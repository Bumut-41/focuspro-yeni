import { supabase } from "../lib/supabase.js";

export async function saveTestSession({
  participant,
  profileKey,
  logs,
  metrics,
  target,
  pressTimeline = []
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
    p_press_timeline: pressTimeline
  });
  if (error) throw error;
  return data;
}

export async function fetchMySessions(limit = 50) {
  const { data, error } = await supabase
    .from("test_sessions")
    .select("id, participant_name, participant_age, profile_key, metrics, created_at, pdf_path, admin_pdf_path")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllSessions(limit = 100) {
  const { data, error } = await supabase
    .from("test_sessions")
    .select(
      "id, owner_id, participant_name, participant_age, profile_key, metrics, created_at, pdf_path, admin_pdf_path, profiles(full_name, role)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
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

export async function uploadReportPdf(userId, sessionId, blob) {
  const path = `${userId}/${sessionId}.pdf`;
  const { error } = await supabase.storage.from("reports").upload(path, blob, {
    contentType: "application/pdf",
    upsert: true
  });
  if (error) throw error;
  return path;
}

/** Storage'a yükler ve test_sessions.pdf_path günceller. */
export async function persistSessionReportPdf(userId, sessionId, blob) {
  const path = await uploadReportPdf(userId, sessionId, blob);
  const { error } = await supabase
    .from("test_sessions")
    .update({ pdf_path: path })
    .eq("id", sessionId)
    .eq("owner_id", userId);
  if (error) throw error;
  return path;
}

export async function uploadAdminReportPdf(userId, sessionId, blob) {
  const path = `${userId}/${sessionId}-admin.pdf`;
  const { error } = await supabase.storage.from("reports").upload(path, blob, {
    contentType: "application/pdf",
    upsert: true
  });
  if (error) throw error;
  return path;
}

/** Yönetici basış PDF — yalnızca admin_pdf_path güncellenir. */
export async function persistAdminReportPdf(userId, sessionId, blob) {
  const path = await uploadAdminReportPdf(userId, sessionId, blob);
  const { error } = await supabase
    .from("test_sessions")
    .update({ admin_pdf_path: path })
    .eq("id", sessionId)
    .eq("owner_id", userId);
  if (error) throw error;
  return path;
}

/** Kayıtlı PDF için geçici indirme bağlantısı (1 saat). */
export async function getReportPdfSignedUrl(pdfPath) {
  const { data, error } = await supabase.storage.from("reports").createSignedUrl(pdfPath, 3600);
  if (error) throw error;
  return data.signedUrl;
}
