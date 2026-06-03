import { riskLabel } from "./metrics.js";
import { getShapeSvg } from "./shapeUtils.jsx";
import {
  INDEX_DEFINITIONS,
  NORM_LEVELS,
  SEVERITY_LEVELS,
  FULL_PHASE_LEGEND,
  buildProfessionalSummary,
  buildSmartComment,
  computeDetailedMetrics,
  formatDurationSeconds,
  formatRate,
  getChartPhaseScores,
  getDistractorSummaryMatrix,
  getLevel,
  getLevelText,
  getScoreColor,
  getScores,
  getSectionSummaries,
  normPlacement,
  pseudoZScore,
  severityLevel
} from "./reportHelpers.js";

let pdfMakePromise;

async function getPdfMake() {
  if (!pdfMakePromise) {
    pdfMakePromise = (async () => {
      const pdfMakeMod = await import("pdfmake/build/pdfmake");
      const pdfFontsMod = await import("pdfmake/build/vfs_fonts");
      const pdfMake = pdfMakeMod.default ?? pdfMakeMod;
      const pdfFonts = pdfFontsMod.default ?? pdfFontsMod;
      pdfMake.vfs = pdfFonts.pdfMake?.vfs ?? pdfFonts.vfs;
      if (!pdfMake.vfs) throw new Error("PDF yazı tipleri yüklenemedi (pdfmake vfs).");
      return pdfMake;
    })();
  }
  return pdfMakePromise;
}

const HEADER = "#4c1d95";
const SUB = "#475569";
const TABLE_HEAD = "#142440";

function tableLayout(headColor = TABLE_HEAD) {
  return {
    fillColor: (rowIndex) => (rowIndex === 0 ? headColor : rowIndex % 2 === 0 ? "#f8fafc" : null),
    hLineColor: () => "#cbd5e1",
    vLineColor: () => "#cbd5e1"
  };
}

function scoreBox(title, value) {
  return {
    width: "*",
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              { text: title, color: "#fff", bold: true, fontSize: 10 },
              { text: String(value), color: "#fff", bold: true, fontSize: 22, margin: [0, 6, 0, 0] }
            ],
            fillColor: getScoreColor(value),
            margin: [8, 10, 8, 10]
          }
        ]
      ]
    },
    layout: "noBorders",
    margin: [0, 0, 4, 0]
  };
}

function buildNormComparison(scores) {
  const indices = [
    { key: "A", score: scores.attention, label: "Dikkat (A)" },
    { key: "T", score: scores.timing, label: "Zamanlama (T)" },
    { key: "I", score: scores.impulsivity, label: "Dürtüsellik (I)" },
    { key: "H", score: scores.hyperactivity, label: "Hiper-reaktivite (H)" }
  ];

  const perfBody = NORM_LEVELS.map((row) => {
    const cells = indices.map((ix) => {
      if (normPlacement(ix.score) !== row.level) return "";
      return { text: pseudoZScore(ix.score).toFixed(2), alignment: "center", bold: true };
    });
    return [
      { text: `${row.level} ${row.label}`, fillColor: row.color, color: row.level <= 2 ? "#0f172a" : "#fff", fontSize: 9 },
      ...cells
    ];
  });

  const difficulty = indices.filter((ix) => getLevel(ix.score) === 4);
  const sevRows = SEVERITY_LEVELS.map((row) => {
    const cells = ["A", "T", "I", "H"].map((key) => {
      const ix = indices.find((i) => i.key === key);
      if (!ix || getLevel(ix.score) !== 4) return "";
      if (severityLevel(ix.score) !== row.level) return "";
      return { text: String(row.level), alignment: "center", bold: true, color: "#fff" };
    });
    return [
      { text: `${row.level} ${row.label}`, fillColor: row.color, color: "#fff", fontSize: 8 },
      ...cells
    ];
  });

  const blocks = [
    { text: "Norm Karşılaştırma", fontSize: 16, bold: true, color: HEADER, margin: [0, 0, 0, 4] },
    {
      text: "Normatif referans gruplarına göre standartlaştırılmış performans karşılaştırması (yaklaşık z-puanı).",
      fontSize: 9,
      color: SUB,
      margin: [0, 0, 0, 10]
    },
    {
      table: {
        headerRows: 1,
        widths: ["*", 40, 40, 40, 40],
        body: [
          [
            { text: "Performans düzeyi", bold: true, color: "#fff" },
            { text: "A", bold: true, color: "#fff", alignment: "center" },
            { text: "T", bold: true, color: "#fff", alignment: "center" },
            { text: "I", bold: true, color: "#fff", alignment: "center" },
            { text: "H", bold: true, color: "#fff", alignment: "center" }
          ],
          ...perfBody
        ]
      },
      layout: tableLayout(),
      margin: [0, 0, 0, 12]
    }
  ];

  if (difficulty.length) {
    blocks.push(
      {
        text: "Performansta zorluk olan performanslar için şiddet düzeyi aşağıda gösterilmektedir.",
        fontSize: 9,
        color: SUB,
        margin: [0, 0, 0, 8]
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", 40, 40, 40, 40],
          body: [
            [
              { text: "Şiddet", bold: true, color: "#fff" },
              { text: "A", bold: true, color: "#fff", alignment: "center" },
              { text: "T", bold: true, color: "#fff", alignment: "center" },
              { text: "I", bold: true, color: "#fff", alignment: "center" },
              { text: "H", bold: true, color: "#fff", alignment: "center" }
            ],
            ...sevRows
          ]
        },
        layout: tableLayout("#7f1d1d"),
        margin: [0, 0, 0, 10]
      }
    );
  }

  blocks.push({
    ul: INDEX_DEFINITIONS.map(([t, d]) => ({ text: [{ text: `${t}: `, bold: true }, d], fontSize: 8, margin: [0, 2, 0, 0] }))
  });

  return blocks;
}

