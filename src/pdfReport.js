import { profileLabel, getStrings } from "./i18n/index.js";
import { dateLocaleForPdf, fillTemplate, getReportPdfStrings, getFullPhaseLegend, getIndexDefinitions, getNormLevels } from "./i18n/reportPdfStrings.js";
import { triggerBlobDownload } from "./lib/triggerBlobDownload.js";
import { pdfFlagRow, pdfStatusLine } from "./lib/pdfStatusMarker.js";
import { getShapeSvg } from "./shapeUtils.jsx";
import {
  computeDetailedMetrics,
  computeDetailedMetricsV2,
  formatDurationSeconds,
  getDistractorSummaryMatrix,
  getGlobalIndexZScores,
  getLevelText,
  getScoreColor,
  getScores,
  getSectionSummaries,
  normPlacementFromZ
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
import { buildPdfLogoBackground, getPdfLogoDataUrl } from "./lib/pdfLogoWatermark.js";

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

/** Başlık + grafik tek blokta kalsın; sayfa ortasında boşluk oluşmasın. */
function chartSectionBlock(title, imageSrc, pageBreakBefore = false, subtitle = null, imageWidth = 515) {
  if (!imageSrc) return null;
  return {
    unbreakable: true,
    pageBreak: pageBreakBefore ? "before" : undefined,
    margin: [0, pageBreakBefore ? 4 : 14, 0, 0],
    stack: [
      {
        columns: [
          { width: 5, canvas: [{ type: "rect", x: 0, y: 0, w: 5, h: 22, color: HEADER }] },
          { width: "*", stack: [{ text: title, fontSize: 15, bold: true, color: HEADER, margin: [10, 2, 0, 0] }] }
        ],
        columnGap: 0,
        margin: [0, 0, 0, subtitle ? 4 : 8]
      },
      ...(subtitle ? [{ text: subtitle, fontSize: 10, color: SUB, margin: [15, 0, 0, 8] }] : []),
      { image: imageSrc, width: imageWidth, alignment: "center", margin: [0, 0, 0, 12] }
    ]
  };
}

function coverHeader(locale = "tr", scoringVersion = "v1") {
  const pdf = getReportPdfStrings(locale);
  const subtitle =
    scoringVersion === "v2"
      ? `${pdf.coverSubtitle} — V2 deneme algoritması (pilot)`
      : pdf.coverSubtitle;
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
                text: subtitle,
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
    hLineWidth: () => 1,
    hLineColor: () => "#475569",
    vLineWidth: () => 1,
    vLineColor: () => "#94a3b8"
  };
}

function normTableLayout(headColor = TABLE_HEAD) {
  return {
    fillColor: (rowIndex) => (rowIndex === 0 ? headColor : null),
    hLineWidth: () => 1.2,
    hLineColor: () => "#334155",
    vLineWidth: () => 1,
    vLineColor: () => "#64748b"
  };
}

function scoreBox(title, value) {
  const display = value == null || Number.isNaN(Number(value)) ? "—" : String(value);
  return {
    width: "*",
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              { text: title, color: "#fff", bold: true, fontSize: 10 },
              { text: display, color: "#fff", bold: true, fontSize: 22, margin: [0, 6, 0, 0] }
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

function indexSectionBlock(key, data, pdf, isFirst = false) {
  return [
    ...(isFirst ? [sectionTitle(pdf.mainIndexes)] : []),
    {
      text: data.title,
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
            {
              text: data.score == null || Number.isNaN(Number(data.score)) ? "—" : `${data.score}/100`,
              fontSize: 22,
              bold: true,
              color: getScoreColor(data.score)
            },
            { text: data.level, fontSize: 10, color: SUB, margin: [0, 4, 0, 0] }
          ]
        },
        {
          width: "*",
          stack: [
            { text: data.definition, fontSize: 8, color: SUB, margin: [0, 0, 0, 6] },
            { text: pdf.commentLabel + ": " + data.comment, fontSize: 9, lineHeight: 1.35, alignment: "justify" }
          ]
        }
      ],
      margin: [0, 0, 0, 8]
    }
  ];
}

