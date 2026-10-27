import { useCallback, useEffect, useState } from "react";
import { useLocale } from "../i18n/LocaleContext.jsx";
import {
  canResendInviteEmail,
  formatInviteEmailStatus,
  inviteEmailStatusColor
} from "../lib/inviteEmailStatus.js";
import {
  fetchAllInvites,
  parseRpcError,
  sendTestInviteEmail
} from "../services/invites.js";
import { Alert, Badge, Button, Card, CardHeader, DataTable, EmptyState, Stack } from "./ui.jsx";

function statusVariant(status) {
  if (status === "completed") return "primary";
  if (status === "pending" || status === "accepted") return "primary";
  return "neutral";
}

export function AdminInvitesPanel() {
  const { t, dateLocale, locale } = useLocale();
  const [invites, setInvites] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgVariant, setMsgVariant] = useState("error");
  const [resendBusy, setResendBusy] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadInvites = useCallback(async () => {
    try {
      setInvites(await fetchAllInvites(200));
    } catch (e) {
      setMsgVariant("error");
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

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

  return (
    <Card>
      <CardHeader
        title={t("admin.invitesTitle", { count: invites.length })}
        description={t("admin.invitesDesc")}
      />
      {msg && (
        <Alert variant={msgVariant} style={{ marginBottom: 16 }}>
          {msg}
        </Alert>
      )}
      {loading && <p className="fp-loading">{t("common.loading")}</p>}
      {!loading && !invites.length && (
        <EmptyState title={t("invite.noInvites")} description={t("admin.invitesEmptyDesc")} />
      )}
      {!loading && invites.length > 0 && (
        <DataTable
          columns={[
            {
              label: t("invite.colDate"),
              render: (row) => new Date(row.created_at).toLocaleString(dateLocale)
            },
            {
              label: t("admin.invitesPsychologist"),
              render: (row) => row.psychologist?.full_name || row.psychologist_id?.slice(0, 8) || "—"
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
                      maxWidth: 280,
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
                  ? new Date(row.expires_at).toLocaleString(dateLocale, {
                      dateStyle: "short",
                      timeStyle: "short"
                    })
                  : "—"
            }
          ]}
          rows={invites}
          rowKey={(row) => row.id}
        />
      )}
    </Card>
  );
}
