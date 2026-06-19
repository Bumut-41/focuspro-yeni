import { profileLabel } from "./i18n/index.js";
import { getShapeSvg } from "./shapeUtils.jsx";
import {
  INDEX_DEFINITIONS,
  SDT_DEFINITIONS,
  NORM_LEVELS,
  SEVERITY_LEVELS,
  FULL_PHASE_LEGEND,
  computeDetailedMetrics,
  formatDurationSeconds,
  formatRate,
  getDistractorSummaryMatrix,
  getGlobalIndexZScores,
  getLevelText,
  getScoreColor,
  getScores,
  getSectionSummaries,
  normPlacementFromZ,
  severityLevel
} from "./reportHelpers.js";
import {
  buildClinicalFlags,
  buildDistractorAnalysisFriendly,
  buildExecutiveSummary,
  buildIndexClinicalComments,
  buildProfessionalNarrative,
  buildSustainabilityReport,
  computeTestValidity
} from "./report/reportClinical.js";
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
      { width: "*", stack: [{ text, fontSize: 15, bold: true, color: HEADER, margin: [10, 2, 0, 0] }] }
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

function indexSectionBlock(key, data, isFirst = false) {
  const titles = {
    attention: "A — DİKKAT",
    timing: "T — ZAMANLAMA",
    impulsivity: "I — DÜRTÜSELLİK",
    hyperactivity: "H — HİPERAKTİVİTE"
  };
  return [
    ...(isFirst ? [sectionTitle("Ana Performans Endeksleri")] : []),
    {
      text: titles[key],
      bold: true,
      fontSize: 12,
      color: HEADER,
      margin: [0, isFirst ? 0 : 12, 0, 6]
    },
    {
      columns: [
        {
          width: 80,
          stack: [
            { text: `${data.score}/100`, fontSize: 22, bold: true, color: getScoreColor(data.score) },
            { text: data.level, fontSize: 10, color: SUB, margin: [0, 4, 0, 0] }
          ]
        },
        {
          width: "*",
          stack: [
            { text: data.definition, fontSize: 8, color: SUB, margin: [0, 0, 0, 6] },
            { text: "Yorum: " + data.comment, fontSize: 9, lineHeight: 1.35, alignment: "justify" }
          ]
        }
      ],
      margin: [0, 0, 0, 8]
    }
  ];
}

