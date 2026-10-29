import { profileLabel, getStrings } from "./i18n/index.js";
import { dateLocaleForPdf, fillTemplate, getReportPdfStrings, getFullPhaseLegend, getIndexDefinitions, getNormLevels } from "./i18n/reportPdfStrings.js";
import { triggerBlobDownload } from "./lib/triggerBlobDownload.js";
import { pdfFlagRow, pdfStatusLine } from "./lib/pdfStatusMarker.js";
import { getShapeSvg } from "./shapeUtils.jsx";
import {
  computeDetailedMetrics,
  computeDetailedMetricsV2,
  computeDetailedMetricsV3,
  computeDetailedMetricsV4,
  formatDurationSeconds,
  getDistractorSummaryMatrix,
  getGlobalIndexZScores,
  getLevel,
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
import { describeRtFiltering } from "./metricsV2.js";
import { compareTimingIqrEffect } from "./metricsV3.js";
import { normLevelTextFromZ } from "./reportNorms.js";
import { getPdfMake } from "./lib/pdfMakeLoader.js";
import { buildReportChartImages } from "./reportCharts.js";
import { buildPdfLogoBackground, getPdfLogoDataUrl } from "./lib/pdfLogoWatermark.js";
import { ACTIVE_REPORT_SCORING_VERSION } from "./scoringVersion.js";

const HEADER = "#4c1d95";
const HEADER_LIGHT = "#ede9fe";
const SUB = "#475569";
const TABLE_HEAD = "#142440";

function sectionTitle(text, pageBreak = false) {
  return {
    margin: [0, pageBreak ? 6 : 16, 0, 12],
    pageBreak: pageBreak ? "before" : undefined,
    columns: [
      { width: 5, canvas: [{ type: "rect", x: 0, y: 0, w: 5, h: 22, color: HEADER }] },
      {
        width: "*",
        stack: [{ text, fontSize: 14, bold: true, color: HEADER, margin: [12, 3, 0, 0] }]
      }
    ],
    columnGap: 0
  };
}

/** Başlık + alt yazı + grafik tek parça — sayfa ortasında kopmasın. */
function chartSectionBlock(title, imageSrc, pageBreakBefore = false, subtitle = null, imageWidth = 480) {
  if (!imageSrc) return null;
  return {
    unbreakable: true,
    pageBreak: pageBreakBefore ? "before" : undefined,
    margin: [0, pageBreakBefore ? 4 : 10, 0, 8],
    stack: [
      {
        columns: [
          { width: 5, canvas: [{ type: "rect", x: 0, y: 0, w: 5, h: 20, color: HEADER }] },
          { width: "*", stack: [{ text: title, fontSize: 14, bold: true, color: HEADER, margin: [10, 1, 0, 0] }] }
        ],
        columnGap: 0,
        margin: [0, 0, 0, subtitle ? 4 : 8]
      },
      ...(subtitle ? [{ text: subtitle, fontSize: 9, color: SUB, margin: [15, 0, 0, 8] }] : []),
      { image: imageSrc, width: imageWidth, alignment: "center", margin: [0, 2, 0, 8] }
    ]
  };
}

function coverHeader(locale = "tr", scoringVersion = ACTIVE_REPORT_SCORING_VERSION) {
  const pdf = getReportPdfStrings(locale);
  let subtitle = pdf.coverSubtitle;
  if (scoringVersion === "v2") subtitle = `${pdf.coverSubtitle} — V2 (dahili / arşiv)`;
  else if (scoringVersion === "v3") subtitle = `${pdf.coverSubtitle} — V3 (dahili / arşiv)`;
  else if (scoringVersion === "v4") subtitle = pdf.coverSubtitle;
  else if (scoringVersion === "v1") subtitle = `${pdf.coverSubtitle} — V1 (dahili / arşiv)`;
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
  const heading = String(title || "").trim();
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              ...(heading
                ? [{ text: heading, bold: true, fontSize: 11, color: HEADER, margin: [0, 0, 0, 8] }]
                : []),
              ...lines.map((t) => ({ text: t, fontSize: 9, color: SUB, margin: [0, 0, 0, 4], lineHeight: 1.35 }))
            ],
            fillColor: fill,
            margin: [14, 12, 14, 12]
          }
        ]
      ]
    },
    layout: "noBorders",
    margin: [0, 0, 0, 14]
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
              {
                text: title,
                color: "#fff",
                bold: true,
                fontSize: 9,
                alignment: "center",
                noWrap: true
              },
              {
                text: display,
                color: "#fff",
                bold: true,
                fontSize: 22,
                alignment: "center",
                margin: [0, 8, 0, 0]
              }
            ],
            fillColor: getScoreColor(value),
            margin: [6, 12, 6, 12]
          }
        ]
      ]
    },
    layout: "noBorders"
  };
}

