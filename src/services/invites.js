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

export async function fetchMyInvites(limit = 50) {
  const { data, error } = await supabase
    .from("test_invites")
    .select("id, token, recipient_email, status, expires_at, created_at, completed_at, session_id")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function sendTestInviteEmail({ inviteId, locale = "tr" }) {
  const { data, error } = await supabase.functions.invoke("send-test-invite", {
    body: { inviteId, locale }
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function inviteErrorMessage(code, t) {
  const map = {
    invite_not_found: t("invite.errNotFound"),
    invite_expired: t("invite.errExpired"),
    invite_already_used: t("invite.errUsed"),
    invite_cancelled: t("invite.errCancelled"),
    email_mismatch: t("invite.errEmailMismatch"),
    invite_individual_only: t("invite.errIndividualOnly"),
    invite_taken: t("invite.errTaken"),
    no_credits: t("invite.errNoCredits"),
    invalid_email: t("invite.errInvalidEmail"),
    forbidden: t("invite.errForbidden")
  };
  return map[code] || code;
}

export function parseRpcError(err, t) {
  const msg = err?.message || "";
  const code = msg.match(/^([a-z_]+)/)?.[1];
  if (code && t) return inviteErrorMessage(code, t);
  return msg || t?.("common.error") || "Error";
}
