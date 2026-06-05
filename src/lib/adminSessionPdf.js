import { downloadAdminTimelinePdf } from "../pdfAdminTimeline.js";
import { downloadPdf } from "../pdfReport.js";
import { getProfile } from "../profiles.js";

/** Supabase oturum kaydı → katılımcı raporu PDF argümanları. */
export function sessionToParticipantReportArgs(session, pressTimeline = []) {
  if (!session?.logs?.length) {
    throw new Error("Bu test için deneme kaydı (logs) bulunamadı.");
  }
  if (!session?.target) {
    throw new Error("Bu test için hedef nesne kaydı bulunamadı.");
  }
  const profile = getProfile(session.profile_key ?? "adult");
  return {
    participant: {
      name: session.participant_name ?? "Katılımcı",
      age: session.participant_age ?? null,
      birthDate: session.participant_birth_date ?? null,
      gender: session.participant_gender ?? null
    },
    profile,
    logs: session.logs,
    target: session.target,
    pressTimeline: pressTimeline ?? []
  };
}

/** Katılımcı test raporu — PDF indir (veritabanından yeniden üretir). */
export async function downloadParticipantReportFromSession(session, pressTimeline = []) {
  await downloadPdf(sessionToParticipantReportArgs(session, pressTimeline));
}

/** Admin basış raporu — PDF indir. */
export async function downloadPressReportFromSession(session, timeline) {
  if (!timeline?.length) {
    throw new Error("Bu test için basış kaydı yok (eski kayıt veya timeline boş).");
  }
  await downloadAdminTimelinePdf({
    session,
    timeline,
    target: session.target
  });
}
