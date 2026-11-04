import { profileLabel } from "../i18n/index.js";
import { ageFromBirthDate, profileKeyFromAge } from "../profiles.js";
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

export async function createTestInvite(
  recipientEmail,
  { clientId = null, recipientName = null, recipientBirthDate = null } = {}
) {
  const payload = {
    p_recipient_email: recipientEmail.trim().toLowerCase()
  };
  if (clientId) payload.p_client_id = clientId;
  if (recipientName) payload.p_recipient_name = String(recipientName).trim();
  if (recipientBirthDate) payload.p_recipient_birth_date = recipientBirthDate;

  let { data, error } = await supabase.rpc("create_test_invite", payload);
  // Eski RPC imzalarına geri düş
  if (error && (clientId || recipientName || recipientBirthDate)) {
    const slim = { p_recipient_email: payload.p_recipient_email };
    if (clientId) slim.p_client_id = clientId;
    if (recipientName) slim.p_recipient_name = String(recipientName).trim();
    let retry = await supabase.rpc("create_test_invite", slim);
    if (retry.error) {
      retry = await supabase.rpc("create_test_invite", {
        p_recipient_email: payload.p_recipient_email
      });
    }
    data = retry.data;
    error = retry.error;
  }
  if (error) throw error;
  return data;
}

const INVITE_SELECT =
  "id, token, recipient_email, recipient_name, recipient_birth_date, client_id, status, expires_at, created_at, completed_at, session_id, psychologist_id, invite_email_status, invite_email_sent_at, invite_email_error_code, invite_email_error_detail, invite_email_provider_id";

function matchingInviteClients(invite, clients = []) {
  if (!clients?.length) return [];
  if (invite?.client_id) {
    const byId = clients.filter((c) => c.id === invite.client_id);
    if (byId.length) return byId;
  }
  const email = String(invite?.recipient_email || "")
    .trim()
    .toLowerCase();
  if (!email) return [];
  return clients.filter((c) => {
    if (String(c.email || "").toLowerCase() !== email) return false;
    if (invite?.psychologist_id && c.specialist_id && c.specialist_id !== invite.psychologist_id) {
      return false;
    }
    return true;
  });
}

/** Davet satırında gösterilecek danışan adı (kayıtlı ad veya e-posta eşleşmesi). */
export function inviteClientLabel(invite, clients = []) {
  const stored = String(invite?.recipient_name || "").trim();
  if (stored) return stored;
  const matches = matchingInviteClients(invite, clients);
  if (!matches.length) return "";
  const names = [...new Set(matches.map((c) => String(c.full_name || "").trim()).filter(Boolean))];
  return names.join(" / ");
}

/** Davet / danışan doğum tarihi. */
export function inviteClientBirthDate(invite, clients = []) {
  if (invite?.recipient_birth_date) return invite.recipient_birth_date;
  const matches = matchingInviteClients(invite, clients);
  for (const c of matches) {
    if (c.birth_date) return c.birth_date;
  }
  return null;
}

/** Danışan yaşı (doğum tarihinden). */
export function inviteClientAge(invite, clients = []) {
  return ageFromBirthDate(inviteClientBirthDate(invite, clients));
}

/**
 * Liste hücresi — geçmiş testlerdeki Profil ile aynı:
 * "Yetişkin (18+)" / "Ergen (13–17)" / "Çocuk (6–12)".
 */
export function inviteClientProfileLabel(invite, clients = [], locale = "tr") {
  const age = inviteClientAge(invite, clients);
  if (age == null) return "";
  return profileLabel(profileKeyFromAge(age), locale);
}

/** @deprecated use inviteClientProfileLabel */
export function inviteClientAgeLabel(invite, clients = [], locale = "tr") {
  return inviteClientProfileLabel(invite, clients, locale);
}

export async function fetchMyInvites(limit = 50) {
  let { data, error } = await supabase
    .from("test_invites")
    .select(INVITE_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error && /recipient_name|recipient_birth_date|client_id/i.test(error.message || "")) {
    const mid =
      "id, token, recipient_email, recipient_name, client_id, status, expires_at, created_at, completed_at, session_id, psychologist_id, invite_email_status, invite_email_sent_at, invite_email_error_code, invite_email_error_detail, invite_email_provider_id";
    let retry = await supabase
      .from("test_invites")
      .select(mid)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (retry.error && /recipient_name|client_id/i.test(retry.error.message || "")) {
      const legacy =
        "id, token, recipient_email, status, expires_at, created_at, completed_at, session_id, psychologist_id, invite_email_status, invite_email_sent_at, invite_email_error_code, invite_email_error_detail, invite_email_provider_id";
      retry = await supabase
        .from("test_invites")
        .select(legacy)
        .order("created_at", { ascending: false })
        .limit(limit);
    }
    data = retry.data;
    error = retry.error;
  }
  if (error) throw error;
  return data ?? [];
}

