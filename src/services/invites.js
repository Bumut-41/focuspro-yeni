import { supabase } from "../lib/supabase.js";

export async function getInviteByToken(token) {
  const { data, error } = await supabase.rpc("get_invite_by_token", { p_token: token });
  if (error) throw error;
  return data;
}

export async function acceptTestInvite(token) {
  const { data, error } = await supabase.rpc("accept_test_invite", { p_token: token });
  if (error) throw error;
  return data;
}

export async function getActiveInviteForUser() {
  const { data, error } = await supabase.rpc("get_active_invite_for_user");
  if (error) throw error;
  return data;
}

export async function createTestInvite(recipientEmail) {
  const { data, error } = await supabase.rpc("create_test_invite", {
    p_recipient_email: recipientEmail.trim().toLowerCase()
  });
  if (error) throw error;
  return data;
}

const INVITE_SELECT =
  "id, token, recipient_email, status, expires_at, created_at, completed_at, session_id, psychologist_id, invite_email_status, invite_email_sent_at, invite_email_error_code, invite_email_error_detail, invite_email_provider_id";

export async function fetchMyInvites(limit = 50) {
  const { data, error } = await supabase
    .from("test_invites")
    .select(INVITE_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/** Admin: tüm psikolog davetleri (e-posta durumu dahil). */
export async function fetchAllInvites(limit = 100) {
  const { data, error } = await supabase
    .from("test_invites")
    .select(
      `${INVITE_SELECT}, psychologist:profiles!test_invites_psychologist_id_fkey(full_name)`
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    // FK alias yoksa düz sorgu
    const fallback = await supabase
      .from("test_invites")
      .select(INVITE_SELECT)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (fallback.error) throw fallback.error;
    return fallback.data ?? [];
  }
  return data ?? [];
}

export async function sendTestInviteEmail({ inviteId, locale = "tr" }) {
  const { data, error } = await supabase.functions.invoke("send-test-invite", {
    body: { inviteId, locale, siteUrl: window.location.origin }
  });
  if (error) {
    throw Object.assign(new Error(error.message || "E-posta gönderilemedi."), {
      code: "invoke_failed"
    });
  }
  if (data?.error) {
    throw Object.assign(new Error(data.detail || data.error), {
      code: data.error,
      detail: data.detail || null
    });
  }
  return data;
}

export function inviteErrorMessage(code, t) {
  const map = {
    invite_not_found: t("invite.errNotFound"),
    invite_expired: t("invite.errExpired"),
    invite_already_used: t("invite.errUsed"),
    test_already_completed: t("invite.errAlreadyCompleted"),
    invite_cancelled: t("invite.errCancelled"),
    email_mismatch: t("invite.errEmailMismatch"),
    invite_individual_only: t("invite.errIndividualOnly"),
    invite_taken: t("invite.errTaken"),
    no_credits: t("invite.errNoCredits"),
    invalid_email: t("invite.errInvalidEmail"),
    forbidden: t("invite.errForbidden"),
    email_not_configured: t("invite.emailErr.email_not_configured"),
    send_failed: t("invite.emailErr.send_failed"),
    invite_invalid_status: t("invite.emailErr.invite_invalid_status"),
    invoke_failed: t("invite.emailErr.invoke_failed"),
    unauthorized: t("invite.emailErr.unauthorized"),
    unexpected: t("invite.emailErr.unexpected")
  };
  return map[code] || code;
}

export function parseRpcError(err, t) {
  const code = err?.code || String(err?.message || "").match(/^([a-z_]+)/)?.[1];
  if (code && t) {
    const mapped = inviteErrorMessage(code, t);
    if (mapped && mapped !== code) {
      if (err?.detail) return `${mapped} (${String(err.detail).slice(0, 100)})`;
      return mapped;
    }
  }
  return err?.message || t?.("common.error") || "Error";
}
