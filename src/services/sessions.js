import { dayEndIso, dayStartIso, likeTerm } from "../lib/listFilters.js";
import { supabase } from "../lib/supabase.js";

export async function saveTestSession({
  participant,
  profileKey,
  logs,
  metrics,
  target,
  pressTimeline = [],
  inviteId = null
}) {
  const { data, error } = await supabase.rpc("complete_test_session", {
    p_participant_name: participant.name,
    p_participant_age: Number(participant.age) || null,
    p_participant_birth_date: participant.birthDate || null,
    p_participant_gender: participant.gender || null,
    p_profile_key: profileKey,
    p_logs: logs,
    p_metrics: metrics,
    p_target: target,
    p_press_timeline: pressTimeline,
    p_invite_id: inviteId || null
  });
  if (error) throw error;
  if (data && typeof data === "object" && data.id) {
    return { sessionId: data.id, ownerId: data.owner_id };
  }
  return { sessionId: data, ownerId: null };
}

function applySessionFilters(request, { query = "", profile = "", from = "", to = "", ownerIds = [] } = {}) {
  let next = request;
  if (profile) next = next.eq("profile_key", profile);
  if (from) next = next.gte("created_at", dayStartIso(from));
  if (to) next = next.lte("created_at", dayEndIso(to));
  const term = likeTerm(query);
  const ids = ownerIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id)).slice(0, 40);
  if (term && ids.length) {
    next = next.or(`participant_name.ilike."%${term}%",owner_id.in.(${ids.join(",")})`);
  } else if (term) {
    next = next.ilike("participant_name", `%${term}%`);
  }
  return next;
}

export async function fetchMySessions(options = {}) {
  const opts = typeof options === "number" ? { limit: options } : options;
  const limit = opts.limit ?? 200;
  let request = supabase
    .from("test_sessions")
    .select(
      "id, participant_name, participant_age, profile_key, metrics, created_at, pdf_path, admin_pdf_path, invite_id, report_email_sent_at, report_email_to, report_email_status, report_email_error_code, report_email_error_detail"
    )
    .order("created_at", { ascending: false });
  request = applySessionFilters(request, opts).limit(limit);
  const { data, error } = await request;
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllSessions(options = {}) {
  const opts = typeof options === "number" ? { limit: options } : options;
  const limit = opts.limit ?? 300;
  let request = supabase
    .from("test_sessions")
    .select(
      "id, owner_id, taker_id, participant_name, participant_age, profile_key, metrics, created_at, pdf_path, admin_pdf_path, report_email_sent_at, report_email_to, report_email_status, report_email_error_code, report_email_error_detail, owner:profiles!owner_id(full_name, role), taker:profiles!taker_id(full_name, role)"
    )
    .order("created_at", { ascending: false });
  request = applySessionFilters(request, opts).limit(limit);
  const { data, error } = await request;
  if (error) throw error;
  return data ?? [];
}

export async function fetchSessionDetail(id) {
  const { data, error } = await supabase.from("test_sessions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

/** Yalnızca admin — basış zaman çizelgesi */
export async function fetchAdminPressTimeline(sessionId) {
  const { data, error } = await supabase
    .from("test_press_timelines")
    .select("timeline")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data?.timeline ?? [];
}

async function uploadWithRetry(path, blob, retries = 3) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    const { error } = await supabase.storage.from("reports").upload(path, blob, {
      contentType: "application/pdf",
      upsert: true
    });
    if (!error) return path;
    lastErr = error;
    await new Promise((resolve) => setTimeout(resolve, 400 * (i + 1)));
  }
  throw lastErr;
}

export async function uploadReportPdf(userId, sessionId, blob) {
  return uploadWithRetry(`${userId}/${sessionId}.pdf`, blob);
}

async function assertStorageObjectExists(path) {
  const { data, error } = await supabase.storage.from("reports").createSignedUrl(path, 60);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "pdf_storage_verify_failed");
  }
}

async function linkSessionPdfPath(sessionId, path, kind) {
  const { error } = await supabase.rpc("set_session_report_pdf", {
    p_session_id: sessionId,
    p_pdf_path: path,
    p_kind: kind
  });
  if (!error) return;
  const missingRpc =
    /Could not find the function|schema cache|PGRST202/i.test(error.message || "");
  if (!missingRpc) throw error;
  const column = kind === "admin" ? "admin_pdf_path" : "pdf_path";
  const { error: updateError } = await supabase
    .from("test_sessions")
    .update({ [column]: path })
    .eq("id", sessionId);
  if (updateError) throw updateError;
}

/** Storage'a yükler ve test_sessions.pdf_path günceller (RPC ile, RLS select engeline takılmaz). */
export async function persistSessionReportPdf(userId, sessionId, blob) {
  const path = await uploadReportPdf(userId, sessionId, blob);
  await assertStorageObjectExists(path);
  await linkSessionPdfPath(sessionId, path, "test");
  return path;
}

export async function uploadAdminReportPdf(userId, sessionId, blob) {
  return uploadWithRetry(`${userId}/${sessionId}-admin.pdf`, blob);
}

/** Yönetici basış PDF — yalnızca admin_pdf_path güncellenir. */
export async function persistAdminReportPdf(userId, sessionId, blob) {
  const path = await uploadAdminReportPdf(userId, sessionId, blob);
  await linkSessionPdfPath(sessionId, path, "admin");
  return path;
}

/** Kayıtlı PDF için geçici indirme bağlantısı (1 saat). */
export async function getReportPdfSignedUrl(pdfPath) {
  const { data, error } = await supabase.storage.from("reports").createSignedUrl(pdfPath, 3600);
  if (error) throw error;
  return data.signedUrl;
}
