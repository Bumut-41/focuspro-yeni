import { formatTestMs } from "./lib/testTime.js";
import { symbolCaption } from "./lib/symbolLabels.js";
import {
  buildAtihImpactSummary,
  enrichPressList,
  formatTempoCell,
  omissionImpactInfo,
  phaseTempoForSection,
  pressesForTrial,
  pressScoreImpact,
  pressScoreImpactInfo,
  pressStatusLabel,
  pressToDetailedTableRow,
  summarizePresses
} from "./lib/pressTimelineReport.js";
import { getPdfMake } from "./lib/pdfMakeLoader.js";
import { getProfile } from "./profiles.js";

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

function scoreCell(metrics, key) {
  const v = metrics?.[key];
  if (v == null || Number.isNaN(Number(v))) return "—";
  return String(Math.round(Number(v)));
}

export function buildAdminTimelineDocDefinition({ session, timeline, target }) {
  const logs = session?.logs ?? [];
  const profile = session?.profile_key ? getProfile(session.profile_key) : null;
  const lateMs = profile?.lateResponseMs ?? 800;
  const presses = enrichPressList(timeline, profile);
  const targetTrials = logs.filter((t) => t.isTarget);
  const stats = summarizePresses(presses);
  const wrongPresses = presses.filter((p) => p.isWrongSymbol || p.errorType === "false_alarm");
  const idlePresses = presses.filter((p) => p.errorType === "idle");
  const metrics = session?.metrics || {};
  const atih = buildAtihImpactSummary(presses, logs, metrics, lateMs);

  const allPressRows = presses.slice(0, 400).map((p) => pressToDetailedTableRow(p, lateMs));

  const formatWhere = (ev) => {
    const parts = [];
    if (ev.pressIndex != null) parts.push(`#${ev.pressIndex}`);
    if (ev.trialNumber != null) parts.push(`den.${ev.trialNumber}`);
    if (ev.atMs != null) parts.push(formatTestMs(ev.atMs));
    if (ev.reason) parts.push(ev.reason);
    return parts.join(" · ") || "—";
  };

  const atihSummaryRows = atih.rows.map((r) => {
    const where =
      r.events.length === 0
        ? "—"
        : r.events
            .slice(0, 12)
            .map(formatWhere)
            .join("\n") + (r.events.length > 12 ? `\n… +${r.events.length - 12} olay` : "");
    return [
      { text: r.name, bold: true },
      { text: r.score != null ? String(r.score) : "—", bold: true, alignment: "center" },
      { text: String(r.events.length), alignment: "center" },
      r.note,
      where
    ];
  });

  const hurtEvents = atih.rows.flatMap((r) =>
    r.events.map((ev) => ({
      indexKey: r.key,
      ...ev
    }))
  );

  const hurtRows = hurtEvents.slice(0, 120).map((ev) => [
    ev.indexKey,
    ev.pressIndex != null ? String(ev.pressIndex) : "—",
    ev.trialNumber != null ? String(ev.trialNumber) : "—",
    formatTestMs(ev.atMs),
    ev.section ? String(ev.section).replace(/^[^—]+—\s*/, "") : "—",
    ev.reactionMs != null ? String(Math.round(ev.reactionMs)) : "—",
    `${ev.impact} — ${ev.reason}`
  ]);

  const wrongRows = wrongPresses.slice(0, 120).map((p) => {
    const info = pressScoreImpactInfo(p, lateMs);
    return [
      String(p.pressIndex),
      formatTestMs(p.atMs),
      p.trialNumber != null ? String(p.trialNumber) : "—",
      formatTempoCell(p.tempo),
      symbolCaption(p.shownShape ?? p.onScreen?.shape, p.shownColor ?? p.onScreen?.color),
      p.reactionMs != null ? String(Math.round(p.reactionMs)) : "—",
      pressStatusLabel(p, lateMs),
      info.endeks,
      pressScoreImpact(p, lateMs)
    ];
  });

  const targetDetailRows = [];
  for (const t of targetTrials.slice(0, 150)) {
    const tempo = phaseTempoForSection(profile, t.section, t.onsetMs);
    const trialPresses = pressesForTrial(presses, t.trialNumber);
    if (!trialPresses.length) {
      const om = omissionImpactInfo();
      targetDetailRows.push([
        String(t.trialNumber),
        formatTestMs(t.onsetMs),
        formatTempoCell(tempo),
        symbolCaption(t.shownShape, t.shownColor),
        "—",
        "—",
        "—",
        "Kaçırıldı",
        om.endeks,
        `${om.impact} — ${om.reason}`
      ]);
      continue;
    }
    trialPresses.forEach((p, idx) => {
      const info = p.impactInfo || pressScoreImpactInfo(p, lateMs);
      targetDetailRows.push([
        idx === 0 ? String(t.trialNumber) : "",
        idx === 0 ? formatTestMs(t.onsetMs) : "",
        idx === 0 ? formatTempoCell(tempo || p.tempo) : "",
        idx === 0 ? symbolCaption(t.shownShape, t.shownColor) : "",
        formatTestMs(p.atMs),
        String(p.pressInTrial ?? "—"),
        p.reactionMs != null ? String(Math.round(p.reactionMs)) : "—",
        pressStatusLabel(p, lateMs),
        info.endeks,
        info.hurts ? `${info.impact} — ${info.reason}` : info.reason
      ]);
    });
  }

  const headerDetail = [
    `Katılımcı: ${session.participant_name} • Yaş: ${session.participant_age ?? "—"} • Profil: ${session.profile_key}`,
    `Oturum: ${session.id} • ${new Date(session.created_at).toLocaleString("tr-TR")}`,
    target ? `Hedef: ${symbolCaption(target.shape, target.color)}` : "Hedef kaydı yok",
    `Geç eşiği (lateMs): ${lateMs} ms · V4’te ortalama tepki hızı T’ye puan olarak girmez`,
    `Kayıtlı skorlar — A: ${scoreCell(metrics, "attentionScore")} · T: ${scoreCell(metrics, "speedScore")} · I: ${scoreCell(metrics, "impulseScore")} · H: ${scoreCell(metrics, "consistencyScore")} · Genel: ${scoreCell(metrics, "overallScore")}`,
    `Basış özeti: ${stats.total} basış · ${stats.correct} isabet · ${stats.late} geç · ${stats.falseAlarm} yanlış simge · ${stats.multi} çoklu · ${stats.idle} boş ekran`
  ].join("\n");

  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [22, 22, 22, 28],
    defaultStyle: { font: "Roboto", fontSize: 6.5 },
    footer: (cp, pc) => ({
      text: `FocusProLab — Yönetici basış raporu (detaylı) • ${cp}/${pc}`,
      alignment: "center",
      fontSize: 7,
      color: "#94a3b8",
      margin: [22, 0, 22, 10]
    }),
    content: [
      { text: "Basış Zaman Çizelgesi — Detaylı", fontSize: 15, bold: true, color: "#0f172a" },
      {
        text: "Yalnızca yönetici — A/T/I/H puan haritası + tempo + her basışın endeks etkisi",
        fontSize: 9,
        color: "#dc2626",
        margin: [0, 2, 0, 6]
      },
      { text: headerDetail, margin: [0, 0, 0, 8], fontSize: 7.5 },
      sectionHead("A / T / I / H — nerede puan aldı / kaybetti"),
      {
        table: {
          headerRows: 1,
          widths: [78, 36, 40, 180, "*"],
          body: [
            [
              { text: "Endeks", bold: true, color: "#fff" },
              { text: "Skor", bold: true, color: "#fff" },
              { text: "Olay", bold: true, color: "#fff" },
              { text: "Ne anlama gelir", bold: true, color: "#fff" },
              { text: "Nerede (basış / deneme / zaman)", bold: true, color: "#fff" }
            ],
            ...atihSummaryRows
          ]
        },
        layout: tableLayout(),
        margin: [0, 0, 0, 8]
      },
      {
        text: [
          { text: "Anahtar: ", bold: true },
          "A = ihmal (kaçırma). T = geç yanıt + RT değişkenliği (ortalama hız puanlanmaz). ",
          "I = yanlış alarm. H = boş ekran veya çoklu basış. ",
          "Zamanında isabet skoru düşürmez (A korunur; T RT örneğine girer)."
        ],
        fontSize: 7,
        color: "#475569",
        margin: [0, 0, 0, 4]
      },
      {
        text: [
          { text: "Tempo: ", bold: true },
          "gösterge = simgenin ekranda kalma süresi (ms). SOA = gösterge + boşluk. yavaş / orta / hızlı = bölüm temposu."
        ],
        fontSize: 7,
        color: "#475569",
        margin: [0, 0, 0, 8]
      },
      hurtRows.length
        ? sectionHead(`Skoru düşüren olaylar — A/T/I/H (${hurtEvents.length})`)
        : null,
      hurtRows.length
        ? {
            table: {
              headerRows: 1,
              widths: [28, 28, 28, 44, "*", 32, 160],
              body: [
                [
                  { text: "Endeks", bold: true, color: "#fff" },
                  { text: "#", bold: true, color: "#fff" },
                  { text: "Den.", bold: true, color: "#fff" },
                  { text: "Zaman", bold: true, color: "#fff" },
                  { text: "Bölüm", bold: true, color: "#fff" },
                  { text: "RT", bold: true, color: "#fff" },
                  { text: "Etki", bold: true, color: "#fff" }
                ],
                ...hurtRows
              ]
            },
            layout: tableLayout(),
            margin: [0, 0, 0, 10]
          }
        : null,
      sectionHead("Tüm Space basışları (kronolojik + tempo + endeks)", true),
      {
        table: {
          headerRows: 1,
          widths: [16, 34, 20, 64, 72, 64, 26, 18, 24, 44, 28, 70],
          body: [
            [
              { text: "#", bold: true, color: "#fff" },
              { text: "Basış", bold: true, color: "#fff" },
              { text: "Den.", bold: true, color: "#fff" },
              { text: "Bölüm", bold: true, color: "#fff" },
              { text: "Tempo", bold: true, color: "#fff" },
              { text: "Ekrandaki simge", bold: true, color: "#fff" },
              { text: "Hedef?", bold: true, color: "#fff" },
              { text: "Sıra", bold: true, color: "#fff" },
              { text: "RT", bold: true, color: "#fff" },
              { text: "Durum", bold: true, color: "#fff" },
              { text: "Endeks", bold: true, color: "#fff" },
              { text: "Puan etkisi", bold: true, color: "#fff" }
            ],
            ...(allPressRows.length
              ? allPressRows
              : [["—", "—", "—", "—", "—", "—", "—", "—", "—", "—", "—", "—"]])
          ]
        },
        layout: tableLayout(),
        margin: [0, 0, 0, 10]
      },
      idlePresses.length ? sectionHead(`Boş ekran basışları — H (${idlePresses.length})`) : null,
      idlePresses.length
        ? {
            table: {
              headerRows: 1,
              widths: [22, 44, "*", 90, 28, "*"],
              body: [
                [
                  { text: "#", bold: true, color: "#fff" },
                  { text: "Basış", bold: true, color: "#fff" },
                  { text: "Bölüm", bold: true, color: "#fff" },
                  { text: "Tempo", bold: true, color: "#fff" },
                  { text: "Endeks", bold: true, color: "#fff" },
                  { text: "Puan etkisi", bold: true, color: "#fff" }
                ],
                ...idlePresses.slice(0, 80).map((p) => {
                  const info = pressScoreImpactInfo(p, lateMs);
                  return [
                    String(p.pressIndex),
                    formatTestMs(p.atMs),
                    p.tempo?.shortSection || (p.section ? String(p.section).replace(/^[^—]+—\s*/, "") : "—"),
                    formatTempoCell(p.tempo),
                    info.endeks,
                    pressScoreImpact(p, lateMs)
                  ];
                })
              ]
            },
            layout: tableLayout(),
            margin: [0, 0, 0, 10]
          }
        : null,
      wrongRows.length ? sectionHead(`Yanlış simgede basışlar — I (${wrongPresses.length})`) : null,
      wrongRows.length
        ? {
            table: {
              headerRows: 1,
              widths: [20, 40, 24, 72, "*", 28, 44, 28, 70],
              body: [
                [
                  { text: "#", bold: true, color: "#fff" },
                  { text: "Basış", bold: true, color: "#fff" },
                  { text: "Den.", bold: true, color: "#fff" },
                  { text: "Tempo", bold: true, color: "#fff" },
                  { text: "Gösterilen simge", bold: true, color: "#fff" },
                  { text: "RT", bold: true, color: "#fff" },
                  { text: "Durum", bold: true, color: "#fff" },
                  { text: "Endeks", bold: true, color: "#fff" },
                  { text: "Puan etkisi", bold: true, color: "#fff" }
                ],
                ...wrongRows
              ]
            },
            layout: tableLayout(),
            margin: [0, 0, 0, 10]
          }
        : null,
      sectionHead("Hedef denemeleri — tempo + endeks + puan", true),
      {
        table: {
          headerRows: 1,
          widths: [22, 36, 70, 64, 36, 20, 24, 44, 28, 70],
          body: [
            [
              { text: "Den.", bold: true, color: "#fff" },
              { text: "Onset", bold: true, color: "#fff" },
              { text: "Tempo", bold: true, color: "#fff" },
              { text: "Hedef simge", bold: true, color: "#fff" },
              { text: "Basış", bold: true, color: "#fff" },
              { text: "Sıra", bold: true, color: "#fff" },
              { text: "RT", bold: true, color: "#fff" },
              { text: "Durum", bold: true, color: "#fff" },
              { text: "Endeks", bold: true, color: "#fff" },
              { text: "Puan etkisi", bold: true, color: "#fff" }
            ],
            ...(targetDetailRows.length
              ? targetDetailRows
              : [["—", "—", "—", "—", "—", "—", "—", "—", "—", "—"]])
          ]
        },
        layout: tableLayout(),
        margin: [0, 0, 0, 8]
      },
      presses.length > 400
        ? {
            text: `Not: Kronoloji tablosu ilk 400 basış (${presses.length} toplam). Tam liste veritabanındadır.`,
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

export async function downloadAdminTimelinePdf({ session, timeline, target }) {
  const blob = await createAdminTimelinePdfBlob({ session, timeline, target });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `FocusProLab_${session?.participant_name || "oturum"}_basis-detay.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
