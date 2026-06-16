import { supabase } from "../lib/supabase.js";

export function mapShareError(message, t) {
  const m = String(message || "").toLowerCase();
  if (m.includes("psychologist_not_found") || m.includes("not_a_psychologist")) return t("share.errors.notFound");
  if (m.includes("psychologist_cannot_link")) return t("share.errors.psychCannotLink");
  if (m.includes("cannot_link_self")) return t("share.errors.cannotLinkSelf");
  if (m.includes("session_not_found")) return t("share.errors.sessionNotFound");
  if (m.includes("not_psychologist")) return t("share.errors.notPsychologist");
  if (m.includes("not_authenticated")) return t("share.errors.notAuth");
  return message || t("share.errors.generic");
}

export async function ensurePsychologistShareCode() {
  const { data, error } = await supabase.rpc("ensure_psychologist_share_code");
  if (error) throw error;
  return data;
}

export async function linkPsychologist({ email, code }) {
  const { data, error } = await supabase.rpc("link_psychologist", {
    p_email: email?.trim() || null,
    p_code: code?.trim() || null
  });
  if (error) throw error;
  return data;
}

export async function unlinkPsychologist(psychologistId) {
  const { error } = await supabase.rpc("unlink_psychologist", {
    p_psychologist_id: psychologistId
  });
  if (error) throw error;
}

export async function fetchMyPsychologistLinks() {
  const { data, error } = await supabase.rpc("get_my_psychologist_links");
  if (error) throw error;
  return data ?? [];
}

export async function shareTestSession(sessionId, { psychologistId, email, code }) {
  const { data, error } = await supabase.rpc("share_test_session", {
    p_session_id: sessionId,
    p_psychologist_id: psychologistId || null,
    p_email: email?.trim() || null,
    p_code: code?.trim() || null
  });
  if (error) throw error;
  return data;
}

export async function fetchMySessionShares(sessionId = null) {
  const { data, error } = await supabase.rpc("get_my_session_shares", {
    p_session_id: sessionId
  });
  if (error) throw error;
  return data ?? [];
}

/** Psikolog: danışanların paylaştığı testler (session_shares üzerinden). */
export async function fetchSharedSessionsAsPsychologist(limit = 50) {
  const { data, error } = await supabase
    .from("session_shares")
    .select(
      `
      created_at,
      test_sessions (
        id,
        owner_id,
        participant_name,
        participant_age,
        profile_key,
        metrics,
        created_at,
        pdf_path,
        profiles ( full_name )
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? [])
    .map((row) => {
      const s = row.test_sessions;
      if (!s) return null;
      return {
        ...s,
        profiles: s.profiles,
        shared_at: row.created_at
      };
    })
    .filter(Boolean);
}
