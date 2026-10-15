import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import {
  createTestInvite,
  fetchMyInvites,
  parseRpcError,
  sendTestInviteEmail
} from "../services/invites.js";
import { Alert, Badge, Button, Card, CardHeader, DataTable, EmptyState, Field, Input } from "./ui.jsx";

function statusVariant(status) {
  if (status === "completed") return "success";
  if (status === "pending" || status === "accepted") return "primary";
  if (status === "expired" || status === "cancelled") return "muted";
  return "default";
}

function isVisibleInvite(row, now = Date.now()) {
  if (row.status === "completed") return true;
  if (!row.expires_at) return false;
  return new Date(row.expires_at).getTime() > now;
}

export function PsychologistInvitesPanel() {
  const { credits, refreshProfile } = useAuth();
  const { t, dateLocale, locale } = useLocale();
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgVariant, setMsgVariant] = useState("error");
  const [busy, setBusy] = useState(false);

  const loadInvites = useCallback(async () => {
    try {
      setInvites(await fetchMyInvites());
    } catch (e) {
      setMsgVariant("error");
      setMsg(e.message);
    }
  }, []);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  async function sendInvite(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const created = await createTestInvite(email);
      await sendTestInviteEmail({ inviteId: created.id, locale });
      setEmail("");
      setMsgVariant("success");
      setMsg(t("invite.sentSuccess", { email: created.recipient_email }));
      await refreshProfile();
      await loadInvites();
    } catch (e) {
      setMsgVariant("error");
      setMsg(parseRpcError(e, t));
    } finally {
      setBusy(false);
    }
  }

  const visibleInvites = invites.filter((row) => isVisibleInvite(row));

  return (
    <>
      <Card style={{ marginTop: 20 }}>
        <CardHeader
          title={t("invite.panelTitle")}
          description={t("invite.panelDesc")}
          action={<Badge variant="primary">{t("invite.creditsLeft", { count: credits })}</Badge>}
        />
        <Card as="form" onSubmit={sendInvite} style={{ padding: 16, background: "var(--fp-surface-muted)" }}>
            <Field label={t("invite.recipientEmail")}>
              <Input
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
                placeholder="ornek@email.com"
                autoComplete="email"
              />
            </Field>
            <p className="fp-hint" style={{ margin: "8px 0 12px" }}>
              {t("invite.sendHint")}
            </p>
            <Button type="submit" variant="primary" disabled={busy || credits < 1}>
              {busy ? t("common.wait") : t("invite.sendBtn")}
            </Button>
          </Card>
        {msg && (
          <Alert variant={msgVariant} style={{ marginTop: 16 }}>
            {msg}
          </Alert>
        )}
      </Card>

      <Card style={{ marginTop: 20 }}>
        <CardHeader title={t("invite.listTitle")} description={t("invite.listDesc")} />
        {!visibleInvites.length && <EmptyState title={t("invite.noInvites")} description={t("invite.noInvitesDesc")} />}
        {visibleInvites.length > 0 && (
          <DataTable
            columns={[
              {
                label: t("invite.colDate"),
                render: (row) => new Date(row.created_at).toLocaleString(dateLocale)
              },
              { key: "recipient_email", label: t("invite.colEmail") },
              {
                key: "status",
                label: t("invite.colStatus"),
                render: (row) => (
                  <Badge variant={statusVariant(row.status)}>{t(`invite.status.${row.status}`)}</Badge>
                )
              },
              {
                label: t("invite.colExpires"),
                render: (row) =>
                  row.expires_at
                    ? new Date(row.expires_at).toLocaleString(dateLocale, { dateStyle: "short", timeStyle: "short" })
                    : "—"
              }
            ]}
            rows={visibleInvites}
            rowKey={(row) => row.id}
          />
        )}
      </Card>
    </>
  );
}
