import { dateLocaleForPdf, getReportPdfStrings } from "./i18n/reportPdfStrings.js";
import { getPdfMake } from "./lib/pdfMakeLoader.js";
import { triggerBlobDownload } from "./lib/triggerBlobDownload.js";
import { buildPdfLogoBackground, getPdfLogoDataUrl } from "./lib/pdfLogoWatermark.js";
import { buildScoreComparison, formatScoreCell, timingUnavailableLabel } from "./scoreComparison.js";

const HEADER = "#4c1d95";
const SUB = "#475569";

function cell(text, opts = {}) {
  return { text: text ?? "—", fontSize: 9, color: "#0f172a", ...opts };
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
  const { v1, v2, counts, delta } = cmp;

  const row = (label, a, b, d) => [
    cell(label, { bold: true }),
    cell(formatScoreCell(a), { alignment: "center" }),
    cell(
      label === "T" && v2.timingUnavailable ? timingUnavailableLabel(v2.timingReason) : formatScoreCell(b),
      { alignment: "center" }
    ),
    cell(d == null || Number.isNaN(d) ? "—" : (d > 0 ? `+${Math.round(d)}` : String(Math.round(d))), {
      alignment: "center"
    })
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
        text: "V1 / V2 Skor Karşılaştırma (deneme)",
        fontSize: 14,
        color: HEADER,
        margin: [0, 0, 0, 8]
      },
      {
        text: "V1 resmi algoritmadır. V2 yalnızca pilot karşılaştırma içindir; T formülü geçici parametreler kullanır (merkez 450 ms).",
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
          widths: ["*", 70, 70, 60],
          body: [
            [
              { text: "Ölçüm", bold: true, color: "#fff", fillColor: HEADER },
              { text: "V1", bold: true, color: "#fff", fillColor: HEADER, alignment: "center" },
              { text: "V2", bold: true, color: "#fff", fillColor: HEADER, alignment: "center" },
              { text: "Δ", bold: true, color: "#fff", fillColor: HEADER, alignment: "center" }
            ],
            row("A — Dikkat", v1.attention, v2.attention, delta.attention),
            row("T — Zamanlama", v1.timing, v2.timing, delta.timing),
            row("I — Dürtüsellik", v1.impulsivity, v2.impulsivity, delta.impulsivity),
            row("H — Motor", v1.hyperactivity, v2.hyperactivity, delta.hyperactivity),
            row("Genel", v1.overall, v2.overall, delta.overall)
          ]
        },
        layout: {
          hLineWidth: () => 0.4,
          vLineWidth: () => 0.4,
          hLineColor: () => "#cbd5e1",
          vLineColor: () => "#cbd5e1"
        },
        margin: [0, 0, 0, 16]
      },
      { text: "Ham göstergeler", bold: true, fontSize: 11, color: HEADER, margin: [0, 0, 0, 8] },
      {
        ul: [
          `Medyan RT — V1: ${formatScoreCell(v1.medianRt)} ms · V2: ${v2.medianRt != null ? v2.medianRt : "—"} ms`,
          `RT ort. — V1: ${formatScoreCell(v1.meanRt)} ms · V2: ${v2.meanRt != null ? v2.meanRt : "—"} ms`,
          `RT SD — V1: ${formatScoreCell(v1.rtStd)} · V2: ${v2.rtStd != null ? v2.rtStd : "—"}`,
          `CV (V2): ${v2.cv != null ? v2.cv : "—"}`,
          `İhmal: ${counts.omissions} / hedef ${counts.targets}`,
          `False alarm (I): ${counts.falseAlarms}`,
          `Multi deneme / basış (H): ${counts.multiTrials} / ${counts.multiPresses}`,
          `Idle / boş ekran (H): ${counts.idlePresses}`,
          `Geç yanıt: ${counts.late}`,
          `V2 RT örneklem: ${v2.rtN ?? "—"} (ham ${v2.rtNRaw ?? "—"}, aykırı çıkan ${v2.outliersRemoved ?? 0})`,
          `150 ms altı (geçerlilik işareti): ${v2.rushUnder150 ?? 0}`,
          v2.timingUnavailable
            ? `V2 T durumu: ${timingUnavailableLabel(v2.timingReason)}`
            : `V2 T alt: hız ${v2.timingRtSpeed} · stab ${v2.timingRtStability} · geç ${v2.timingLateResponse}`
        ],
        fontSize: 9,
        color: "#334155",
        margin: [0, 0, 0, 12]
      },
      {
        text: "V2 T = 0.40×RT hızı + 0.40×Stabilite + 0.20×Geç yanıt. RT hızı = clamp(100 − |medyanRT − 450|/5). Stabilite = clamp(100 − 200×(SD/ort)). Zİ bileşeni T'de yoktur (A'da ihmal).",
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
  triggerBlobDownload(blob, `FocusProLab_${safeName}_V1-V2_karsilastirma_${Date.now()}.pdf`);
}
