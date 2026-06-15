import { profileLabel } from "./i18n/index.js";
import { riskLabel } from "./metrics.js";
import { getShapeSvg } from "./shapeUtils.jsx";
import {
  INDEX_DEFINITIONS,
  SDT_DEFINITIONS,
  NORM_LEVELS,
  SEVERITY_LEVELS,
  FULL_PHASE_LEGEND,
  buildProfessionalSummary,
  buildSmartComment,
  computeDetailedMetrics,
  computeValidityFlags,
  computeVigilanceIndex,
  formatDurationSeconds,
  formatRate,
  getDistractorSummaryMatrix,
  getGlobalIndexZScores,
  getLevel,
  getLevelText,
  getScoreColor,
  getScores,
  getSectionSummaries,
  normPlacementFromZ,
  severityLevel
} from "./reportHelpers.js";
import { normLevelTextFromZ } from "./reportNorms.js";
import { getPdfMake } from "./lib/pdfMakeLoader.js";
import { buildReportChartImages } from "./reportCharts.js";

const HEADER = "#4c1d95";
const HEADER_LIGHT = "#ede9fe";
const SUB = "#475569";
const TABLE_HEAD = "#142440";

function sectionTitle(text, pageBreak = false) {
  return {
    margin: [0, pageBreak ? 4 : 14, 0, 10],
    pageBreak: pageBreak ? "before" : undefined,
    columns: [
      { width: 5, canvas: [{ type: "rect", x: 0, y: 0, w: 5, h: 22, color: HEADER }] },
      {
        width: "*",
        stack: [{ text, fontSize: 15, bold: true, color: HEADER, margin: [10, 2, 0, 0] }]
      }
    ],
    columnGap: 0
  };
}

function coverHeader() {
  return {
    margin: [-36, -36, 16, 20],
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              { text: "FocusProLab", fontSize: 26, bold: true, color: "#fff", margin: [20, 18, 20, 4] },
              {
                text: "Sürekli Performans ve Dikkat Değerlendirme Raporu",
                fontSize: 13,
                color: "#e9d5ff",
                margin: [20, 0, 20, 16]
              }
            ],
            fillColor: HEADER,
            border: [false, false, false, false]
          }
        ]
      ]
    },
    layout: "noBorders"
  };
}

function infoBox(title, lines, fill = "#f8fafc") {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              { text: title, bold: true, fontSize: 11, color: HEADER, margin: [0, 0, 0, 8] },
              ...lines.map((t) => ({ text: t, fontSize: 9, color: SUB, margin: [0, 0, 0, 4] }))
            ],
            fillColor: fill,
            margin: [12, 10, 12, 10]
          }
        ]
      ]
    },
    layout: "noBorders",
    margin: [0, 0, 0, 12]
  };
}

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

