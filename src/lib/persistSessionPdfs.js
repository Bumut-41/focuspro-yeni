import { createAdminTimelinePdfBlob } from "../pdfAdminTimeline.js";
import { createPdfBlob } from "../pdfReport.js";
import { persistAdminReportPdf, persistSessionReportPdf } from "../services/sessions.js";

async function withRetry(fn, retries = 1) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/**
 * Test bitince katılımcı + basış PDF'lerini Storage'a kaydeder.
 * @returns {{ testSaved: boolean, adminSaved: boolean, testBlob: Blob, errors: string[] }}
 */
export async function persistAllSessionPdfs({
  userId,
  sessionId,
  participant,
  profile,
  logs,
  target,
  pressTimeline = [],
  locale = "tr"
}) {
  const errors = [];
  let testSaved = false;
  let adminSaved = false;
  let testBlob = null;

  try {
    testBlob = await withRetry(() =>
      createPdfBlob({ participant, profile, logs, target, pressTimeline, locale })
    );
    await withRetry(() => persistSessionReportPdf(userId, sessionId, testBlob));
    testSaved = true;
  } catch (e) {
    errors.push(`Test raporu PDF: ${e?.message || "kayıt başarısız"}`);
  }

  if (pressTimeline?.length) {
    try {
      const adminBlob = await withRetry(() =>
        createAdminTimelinePdfBlob({
          session: {
            id: sessionId,
            participant_name: participant.name,
            participant_age: participant.age ?? null,
            participant_birth_date: participant.birthDate ?? null,
            participant_gender: participant.gender ?? null,
            profile_key: profile.key,
            created_at: new Date().toISOString(),
            logs
          },
          timeline: pressTimeline,
          target
        })
      );
      await withRetry(() => persistAdminReportPdf(userId, sessionId, adminBlob));
      adminSaved = true;
    } catch (e) {
      errors.push(`Basış raporu PDF: ${e?.message || "kayıt başarısız"}`);
    }
  }

  return { testSaved, adminSaved, testBlob, errors };
}

export function formatPersistResult({ testSaved, adminSaved, errors }, hasTimeline, locale = "tr") {
  const tr = locale !== "en";
  if (testSaved && (adminSaved || !hasTimeline)) {
    let msg = tr
      ? "Test raporu sisteme kaydedildi."
      : "Test report saved to your account.";
    if (adminSaved) {
      msg += tr ? " Basış raporu (admin) kaydedildi." : " Press report (admin) saved.";
    }
    return msg;
  }
  if (testSaved) {
    return tr
      ? `Test raporu kaydedildi. ${errors.join(" ")}`
      : `Test report saved. ${errors.join(" ")}`;
  }
  return tr
    ? `PDF kaydı başarısız: ${errors.join(" ")} «PDF indir» ile tekrar deneyebilirsiniz.`
    : `PDF save failed: ${errors.join(" ")} Try «Download PDF» again.`;
}