function indexSectionBlock(key, data, pdf, isFirst = false) {
  const scoreText =
    data.score == null || Number.isNaN(Number(data.score)) ? "—" : `${data.score}\u00A0/\u00A0100`;
  return [
    ...(isFirst ? [sectionTitle(pdf.mainIndexes)] : []),
    {
      unbreakable: true,
      margin: [0, isFirst ? 0 : 10, 0, 6],
      stack: [
        {
          text: data.title,
          bold: true,
          fontSize: 12,
          color: HEADER,
          margin: [0, 0, 0, 6]
        },
        {
          columns: [
            {
              width: 92,
              stack: [
                {
                  text: scoreText,
                  fontSize: 20,
                  bold: true,
                  color: getScoreColor(data.score),
                  noWrap: true
                },
                { text: data.level, fontSize: 10, color: SUB, margin: [0, 4, 0, 0] }
              ]
            },
            {
              width: "*",
              stack: [
                { text: data.definition, fontSize: 8, color: SUB, margin: [0, 0, 0, 6] },
                {
                  text: pdf.commentLabel + ": " + data.comment,
                  fontSize: 9,
                  lineHeight: 1.35,
                  alignment: "justify"
                }
              ]
            }
          ],
          columnGap: 10
        }
      ]
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
    pageMargins: [42, 40, 42, 52],
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

const PERF_BAND_LABELS = {
  tr: {
    1: "İyi performans (≥ 85)",
    2: "Standart performans (70–84)",
    3: "Düşük performans (55–69)",
    4: "Performansta zorluk (40–54)",
    5: "Belirgin zorluk (< 40)"
  },
  en: {
    1: "Good performance (≥ 85)",
    2: "Standard performance (70–84)",
    3: "Low performance (55–69)",
    4: "Performance difficulty (40–54)",
    5: "Marked difficulty (< 40)"
  },
  it: {
    1: "Buona prestazione (≥ 85)",
    2: "Prestazione standard (70–84)",
    3: "Prestazione bassa (55–69)",
    4: "Difficoltà di prestazione (40–54)",
    5: "Difficoltà marcata (< 40)"
  }
};

function buildPerformanceLevelTable(scores, profileKey, locale, scoringVersion) {
  const pdf = getReportPdfStrings(locale);
  const NORM_LEVELS = getNormLevels(locale);
  const isV4 = scoringVersion === "v4";
  const labelMap = PERF_BAND_LABELS[locale] || PERF_BAND_LABELS.tr;

  let indices;
  if (isV4) {
    indices = [
      { score: scores.attention, band: scores.attention == null ? null : getLevel(scores.attention) },
      { score: scores.timing, band: scores.timing == null ? null : getLevel(scores.timing) },
      { score: scores.impulsivity, band: scores.impulsivity == null ? null : getLevel(scores.impulsivity) },
      { score: scores.hyperactivity, band: scores.hyperactivity == null ? null : getLevel(scores.hyperactivity) }
    ];
  } else {
    const z = getGlobalIndexZScores(scores, profileKey);
    indices = [
      { z: z.attention },
      { z: z.timing },
      { z: z.impulsivity },
      { z: z.hyperactivity }
    ];
  }

  const perfBody = NORM_LEVELS.map((row) => {
    const label = isV4 ? labelMap[row.level] || row.label : row.label;
    const cells = indices.map((ix) => {
      const match = isV4 ? ix.band === row.level : normPlacementFromZ(ix.z) === row.level;
      if (!match) return { text: "", fillColor: row.color };
      const value = isV4
        ? ix.score == null || Number.isNaN(Number(ix.score))
          ? "—"
          : String(Math.round(Number(ix.score)))
        : Number(ix.z).toFixed(2);
      return {
        text: value,
        alignment: "center",
        bold: true,
        color: row.level <= 2 ? "#0f172a" : "#fff",
        fillColor: row.color
      };
    });
    return [
      {
        text: `${row.level} ${label}`,
        fillColor: row.color,
        color: row.level <= 2 ? "#0f172a" : "#fff",
        fontSize: 9
      },
      ...cells
    ];
  });

  return {
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
  };
}

function buildNormComparison(scores, profileKey, locale = "tr", scoringVersion = "v1") {
  const pdf = getReportPdfStrings(locale);

  // V4: Z/norm tablosu yok; performans düzeyi (zorluk bantları) geri geldi
  if (scoringVersion === "v4") {
    return [
      sectionTitle(pdf.perfLevel, false),
      {
        text: pdf.perfBandIntro || pdf.normIntro,
        fontSize: 9,
        color: SUB,
        margin: [0, 0, 0, 10]
      },
      buildPerformanceLevelTable(scores, profileKey, locale, "v4")
    ];
  }

  const blocks = [
    sectionTitle(pdf.normComparison, false),
    {
      text: pdf.normIntro,
      fontSize: 9,
      color: SUB,
      margin: [0, 0, 0, 10]
    },
    buildPerformanceLevelTable(scores, profileKey, locale, scoringVersion),
    {
      ul: getIndexDefinitions(locale, scoringVersion).map(([t, d]) => ({
        text: [{ text: `${t}: `, bold: true }, d],
        fontSize: 8,
        margin: [0, 2, 0, 0]
      }))
    }
  ];
  if (scoringVersion === "v3") {
    blocks.push({
      text: pdf.algorithmCategoryNote || "",
      fontSize: 8,
      color: "#b45309",
      margin: [0, 8, 0, 0]
    });
  }

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
          s.attentionScore == null ? "—" : s.attentionScore,
          s.timingScore == null ? "—" : s.timingScore,
          s.impulsivityScore == null ? "—" : s.impulsivityScore,
          s.hyperactivityScore == null ? "—" : s.hyperactivityScore,
          s.medianReaction == null ? "—" : `${s.medianReaction} ms`,
          { text: s.comment, fontSize: 8 }
        ])
      ]
    },
    layout: tableLayout(),
    margin: [0, 0, 0, 8]
  };
}