function buildInvalidDocDefinition({ participant, profile, validity, locale = "tr" }) {
  const profileKey = profile.key ?? "adult";
  const profileDisplay = profileLabel(profileKey, locale) || profile.label;
  return {
    pageSize: "A4",
    pageMargins: [36, 36, 36, 48],
    defaultStyle: { font: "Roboto", fontSize: 10 },
    content: [
      coverHeader(),
      sectionTitle("TEST GEÇERSİZ"),
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  { text: "Geçerlilik Endeksi: " + validity.score + "/100", bold: true, fontSize: 14, color: "#dc2626" },
                  { text: "🔴 TEST GEÇERSİZ", bold: true, fontSize: 16, color: "#dc2626", margin: [0, 8, 0, 8] },
                  { text: validity.summary, fontSize: 10, margin: [0, 0, 0, 10] },
                  { text: "Kritik bulgular:", bold: true, margin: [0, 0, 0, 6] },
                  ...validity.level1Critical.map((c) => ({ text: "• " + c, fontSize: 9, color: "#991b1b", margin: [0, 0, 0, 4] }))
                ],
                fillColor: "#fef2f2",
                margin: [14, 14, 14, 14]
              }
            ]
          ]
        },
        layout: "noBorders",
        margin: [0, 0, 0, 16]
      },
      infoBox("Katılımcı", [
        `Ad Soyad: ${participant.name}`,
        `Yaş: ${participant.age}`,
        `Profil: ${profileDisplay}`,
        `Tarih: ${new Date().toLocaleDateString("tr-TR")}`
      ]),
      {
        text: "Bu oturum için performans raporu üretilmemiştir. Sonuçlar klinik yorum için kullanılmamalıdır.",
        fontSize: 10,
        bold: true,
        color: "#475569",
        margin: [0, 12, 0, 0]
      }
    ]
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
      text: "Normatif referans gruplarına göre standartlaştırılmış performans karşılaştırması.",
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
  const validity = computeTestValidity(logs, metrics, profile, pressTimeline, age);

  if (validity.shouldBlockReport) {
    return buildInvalidDocDefinition({ participant, profile, validity, locale });
  }

  const distractor = buildDistractorAnalysisFriendly(logs, profile, age, pressTimeline);
  const sustainability = buildSustainabilityReport(logs, profile, age, pressTimeline, locale);
  const indexComments = buildIndexClinicalComments(scores);
  const clinicalFlags = buildClinicalFlags(scores, metrics, validity, distractor, sustainability);
  const executive = buildExecutiveSummary(scores, metrics, validity, clinicalFlags, distractor);
  const professional = buildProfessionalNarrative(scores, metrics, validity, distractor, sustainability);
  const sections = getSectionSummaries(logs, profile, age, pressTimeline);
  const matrix = getDistractorSummaryMatrix(logs, profile, age, pressTimeline);
  const zGlobal = getGlobalIndexZScores(scores, profileKey);
  const betaStr = metrics.beta != null ? metrics.beta.toFixed(2) : "—";

  const chartBlocks = [];
  const indexCharts = [
    ["attention", "Dikkat (A)"],
    ["timing", "Zamanlama (T)"],
    ["impulsivity", "Dürtüsellik (I)"],
    ["hyperactivity", "Hiperaktivite (H)"]
  ];
  let chartFirst = true;
  for (const [key, title] of indexCharts) {
    if (reportCharts[key]) {
      chartBlocks.push(
        sectionTitle(title + " — Grafik", chartFirst),
        { image: reportCharts[key], width: 515, margin: [0, 0, 0, 12] }
      );
      chartFirst = false;
    }
  }
  if (reportCharts.combined) {
    chartBlocks.push(
      sectionTitle("Dört İndeks — Faz Grafiği", true),
      { image: reportCharts.combined, width: 515, margin: [0, 0, 0, 14] }
    );
  }

  const durationMin = Math.round(profile.durationMs / 60000);

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

      sectionTitle("Katılımcı Bilgileri"),
      infoBox("", [
        `Ad Soyad: ${participant.name}`,
        `Yaş: ${participant.age}`,
        `Cinsiyet: ${participant.gender || "—"}`,
        `Değerlendirme Tarihi: ${new Date().toLocaleDateString("tr-TR")}`,
        `Profil: ${profileDisplay}`,
        `Test Süresi: ${durationMin} Dakika`,
        `Toplam Deneme: ${metrics.totalTrials}`
      ]),

      sectionTitle("Test Geçerliliği"),
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  {
                    text: `Geçerlilik Endeksi: ${validity.score}/100`,
                    bold: true,
                    fontSize: 14,
                    color: validity.band.color,
                    margin: [0, 0, 0, 4]
                  },
                  {
                    text: `${validity.band.emoji} ${validity.band.label}`,
                    bold: true,
                    fontSize: 12,
                    color: validity.band.color,
                    margin: [0, 0, 0, 10]
                  },
                  ...validity.checklist.map((c) => ({ text: c, fontSize: 9, margin: [0, 0, 0, 3] })),
                  { text: "Genel Sonuç:", bold: true, fontSize: 10, margin: [0, 8, 0, 4] },
                  { text: validity.summary, fontSize: 9, lineHeight: 1.35 },
                  ...(validity.level2Warnings.length
                    ? [
                        { text: "Düşük güvenilirlik uyarıları:", bold: true, fontSize: 9, color: "#b45309", margin: [0, 8, 0, 4] },
                        ...validity.level2Warnings.map((w) => ({ text: "⚠ " + w, fontSize: 8, color: "#b45309" }))
                      ]
                    : []),
                  ...(validity.level3Consistency.length
                    ? [
                        { text: "Performans tutarlılığı:", bold: true, fontSize: 9, margin: [0, 8, 0, 4] },
                        ...validity.level3Consistency.map((w) => ({ text: "• " + w, fontSize: 8 }))
                      ]
                    : [])
                ],
                fillColor: validity.band.fill,
                margin: [12, 10, 12, 10]
              }
            ]
          ]
        },
        layout: "noBorders",
        margin: [0, 0, 0, 14]
      },

      sectionTitle("Yönetici Özeti"),
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  { text: "Genel Performans Skoru", bold: true, color: "#fff", fontSize: 11 },
                  { text: `${scores.overall}/100`, bold: true, color: "#fff", fontSize: 26, margin: [0, 4, 0, 0] },
                  { text: `Risk Düzeyi: ${executive.risk}`, color: "#fff", fontSize: 10, margin: [0, 2, 0, 0] }
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
      infoBox("Güçlü Alanlar", executive.strengths.length ? executive.strengths.map((s) => "✓ " + s) : ["—"], "#ecfdf5"),
      infoBox(
        "Gelişim Alanları",
        executive.weaknesses.length ? executive.weaknesses.map((s) => "⚠ " + s) : ["Belirgin gelişim alanı yok"],
        "#fff7ed"
      ),
      infoBox(
        "Klinik Bayraklar",
        clinicalFlags.map((f) => `${f.emoji} ${f.text}`),
        clinicalFlags[0]?.level === "green" ? "#ecfdf5" : "#fefce8"
      ),
      infoBox("Kısa Yorum", executive.lines, "#f8fafc"),

      ...indexSectionBlock("attention", indexComments.attention, true),
      ...indexSectionBlock("timing", indexComments.timing),
      ...indexSectionBlock("impulsivity", indexComments.impulsivity),
      ...indexSectionBlock("hyperactivity", indexComments.hyperactivity),

      {
        columns: [
          scoreBox("A — Dikkat", scores.attention),
          scoreBox("T — Zamanlama", scores.timing),
          scoreBox("I — Dürtüsellik", scores.impulsivity),
          scoreBox("H — Hiperaktivite", scores.hyperactivity)
        ],
        columnGap: 2,
        margin: [0, 0, 0, 6]
      },
      {
        text: `T = (Zİ ${metrics.timingOnTimeHit ?? "—"}×0.40) + (RT ${metrics.timingRtSpeed ?? "—"}×0.25) + (Geç ${metrics.timingLateResponse ?? "—"}×0.20) + (Stab. ${metrics.timingRtStability ?? "—"}×0.15) = ${scores.timing}`,
        fontSize: 7,
        color: "#64748b",
        margin: [0, 0, 0, 14]
      },

      ...chartBlocks,

      sectionTitle("Çeldirici Analizi", true),
      ...distractor.items.flatMap((item) => [
        {
          text: `${item.emoji} ${item.title} — ${item.label}`,
          bold: true,
          fontSize: 11,
          color: HEADER,
          margin: [0, 0, 0, 4]
        },
        { text: item.comment, fontSize: 9, lineHeight: 1.35, margin: [0, 0, 0, 12] }
      ]),
      infoBox("Genel Sonuç", [distractor.general], HEADER_LIGHT),

      sectionTitle("Sürdürülebilir Dikkat Analizi"),
      infoBox("", [
        `Başlangıç Performansı: ${sustainability.firstAvg ?? "—"}`,
        `Kapanış Performansı: ${sustainability.lastAvg ?? "—"}`,
        `Değişim: ${sustainability.delta != null ? (sustainability.delta > 0 ? "+" : "") + sustainability.delta + " puan" : "—"}`,
        `Yorum: ${sustainability.comment}`
      ]),

      sectionTitle("Ham Psikometrik Göstergeler", true),
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
                ["Genel Doğruluk", `%${metrics.accuracy}`],
                ["Hit Rate", formatRate(metrics.hitRate)],
                ["Omission Rate", formatRate(metrics.omissionRate)],
                ["Commission Rate", formatRate(metrics.commissionRate)],
                ["Late Response Rate", formatRate(metrics.lateRate)],
                ["Multi Press Rate", formatRate(metrics.multiPressRate)]
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
                ["Ortalama Tepki Süresi", `${metrics.avgReaction} ms`],
                ["RT Standart Sapma", `${metrics.rtStd} ms`],
                ["d-prime (d′)", metrics.dPrime.toFixed(2)],
                ["Beta (β)", betaStr],
                ["Criterion (c)", metrics.criterionC.toFixed(2)],
                ["Geçerlilik Endeksi", `${validity.score}/100`]
              ]
            },
            layout: tableLayout("#1e3a5f")
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 14]
      },

      sectionTitle("Profesyonel Değerlendirme"),
      { text: professional, lineHeight: 1.4, alignment: "justify", margin: [0, 0, 0, 16] },

      sectionTitle("Teknik Ek — Faz ve Norm"),
      {
        ul: FULL_PHASE_LEGEND.map(([a, b]) => `${a} — ${b}`),
        fontSize: 8,
        color: SUB,
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", 80, 80, 80, 80],
          body: [
            [
              { text: "Çeldirici etkisi (teknik)", bold: true, color: "#fff" },
              { text: "A", bold: true, alignment: "center", color: "#fff" },
              { text: "T", bold: true, alignment: "center", color: "#fff" },
              { text: "I", bold: true, alignment: "center", color: "#fff" },
              { text: "H", bold: true, alignment: "center", color: "#fff" }
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
              { text: "RT", bold: true, color: "#fff" },
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
        margin: [0, 0, 0, 12]
      },
      ...buildNormComparison(scores, profileKey),

      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: "FocusProLab değerlendirmesi tanı koymaz. Sonuçlar yalnızca nitelikli profesyoneller tarafından, klinik görüşme ve diğer verilerle birlikte yorumlanmalıdır.",
                fontSize: 8,
                color: "#475569",
                fillColor: "#f1f5f9",
                margin: [10, 10, 10, 10]
              }
            ]
          ]
        },
        layout: "noBorders",
        margin: [0, 16, 0, 0]
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
