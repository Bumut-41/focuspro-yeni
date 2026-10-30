import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { ageFromBirthDate, profileKeyFromAge } from "../profiles.js";
import { createClient, deleteClient, fetchMyClients, updateClient, updateClientEmail } from "../services/clients.js";
import { createTestInvite, parseRpcError, sendTestInviteEmail } from "../services/invites.js";
import { Alert, Button, Card, CardHeader, DataTable, EmptyState, Field, Input, Select, Stack, Textarea } from "./ui.jsx";

const EMPTY = {
  fullName: "",
  birthDate: "",
  gender: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  consent: false
};

function isValidEmail(email) {
  return String(email ?? "").includes("@");
}

function clientToForm(client) {
  return {
    fullName: client.full_name || "",
    birthDate: client.birth_date || "",
    gender: client.gender || "",
    email: client.email || "",
    phone: client.phone || "",
    address: client.address || "",
    notes: client.notes || "",
    consent: Boolean(client.guardian_consent)
  };
}

export function SpecialistClientsPanel() {
  const { credits, refreshProfile } = useAuth();
  const { t, locale } = useLocale();
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [clients, setClients] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgVariant, setMsgVariant] = useState("error");
  const [busy, setBusy] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [emailPrompt, setEmailPrompt] = useState(null);

  const load = useCallback(async () => {
    setClients(await fetchMyClients());
  }, []);

  useEffect(() => {
    load().catch((e) => {
      setMsgVariant("error");
      setMsg(e.message || t("clients.errSave"));
    });
  }, [load, t]);

  const age = ageFromBirthDate(form.birthDate);
  const needsConsent = age != null && (profileKeyFromAge(age) === "child" || profileKeyFromAge(age) === "teen");
  const editAge = ageFromBirthDate(editForm.birthDate);
  const editNeedsConsent =
    editAge != null && (profileKeyFromAge(editAge) === "child" || profileKeyFromAge(editAge) === "teen");

  function validateClientForm(values, { requireConsent }) {
    if (!values.fullName.trim()) return t("test.errName");
    const a = ageFromBirthDate(values.birthDate);
    if (a == null || a < 6 || a > 99) return t("test.errBirth");
    if (!values.gender) return t("test.errGender");
    const email = values.email.trim();
    if (email && !isValidEmail(email)) return t("invite.errInvalidEmail");
    if (requireConsent && !values.consent) return t("test.errConsent");
    return null;
  }

  async function onSave(event) {
    event.preventDefault();
    setMsg("");
    const err = validateClientForm(form, { requireConsent: needsConsent });
    if (err) {
      setMsgVariant("error");
      setMsg(err);
      return;
    }

    setBusy(true);
    try {
      await createClient({
        fullName: form.fullName,
        birthDate: form.birthDate,
        gender: form.gender,
        email: form.email,
        phone: form.phone,
        address: form.address,
        notes: form.notes,
        guardianConsent: needsConsent ? form.consent : true
      });
      setForm(EMPTY);
      setMsgVariant("success");
      setMsg(t("clients.saved"));
      await load();
    } catch (e) {
      setMsgVariant("error");
      setMsg(t("clients.errSave"));
    } finally {
      setBusy(false);
    }
  }

  function openEdit(client) {
    setEditId(client.id);
    setEditForm(clientToForm(client));
    setEmailPrompt(null);
    setMsg("");
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm(EMPTY);
  }

  async function onUpdate(event) {
    event.preventDefault();
    if (!editId) return;
    setMsg("");
    const err = validateClientForm(editForm, { requireConsent: editNeedsConsent });
    if (err) {
      setMsgVariant("error");
      setMsg(err);
      return;
    }

    setEditBusy(true);
    try {
      await updateClient(editId, {
        fullName: editForm.fullName,
        birthDate: editForm.birthDate,
        gender: editForm.gender,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        notes: editForm.notes,
        guardianConsent: editNeedsConsent ? editForm.consent : true
      });
      setEditId(null);
      setEditForm(EMPTY);
      setMsgVariant("success");
      setMsg(t("clients.updated"));
      await load();
    } catch (e) {
      setMsgVariant("error");
      setMsg(t("clients.errUpdate"));
    } finally {
      setEditBusy(false);
    }
  }

  async function deliverTest(client, email) {
    setSendingId(client.id);
    setMsg("");
    try {
      const created = await createTestInvite(email);
      await refreshProfile();
      try {
        await sendTestInviteEmail({ inviteId: created.id, locale });
        setEmailPrompt(null);
        setMsgVariant("success");
        setMsg(t("clients.sent", { email }));
      } catch (mailErr) {
        setMsgVariant("error");
        setMsg(t("invite.emailSendFailedAfterCreate", { reason: parseRpcError(mailErr, t) }));
      }
      await load();
    } catch (e) {
      setMsgVariant("error");
      setMsg(parseRpcError(e, t));
    } finally {
      setSendingId(null);
    }
  }

  async function sendTest(client) {
    const email = String(client.email ?? "").trim();
    if (!isValidEmail(email)) {
      setEmailPrompt({ clientId: client.id, email: "" });
      setMsgVariant("error");
      setMsg(t("clients.errEmailRequiredForSend"));
      return;
    }
    await deliverTest(client, email);
  }

  async function removeClient(client) {
    if (!window.confirm(t("clients.deleteConfirm", { name: client.full_name }))) return;
    setDeletingId(client.id);
    setMsg("");
    try {
      await deleteClient(client.id);
      if (editId === client.id) cancelEdit();
      setMsgVariant("success");
      setMsg(t("clients.deleted"));
      await load();
    } catch (e) {
      setMsgVariant("error");
      setMsg(t("clients.errDelete"));
    } finally {
      setDeletingId(null);
    }
  }

  async function confirmSendWithEmail(event) {
    event.preventDefault();
    if (!emailPrompt) return;
    const email = emailPrompt.email.trim();
    if (!isValidEmail(email)) {
      setMsgVariant("error");
      setMsg(t("invite.errInvalidEmail"));
      return;
    }
    const client = clients.find((row) => row.id === emailPrompt.clientId);
    if (!client) {
      setEmailPrompt(null);
      return;
    }
    setSendingId(client.id);
    try {
      const updated = await updateClientEmail(client.id, email);
      await deliverTest(updated, updated.email);
    } catch (e) {
      setMsgVariant("error");
      if ((e?.message || "") === "invalid_email") {
        setMsg(t("invite.errInvalidEmail"));
      } else {
        setMsg(parseRpcError(e, t));
      }
      setSendingId(null);
    }
  }

  function renderClientFields(values, setValues, { consentRequired }) {
    return (
      <Stack wrap gap={12}>
        <Field label={t("clients.name")}>
          <Input
            value={values.fullName}
            onChange={(e) => setValues({ ...values, fullName: e.target.value })}
            required
          />
        </Field>
        <Field label={t("clients.birth")}>
          <Input
            type="date"
            value={values.birthDate}
            onChange={(e) => setValues({ ...values, birthDate: e.target.value, consent: false })}
            required
          />
        </Field>
        <Field label={t("test.gender")}>
          <Select value={values.gender} onChange={(e) => setValues({ ...values, gender: e.target.value })} required>
            <option value="">{t("common.select")}</option>
            <option value="Kadın">{t("test.genderFemale")}</option>
            <option value="Erkek">{t("test.genderMale")}</option>
          </Select>
        </Field>
        <Field label={t("clients.emailOptional")}>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            autoComplete="off"
          />
        </Field>
        <Field label={t("clients.phone")}>
          <Input
            type="tel"
            value={values.phone}
            onChange={(e) => setValues({ ...values, phone: e.target.value })}
            autoComplete="tel"
          />
        </Field>
        <Field label={t("clients.address")} style={{ flex: "1 1 280px" }}>
          <Input value={values.address} onChange={(e) => setValues({ ...values, address: e.target.value })} />
        </Field>
        <Field label={t("clients.notes")} style={{ flex: "1 1 100%" }}>
          <Textarea
            value={values.notes}
            onChange={(e) => setValues({ ...values, notes: e.target.value })}
            rows={3}
          />
        </Field>
        {consentRequired && (
          <label className="fp-checkbox-row">
            <input
              type="checkbox"
              checked={values.consent}
              onChange={(e) => setValues({ ...values, consent: e.target.checked })}
            />
            <span>{t("test.consent")}</span>
          </label>
        )}
      </Stack>
    );
  }

  return (
    <Card style={{ marginTop: 20 }}>
      <CardHeader title={t("clients.title")} description={t("clients.desc")} />
      <Card as="form" onSubmit={onSave} style={{ padding: 16, background: "var(--fp-surface-muted)" }}>
        {renderClientFields(form, setForm, { consentRequired: needsConsent })}
        <Stack wrap gap={8} style={{ marginTop: 12 }}>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? t("common.wait") : t("clients.save")}
          </Button>
        </Stack>
      </Card>

      {msg && (
        <Alert variant={msgVariant} style={{ marginTop: 16 }}>
          {msg}
        </Alert>
      )}

      {editId && (
        <Card as="form" onSubmit={onUpdate} style={{ marginTop: 16, padding: 16 }}>
          <CardHeader title={t("clients.editTitle")} description={t("clients.editDesc")} />
          {renderClientFields(editForm, setEditForm, { consentRequired: editNeedsConsent })}
          <Stack wrap gap={8} style={{ marginTop: 12 }}>
            <Button type="submit" variant="primary" disabled={editBusy}>
              {editBusy ? t("common.wait") : t("clients.saveChanges")}
            </Button>
            <Button type="button" variant="secondary" disabled={editBusy} onClick={cancelEdit}>
              {t("common.cancel")}
            </Button>
          </Stack>
        </Card>
      )}

      {emailPrompt && (
        <Card as="form" onSubmit={confirmSendWithEmail} style={{ marginTop: 16, padding: 16 }}>
          <Field label={t("clients.email")}>
            <Input
              type="email"
              value={emailPrompt.email}
              onChange={(e) => setEmailPrompt({ ...emailPrompt, email: e.target.value })}
              required
              autoComplete="email"
              autoFocus
            />
          </Field>
          <Stack wrap gap={8} style={{ marginTop: 12 }}>
            <Button type="submit" variant="primary" disabled={sendingId === emailPrompt.clientId}>
              {sendingId === emailPrompt.clientId ? t("common.wait") : t("clients.sendTest")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={sendingId === emailPrompt.clientId}
              onClick={() => setEmailPrompt(null)}
            >
              {t("common.cancel")}
            </Button>
          </Stack>
        </Card>
      )}

      <div style={{ marginTop: 20 }}>
        {!clients.length && <EmptyState title={t("clients.listEmpty")} description={t("clients.listEmptyDesc")} />}
        {clients.length > 0 && (
          <DataTable
            columns={[
              { key: "full_name", label: t("clients.name") },
              {
                key: "email",
                label: t("clients.email"),
                render: (client) => client.email || "—"
              },
              {
                key: "phone",
                label: t("clients.phone"),
                render: (client) => client.phone || "—"
              },
              { key: "birth_date", label: t("clients.birth") },
              {
                label: "",
                render: (client) => (
                  <Stack wrap gap={6}>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={editBusy || sendingId === client.id || deletingId === client.id}
                      onClick={() => openEdit(client)}
                    >
                      {t("clients.edit")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={sendingId === client.id || credits < 1 || deletingId === client.id}
                      onClick={() => sendTest(client)}
                    >
                      {sendingId === client.id ? t("common.wait") : t("clients.sendTest")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      disabled={deletingId === client.id || sendingId === client.id || editBusy}
                      onClick={() => removeClient(client)}
                    >
                      {deletingId === client.id ? t("common.wait") : t("common.delete")}
                    </Button>
                  </Stack>
                )
              }
            ]}
            rows={clients}
            rowKey={(client) => client.id}
            activeKey={editId}
          />
        )}
      </div>
    </Card>
  );
}
