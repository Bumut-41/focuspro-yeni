import { getProfile } from "../profiles.js";
import { computeReportMetrics } from "../reportHelpers.js";
import { persistAllSessionPdfs } from "./persistSessionPdfs.js";
import { sessionToParticipantReportArgs } from "./adminSessionPdf.js";
import { fetchAdminPressTimeline, fetchSessionDetail, updateSessionMetrics } from "../services/sessions.js";

/**
 * Tek oturum: V4 metrikleri DB’ye yaz + katılımcı (ve varsa basış) PDF’ini Storage’a yeniden yükle.
 */
export async function refreshOneStoredReport(sessionId, { locale = "tr", saveAdminPdf = true } = {}) {
  const detail = await fetchSessionDetail(sessionId);
  if (!detail?.id) throw new Error("Oturum bulunamadı.");
  if (!detail.logs?.length) throw new Error("Deneme kaydı (logs) yok.");
  if (!detail.target) throw new Error("Hedef nesne kaydı yok.");
  if (!detail.owner_id) throw new Error("owner_id yok.");

  const timeline = await fetchAdminPressTimeline(sessionId).catch(() => []);
  const profile = getProfile(detail.profile_key ?? "adult");
  const age = detail.participant_age ?? null;
  const metrics = {
    ...computeReportMetrics(detail.logs, profile.lateResponseMs, {
      pressTimeline: timeline ?? [],
      age: Number(age) || null,
      locale
    }),
    lateResponseMs: profile.lateResponseMs
  };

  await updateSessionMetrics(detail.id, metrics);

  const args = sessionToParticipantReportArgs(detail, timeline ?? []);
  const persist = await persistAllSessionPdfs({
    userId: detail.owner_id,
    sessionId: detail.id,
    participant: args.participant,
    profile,
    logs: args.logs,
    target: args.target,
    pressTimeline: args.pressTimeline,
    locale,
    saveAdminPdf: Boolean(saveAdminPdf && timeline?.length)
  });

  return {
    sessionId: detail.id,
    name: detail.participant_name,
    metricsOk: true,
    testSaved: persist.testSaved,
    adminSaved: persist.adminSaved,
    errors: persist.errors || [],
    overallScore: metrics.overallScore,
    version: metrics.version
  };
}

/**
 * Birden fazla oturum — sırayla (PDF üretimi ağır).
 * @param {string[]} sessionIds
 * @param {{ locale?: string, onProgress?: (done: number, total: number, last: object) => void }} [opts]
 */
export async function refreshStoredReports(sessionIds, opts = {}) {
  const locale = opts.locale || "tr";
  const onProgress = opts.onProgress;
  const results = [];
  const total = sessionIds.length;
  for (let i = 0; i < sessionIds.length; i++) {
    const id = sessionIds[i];
    let row;
    try {
      row = await refreshOneStoredReport(id, { locale });
      row.ok = row.testSaved;
      if (!row.testSaved) row.error = (row.errors || []).join("; ") || "PDF kaydı başarısız";
    } catch (e) {
      row = {
        sessionId: id,
        ok: false,
        metricsOk: false,
        testSaved: false,
        adminSaved: false,
        error: e?.message || String(e)
      };
    }
    results.push(row);
    onProgress?.(i + 1, total, row);
  }
  return results;
}
