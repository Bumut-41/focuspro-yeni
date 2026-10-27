/** Davet e-posta durumu — psikolog + admin panelleri. */

export function inviteEmailStatusColor(invite) {
  const status = invite?.invite_email_status;
  if (status === "sent" || invite?.invite_email_sent_at) return "var(--fp-success)";
  if (!status && (invite?.status === "accepted" || invite?.status === "completed")) {
    return "var(--fp-success)";
  }
  if (status === "failed") return "var(--fp-danger)";
  if (status === "pending") return "var(--fp-primary)";
  return "var(--fp-text-secondary)";
}

/**
 * @param {object} invite test_invites satırı
 * @param {function} t i18n
 * @param {string} dateLocale
 */
export function formatInviteEmailStatus(invite, t, dateLocale) {
  const status = invite?.invite_email_status;
  const email = invite?.recipient_email || "—";

  if (status === "sent" || invite?.invite_email_sent_at) {
    const when = invite.invite_email_sent_at
      ? new Date(invite.invite_email_sent_at).toLocaleString(dateLocale)
      : "—";
    return t("invite.emailDelivered", { date: when, email });
  }
  if (status === "pending") {
    return t("invite.emailPending");
  }
  if (status === "failed") {
    const code = invite.invite_email_error_code;
    const mapped = code ? t(`invite.emailErr.${code}`) : "";
    let reason =
      mapped && mapped !== `invite.emailErr.${code}` ? mapped : code || t("invite.emailErr.unexpected");
    if (invite.invite_email_error_detail) {
      const detail = String(invite.invite_email_error_detail).slice(0, 120);
      reason = `${reason} (${detail})`;
    }
    return t("invite.emailNotDelivered", { reason });
  }

  // İzleme kolonlarından önce oluşturulmuş, kullanılmış davetler
  if (invite?.status === "accepted" || invite?.status === "completed") {
    const when = invite.created_at
      ? new Date(invite.created_at).toLocaleString(dateLocale)
      : "—";
    return t("invite.emailDelivered", { date: when, email });
  }

  return t("invite.emailNotAttempted");
}

export function canResendInviteEmail(invite) {
  if (!invite || invite.status !== "pending") return false;
  if (invite.expires_at && new Date(invite.expires_at).getTime() <= Date.now()) return false;
  return invite.invite_email_status !== "pending"; // pending = gönderim sürüyor
}
