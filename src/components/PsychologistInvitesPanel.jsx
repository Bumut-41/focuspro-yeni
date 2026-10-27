import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import {
  canResendInviteEmail,
  formatInviteEmailStatus,
  inviteEmailStatusColor
} from "../lib/inviteEmailStatus.js";
import {
  createTestInvite,
  fetchMyInvites,
  parseRpcError,
  sendTestInviteEmail
} from "../services/invites.js";
import { Alert, Badge, Button, Card, CardHeader, DataTable, EmptyState, Field, Input, Stack } from "./ui.jsx";

function statusVariant(status) {
  if (status === "completed") return "primary";
  if (status === "pending" || status === "accepted") return "primary";
  return "neutral";
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
  const [resendBusy, setResendBusy] = useState(null);

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
      setEmail("");
      await refreshProfile();
      try {
        await sendTestInviteEmail({ inviteId: created.id, locale });
        setMsgVariant("success");
        setMsg(t("invite.sentSuccess", { email: created.recipient_email }));
      } catch (mailErr) {
        setMsgVariant("error");
        setMsg(t("invite.emailSendFailedAfterCreate", { reason: parseRpcError(mailErr, t) }));
      }
      await loadInvites();
    } catch (e) {
      setMsgVariant("error");
      setMsg(parseRpcError(e, t));
    } finally {
      setBusy(false);
    }
  }

  async function resendEmail(invite) {
    setResendBusy(invite.id);
    setMsg("");
    try {
      await sendTestInviteEmail({ inviteId: invite.id, locale });
      setMsgVariant("success");
      setMsg(t("invite.emailResendOk"));
      await loadInvites();
    } catch (e) {
      setMsgVariant("error");
      setMsg(parseRpcError(e, t));
      await loadInvites();
    } finally {
      setResendBusy(null);
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
                label: t("invite.colEmailDelivery"),
                render: (row) => (
                  <Stack gap={6}>
                    <span
                      style={{
                        display: "block",
                        maxWidth: 260,
                        fontSize: "0.8125rem",
                        lineHeight: 1.45,
                        color: inviteEmailStatusColor(row)
                      }}
                    >
                      {formatInviteEmailStatus(row, t, dateLocale)}
                    </span>
                    {canResendInviteEmail(row) ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={resendBusy === row.id}
                        onClick={() => resendEmail(row)}
                      >
                        {resendBusy === row.id
                          ? "…"
                          : row.invite_email_status === "sent" || row.invite_email_sent_at
                            ? t("invite.emailResend")
                            : t("invite.emailSend")}
                      </Button>
                    ) : null}
                  </Stack>
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