/** Admin: tüm psikolog davetleri (e-posta durumu dahil). */
export async function fetchAllInvites(limit = 100) {
  const withPsych = `${INVITE_SELECT}, psychologist:profiles!test_invites_psychologist_id_fkey(full_name)`;
  let { data, error } = await supabase
    .from("test_invites")
    .select(withPsych)
    .order("created_at", { ascending: false })
    .limit(limit);
  // Yeni sütunlar henüz yoksa kademeli geri düş
  if (error && /recipient_name|recipient_birth_date|client_id/i.test(error.message || "")) {
    const mid = `${INVITE_SELECT.replace(", recipient_birth_date", "")}, psychologist:profiles!test_invites_psychologist_id_fkey(full_name)`;
    let retry = await supabase
      .from("test_invites")
      .select(mid)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (retry.error && /recipient_name|client_id/i.test(retry.error.message || "")) {
      const legacy =
        "id, token, recipient_email, status, expires_at, created_at, completed_at, session_id, psychologist_id, invite_email_status, invite_email_sent_at, invite_email_error_code, invite_email_error_detail, invite_email_provider_id, psychologist:profiles!test_invites_psychologist_id_fkey(full_name)";
      retry = await supabase
        .from("test_invites")
        .select(legacy)
        .order("created_at", { ascending: false })
        .limit(limit);
    }
    data = retry.data;
    error = retry.error;
  }
  if (error) {
    const fallback = await supabase
      .from("test_invites")
      .select(
        "id, token, recipient_email, status, expires_at, created_at, completed_at, session_id, psychologist_id, invite_email_status, invite_email_sent_at, invite_email_error_code, invite_email_error_detail, invite_email_provider_id"
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (fallback.error) throw fallback.error;
    return fallback.data ?? [];
  }
  return data ?? [];
}

/** Davet e-posta iletim durumunu DB'ye yazar (psikolog/admin). */
export async function recordInviteEmailStatus({
  inviteId,
  status,
  errorCode = null,
  errorDetail = null,
  providerId = null
}) {
  const { error } = await supabase.rpc("record_invite_email_status", {
    p_invite_id: inviteId,
    p_status: status,
    p_error_code: errorCode,
    p_error_detail: errorDetail,
    p_provider_id: providerId
  });
  if (error) throw error;
}

async function invokeSendTestInvite(inviteId, locale) {
  const { data, error } = await supabase.functions.invoke("send-test-invite", {
    body: { inviteId, locale, siteUrl: window.location.origin }
  });
  // Non-2xx olsa bile gövde çoğu zaman data'da gelir
  if (data?.error) {
    return {
      ok: false,
      code: data.error,
      detail: data.detail || null,
      message: data.detail || data.error
    };
  }
  if (error) {
    let detail = error.message || null;
    try {
      const ctx = error.context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) {
          return {
            ok: false,
            code: body.error,
            detail: body.detail || null,
            message: body.detail || body.error
          };
        }
      }
    } catch {
      /* ignore */
    }
    return { ok: false, code: "invoke_failed", detail, message: detail || "E-posta gönderilemedi." };
  }
  return { ok: true, data };
}

export async function sendTestInviteEmail({ inviteId, locale = "tr" }) {
  if (!inviteId) {
    throw Object.assign(new Error("inviteId required"), { code: "invite_not_found" });
  }

  try {
    await recordInviteEmailStatus({ inviteId, status: "pending" });
  } catch {
    /* RPC yoksa edge yine de dener */
  }

  let result = await invokeSendTestInvite(inviteId, locale);
  // Geçici ağ / cold start: bir kez daha dene
  if (!result.ok && (result.code === "invoke_failed" || result.code === "unexpected")) {
    await new Promise((r) => setTimeout(r, 800));
    result = await invokeSendTestInvite(inviteId, locale);
  }

  if (!result.ok) {
    try {
      await recordInviteEmailStatus({
        inviteId,
        status: "failed",
        errorCode: result.code || "send_failed",
        errorDetail: result.detail
      });
    } catch {
      /* ignore */
    }
    throw Object.assign(new Error(result.message || "E-posta gönderilemedi."), {
      code: result.code || "send_failed",
      detail: result.detail || null
    });
  }

  try {
    await recordInviteEmailStatus({
      inviteId,
      status: "sent",
      providerId: result.data?.providerId || null
    });
  } catch {
    /* edge zaten yazdıysa sorun değil */
  }
  return result.data;
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