function buildInvalidDocDefinition({ participant, profile, validity, locale = "tr", logoDataUrl = null }) {
  const profileKey = profile.key ?? "adult";
  const profileDisplay = profileLabel(profileKey, locale) || profile.label;
  const pdf = getReportPdfStrings(locale);
  const dateLoc = dateLocaleForPdf(locale);
  return {
    pageSize: "A4",
    pageMargins: [36, 36, 36, 48],
    defaultStyle: { font: "Roboto", fontSize: 10 },
    background: buildPdfLogoBackground(logoDataUrl),
    content: [
      coverHeader(locale),
      sectionTitle(pdf.invalidTitle),
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  { text: `${pdf.validityIndex}: ${validity.score}/100`, bold: true, fontSize: 14, color: "#dc2626" },
                  {
                    columns: [
                      {
                        width: 14,
                        canvas: [{ type: "ellipse", x: 7, y: 8, r1: 5, r2: 5, color: "#dc2626" }],
                        margin: [0, 4, 4, 0]
                      },
                      {
                        width: "*",
                        text: pdf.invalidTitle,
                        bold: true,
                        fontSize: 16,
                        color: "#dc2626",
                        margin: [0, 8, 0, 8]
                      }
                    ]
                  },
                  { text: validity.summary, fontSize: 10, margin: [0, 0, 0, 10] },
                  { text: pdf.invalidCritical + ":", bold: true, margin: [0, 0, 0, 6] },
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
      infoBox(pdf.participantInfo, [
        `${pdf.fullName}: ${participant.name}`,
        `${pdf.age}: ${participant.age}`,
        `${pdf.profile}: ${profileDisplay}`,
        `${pdf.evalDate}: ${new Date().toLocaleDateString(dateLoc)}`
      ]),
      {
        text: pdf.invalidNoReport,
        fontSize: 10,
        bold: true,
        color: "#475569",
        margin: [0, 12, 0, 0]
      }
    ]
  };
}

function clinicalFlagsSection(clinicalFlags, pdf) {
  const styles = {
    green: { fill: "#ecfdf5", text: "#166534" },
    yellow: { fill: "#fefce8", text: "#854d0e" },
    orange: { fill: "#fff7ed", text: "#9a3412" },
    red: { fill: "#fef2f2", text: "#991b1b" }
  };
  return [
    sectionTitle(pdf.clinicalFlags, true),
    {
      table: {
        widths: ["*"],
        body: clinicalFlags.map((f) => {
          const st = styles[f.level] ?? styles.yellow;
          return [
            {
              stack: [pdfFlagRow(f, { fontSize: 12 })],
              fillColor: st.fill,
              margin: [10, 8, 10, 8]
            }
          ];
        })
      },
      layout: "noBorders",
      margin: [0, 0, 0, 16]
    }
  ];
}

function buildNormComparison(scores, profileKey, locale = "tr") {
  const pdf = getReportPdfStrings(locale);
  const NORM_LEVELS = getNormLevels(locale);
  const z = getGlobalIndexZScores(scores, profileKey);
  const indices = [
    { key: "A", score: scores.attention, z: z.attention },
    { key: "T", score: scores.timing, z: z.timing },
    { key: "I", score: scores.impulsivity, z: z.impulsivity },
    { key: "H", score: scores.hyperactivity, z: z.hyperactivity }
  ];

  const perfBody = NORM_LEVELS.map((row) => {
    const cells = indices.map((ix) => {
      if (normPlacementFromZ(ix.z) !== row.level) return { text: "", fillColor: row.color };
      return {
        text: ix.z.toFixed(2),
        alignment: "center",
        bold: true,
        color: row.level <= 2 ? "#0f172a" : "#fff",
        fillColor: row.color
      };
    });
    return [
      { text: `${row.level} ${row.label}`, fillColor: row.color, color: row.level <= 2 ? "#0f172a" : "#fff", fontSize: 9 },
      ...cells
    ];
  });

  const blocks = [
    sectionTitle(pdf.normComparison, false),
    {
      text: pdf.normIntro,
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
            { text: pdf.perfLevel, bold: true, color: "#fff", fillColor: TABLE_HEAD },
            { text: "A", bold: true, color: "#fff", alignment: "center", fillColor: TABLE_HEAD },
            { text: "T", bold: true, color: "#fff", alignment: "center", fillColor: TABLE_HEAD },
            { text: "I", bold: true, color: "#fff", alignment: "center", fillColor: TABLE_HEAD },
            { text: "H", bold: true, color: "#fff", alignment: "center", fillColor: TABLE_HEAD }
          ],
          ...perfBody
        ]
      },
      layout: normTableLayout(),
      margin: [0, 0, 0, 12]
    }
  ];

  blocks.push({
    ul: getIndexDefinitions(locale).map(([t, d]) => ({ text: [{ text: `${t}: `, bold: true }, d], fontSize: 8, margin: [0, 2, 0, 0] }))
  });

  return blocks;
}

