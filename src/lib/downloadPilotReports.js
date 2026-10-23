import { downloadPdf } from "../pdfReport.js";
import { downloadComparisonPdf } from "../pdfScoreComparison.js";
import { sessionToParticipantReportArgs } from "./adminSessionPdf.js";
import { fetchAdminPressTimeline, fetchSessionDetail } from "../services/sessions.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Yerel indirme sırası:
 * 1) V1 resmi rapor → 2) V1/V2 karşılaştırma → 3) V2 deneme raporu
 * Kayıtlı/e-posta PDF'si ayrı olarak yalnızca V1 kalır.
 */
export async function downloadV1ComparisonV2Reports({
  participant,
  profile,
  logs,
  target,
  pressTimeline = [],
  locale = "tr",
  gapMs = 700,
  onStep = null
}) {
  const base = { participant, profile, logs, target, pressTimeline, locale };

  onStep?.("v1");
  await downloadPdf({ ...base, scoringVersion: "v1" });
  await sleep(gapMs);

  onStep?.("comparison");
  await downloadComparisonPdf(base);
  await sleep(gapMs);

  onStep?.("v2");
  await downloadPdf({ ...base, scoringVersion: "v2" });
  onStep?.("done");
}

/**
 * Sistemdeki eski oturumdan logs ile V1 → karşılaştırma → V2 üretir ve indirir.
 * Storage’daki kayıtlı V1 PDF’e dokunmaz.
 */
export async function downloadPilotReportsFromSessionId(sessionId, locale = "tr", onStep = null) {
  const [detail, timeline] = await Promise.all([
    fetchSessionDetail(sessionId),
    fetchAdminPressTimeline(sessionId).catch(() => [])
  ]);
  if (!detail) throw new Error("Oturum bulunamadı.");
  const args = sessionToParticipantReportArgs(detail, timeline ?? []);
  await downloadV1ComparisonV2Reports({ ...args, locale, onStep });
  return detail;
}
