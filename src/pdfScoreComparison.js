import { dateLocaleForPdf, getReportPdfStrings } from "./i18n/reportPdfStrings.js";
import { getPdfMake } from "./lib/pdfMakeLoader.js";
import { triggerBlobDownload } from "./lib/triggerBlobDownload.js";
import { buildPdfLogoBackground, getPdfLogoDataUrl } from "./lib/pdfLogoWatermark.js";
import { buildScoreComparison, formatScoreCell, timingUnavailableLabel } from "./scoreComparison.js";

const HEADER = "#4c1d95";
const SUB = "#475569";

function cell(text, opts = {}) {
  return { text: text ?? "—", fontSize: 8, color: "#0f172a", ...opts };
}

function timingCell(pack) {
  if (pack.timingUnavailable) return timingUnavailableLabel(pack.timingReason);
  return formatScoreCell(pack.timing);
}

export function buildComparisonDocDefinition({
  participant,
  profile,
  logs,
  pressTimeline = [],
  locale = "tr",
  logoDataUrl = null
}) {
  const pdf = getReportPdfStrings(locale);
  const dateLoc = dateLocaleForPdf(locale);
  const lateMs = profile.lateResponseMs;
  const age = participant?.age ?? null;
  const cmp = buildScoreComparison(logs, lateMs, age, pressTimeline);
  const { v1, v2, v3, v4, counts, delta } = cmp;

  const row = (label, a, b, c, d) => [
    cell(label, { bold: true }),
    cell(label.startsWith("T") ? (v1.timing == null ? "—" : formatScoreCell(a)) : formatScoreCell(a), {
      alignment: "center"
    }),
    cell(label.startsWith("T") ? timingCell(v2) : formatScoreCell(b), { alignment: "center" }),
    cell(label.startsWith("T") ? timingCell(v3) : formatScoreCell(c), { alignment: "center" }),
    cell(label.startsWith("T") ? timingCell(v4 || v3) : formatScoreCell(d), { alignment: "center" })
  ];

  return {
    pageSize: "A4",
    pageMargins: [36, 36, 36, 48],
    defaultStyle: { font: "Roboto", fontSize: 10 },
    background: buildPdfLogoBackground(logoDataUrl),
    content: [
      {
        text: "FocusProLab",
        fontSize: 20,
        bold: true,
        color: HEADER,
        margin: [0, 0, 0, 4]
      },
      {
        text: "V1 / V2 / V3 / V4 Skor Karşılaştırma (deneme)",
        fontSize: 14,
        color: HEADER,
        margin: [0, 0, 0, 8]
      },
      {
        text:
          "V1 resmi. V2: 450 ms hız (pilot). V3/V4 skor aynı (hız yok; K=100 exploratory). V4 farkı rapor dili/faz/veri kalitesi. Klinik karar için V1 kullanılır.",
        fontSize: 8,
        color: "#b45309",
        margin: [0, 0, 0, 12]
      },
      {
        text: [
          `${pdf.fullName}: ${participant?.name || "—"}  ·  `,
          `${pdf.age}: ${participant?.age ?? "—"}  ·  `,
          `${pdf.profile}: ${profile?.label || profile?.key || "—"}  ·  `,
          `${pdf.evalDate}: ${new Date().toLocaleDateString(dateLoc)}`
        ].join(""),
        fontSize: 9,
        color: SUB,
        margin: [0, 0, 0, 14]
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", 48, 48, 48, 48],
          body: [
            [
              { text: "Ölçüm", bold: true, color: "#fff", fillColor: HEADER, fontSize: 8 },
              { text: "V1", bold: true, color: "#fff", fillColor: HEADER, alignment: "center", fontSize: 8 },
              { text: "V2", bold: true, color: "#fff", fillColor: HEADER, alignment: "center", fontSize: 8 },
              { text: "V3", bold: true, color: "#fff", fillColor: HEADER, alignment: "center", fontSize: 8 },
              { text: "V4", bold: true, color: "#fff", fillColor: HEADER, alignment: "center", fontSize: 8 }
            ],
            row("A — Dikkat", v1.attention, v2.attention, v3.attention, v4?.attention),
            row("T — Zamanlama", v1.timing, v2.timing, v3.timing, v4?.timing),
            row("I — Dürtüsellik", v1.impulsivity, v2.impulsivity, v3.impulsivity, v4?.impulsivity),
            row("H — Motor", v1.hyperactivity, v2.hyperactivity, v3.hyperactivity, v4?.hyperactivity),
            row("Genel", v1.overall, v2.overall, v3.overall, v4?.overall)
          ]
        },
        layout: {
          hLineWidth: () => 0.4,
          vLineWidth: () => 0.4,
          hLineColor: () => "#cbd5e1",
          vLineColor: () => "#cbd5e1"
        },
        margin: [0, 0, 0, 10]
      },
      {
        text: `Δ T (V2−V1): ${delta.timing == null ? "—" : Math.round(delta.timing)} · Δ T (V3−V2): ${delta.v3v2?.timing == null ? "—" : Math.round(delta.v3v2.timing)} · V4 skor = V3`,
        fontSize: 8,
        color: SUB,
        margin: [0, 0, 0, 12]
      },
      { text: "Ham göstergeler ve yaş", bold: true, fontSize: 11, color: HEADER, margin: [0, 0, 0, 8] },
      {
        ul: [
          `Medyan RT — V1: ${formatScoreCell(v1.medianRt)} · V2: ${v2.medianRt ?? "—"} · V3: ${v3.medianRt ?? "—"} ms`,
          `RT SD — V1: ${formatScoreCell(v1.rtStd)} · V2: ${v2.rtStd ?? "—"} · V3: ${v3.rtStd ?? "—"}`,
          `CV — V2: ${v2.cv ?? "—"} · V3: ${v3.cv ?? "—"}`,
          `V3 yaş bandı: ${v3.ageBandLabel || "—"} · tanımlayıcı ref RT: ${v3.ageReferenceRtMs ?? "—"} ms (skor cezası değil)`,
          `İhmal: ${counts.omissions} / hedef ${counts.targets}`,
          `False alarm (I): ${counts.falseAlarms}`,
          `Multi deneme / basış (H): ${counts.multiTrials} / ${counts.multiPresses}`,
          `Idle / boş ekran (H): ${counts.idlePresses}`,
          `Geç yanıt: ${counts.late}`,
          `Örtüşme denetimi (A↔T): ihmal %${v3.overlap?.omissionRate ?? "—"} · geç %${v3.overlap?.lateRate ?? "—"} · zamanında isabet %${v3.overlap?.onTimeHitRate ?? "—"} (V3 T’de Zİ yok)`,
          `150 ms altı: V2 ${v2.rushUnder150 ?? 0} · V3 ${v3.rushUnder150 ?? 0}`,
          v2.timingUnavailable
            ? `V2 T: ${timingUnavailableLabel(v2.timingReason)}`
            : `V2 T alt: hız ${v2.timingRtSpeed} · stab ${v2.timingRtStability} · geç ${v2.timingLateResponse}`,
          v3.timingUnavailable
            ? `V3 T: ${timingUnavailableLabel(v3.timingReason)}`
            : `V3 T alt: stab ${v3.timingRtStability} · geç ${v3.timingLateResponse} (hız yok)`
        ],
        fontSize: 8,
        color: "#334155",
        margin: [0, 0, 0, 12]
      },
      {
        text:
          "V2 T = 0.40×hız + 0.40×stab + 0.20×geç (merkez 450). V3 T = 0.55×stab + 0.45×geç; stab = clamp(100 − 100×CV) exploratory. I/H değişmedi.",
        fontSize: 8,
        color: SUB
      }
    ]
  };
}

export async function createComparisonPdfBlob(args) {
  const pdfMake = await getPdfMake();
  const logoDataUrl = args.logoDataUrl ?? (await getPdfLogoDataUrl());
  const doc = buildComparisonDocDefinition({ ...args, logoDataUrl });
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(doc).getBlob((blob) => {
        if (blob && blob.size > 0) resolve(blob);
        else reject(new Error("Karşılaştırma PDF oluşturulamadı."));
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function downloadComparisonPdf(args) {
  const blob = await createComparisonPdfBlob(args);
  const safeName = (args.participant?.name || "report").replace(/\s+/g, "_");
  triggerBlobDownload(blob, `FocusProLab_${safeName}_V1-V2-V3-V4_karsilastirma_${Date.now()}.pdf`);
}