function buildNormComparison(scores, profileKey) {
  const z = getGlobalIndexZScores(scores, profileKey);
  const indices = [
    { key: "A", score: scores.attention, z: z.attention },
    { key: "T", score: scores.timing, z: z.timing },
    { key: "I", score: scores.impulsivity, z: z.impulsivity },
    { key: "H", score: scores.hyperactivity, z: z.hyperactivity }
  ];

  const perfBody = NORM_LEVELS.map((row) => {
    const cells = indices.map((ix) => {
      if (normPlacementFromZ(ix.z) !== row.level) return "";
      return { text: ix.z.toFixed(2), alignment: "center", bold: true };
    });
    return [
      { text: `${row.level} ${row.label}`, fillColor: row.color, color: row.level <= 2 ? "#0f172a" : "#fff", fontSize: 9 },
      ...cells
    ];
  });

  const difficulty = indices.filter((ix) => normPlacementFromZ(ix.z) === 4);
  const sevRows = SEVERITY_LEVELS.map((row) => {
    const cells = ["A", "T", "I", "H"].map((key) => {
      const ix = indices.find((i) => i.key === key);
      if (!ix || normPlacementFromZ(ix.z) !== 4) return "";
      if (severityLevel(ix.score) !== row.level) return "";
      return { text: String(row.level), alignment: "center", bold: true, color: "#fff" };
    });
    return [
      { text: `${row.level} ${row.label}`, fillColor: row.color, color: "#fff", fontSize: 8 },
      ...cells
    ];
  });

  const blocks = [
    sectionTitle("Norm Karşılaştırma", true),
    {
      text: "Normatif referans gruplarına göre standartlaştırılmış performans karşılaştırması (yaş grubu norm tablosu, z-puanı).",
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

export function buildDocDefinition({
  participant,
  profile,
  logs,
  target,
  pressTimeline = [],
  reportCharts = {},
  locale = "tr"
}) {
  const profileKey = profile.key ?? "adult";
  const profileDisplay = profileLabel(profileKey, locale) || profile.label;
  const age = participant?.age ?? null;
  const metricOpts = { pressTimeline, age, locale };
  const metrics = computeDetailedMetrics(logs, profile.lateResponseMs, metricOpts);
  const scores = getScores(metrics);
  const risk = riskLabel(metrics, locale);
  const validityFlags = computeValidityFlags(logs, metrics, profile, locale);
  const vigilance = computeVigilanceIndex(logs, profile, age, pressTimeline, locale);
  const sections = getSectionSummaries(logs, profile, age, pressTimeline);
  const matrix = getDistractorSummaryMatrix(logs, profile, age, pressTimeline);
  const professional = buildProfessionalSummary(scores, metrics, profile, vigilance);
  const smart = buildSmartComment(scores, metrics, profile);
  const zGlobal = getGlobalIndexZScores(scores, profileKey);
  const betaStr = metrics.beta != null ? metrics.beta.toFixed(2) : "—";
  const allFlags = [...metrics.flags];
  const testValid = validityFlags.length === 0;

  const indexChartNotes = {
    attention:
      "Dikkat endeksi; hedef uyaranlara doğru yanıt ve kaçırma oranlarını yansıtır. Gri bant norm aralığı (±1 SS), kesikli çizgi normatif referanstır.",
    timing: "Zamanlama endeksi; tepki süresi tutarlılığı ve geç yanıtları ölçer.",
    impulsivity: "Dürtüsellik endeksi; hedef dışı uyaranlara yanlış basışları yansıtır.",
    hyperactivity: "Hiper-reaktivite endeksi; çoklu basma ve aşırı tepkiselliği ölçer."
  };
  const chartBlocks = [];
  const indexCharts = [
    ["attention", "Dikkat (A)"],
    ["timing", "Zamanlama (T)"],
    ["impulsivity", "Dürtüsellik (I)"],
    ["hyperactivity", "Hiper-reaktivite (H)"]
  ];
  let chartFirst = true;
  for (const [key, title] of indexCharts) {
    if (reportCharts[key]) {
      chartBlocks.push(
        sectionTitle(title, chartFirst),
        {
          text: `${indexChartNotes[key]} Tüm test fazları gösterilmektedir.`,
          fontSize: 9,
          color: SUB,
          margin: [0, 0, 0, 10]
        },
        { image: reportCharts[key], width: 515, margin: [0, 0, 0, 12] }
      );
      chartFirst = false;
    }
  }
  if (reportCharts.combined) {
    chartBlocks.push(
      sectionTitle("Dört İndeks Genelinde Performans", true),
      {
        text: "Dört endeksi kullanarak test aşamaları genelinde performansı gösterir ve farklı dikkat dağıtıcıların sonuçlar üzerindeki etkisini açıklar.",
        fontSize: 9,
        color: SUB,
        margin: [0, 0, 0, 10]
      },
      { image: reportCharts.combined, width: 515, margin: [0, 0, 0, 14] }
    );
  }

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
      coverHeader(),
      {
        text: "Bilgisayarlı Go/No-Go — dört endeks (A, T, I, H) · norm karşılaştırmalı profesyonel rapor",
        fontSize: 9,
        color: "#64748b",
        margin: [0, 0, 0, 14]
      },
      infoBox("Test geçerliliği", [
        testValid
          ? "✓ Test verisi raporlama için yeterli görülmektedir."
          : "⚠ Dikkat: aşağıdaki geçerlilik uyarıları sonuçların yorumunu etkileyebilir.",
        ...validityFlags
      ], testValid ? "#ecfdf5" : "#fff7ed"),
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
              { text: `Test profili: ${profileDisplay}`, bold: true, margin: [0, 6, 0, 0] },
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
      sectionTitle("Performans özeti"),
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
          widths: ["*", "auto", "auto", "auto", "*"],
          body: [
            [
              { text: "İndeks", bold: true, color: "#fff" },
              { text: "Skor", bold: true, color: "#fff" },
              { text: "z", bold: true, color: "#fff" },
              { text: "Norm seviye", bold: true, color: "#fff" },
              { text: "Yorum", bold: true, color: "#fff" }
            ],
            [
              "A — Dikkat",
              scores.attention,
              zGlobal.attention.toFixed(2),
              normLevelTextFromZ(zGlobal.attention),
              getLevelText(scores.attention)
            ],
            [
              "T — Zamanlama",
              scores.timing,
              zGlobal.timing.toFixed(2),
              normLevelTextFromZ(zGlobal.timing),
              getLevelText(scores.timing)
            ],
            [
              "I — Dürtüsellik",
              scores.impulsivity,
              zGlobal.impulsivity.toFixed(2),
              normLevelTextFromZ(zGlobal.impulsivity),
              getLevelText(scores.impulsivity)
            ],
            [
              "H — Hiper-reaktivite",
              scores.hyperactivity,
              zGlobal.hyperactivity.toFixed(2),
              normLevelTextFromZ(zGlobal.hyperactivity),
              getLevelText(scores.hyperactivity)
            ]
          ]
        },
        layout: tableLayout(),
        margin: [0, 0, 0, 12]
      },
      infoBox(
        "Sürdürülebilir dikkat (Vigilance)",
        [
          vigilance.label,
          vigilance.deltaAttention != null
            ? `Dikkat (A) farkı (kapanış − başlangıç): ${vigilance.deltaAttention > 0 ? "+" : ""}${vigilance.deltaAttention} puan`
            : "",
          vigilance.deltaRt != null
            ? `Median RT farkı: ${vigilance.deltaRt > 0 ? "+" : ""}${vigilance.deltaRt} ms`
            : ""
        ].filter(Boolean),
        HEADER_LIGHT
      ),
      sectionTitle("Davranışsal ve sinyal tespit metrikleri"),
      {
        columns: [
          {
            width: "*",
            table: {
              headerRows: 1,
              widths: ["*", "*"],
              body: [
                [
                  { text: "Ölçüm", bold: true, color: "#fff", fontSize: 9 },
                  { text: "Değer", bold: true, color: "#fff", fontSize: 9 }
                ],
                ["Genel doğruluk", `%${metrics.accuracy}`],
                ["Hit rate (zamanında isabet)", formatRate(metrics.hitRate)],
                ["Commission (hedef dışı basış)", formatRate(metrics.commissionRate)],
                ["Omission rate", formatRate(metrics.omissionRate)],
                ["False alarm rate", formatRate(metrics.falseAlarmRate)],
                ["Perseveration oranı", formatRate(metrics.perseverationRate)],
                ["Late response rate", formatRate(metrics.lateRate)],
                ["Multi press rate", formatRate(metrics.multiPressRate)],
                ["Perseveration (adet)", String(metrics.perseverationCount)]
              ]
            },
            layout: tableLayout("#374151")
          },
          {
            width: "*",
            table: {
              headerRows: 1,
              widths: ["*", "*"],
              body: [
                [
                  { text: "Ölçüm", bold: true, color: "#fff", fontSize: 9 },
                  { text: "Değer", bold: true, color: "#fff", fontSize: 9 }
                ],
                ["Ortalama tepki", `${metrics.avgReaction} ms`],
                ["Median tepki", `${metrics.medianReaction} ms`],
                ["RT standart sapma", `${metrics.rtStd} ms`],
                ["d′ (d-prime)", metrics.dPrime.toFixed(2)],
                ["Ölçüt c", metrics.criterionC.toFixed(2)],
                ["β (beta)", betaStr],
                ["Hedef sayısı", String(metrics.targets)],
                ["Hedef dışı", String(metrics.nonTargets)],
                ["Doğru hedef yanıtı", String(metrics.correctHits)],
                ["Kaçırılan hedef", String(metrics.omissions)],
                ["Geç yanıt", String(metrics.lateResponses)],
                ["Çoklu basma", String(metrics.multiPress)]
              ]
            },
            layout: tableLayout("#1e3a5f")
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 8]
      },
      {
        ul: SDT_DEFINITIONS.map(([t, d]) => ({ text: [{ text: `${t}: `, bold: true, fontSize: 8 }, d], fontSize: 8 })),
        margin: [0, 0, 0, 14]
      },
      ...buildNormComparison(scores, profileKey),
      ...chartBlocks,
      sectionTitle("Çeldirici ve faz özeti"),
      {
        ul: FULL_PHASE_LEGEND.map(([a, b]) => `${a} — ${b}`),
        fontSize: 8,
        color: SUB,
        margin: [0, 0, 0, 10]
      },
      { text: "Dört endeks × çeldirici etkisi", fontSize: 12, bold: true, color: HEADER, margin: [0, 0, 0, 8] },
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
      sectionTitle("Faz bazlı performans", true),
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
      sectionTitle("Profesyonel ön değerlendirme"),
      { text: professional, lineHeight: 1.35, alignment: "justify", margin: [0, 0, 0, 12] },
      sectionTitle("Klinik risk ve geçerlilik"),
      {
        ul: allFlags.length ? allFlags : ["Belirgin performans risk bayrağı izlenmedi."],
        margin: [0, 0, 0, 6]
      },
      validityFlags.length
        ? {
            text: "Geçerlilik uyarıları: " + validityFlags.join("; "),
            fontSize: 9,
            color: "#b45309",
            margin: [0, 0, 0, 12]
          }
        : { text: "", margin: [0, 0, 0, 8] },
      sectionTitle("Otomatik yorum"),
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
  const reportCharts =
    args.reportCharts ?? (await buildReportChartImages(args.logs, args.profile, args.participant?.age));
  const doc = buildDocDefinition({ ...args, reportCharts });
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(doc).getBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Test raporu PDF oluşturulamadı."));
      });
    } catch (e) {
      reject(e);
    }
  });
}

/** Basış raporu ile aynı yöntem: blob + indirme linki (tarayıcı uyumluluğu). */
export async function downloadPdf(args) {
  const blob = await createPdfBlob(args);
  const name = `FocusProLab_${args.participant.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