function normAndPhaseBlock(sections, scores, profileKey, locale, scoringVersion = "v1") {
  const phaseTable = phaseSectionsTableBlock(sections, getReportPdfStrings(locale));
  const normBlocks = buildNormComparison(scores, profileKey, locale, scoringVersion);
  if (!phaseTable && !normBlocks.length) return null;
  if (!normBlocks.length) {
    return phaseTable
      ? { unbreakable: true, ...phaseTable, margin: [0, 0, 0, 12] }
      : null;
  }
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
  scoringVersion = ACTIVE_REPORT_SCORING_VERSION
}) {
  const profileKey = profile.key ?? "adult";
  const profileDisplay = profileLabel(profileKey, locale) || profile.label;
  const age = participant?.age ?? null;
  const pdf = getReportPdfStrings(locale);
  const report = getStrings(locale).report;
  const dateLoc = dateLocaleForPdf(locale);
  const metricOpts = { pressTimeline, age, locale };
  const isV2 = scoringVersion === "v2";
  const isV3 = scoringVersion === "v3";
  const isV4 = scoringVersion === "v4";
  const isPilot = isV2 || isV3 || isV4;
  const noSpeedTiming = isV3 || isV4;
  // Kullanıcıya sunulan rapor her zaman V4; V1/V2/V3 yalnızca dahili arşiv çağrılarında
  const metrics = isV4
    ? computeDetailedMetricsV4(logs, profile.lateResponseMs, metricOpts, age)
    : isV3
      ? computeDetailedMetricsV3(logs, profile.lateResponseMs, metricOpts, age)
      : isV2
        ? computeDetailedMetricsV2(logs, profile.lateResponseMs, metricOpts, age)
        : computeDetailedMetrics(logs, profile.lateResponseMs, metricOpts, age);
  const scores = getScores(metrics);
  // Geçerlilik / veri kalitesi de aynı skor motorundan (V4 raporunda V1'e düşülmez)
  const validity = computeTestValidity(logs, metrics, profile, pressTimeline, age, locale, {
    dataQualityMode: isV4
  });

  if (validity.shouldBlockReport) {
    return buildInvalidDocDefinition({ participant, profile, validity, locale, logoDataUrl });
  }

  const distractor = buildDistractorAnalysisFriendly(logs, profile, age, pressTimeline, locale);
  const sustainability = buildSustainabilityReport(logs, profile, age, pressTimeline, locale);
  const skipNormZ = isV4;
  const zGlobal = skipNormZ ? null : getGlobalIndexZScores(scores, profileKey);
  const indexComments = buildIndexClinicalComments(scores, locale, zGlobal, {
    noSpeedTiming,
    skipNormZ,
    metrics
  });
  const clinicalFlags = buildClinicalFlags(scores, metrics, validity, distractor, sustainability, locale);
  const executive = buildExecutiveSummary(
    scores,
    metrics,
    validity,
    clinicalFlags,
    distractor,
    locale,
    profileKey,
    { skipNormZ }
  );
  const professional = buildProfessionalNarrative(
    scores,
    metrics,
    validity,
    distractor,
    sustainability,
    locale,
    zGlobal
  );
  const sections = getSectionSummaries(logs, profile, age, pressTimeline, locale);
  const matrix = getDistractorSummaryMatrix(logs, profile, age, pressTimeline, locale);
  const rtFilter = describeRtFiltering(logs, profile.lateResponseMs);
  const rtAppendix = getReportPdfStrings(locale).technical?.rtFilterAppendix;
  const iqrCompare = isV4 ? compareTimingIqrEffect(logs, profile.lateResponseMs, age) : null;

  // Grafikler: zorunlu pageBreak yok (boş sayfa üretmesin); unbreakable başlık+grafiği bir arada tutar
  const chartBlocks = [];
  if (reportCharts.radar) {
    chartBlocks.push(chartSectionBlock(pdf.chartRadar, reportCharts.radar, true, pdf.chartRadarSubtitle, 420));
  }
  const timingChartDesc =
    noSpeedTiming ? pdf.chartTimingDesc : pdf.chartTimingDescV1 || pdf.chartTimingDesc;
  const indexCharts = [
    ["attention", pdf.chartAttention, pdf.chartAttentionDesc],
    ["timing", pdf.chartTiming, timingChartDesc],
    ["impulsivity", pdf.chartImpulsivity, pdf.chartImpulsivityDesc],
    ["hyperactivity", pdf.chartHyperactivity, pdf.chartHyperactivityDesc]
  ];
  for (const [key, title, desc] of indexCharts) {
    const block = chartSectionBlock(title + pdf.chartSuffix, reportCharts[key], false, desc || null, 480);
    if (block) chartBlocks.push(block);
  }
  if (reportCharts.combined) {
    chartBlocks.push(
      chartSectionBlock(pdf.chartCombined, reportCharts.combined, false, pdf.chartCombinedTitle, 480)
    );
  }

  const durationMin = Math.round(profile.durationMs / 60000);
  let timingFormula;
  if (isV4 || isV3) {
    const tag = isV4 ? "V4" : "V3";
    timingFormula = metrics.timingUnavailable
      ? `${tag} T: hesaplanamadı (${metrics.timingReason || "yetersiz RT"})`
      : `${tag} T = (Stab. ${metrics.timingRtStability ?? "—"}×0.55) + (Geç ${metrics.timingLateResponse ?? "—"}×0.45) = ${scores.timing ?? "—"} · ham medyan RT ${metrics.medianReaction ?? "—"} ms · ort ${metrics.avgReaction ?? "—"} · SD ${metrics.rtStd ?? "—"} · CV ${metrics.cv ?? "—"} · yaş bandı ${metrics.ageBandLabel || "—"} (ref ${metrics.ageReferenceRtMs ?? "—"} ms, skor değil) · K=${metrics.stabilityK ?? "—"} exploratory`;
  } else if (isV2) {
    timingFormula = metrics.timingUnavailable
      ? `V2 T: hesaplanamadı (${metrics.timingReason || "yetersiz RT"})`
      : `V2 T = (RT hızı ${metrics.timingRtSpeed ?? "—"}×0.40) + (Stab. ${metrics.timingRtStability ?? "—"}×0.40) + (Geç ${metrics.timingLateResponse ?? "—"}×0.20) = ${scores.timing ?? "—"} · medyan RT ${metrics.medianReaction ?? "—"} ms (pilot merkez 450 ms)`;
  } else {
    timingFormula = fillTemplate(pdf.timingFormula, {
      onTime: metrics.timingOnTimeHit ?? "—",
      rtSpeed: metrics.timingRtSpeed ?? "—",
      late: metrics.timingLateResponse ?? "—",
      stability: metrics.timingRtStability ?? "—",
      total: scores.timing
    });
  }
  const deltaStr =
    sustainability.delta != null
      ? (sustainability.delta > 0 ? "+" : "") + sustainability.delta + " " + pdf.points
      : "—";

  return {
    pageSize: "A4",
    pageMargins: [42, 40, 42, 52],
    defaultStyle: { font: "Roboto", fontSize: 10 },
    background: buildPdfLogoBackground(logoDataUrl),
    footer: (currentPage, pageCount) => ({
      margin: [42, 0, 42, 22],
      stack: [
        {
          canvas: [{ type: "line", x1: 0, y1: 0, x2: 511, y2: 0, lineWidth: 0.5, lineColor: "#cbd5e1" }],
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
      ...(isV3
        ? [
            {
              text:
                "Bu rapor V3 deneme algoritmasıdır. RT hız puanı yoktur (yaş normu oluşana kadar ham medyan RT gösterilir). Stabilite CV katsayısı exploratory’dir; klinik karar için V1 resmi rapor kullanılır.",
              fontSize: 8,
              color: "#b45309",
              margin: [0, 0, 0, 10]
            },
            ...(metrics.timingUnavailable
              ? [
                  {
                    text: `V3 T hesaplanamadı (${metrics.timingReason || "yetersiz veri"}). Genel skor üretilmedi.`,
                    fontSize: 9,
                    color: "#dc2626",
                    margin: [0, 0, 0, 10]
                  }
                ]
              : [])
          ]
        : []),
      ...(isV4 && metrics.timingUnavailable
        ? [
            {
              text: `T hesaplanamadı (${metrics.timingReason || "yetersiz veri"}). Genel skor üretilmedi.`,
              fontSize: 9,
              color: "#dc2626",
              margin: [0, 0, 0, 10]
            }
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

      sectionTitle(isV4 ? pdf.sessionDataQuality || pdf.testValidity : pdf.testValidity),
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  {
                    text: `${isV4 ? pdf.dataQualityIndex || pdf.validityIndex : pdf.validityIndex}: ${validity.score}/100`,
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

      // Skor kutuları üstte (eşit genişlik) — altta boş sayfa bırakmasın
      {
        columns: [
          scoreBox("A — Dikkat", scores.attention),
          scoreBox("T — Zamanlama", scores.timing),
          scoreBox("I — Dürtüsellik", scores.impulsivity),
          scoreBox("H — Motor", scores.hyperactivity)
        ],
        columnGap: 8,
        margin: [0, 4, 0, isV4 ? 12 : 8]
      },
      // V4 kullanıcı raporunda formül satırı yok (kurumsal görünüm)
      ...(!isV4
        ? [
            {
              text: timingFormula,
              fontSize: 7,
              color: "#64748b",
              margin: [0, 0, 0, 10]
            }
          ]
        : []),

      ...indexSectionBlock("attention", indexComments.attention, pdf, true),
      ...indexSectionBlock("timing", indexComments.timing, pdf),
      ...indexSectionBlock("impulsivity", indexComments.impulsivity, pdf),
      ...indexSectionBlock("hyperactivity", indexComments.hyperactivity, pdf),

      ...chartBlocks,

      sectionTitle(pdf.distractorAnalysis, true),
      ...distractor.items.flatMap((item) => [
        pdfStatusLine(item.level ?? "green", `${item.title} — ${item.label}`, {
          fontSize: 11,
          margin: [0, 0, 0, 4]
        }),
        {
          text: item.comment,
          fontSize: 9,
          color: SUB,
          lineHeight: 1.4,
          margin: [18, 0, 0, 14]
        }
      ]),
      infoBox(pdf.distractorGeneral, [distractor.general], HEADER_LIGHT),

      {
        unbreakable: true,
        stack: [
          sectionTitle(pdf.sustainability),
          infoBox("", [
            `${pdf.startPerf}: ${sustainability.firstAvg ?? "—"}`,
            `${pdf.endPerf}: ${sustainability.lastAvg ?? "—"}`,
            `${pdf.change}: ${deltaStr}`,
            `${pdf.commentLabel}: ${sustainability.comment}`
          ])
        ]
      },

      sectionTitle(pdf.professionalTitle, true),
      { text: professional, lineHeight: 1.4, alignment: "justify", margin: [0, 0, 0, 16] },

      sectionTitle(pdf.technicalAppendix),
      {
        ul: getFullPhaseLegend(locale).map(([a, b]) => `${a} — ${b}`),
        fontSize: 8,
        color: SUB,
        margin: [0, 0, 0, 10]
      },
      // V4: RT filtreleme teknik eki kullanıcı raporunda yok
      ...(!isV4 && rtAppendix
        ? [
            { text: rtAppendix.title, bold: true, fontSize: 10, color: HEADER, margin: [0, 4, 0, 4] },
            { text: rtAppendix.intro, fontSize: 8, color: SUB, margin: [0, 0, 0, 4] },
            { text: rtAppendix.iqr, fontSize: 8, color: SUB, margin: [0, 0, 0, 4] },
            {
              text: fillTemplate(rtAppendix.summary, {
                raw: rtFilter.rawN,
                cleaned: rtFilter.cleanedN,
                outliers: rtFilter.outliersRemoved,
                lateMs: rtFilter.lateMs,
                rush: rtFilter.rushUnder150
              }),
              fontSize: 8,
              color: "#0f172a",
              margin: [0, 0, 0, 4]
            },
            ...(rtFilter.outlierValues?.length
              ? [
                  {
                    text: `Dışlanan aykırı RT örnekleri (ms): ${rtFilter.outlierValues.join(", ")}${
                      rtFilter.outliersRemoved > rtFilter.outlierValues.length ? "…" : ""
                    }${
                      rtFilter.bounds
                        ? ` · IQR bandı ≈ [${rtFilter.bounds.lo}, ${rtFilter.bounds.hi}]`
                        : ""
                    }`,
                    fontSize: 7,
                    color: "#64748b",
                    margin: [0, 0, 0, 4]
                  }
                ]
              : []),
            {
              ul: rtFilter.rules,
              fontSize: 7,
              color: SUB,
              margin: [0, 0, 0, 4]
            },
            { text: rtAppendix.note, fontSize: 7, color: "#b45309", margin: [0, 0, 0, 10] }
          ]
        : []),
      {
        unbreakable: true,
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
      normAndPhaseBlock(sections, scores, profileKey, locale, scoringVersion),

      ...clinicalFlagsSection(clinicalFlags, pdf),

      ...(isV4 && iqrCompare
        ? [
            sectionTitle(pdf.iqrResearchTitle, false),
            {
              text: pdf.iqrResearchIntro,
              fontSize: 8,
              color: SUB,
              margin: [0, 0, 0, 8]
            },
            {
              unbreakable: true,
              table: {
                headerRows: 1,
                widths: ["*", 110, 110],
                body: [
                  [
                    { text: "", bold: true, color: "#fff", fillColor: TABLE_HEAD },
                    {
                      text: pdf.iqrColV4,
                      bold: true,
                      color: "#fff",
                      alignment: "center",
                      fillColor: TABLE_HEAD,
                      fontSize: 8
                    },
                    {
                      text: pdf.iqrColAlt,
                      bold: true,
                      color: "#fff",
                      alignment: "center",
                      fillColor: TABLE_HEAD,
                      fontSize: 8
                    }
                  ],
                  ...[
                    [pdf.iqrRowRawN, iqrCompare.rawOnTimeN, iqrCompare.rawOnTimeN],
                    [
                      pdf.iqrRowIncluded,
                      iqrCompare.withIqr.rtN,
                      iqrCompare.withoutIqr.rtN
                    ],
                    [
                      pdf.iqrRowOutliers,
                      iqrCompare.withIqr.outliersRemoved ?? 0,
                      0
                    ],
                    [
                      pdf.iqrRowMedian,
                      iqrCompare.withIqr.medianRt ?? "—",
                      iqrCompare.withoutIqr.medianRt ?? "—"
                    ],
                    [
                      pdf.iqrRowMean,
                      iqrCompare.withIqr.meanRt ?? "—",
                      iqrCompare.withoutIqr.meanRt ?? "—"
                    ],
                    [
                      pdf.iqrRowSd,
                      iqrCompare.withIqr.rtStd ?? "—",
                      iqrCompare.withoutIqr.rtStd ?? "—"
                    ],
                    [
                      pdf.iqrRowCv,
                      iqrCompare.withIqr.cv != null ? Number(iqrCompare.withIqr.cv).toFixed(3) : "—",
                      iqrCompare.withoutIqr.cv != null
                        ? Number(iqrCompare.withoutIqr.cv).toFixed(3)
                        : "—"
                    ],
                    [
                      pdf.iqrRowStab,
                      iqrCompare.withIqr.rtStability ?? "—",
                      iqrCompare.withoutIqr.rtStability ?? "—"
                    ],
                    [
                      pdf.iqrRowT,
                      iqrCompare.withIqr.unavailable
                        ? `— (${iqrCompare.withIqr.reason || ""})`
                        : iqrCompare.withIqr.score,
                      iqrCompare.withoutIqr.unavailable
                        ? `— (${iqrCompare.withoutIqr.reason || ""})`
                        : iqrCompare.withoutIqr.score
                    ]
                  ].map((row) => [
                    { text: row[0], fontSize: 8 },
                    { text: String(row[1]), alignment: "center", fontSize: 8 },
                    { text: String(row[2]), alignment: "center", fontSize: 8 }
                  ])
                ]
              },
              layout: tableLayout(),
              margin: [0, 0, 0, 6]
            },
            {
              text: `${pdf.iqrDeltaNote}: ${
                iqrCompare.deltaT == null
                  ? "—"
                  : (iqrCompare.deltaT > 0 ? "+" : "") + iqrCompare.deltaT
              }`,
              fontSize: 8,
              bold: true,
              color: HEADER,
              margin: [0, 0, 0, 4]
            },
            {
              text: pdf.iqrFootnote,
              fontSize: 7,
              color: SUB,
              margin: [0, 0, 0, 12]
            }
          ]
        : []),

      // Alternatif denetim ekleri — gövdeyi silmeden en alta (eski + yeni yan yana)
      ...(isV4
        ? [
            sectionTitle(pdf.distractorAltTitle || "Araştırma notu — çeldirici etiket karşılaştırması", false),
            {
              text:
                pdf.distractorAltIntro ||
                "Solda rapordaki (eski) etiket; sağda yalnız maxDrop eşiklerinden üretilen alternatif. Ana çeldirici bölümü değişmedi.",
              fontSize: 8,
              color: SUB,
              margin: [0, 0, 0, 8]
            },
            {
              unbreakable: true,
              table: {
                headerRows: 1,
                widths: ["*", 90, 90, 50, "*"],
                body: [
                  [
                    { text: pdf.section || "Faz", bold: true, color: "#fff", fillColor: TABLE_HEAD, fontSize: 8 },
                    {
                      text: pdf.distractorAltColLegacy || "Rapor etiketi (eski)",
                      bold: true,
                      color: "#fff",
                      fillColor: TABLE_HEAD,
                      fontSize: 8
                    },
                    {
                      text: pdf.distractorAltColThreshold || "Eşik alternatifi",
                      bold: true,
                      color: "#fff",
                      fillColor: TABLE_HEAD,
                      fontSize: 8
                    },
                    {
                      text: "maxDrop",
                      bold: true,
                      color: "#fff",
                      fillColor: TABLE_HEAD,
                      fontSize: 8,
                      alignment: "center"
                    },
                    {
                      text: pdf.distractorAltColRaw || "Hedef dışı / FA / idle / multi · A/T/I/H",
                      bold: true,
                      color: "#fff",
                      fillColor: TABLE_HEAD,
                      fontSize: 8
                    }
                  ],
                  ...distractor.items.map((item) => {
                    const r = item.raw;
                    const sc = r?.scores;
                    const rawTxt = r
                      ? `${r.nonTargets ?? "—"} / ${r.falseAlarms ?? "—"} / ${r.idlePresses ?? "—"} / ${r.multiPresses ?? "—"} · ${sc?.attention ?? "—"}/${sc?.timing ?? "—"}/${sc?.impulsivity ?? "—"}/${sc?.hyperactivity ?? "—"}`
                      : "—";
                    return [
                      { text: item.title, fontSize: 8 },
                      { text: item.label || "—", fontSize: 8 },
                      { text: item.altThreshold?.label || "—", fontSize: 8 },
                      {
                        text:
                          item.maxDrop != null && !Number.isNaN(Number(item.maxDrop))
                            ? String(Math.round(Number(item.maxDrop)))
                            : "—",
                        fontSize: 8,
                        alignment: "center"
                      },
                      { text: rawTxt, fontSize: 7 }
                    ];
                  })
                ]
              },
              layout: tableLayout(),
              margin: [0, 0, 0, 8]
            },
            {
              text:
                pdf.distractorAltFootnote ||
                "Eşik: ≤3 etki yok, ≤12 hafif, ≤22 orta, üstü belirgin. Eski mantık zayıf endeksi mild bandında orta’ya yükseltebilir.",
              fontSize: 7,
              color: SUB,
              margin: [0, 0, 0, 12]
            }
          ]
        : []),

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
  // Kayıtlı / e-posta — her zaman aktif rapor sürümü (V4); legacy istenmez
  const doc = buildDocDefinition({
    ...args,
    scoringVersion: ACTIVE_REPORT_SCORING_VERSION,
    reportCharts,
    logoDataUrl
  });
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
  // İndirme her zaman aktif kullanıcı sürümü (V4) — eski motorlar yalnızca downloadLegacyScoringBundle
  const version = ACTIVE_REPORT_SCORING_VERSION;
  const doc = buildDocDefinition({ ...args, scoringVersion: version, reportCharts, logoDataUrl });
  const safeName = (args.participant?.name || "report").replace(/\s+/g, "_");
  const tag = "rapor";
  const filename = `FocusProLab_${safeName}_${tag}_${Date.now()}.pdf`;
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
