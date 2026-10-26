import { downloadPdf } from "../pdfReport.js";
import { downloadComparisonPdf } from "../pdfScoreComparison.js";
import { sessionToParticipantReportArgs } from "./adminSessionPdf.js";
import { fetchAdminPressTimeline, fetchSessionDetail } from "../services/sessions.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Yerel indirme sırası:
 * 1) V1 resmi rapor
 * 2) V1/V2/V3 karşılaştırma (yönetici karşılaştırma özelliği)
 * 3) V2 deneme raporu
 * 4) V3 deneme raporu
 * 5) V4 deneme raporu (V3 skor + rapor düzeltmeleri)
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
  await sleep(gapMs);

  onStep?.("v3");
  await downloadPdf({ ...base, scoringVersion: "v3" });
  await sleep(gapMs);

  onStep?.("v4");
  await downloadPdf({ ...base, scoringVersion: "v4" });
  onStep?.("done");
}

/** @deprecated alias — aynı paket (V1 + karşılaştırma + V2 + V3 + V4) */
export const downloadPilotReportBundle = downloadV1ComparisonV2Reports;

/**
 * Sistemdeki eski oturumdan logs ile V1 → karşılaştırma → V2 → V3 → V4 üretir ve indirir.
 * Storage’daki kayıtlı V1 PDF’e dokunmaz; ham veri / kayıtlı skor değişmez.
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