function phaseSectionsTableBlock(sections, pdf) {
  if (!sections?.length) return null;
  return {
    table: {
      headerRows: 1,
      widths: ["*", "auto", "auto", "auto", "auto", "auto", "*"],
      body: [
        [
          { text: pdf.section, bold: true, color: "#fff", fillColor: TABLE_HEAD },
          { text: "A", bold: true, color: "#fff", alignment: "center", fillColor: TABLE_HEAD },
          { text: "T", bold: true, color: "#fff", alignment: "center", fillColor: TABLE_HEAD },
          { text: "I", bold: true, color: "#fff", alignment: "center", fillColor: TABLE_HEAD },
          { text: "H", bold: true, color: "#fff", alignment: "center", fillColor: TABLE_HEAD },
          { text: "RT", bold: true, color: "#fff", alignment: "center", fillColor: TABLE_HEAD },
          { text: pdf.comment, bold: true, color: "#fff", fillColor: TABLE_HEAD }
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
    margin: [0, 0, 0, 8]
  };
}

function normAndPhaseBlock(sections, scores, profileKey, locale) {
  const phaseTable = phaseSectionsTableBlock(sections, getReportPdfStrings(locale));
  const normBlocks = buildNormComparison(scores, profileKey, locale);
  if (!phaseTable && !normBlocks.length) return null;
  return {
    unbreakable: true,
    margin: [0, 0, 0, 12],
    stack: [phaseTable, ...normBlocks].filter(Boolean)
  };
}

export function buildDocDefinition({
  participant,
  profile,
  logs,
  target,
  pressTimeline = [],
  reportCharts = {},
  locale = "tr",
  logoDataUrl = null,
  scoringVersion = "v1"
}) {
  const profileKey = profile.key ?? "adult";
  const profileDisplay = profileLabel(profileKey, locale) || profile.label;
  const age = participant?.age ?? null;
  const pdf = getReportPdfStrings(locale);
  const report = getStrings(locale).report;
  const dateLoc = dateLocaleForPdf(locale);
  const metricOpts = { pressTimeline, age, locale };
  const isV2 = scoringVersion === "v2";
  const metrics = isV2
    ? computeDetailedMetricsV2(logs, profile.lateResponseMs, metricOpts)
    : computeDetailedMetrics(logs, profile.lateResponseMs, metricOpts);
  const scores = getScores(metrics);
  // Geçerlilik her zaman V1 metrikleriyle (mevcut kurallar); V2 raporu da aynı geçerlilik kapısını kullanır
  const validityBase = isV2
    ? computeDetailedMetrics(logs, profile.lateResponseMs, metricOpts)
    : metrics;
  const validity = computeTestValidity(logs, validityBase, profile, pressTimeline, age, locale);

  if (validity.shouldBlockReport) {
    return buildInvalidDocDefinition({ participant, profile, validity, locale, logoDataUrl });
  }

  const distractor = buildDistractorAnalysisFriendly(logs, profile, age, pressTimeline, locale);
  const sustainability = buildSustainabilityReport(logs, profile, age, pressTimeline, locale);
  const zGlobal = getGlobalIndexZScores(scores, profileKey);
  const indexComments = buildIndexClinicalComments(scores, locale, zGlobal);
  const clinicalFlags = buildClinicalFlags(scores, metrics, validity, distractor, sustainability, locale);
  const executive = buildExecutiveSummary(scores, metrics, validity, clinicalFlags, distractor, locale, profileKey);
  const professional = buildProfessionalNarrative(scores, metrics, validity, distractor, sustainability, locale, zGlobal);
  const sections = getSectionSummaries(logs, profile, age, pressTimeline, locale);
  const matrix = getDistractorSummaryMatrix(logs, profile, age, pressTimeline, locale);

  const chartBlocks = [];
  let chartFirst = true;
  if (reportCharts.radar) {
    chartBlocks.push(chartSectionBlock(pdf.chartRadar, reportCharts.radar, true, pdf.chartRadarSubtitle, 420));
    chartFirst = false;
  }
  const indexCharts = [
    ["attention", pdf.chartAttention, pdf.chartAttentionDesc],
    ["timing", pdf.chartTiming, pdf.chartTimingDesc],
    ["impulsivity", pdf.chartImpulsivity, pdf.chartImpulsivityDesc],
    ["hyperactivity", pdf.chartHyperactivity, pdf.chartHyperactivityDesc]
  ];
  for (const [key, title, desc] of indexCharts) {
    const block = chartSectionBlock(title + pdf.chartSuffix, reportCharts[key], chartFirst, desc || null);
    if (block) {
      chartBlocks.push(block);
      chartFirst = false;
    }
  }
  if (reportCharts.combined) {
    chartBlocks.push(chartSectionBlock(pdf.chartCombined, reportCharts.combined, true, pdf.chartCombinedTitle));
  }

  const durationMin = Math.round(profile.durationMs / 60000);
  const timingFormula = isV2
    ? metrics.timingUnavailable
      ? `V2 T: hesaplanamadı (${metrics.timingReason || "yetersiz RT"})`
      : `V2 T = (RT hızı ${metrics.timingRtSpeed ?? "—"}×0.40) + (Stab. ${metrics.timingRtStability ?? "—"}×0.40) + (Geç ${metrics.timingLateResponse ?? "—"}×0.20) = ${scores.timing ?? "—"} · medyan RT ${metrics.medianReaction ?? "—"} ms (pilot merkez 450 ms)`
    : fillTemplate(pdf.timingFormula, {
        onTime: metrics.timingOnTimeHit ?? "—",
        rtSpeed: metrics.timingRtSpeed ?? "—",
        late: metrics.timingLateResponse ?? "—",
        stability: metrics.timingRtStability ?? "—",
        total: scores.timing
      });
  const deltaStr =
    sustainability.delta != null
      ? (sustainability.delta > 0 ? "+" : "") + sustainability.delta + " " + pdf.points
      : "—";

  return {
    pageSize: "A4",
    pageMargins: [36, 36, 36, 48],
    defaultStyle: { font: "Roboto", fontSize: 10 },
    background: buildPdfLogoBackground(logoDataUrl),
    footer: (currentPage, pageCount) => ({
      margin: [36, 0, 36, 20],
      stack: [
        {
          canvas: [{ type: "line", x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 0.5, lineColor: "#cbd5e1" }],
          margin: [0, 0, 0, 6]
        },
        {
          text: `${pdf.footer} • ${new Date().toLocaleDateString(dateLoc)} • ${pdf.pageLabel} ${currentPage}/${pageCount}`,
          fontSize: 7,
          color: "#94a3b8",
          alignment: "center"
        }
      ]
    }),
    content: [
      coverHeader(locale, scoringVersion),
      ...(isV2
        ? [
            {
              text:
                "Bu rapor V2 deneme algoritmasıdır. T puanı pilot parametrelerle (merkez 450 ms) hesaplanmıştır; klinik karar için V1 resmi rapor kullanılır.",
              fontSize: 8,
              color: "#b45309",
              margin: [0, 0, 0, 10]
            },
            ...(metrics.timingUnavailable
              ? [
                  {
                    text: `V2 T hesaplanamadı (${metrics.timingReason || "yetersiz veri"}). Genel skor üretilmedi.`,
                    fontSize: 9,
                    color: "#dc2626",
                    margin: [0, 0, 0, 10]
                  }
                ]
              : [])
          ]
        : []),

      sectionTitle(pdf.participantInfo),
      infoBox("", [
        `${pdf.fullName}: ${participant.name}`,
        `${pdf.age}: ${participant.age}`,
        `${pdf.gender}: ${participant.gender || "—"}`,
        `${pdf.evalDate}: ${new Date().toLocaleDateString(dateLoc)}`,
        `${pdf.profile}: ${profileDisplay}`,
        `${pdf.testDuration}: ${durationMin} ${pdf.testDurationUnit}`,
        `${pdf.totalTrials}: ${metrics.totalTrials}`
      ]),

      sectionTitle(pdf.testValidity),
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  {
                    text: `${pdf.validityIndex}: ${validity.score}/100`,
                    bold: true,
                    fontSize: 14,
                    color: validity.band.color,
                    margin: [0, 0, 0, 4]
                  },
                  {
                    columns: [
                      {
                        width: 14,
                        canvas: [
                          {
                            type: "ellipse",
                            x: 7,
                            y: 8,
                            r1: 5,
                            r2: 5,
                            color: validity.band.color
                          }
                        ],
                        margin: [0, 2, 4, 0]
                      },
                      {
                        width: "*",
                        text: validity.band.label,
                        bold: true,
                        fontSize: 12,
                        color: validity.band.color,
                        margin: [0, 0, 0, 10]
                      }
                    ]
                  },
                  ...validity.checklist.map((c) =>
                    pdfStatusLine(c.level ?? "green", c.text ?? String(c), {
                      fontSize: 9,
                      bold: false,
                      textColor: "#334155",
                      margin: [0, 0, 0, 3]
                    })
                  ),
                  { text: pdf.generalResult + ":", bold: true, fontSize: 10, margin: [0, 8, 0, 4] },
                  { text: validity.summary, fontSize: 9, lineHeight: 1.35 },
                  ...(validity.level2Warnings.length
                    ? [
                        { text: pdf.lowReliabilityWarnings + ":", bold: true, fontSize: 9, color: "#b45309", margin: [0, 8, 0, 4] },
                        ...validity.level2Warnings.map((w) =>
                          pdfStatusLine("yellow", w, { fontSize: 8, bold: false, textColor: "#b45309", margin: [0, 0, 0, 3] })
                        )
                      ]
                    : []),
                  ...(validity.level3Consistency.length
                    ? [
                        { text: pdf.consistencyWarnings + ":", bold: true, fontSize: 9, margin: [0, 8, 0, 4] },
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

      sectionTitle(pdf.executiveSummary),
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  { text: pdf.overallScore, bold: true, color: "#fff", fontSize: 11 },
                  {
                    text:
                      scores.overall == null || Number.isNaN(scores.overall)
                        ? "—"
                        : `${scores.overall}/100`,
                    bold: true,
                    color: "#fff",
                    fontSize: 26,
                    margin: [0, 4, 0, 0]
                  },
                  {
                    text:
                      scores.overall == null || Number.isNaN(scores.overall)
                        ? "Genel skor: T hesaplanamadığı için üretilmedi"
                        : `${pdf.riskLevel}: ${executive.risk}`,
                    color: "#fff",
                    fontSize: 10,
                    margin: [0, 2, 0, 0]
                  }
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
      infoBox(pdf.strengths, executive.strengths.length ? executive.strengths.map((s) => "• " + s) : [pdf.noStrengths], "#ecfdf5"),
      infoBox(
        pdf.weaknesses,
        executive.weaknesses.length ? executive.weaknesses.map((s) => "• " + s) : [pdf.noWeaknesses],
        "#fff7ed"
      ),
      infoBox(pdf.shortComment, [executive.shortComment], "#f8fafc"),

      ...indexSectionBlock("attention", indexComments.attention, pdf, true),
      ...indexSectionBlock("timing", indexComments.timing, pdf),
      ...indexSectionBlock("impulsivity", indexComments.impulsivity, pdf),
      ...indexSectionBlock("hyperactivity", indexComments.hyperactivity, pdf),

      {
        columns: [
          scoreBox(report.attention, scores.attention),
          scoreBox(report.timing, scores.timing),
          scoreBox(report.impulsivity, scores.impulsivity),
          scoreBox(report.hyperactivity, scores.hyperactivity)
        ],
        columnGap: 2,
        margin: [0, 0, 0, 6]
      },
      {
        text: timingFormula,
        fontSize: 7,
        color: "#64748b",
        margin: [0, 0, 0, 14]
      },

      ...chartBlocks,

      sectionTitle(pdf.distractorAnalysis, true),
      ...distractor.items.flatMap((item) => [
        pdfStatusLine(item.level ?? "green", `${item.title} — ${item.label}`, { fontSize: 11 }),
        { text: item.comment, fontSize: 9, lineHeight: 1.35, margin: [0, 0, 0, 12] }
      ]),
      infoBox(pdf.distractorGeneral, [distractor.general], HEADER_LIGHT),

      sectionTitle(pdf.sustainability),
      infoBox("", [
        `${pdf.startPerf}: ${sustainability.firstAvg ?? "—"}`,
        `${pdf.endPerf}: ${sustainability.lastAvg ?? "—"}`,
        `${pdf.change}: ${deltaStr}`,
        `${pdf.commentLabel}: ${sustainability.comment}`
      ]),

      sectionTitle(pdf.professionalTitle, true),
      { text: professional, lineHeight: 1.4, alignment: "justify", margin: [0, 0, 0, 16] },

      sectionTitle(pdf.technicalAppendix),
      {
        ul: getFullPhaseLegend(locale).map(([a, b]) => `${a} — ${b}`),
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
              { text: pdf.distractorTechnical, bold: true, color: "#fff" },
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
      normAndPhaseBlock(sections, scores, profileKey, locale),

      ...clinicalFlagsSection(clinicalFlags, pdf),

      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: pdf.disclaimer,
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

function pdfCreateErrorMessage(locale) {
  if (locale === "en") return "Could not create test report PDF.";
  if (locale === "it") return "Impossibile creare il PDF.";
  return "Test raporu PDF oluşturulamadı.";
}

export async function createPdfBlob(args) {
  const pdfMake = await getPdfMake();
  const [reportCharts, logoDataUrl] = await Promise.all([
    args.reportCharts ??
      buildReportChartImages(
        args.logs,
        args.profile,
        args.participant?.age,
        args.pressTimeline ?? [],
        args.locale ?? "tr"
      ),
    args.logoDataUrl ?? getPdfLogoDataUrl()
  ]);
  // Kayıtlı / e-posta raporu her zaman V1 (resmi algoritma)
  const doc = buildDocDefinition({ ...args, scoringVersion: "v1", reportCharts, logoDataUrl });
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(doc).getBlob((blob) => {
        if (blob && blob.size > 0) resolve(blob);
        else reject(new Error(pdfCreateErrorMessage(args.locale)));
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function downloadPdf(args) {
  const pdfMake = await getPdfMake();
  const [reportCharts, logoDataUrl] = await Promise.all([
    args.reportCharts ??
      buildReportChartImages(
        args.logs,
        args.profile,
        args.participant?.age,
        args.pressTimeline ?? [],
        args.locale ?? "tr"
      ),
    args.logoDataUrl ?? getPdfLogoDataUrl()
  ]);
  const version = args.scoringVersion === "v2" ? "v2" : "v1";
  const doc = buildDocDefinition({ ...args, scoringVersion: version, reportCharts, logoDataUrl });
  const safeName = (args.participant?.name || "report").replace(/\s+/g, "_");
  const filename = `FocusProLab_${safeName}_${version}_${Date.now()}.pdf`;
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(doc).getBlob((blob) => {
        if (!blob || blob.size === 0) {
          reject(new Error(pdfCreateErrorMessage(args.locale)));
          return;
        }
        try {
          triggerBlobDownload(blob, filename);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}
