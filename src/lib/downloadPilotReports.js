import { downloadPdf } from "../pdfReport.js";
import { downloadComparisonPdf } from "../pdfScoreComparison.js";
import { ACTIVE_REPORT_SCORING_VERSION } from "../scoringVersion.js";
import { sessionToParticipantReportArgs } from "./adminSessionPdf.js";
import { fetchAdminPressTimeline, fetchSessionDetail } from "../services/sessions.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Kullanıcıya sunulan rapor indirme — yalnızca V4.
 */
export async function downloadActiveReport(args) {
  const { onStep = null, ...rest } = args;
  onStep?.(ACTIVE_REPORT_SCORING_VERSION);
  await downloadPdf({ ...rest, scoringVersion: ACTIVE_REPORT_SCORING_VERSION });
  onStep?.("done");
}

/**
 * @deprecated Kullanıcı akışında kullanılmaz. V1–V4 paketini yalnızca dahili araştırma için saklar.
 */
export async function downloadLegacyScoringBundle({
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

/** @deprecated alias — artık yalnızca V4 indirir */
export async function downloadV1ComparisonV2Reports(args) {
  return downloadActiveReport(args);
}

/** @deprecated alias */
export const downloadPilotReportBundle = downloadActiveReport;

/** Oturumdan aktif (V4) rapor üretip indirir. */
export async function downloadPilotReportsFromSessionId(sessionId, locale = "tr", onStep = null) {
  const [detail, timeline] = await Promise.all([
    fetchSessionDetail(sessionId),
    fetchAdminPressTimeline(sessionId).catch(() => [])
  ]);
  if (!detail) throw new Error("Oturum bulunamadı.");
  const args = sessionToParticipantReportArgs(detail, timeline ?? []);
  await downloadActiveReport({ ...args, locale, onStep });
  return detail;
}