export function buildDocDefinition({ participant, profile, logs, target, chartImage }) {
  const metrics = computeDetailedMetrics(logs, profile.lateResponseMs);
  const scores = getScores(metrics);
  const risk = riskLabel(metrics);
  const sections = getSectionSummaries(logs, profile);
  const chartPhases = getChartPhaseScores(logs, profile);
  const matrix = getDistractorSummaryMatrix(logs, profile);
  const professional = buildProfessionalSummary(scores, metrics, profile);
  const smart = buildSmartComment(scores, metrics, profile);

  const phaseChartNote = chartPhases.length
    ? chartPhases.map((p) => `${p.label}: A${p.attention} T${p.timing} I${p.impulsivity} H${p.hyperactivity}`).join(" · ")
    : "Faz verisi yetersiz.";

  return {
    pageSize: "A4",
    pageMargins: [36, 36, 36, 48],
    defaultStyle: { font: "Roboto", fontSize: 10 },
    footer: (currentPage, pageCount) => ({
      margin: [36, 0, 36, 20],
      stack: [
        {
          canvas: [{ type: "line", x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 0.5, lineColor: "#cbd5e1" }],
          margin: [0, 0, 0, 6]
        },
        {
          text: `FocusProLab • ${new Date().toLocaleDateString("tr-TR")} • Sayfa ${currentPage}/${pageCount}`,
          fontSize: 7,
          color: "#94a3b8",
          alignment: "center"
        }
      ]
    }),
    content: [
      { text: "FocusProLab", fontSize: 22, bold: true, color: HEADER },
      {
        text: "Sürekli Performans ve Dikkat Değerlendirme Raporu",
        fontSize: 14,
        color: SUB,
        margin: [0, 4, 0, 2]
      },
      {
        text: "Bilgisayarlı Go/No-Go görevi — dört endeks (A, T, I, H)",
        fontSize: 10,
        color: "#64748b",
        margin: [0, 0, 0, 16]
      },
      {
        columns: [
          {
            width: "*",
            stack: [
              { text: `Rapor tarihi: ${new Date().toLocaleString("tr-TR")}` },
              { text: `Katılımcı: ${participant.name}`, margin: [0, 4, 0, 0] },
              { text: `Doğum tarihi: ${participant.birthDate || "—"}`, margin: [0, 4, 0, 0] },
              { text: `Yaş: ${participant.age}`, margin: [0, 4, 0, 0] },
              { text: `Cinsiyet: ${participant.gender || "—"}`, margin: [0, 4, 0, 0] },
              { text: `Test profili: ${profile.label}`, bold: true, margin: [0, 6, 0, 0] },
              { text: `Süre: ${formatDurationSeconds(profile.durationMs)} sn`, margin: [0, 4, 0, 0] },
              { text: `Geç yanıt eşiği: ${profile.lateResponseMs} ms`, margin: [0, 4, 0, 0] },
              { text: `Deneme sayısı: ${metrics.totalTrials}`, margin: [0, 4, 0, 0] },
              { text: `Risk (özet): ${risk}`, bold: true, margin: [0, 8, 0, 0] }
            ]
          },
          {
            width: 100,
            stack: [
              { text: "Hedef nesne", bold: true, alignment: "center", fontSize: 9 },
              { svg: getShapeSvg(target.shape, target.color), width: 42, alignment: "center", margin: [0, 8, 0, 0] }
            ]
          }
        ],
        margin: [0, 0, 0, 14]
      },
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  { text: "Genel Performans Skoru", bold: true, color: "#fff", fontSize: 11 },
                  { text: `${scores.overall}/100`, bold: true, color: "#fff", fontSize: 26, margin: [0, 4, 0, 0] },
                  { text: `Risk: ${risk}`, color: "#fff", fontSize: 10, margin: [0, 2, 0, 0] }
                ],
                fillColor: getScoreColor(scores.overall),
                margin: [12, 10, 12, 10]
              }
            ]
          ]
        },
        layout: "noBorders",
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          scoreBox("A — Dikkat", scores.attention),
          scoreBox("T — Zamanlama", scores.timing),
          scoreBox("I — Dürtüsellik", scores.impulsivity),
          scoreBox("H — Hiper-reaktivite", scores.hyperactivity)
        ],
        columnGap: 2,
        margin: [0, 0, 0, 18]
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "*"],
          body: [
            [
              { text: "İndeks", bold: true, color: "#fff" },
              { text: "Skor", bold: true, color: "#fff" },
              { text: "Seviye", bold: true, color: "#fff" },
              { text: "Yorum", bold: true, color: "#fff" }
            ],
            ["A — Dikkat", scores.attention, getLevelText(scores.attention), getLevelText(scores.attention)],
            ["T — Zamanlama", scores.timing, getLevelText(scores.timing), getLevelText(scores.timing)],
            ["I — Dürtüsellik", scores.impulsivity, getLevelText(scores.impulsivity), getLevelText(scores.impulsivity)],
            [
              "H — Hiper-reaktivite",
              scores.hyperactivity,
              getLevelText(scores.hyperactivity),
              getLevelText(scores.hyperactivity)
            ]
          ]
        },
        layout: tableLayout(),
        margin: [0, 0, 0, 16]
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*"],
          body: [
            [
              { text: "Ölçüm", bold: true, color: "#fff" },
              { text: "Değer", bold: true, color: "#fff" }
            ],
            ["Genel doğruluk", `%${metrics.accuracy}`],
            ["Hit rate", formatRate(metrics.hitRate)],
            ["Omission rate", formatRate(metrics.omissionRate)],
            ["False alarm rate", formatRate(metrics.falseAlarmRate)],
            ["Late response rate", formatRate(metrics.lateRate)],
            ["Multi press rate", formatRate(metrics.multiPressRate)],
            ["Ortalama tepki", `${metrics.avgReaction} ms`],
            ["Median tepki", `${metrics.medianReaction} ms`],
            ["RT standart sapma", `${metrics.rtStd} ms`],
            ["d-prime", metrics.dPrime.toFixed(2)],
            ["Hedef sayısı", String(metrics.targets)],
            ["Hedef dışı", String(metrics.nonTargets)],
            ["Doğru hedef yanıtı", String(metrics.correctHits)],
            ["Kaçırılan hedef", String(metrics.omissions)],
            ["Geç yanıt", String(metrics.lateResponses)],
            ["Dürtüsel hata", String(metrics.impulsiveErrors)],
            ["Çoklu basma", String(metrics.multiPress)]
          ]
        },
        layout: tableLayout("#374151"),
        margin: [0, 0, 0, 16]
      },
      { text: "Dört İndeks Genelinde Performans", fontSize: 15, bold: true, color: HEADER, pageBreak: "before" },
      {
        text: "Dört endeksi kullanarak test aşamaları genelinde performansı gösterir ve farklı dikkat dağıtıcıların sonuçlar üzerindeki etkisini açıklar.",
        fontSize: 9,
        color: SUB,
        margin: [0, 4, 0, 10]
      },
      { text: phaseChartNote, fontSize: 8, color: "#64748b", margin: [0, 0, 0, 10] },
      {
        ul: FULL_PHASE_LEGEND.map(([a, b]) => `${a} — ${b}`),
        fontSize: 8,
        color: SUB,
        margin: [0, 0, 0, 12]
      },
      { text: "Dört Endeks Genelinde Performans Özeti", fontSize: 13, bold: true, margin: [0, 0, 0, 8] },
      {
        table: {
          headerRows: 1,
          widths: ["*", 80, 80, 80, 80],
          body: [
            [
              { text: "", border: [false, false, false, false] },
              { text: "A", bold: true, alignment: "center" },
              { text: "T", bold: true, alignment: "center" },
              { text: "I", bold: true, alignment: "center" },
              { text: "H", bold: true, alignment: "center" }
            ],
            ...matrix.map((row) => [
              row.name,
              { text: row.A.text, color: row.A.color, fontSize: 8, alignment: "center" },
              { text: row.T.text, color: row.T.color, fontSize: 8, alignment: "center" },
              { text: row.I.text, color: row.I.color, fontSize: 8, alignment: "center" },
              { text: row.H.text, color: row.H.color, fontSize: 8, alignment: "center" }
            ])
          ]
        },
        layout: tableLayout(),
        margin: [0, 0, 0, 10]
      },
      {
        text: "Sürdürülebilir performans: başlangıç–kapanış değişimi. Görsel / İşitsel / Kombine: ilgili çeldirici fazlarına göre. Çeldirici yükü: az ve yoğun çeldirici karşılaştırması.",
        fontSize: 7,
        color: "#94a3b8",
        margin: [0, 0, 0, 14]
      },
      ...buildNormComparison(scores),
      chartImage
        ? { text: "Performans grafiği (deneme bazlı)", fontSize: 14, bold: true, pageBreak: "before", margin: [0, 0, 0, 8] }
        : null,
      chartImage ? { image: chartImage, width: 515, margin: [0, 0, 0, 16] } : null,
      { text: "Faz bazlı performans", fontSize: 14, bold: true, margin: [0, 8, 0, 8] },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto", "auto", "auto", "*"],
          body: [
            [
              { text: "Bölüm", bold: true, color: "#fff" },
              { text: "A", bold: true, color: "#fff" },
              { text: "T", bold: true, color: "#fff" },
              { text: "I", bold: true, color: "#fff" },
              { text: "H", bold: true, color: "#fff" },
              { text: "RT med.", bold: true, color: "#fff" },
              { text: "Yorum", bold: true, color: "#fff" }
            ],
            ...sections.map((s) => [
              s.shortLabel,
              s.attentionScore,
              s.timingScore,
              s.impulsivityScore,
              s.hyperactivityScore,
              `${s.medianReaction} ms`,
              { text: s.comment, fontSize: 8 }
            ])
          ]
        },
        layout: tableLayout(),
        margin: [0, 0, 0, 16]
      },
      { text: "Profesyonel ön değerlendirme özeti", fontSize: 14, bold: true, margin: [0, 0, 0, 6] },
      { text: professional, lineHeight: 1.35, alignment: "justify", margin: [0, 0, 0, 12] },
      { text: "Klinik risk bayrakları", fontSize: 14, bold: true, margin: [0, 0, 0, 6] },
      {
        ul: metrics.flags.length ? metrics.flags : ["Belirgin risk bayrağı izlenmedi."],
        margin: [0, 0, 0, 12]
      },
      { text: "Otomatik yorum", fontSize: 14, bold: true, margin: [0, 0, 0, 6] },
      { text: smart, lineHeight: 1.35, alignment: "justify", margin: [0, 0, 0, 20] },
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: "FocusPro Testi, tanı sürecinde kullanılan bir değerlendirme aracıdır. Her testin sonunda üretilen sonuçlar, yalnızca nitelikli profesyoneller tarafından danışanlarının değerlendirmesine yardımcı olmak için bir araç olarak yorumlanabilir. Asla bağımsız bir tanı kaynağı olarak kullanılmamalıdır.",
                fontSize: 8,
                color: "#475569",
                fillColor: "#f1f5f9",
                margin: [10, 10, 10, 10]
              }
            ]
          ]
        },
        layout: "noBorders"
      }
    ].filter(Boolean)
  };
}

export async function createPdfBlob(args) {
  const pdfMake = await getPdfMake();
  const doc = buildDocDefinition(args);
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(doc).getBlob((b) => resolve(b));
    } catch (e) {
      reject(e);
    }
  });
}

export async function downloadPdf(args) {
  const pdfMake = await getPdfMake();
  const doc = buildDocDefinition(args);
  const name = `FocusProLab_${args.participant.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  pdfMake.createPdf(doc).download(name);
}
