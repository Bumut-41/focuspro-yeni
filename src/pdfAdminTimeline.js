import { formatTestMs } from "./lib/testTime.js";
import { shapeLabel } from "./lib/symbolLabels.js";
import { getProfile } from "./profiles.js";

let pdfMakePromise;

async function getPdfMake() {
  if (!pdfMakePromise) {
    pdfMakePromise = (async () => {
      const pdfMakeMod = await import("pdfmake/build/pdfmake");
      const pdfFontsMod = await import("pdfmake/build/vfs_fonts");
      const pdfMake = pdfMakeMod.default ?? pdfMakeMod;
      const pdfFonts = pdfFontsMod.default ?? pdfFontsMod;
      pdfMake.vfs = pdfFonts.pdfMake?.vfs ?? pdfFonts.vfs;
      if (!pdfMake.vfs) throw new Error("PDF yazı tipleri yüklenemedi.");
      return pdfMake;
    })();
  }
  return pdfMakePromise;
}

const ERROR_LABELS = {
  none: "Doğru basış",
  late: "Geç basış (hedef)",
  false_alarm: "Hatalı — hedef değilken",
  multi: "Çoklu basış",
  idle: "Hatalı — simge yokken"
};

function tableLayout() {
  return {
    fillColor: (i) => (i === 0 ? "#1e293b" : i % 2 === 0 ? "#f8fafc" : null),
    hLineColor: () => "#e2e8f0",
    vLineColor: () => "#e2e8f0"
  };
}

export function buildAdminTimelineDocDefinition({ session, timeline, target }) {
  const logs = session?.logs ?? [];
  const presses = timeline ?? [];
  const profile = session?.profile_key ? getProfile(session.profile_key) : null;
  const lateMs = profile?.lateResponseMs ?? 800;
  const targetTrials = logs.filter((t) => t.isTarget);
  const errors = presses.filter((p) => ["false_alarm", "multi", "idle"].includes(p.errorType));

  const targetRows = targetTrials.slice(0, 120).map((t) => {
    const first = (t.trialPresses ?? [])[0];
    const status = !t.responded ? "Kaçırıldı" : t.reactionTime > lateMs ? "Geç" : "İsabet";
    return [
      String(t.trialNumber),
      formatTestMs(t.onsetMs),
      shapeLabel(t.shownShape),
      first ? formatTestMs(first.atMs) : "—",
      first?.reactionMs != null ? String(Math.round(first.reactionMs)) : "—",
      status
    ];
  });

  const pressRows = presses.slice(0, 200).map((p) => [
    formatTestMs(p.atMs),
    p.trialNumber != null ? String(p.trialNumber) : "—",
    p.onScreen ? shapeLabel(p.onScreen.shape) : "—",
    ERROR_LABELS[p.errorType] ?? p.errorType,
    p.reactionMs != null ? String(Math.round(p.reactionMs)) : "—"
  ]);

  const errorRows = errors.slice(0, 80).map((p) => [
    formatTestMs(p.atMs),
    ERROR_LABELS[p.errorType] ?? p.errorType,
    p.trialNumber != null ? String(p.trialNumber) : "—"
  ]);

  return {
    pageSize: "A4",
    pageMargins: [32, 32, 32, 40],
    defaultStyle: { font: "Roboto", fontSize: 8 },
    footer: (cp, pc) => ({
      text: `FocusProLab — Yönetici basış raporu • ${cp}/${pc}`,
      alignment: "center",
      fontSize: 7,
      color: "#94a3b8",
      margin: [32, 0, 32, 16]
    }),
    content: [
      { text: "Basış Zaman Çizelgesi", fontSize: 16, bold: true, color: "#0f172a" },
      { text: "Yalnızca yönetici — katılımcıya sunulmaz", fontSize: 9, color: "#dc2626", margin: [0, 2, 0, 10] },
      {
        text: [
          `Katılımcı: ${session.participant_name} • Yaş: ${session.participant_age ?? "—"} • Profil: ${session.profile_key}\n`,
          `Oturum: ${session.id} • ${new Date(session.created_at).toLocaleString("tr-TR")}\n`,
          target
            ? `Hedef: ${shapeLabel(target.shape)} (${target.color})`
            : "Hedef kaydı yok"
        ],
        margin: [0, 0, 0, 12]
      },
      { text: "Hedef simge denemeleri (ilk 120)", bold: true, fontSize: 10, margin: [0, 0, 0, 6] },
      {
        table: {
          headerRows: 1,
          widths: [28, 52, "*", 52, 40, 50],
          body: [
            [
              { text: "#", bold: true, color: "#fff" },
              { text: "Onset", bold: true, color: "#fff" },
              { text: "Simge", bold: true, color: "#fff" },
              { text: "Basış", bold: true, color: "#fff" },
              { text: "RT ms", bold: true, color: "#fff" },
              { text: "Durum", bold: true, color: "#fff" }
            ],
            ...(targetRows.length ? targetRows : [["—", "—", "Kayıt yok", "—", "—", "—"]])
          ]
        },
        layout: tableLayout(),
        margin: [0, 0, 0, 14]
      },
      { text: "Tüm basışlar (ilk 200)", bold: true, fontSize: 10, pageBreak: presses.length > 100 ? "before" : undefined, margin: [0, 0, 0, 6] },
      {
        table: {
          headerRows: 1,
          widths: [52, 32, "*", "*", 40],
          body: [
            [
              { text: "Zaman", bold: true, color: "#fff" },
              { text: "#", bold: true, color: "#fff" },
              { text: "Ekranda", bold: true, color: "#fff" },
              { text: "Durum", bold: true, color: "#fff" },
              { text: "RT", bold: true, color: "#fff" }
            ],
            ...(pressRows.length ? pressRows : [["—", "—", "—", "—", "—"]])
          ]
        },
        layout: tableLayout(),
        margin: [0, 0, 0, 14]
      },
      { text: "Hatalı basışlar", bold: true, fontSize: 10, margin: [0, 0, 0, 6] },
      {
        table: {
          headerRows: 1,
          widths: [52, "*", 32],
          body: [
            [
              { text: "Zaman", bold: true, color: "#fff" },
              { text: "Tür", bold: true, color: "#fff" },
              { text: "#", bold: true, color: "#fff" }
            ],
            ...(errorRows.length ? errorRows : [["—", "Hata yok", "—"]])
          ]
        },
        layout: tableLayout()
      },
      presses.length > 200
        ? {
            text: `Not: Tablolar kısaltıldı (toplam ${presses.length} basış). Tam veri veritabanındadır.`,
            fontSize: 7,
            color: "#64748b",
            margin: [0, 12, 0, 0]
          }
        : null
    ].filter(Boolean)
  };
}

export async function createAdminTimelinePdfBlob({ session, timeline, target }) {
  const pdfMake = await getPdfMake();
  const doc = buildAdminTimelineDocDefinition({ session, timeline, target });
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(doc).getBlob((b) => resolve(b));
    } catch (e) {
      reject(e);
    }
  });
}
