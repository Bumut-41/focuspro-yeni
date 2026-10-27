import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { ageFromBirthDate, profileKeyFromAge } from "../profiles.js";
import { createClient, fetchMyClients, updateClientEmail } from "../services/clients.js";
import { createTestInvite, parseRpcError, sendTestInviteEmail } from "../services/invites.js";
import { Alert, Button, Card, CardHeader, DataTable, EmptyState, Field, Input, Select, Stack } from "./ui.jsx";

const EMPTY = { fullName: "", birthDate: "", gender: "", email: "", consent: false };

function isValidEmail(email) {
  return String(email ?? "").includes("@");
}

export function SpecialistClientsPanel() {
  const { credits, refreshProfile } = useAuth();
  const { t, locale } = useLocale();
  const [form, setForm] = useState(EMPTY);
  const [clients, setClients] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgVariant, setMsgVariant] = useState("error");
  const [busy, setBusy] = useState(false);
  const [sendingId, setSendingId] = useState(null);
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

  async function onSave(event) {
    event.preventDefault();
    setMsg("");
    if (!form.fullName.trim()) {
      setMsgVariant("error");
      setMsg(t("test.errName"));
      return;
    }
    if (age == null || age < 6 || age > 99) {
      setMsgVariant("error");
      setMsg(t("test.errBirth"));
      return;
    }
    if (!form.gender) {
      setMsgVariant("error");
      setMsg(t("test.errGender"));
      return;
    }
    const email = form.email.trim();
    if (email && !isValidEmail(email)) {
      setMsgVariant("error");
      setMsg(t("invite.errInvalidEmail"));
      return;
    }
    if (needsConsent && !form.consent) {
      setMsgVariant("error");
      setMsg(t("test.errConsent"));
      return;
    }

    setBusy(true);
    try {
      await createClient({
        fullName: form.fullName,
        birthDate: form.birthDate,
        gender: form.gender,
        email,
        guardianConsent: needsConsent ? form.consent : true
      });
      setForm(EMPTY);
      setMsgVariant("success");
      setMsg(t("clients.saved"));
      await load();
    } catch (e) {
      setMsgVariant("error");
      const text = e?.message || "";
      if (text.includes("duplicate") || text.includes("23505") || text.includes("specialist_clients_unique_email")) {
        setMsg(t("clients.errDuplicate"));
      } else {
        setMsg(t("clients.errSave"));
      }
    } finally {
      setBusy(false);
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
      const text = e?.message || "";
      if (text.includes("duplicate") || text.includes("23505") || text.includes("specialist_clients_unique_email")) {
        setMsg(t("clients.errDuplicate"));
      } else if (text === "invalid_email") {
        setMsg(t("invite.errInvalidEmail"));
      } else {
        setMsg(parseRpcError(e, t));
      }
      setSendingId(null);
    }
  }

  return (
    <Card style={{ marginTop: 20 }}>
      <CardHeader title={t("clients.title")} description={t("clients.desc")} />
      <Card as="form" onSubmit={onSave} style={{ padding: 16, background: "var(--fp-surface-muted)" }}>
        <Stack wrap gap={12}>
          <Field label={t("clients.name")}>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </Field>
          <Field label={t("clients.birth")}>
            <Input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value, consent: false })}
              required
            />
          </Field>
          <Field label={t("test.gender")}>
            <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} required>
              <option value="">{t("common.select")}</option>
              <option value="Kadın">{t("test.genderFemale")}</option>
              <option value="Erkek">{t("test.genderMale")}</option>
            </Select>
          </Field>
          <Field label={t("clients.emailOptional")}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="off"
            />
          </Field>
          {needsConsent && (
            <label className="fp-checkbox-row">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              />
              <span>{t("test.consent")}</span>
            </label>
          )}
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
              { key: "birth_date", label: t("clients.birth") },
              {
                label: "",
                render: (client) => (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={sendingId === client.id || credits < 1}
                    onClick={() => sendTest(client)}
                  >
                    {sendingId === client.id ? t("common.wait") : t("clients.sendTest")}
                  </Button>
                )
              }
            ]}
            rows={clients}
            rowKey={(client) => client.id}
          />
        )}
      </div>
    </Card>
  );
}
