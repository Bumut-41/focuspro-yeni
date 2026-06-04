import { formatTestMs } from "./lib/testTime.js";
import { symbolCaption } from "./lib/symbolLabels.js";
import {
  enrichPressList,
  pressesForTrial,
  pressStatusLabel,
  pressToTableRow,
  summarizePresses
} from "./lib/pressTimelineReport.js";
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

function tableLayout() {
  return {
    fillColor: (i) => (i === 0 ? "#1e293b" : i % 2 === 0 ? "#f8fafc" : null),
    hLineColor: () => "#e2e8f0",
    vLineColor: () => "#e2e8f0"
  };
}

function sectionHead(text, pageBreak = false) {
  return {
    text,
    fontSize: 11,
    bold: true,
    color: "#4c1d95",
    margin: [0, pageBreak ? 12 : 8, 0, 6],
    pageBreak: pageBreak ? "before" : undefined
  };
}

export function buildAdminTimelineDocDefinition({ session, timeline, target }) {
  const logs = session?.logs ?? [];
  const presses = enrichPressList(timeline);
  const profile = session?.profile_key ? getProfile(session.profile_key) : null;
  const lateMs = profile?.lateResponseMs ?? 800;
  const targetTrials = logs.filter((t) => t.isTarget);
  const stats = summarizePresses(presses);
  const wrongPresses = presses.filter((p) => p.isWrongSymbol || p.errorType === "false_alarm");
  const idlePresses = presses.filter((p) => p.errorType === "idle");

  const allPressRows = presses.slice(0, 350).map((p) => pressToTableRow(p));

  const wrongRows = wrongPresses.slice(0, 120).map((p) => [
    String(p.pressIndex),
    formatTestMs(p.atMs),
    p.trialNumber != null ? String(p.trialNumber) : "—",
    symbolCaption(p.shownShape ?? p.onScreen?.shape, p.shownColor ?? p.onScreen?.color),
    p.reactionMs != null ? String(Math.round(p.reactionMs)) : "—",
    pressStatusLabel(p, lateMs)
  ]);

  const targetDetailRows = [];
  for (const t of targetTrials.slice(0, 150)) {
    const trialPresses = pressesForTrial(presses, t.trialNumber);
    if (!trialPresses.length) {
      targetDetailRows.push([
        String(t.trialNumber),
        formatTestMs(t.onsetMs),
        symbolCaption(t.shownShape, t.shownColor),
        "—",
        "—",
        "—",
        "Kaçırıldı"
      ]);
      continue;
    }
    trialPresses.forEach((p, idx) => {
      targetDetailRows.push([
        idx === 0 ? String(t.trialNumber) : "",
        idx === 0 ? formatTestMs(t.onsetMs) : "",
        idx === 0 ? symbolCaption(t.shownShape, t.shownColor) : "",
        formatTestMs(p.atMs),
        String(p.pressInTrial ?? "—"),
        p.reactionMs != null ? String(Math.round(p.reactionMs)) : "—",
        pressStatusLabel(p, lateMs)
      ]);
    });
  }

  return {
    pageSize: "A4",
    pageMargins: [28, 28, 28, 36],
    defaultStyle: { font: "Roboto", fontSize: 7 },
    footer: (cp, pc) => ({
      text: `FocusProLab — Yönetici basış raporu • ${cp}/${pc}`,
      alignment: "center",
      fontSize: 7,
      color: "#94a3b8",
      margin: [28, 0, 28, 12]
    }),
    content: [
      { text: "Basış Zaman Çizelgesi", fontSize: 16, bold: true, color: "#0f172a" },
      { text: "Yalnızca yönetici — her Space basışı kayıtlıdır", fontSize: 9, color: "#dc2626", margin: [0, 2, 0, 8] },
      {
        text: [
          `Katılımcı: ${session.participant_name} • Yaş: ${session.participant_age ?? "—"} • Profil: ${session.profile_key}\n`,
          `Oturum: ${session.id} • ${new Date(session.created_at).toLocaleString("tr-TR")}\n`,
          target ? `Hedef: ${symbolCaption(target.shape, target.color)}` : "Hedef kaydı yok",
          `\nÖzet: ${stats.total} basış · ${stats.correct} isabet · ${stats.late} geç · ${stats.falseAlarm} yanlış simge · ${stats.multi} çoklu · ${stats.idle} boş ekran`
        ],
        margin: [0, 0, 0, 10]
      },
      sectionHead("Tüm Space basışları (kronolojik)", true),
      {
        table: {
          headerRows: 1,
          widths: [22, 44, 28, "*", 32, 38, 28, 32, "*"],
          body: [
            [
              { text: "#", bold: true, color: "#fff" },
              { text: "Basış", bold: true, color: "#fff" },
              { text: "Den.", bold: true, color: "#fff" },
              { text: "Ekrandaki simge", bold: true, color: "#fff" },
              { text: "Hedef?", bold: true, color: "#fff" },
              { text: "Yanlış?", bold: true, color: "#fff" },
              { text: "Sıra", bold: true, color: "#fff" },
              { text: "RT", bold: true, color: "#fff" },
              { text: "Durum", bold: true, color: "#fff" }
            ],
            ...(allPressRows.length ? allPressRows : [["—", "—", "—", "—", "—", "—", "—", "—", "—"]])
          ]
        },
        layout: tableLayout(),
        margin: [0, 0, 0, 10]
      },
      idlePresses.length
        ? sectionHead(`Boş ekran basışları (${idlePresses.length})`)
        : null,
      idlePresses.length
        ? {
            table: {
              headerRows: 1,
              widths: [22, 44, "*", "*"],
              body: [
                [
                  { text: "#", bold: true, color: "#fff" },
                  { text: "Basış", bold: true, color: "#fff" },
                  { text: "Bölüm", bold: true, color: "#fff" },
                  { text: "Durum", bold: true, color: "#fff" }
                ],
                ...idlePresses.slice(0, 80).map((p) => [
                  String(p.pressIndex),
                  formatTestMs(p.atMs),
                  p.section ? p.section.replace(/^[^—]+—\s*/, "") : "—",
                  pressStatusLabel(p, lateMs)
                ])
              ]
            },
            layout: tableLayout(),
            margin: [0, 0, 0, 10]
          }
        : null,
      wrongRows.length
        ? sectionHead(`Yanlış simgede basışlar (${wrongPresses.length})`)
        : null,
      wrongRows.length
        ? {
            table: {
              headerRows: 1,
              widths: [22, 44, 28, "*", 32, "*"],
              body: [
                [
                  { text: "#", bold: true, color: "#fff" },
                  { text: "Basış", bold: true, color: "#fff" },
                  { text: "Den.", bold: true, color: "#fff" },
                  { text: "Gösterilen simge", bold: true, color: "#fff" },
                  { text: "RT", bold: true, color: "#fff" },
                  { text: "Durum", bold: true, color: "#fff" }
                ],
                ...wrongRows
              ]
            },
            layout: tableLayout("#7c2d12"),
            margin: [0, 0, 0, 10]
          }
        : null,
      sectionHead("Hedef denemeleri — tüm basışlar", wrongRows.length > 0 || allPressRows.length > 80),
      {
        table: {
          headerRows: 1,
          widths: [28, 44, "*", 44, 24, 32, "*"],
          body: [
            [
              { text: "Den.", bold: true, color: "#fff" },
              { text: "Onset", bold: true, color: "#fff" },
              { text: "Hedef simge", bold: true, color: "#fff" },
              { text: "Basış", bold: true, color: "#fff" },
              { text: "Sıra", bold: true, color: "#fff" },
              { text: "RT", bold: true, color: "#fff" },
              { text: "Durum", bold: true, color: "#fff" }
            ],
            ...(targetDetailRows.length ? targetDetailRows : [["—", "—", "—", "—", "—", "—", "—"]])
          ]
        },
        layout: tableLayout(),
        margin: [0, 0, 0, 8]
      },
      presses.length > 350
        ? {
            text: `Not: Kronoloji tablosu ilk 350 basış (${presses.length} toplam). Tam liste veritabanındadır.`,
            fontSize: 7,
            color: "#64748b"
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

/** Yönetim ekranından doğrudan indirme */
export async function downloadAdminTimelinePdf({ session, timeline, target }) {
  const blob = await createAdminTimelinePdfBlob({ session, timeline, target });
  const name = session?.participant_name?.replace(/\s+/g, "_") ?? "katilimci";
  const stamp = new Date(session?.created_at ?? Date.now()).toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `FocusProLab_Basis_${name}_${stamp}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
