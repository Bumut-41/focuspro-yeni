import {
  Chart,
  Filler,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Legend,
  Tooltip
} from "chart.js";
import {
  getReportPhaseChartScores,
  computeDetailedMetrics,
  getScores
} from "./reportHelpers.js";
import { getReportPdfStrings } from "./i18n/reportPdfStrings.js";
import { getStrings } from "./i18n/index.js";
import { normBand } from "./reportNorms.js";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Legend, Tooltip, Filler);

const COMBINED_COLORS = {
  attention: "#2563eb",
  timing: "#0d9488",
  impulsivity: "#ef4444",
  hyperactivity: "#d4a574"
};

function indexMeta(locale = "tr") {
  const r = getStrings(locale).report;
  return {
    attention: {
      title: r.attention.replace(/^A — /, ""),
      field: "attention",
      color: "#2563eb",
      pointStyle: "circle",
      borderDash: []
    },
    timing: {
      title: r.timing.replace(/^T — /, ""),
      field: "timing",
      color: "#0d9488",
      pointStyle: "rect",
      borderDash: [8, 4]
    },
    impulsivity: {
      title: r.impulsivity.replace(/^I — /, ""),
      field: "impulsivity",
      color: "#dc2626",
      pointStyle: "rectRot",
      borderDash: [4, 4]
    },
    hyperactivity: {
      title: r.hyperactivity.replace(/^H — /, ""),
      field: "hyperactivity",
      color: "#d97706",
      pointStyle: "triangle",
      borderDash: [6, 3]
    }
  };
}

/** 8 nokta — birleşik grafik serisi. */
export function getProfilePhaseSeries(logs, profile) {
  return getReportPhaseChartScores(logs, profile);
}

function renderChart(config, width = 520, height = 300) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const chart = new Chart(canvas.getContext("2d"), {
    ...config,
    options: {
      responsive: false,
      animation: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: config.options?.plugins?.legend?.display ?? false },
        tooltip: { enabled: false }
      },
      ...config.options
    }
  });
  chart.update("none");
  const url = canvas.toDataURL("image/png", 1);
  chart.destroy();
  return url;
}

function chartYScale(step = 20) {
  return {
    min: 0,
    max: 100,
    ticks: { stepSize: step },
    border: { display: true, color: "#334155", width: 2, dash: [] },
    grid: {
      color: (ctx) => {
        const v = ctx.tick?.value;
        if (v === 0 || v === 100) return "#334155";
        return "#e2e8f0";
      },
      lineWidth: (ctx) => {
        const v = ctx.tick?.value;
        if (v === 0 || v === 100) return 2;
        return 1;
      }
    }
  };
}

const RADAR_AXES = {
  tr: [
    { code: "A", lines: ["DİKKAT"], color: "#2563eb", key: "attention" },
    { code: "T", lines: ["ZAMANLAMA"], color: "#16a34a", key: "timing" },
    { code: "I", lines: ["DÜRTÜSELLİK"], color: "#f97316", key: "impulsivity" },
    { code: "H", lines: ["MOTOR", "KONTROL"], color: "#ef4444", key: "hyperactivity" },
    { code: "C", lines: ["ÇELDİRİCİ", "DİRENCİ"], color: "#7c3aed", key: "distractor" }
  ],
  en: [
    { code: "A", lines: ["ATTENTION"], color: "#2563eb", key: "attention" },
    { code: "T", lines: ["TIMING"], color: "#16a34a", key: "timing" },
    { code: "I", lines: ["IMPULSIVITY"], color: "#f97316", key: "impulsivity" },
    { code: "H", lines: ["MOTOR", "CONTROL"], color: "#ef4444", key: "hyperactivity" },
    { code: "C", lines: ["DISTRACTOR", "RESISTANCE"], color: "#7c3aed", key: "distractor" }
  ]
};

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function distractorResistanceScore(phaseRows, scores) {
  const distractorKeys = new Set(["gorsel2", "isitsel2", "kombine2"]);
  const rows = phaseRows.filter((row) => distractorKeys.has(row.phaseKey));
  const source = rows.length ? rows : phaseRows;
  if (!source.length) {
    return Math.round((scores.attention + scores.timing + scores.impulsivity + scores.hyperactivity) / 4);
  }
  const values = source.flatMap((row) => [row.attention, row.timing, row.impulsivity, row.hyperactivity]);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function radarPoint(cx, cy, index, radius) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

/** Beş boyutlu performans radarı — PDF görseli. */
export function renderProfileRadar(scores, locale = "tr") {
  if (typeof document === "undefined") return null;
  const axes = (RADAR_AXES[locale] ?? RADAR_AXES.tr).map((axis) => ({
    ...axis,
    value: clampScore(scores[axis.key])
  }));
  const width = 920;
  const height = 760;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2 + 8;
  const radius = 210;

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i += 1) {
    const outer = radarPoint(cx, cy, i, radius);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(outer.x, outer.y);
    ctx.stroke();
  }

  for (const step of [0.25, 0.5, 0.75, 1]) {
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const point = radarPoint(cx, cy, i, radius * step);
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.strokeStyle = step === 1 ? "#94a3b8" : "#e2e8f0";
    ctx.lineWidth = step === 1 ? 2 : 1.25;
    ctx.stroke();
  }

  ctx.beginPath();
  axes.forEach((axis, index) => {
    const point = radarPoint(cx, cy, index, radius * (axis.value / 100));
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(37, 99, 235, 0.62)";
  ctx.fill();
  ctx.strokeStyle = "#1d4ed8";
  ctx.lineWidth = 3.5;
  ctx.stroke();

  axes.forEach((axis, index) => {
    const point = radarPoint(cx, cy, index, radius * (axis.value / 100));
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#1e3a8a";
    ctx.fill();
  });

  axes.forEach((axis, index) => {
    const point = radarPoint(cx, cy, index, radius + 54);
    const align = index === 0 ? "center" : index === 1 || index === 2 ? "left" : "right";
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillStyle = axis.color;
    ctx.font = "800 28px sans-serif";
    ctx.fillText(axis.code, point.x, point.y - 16);
    ctx.font = "700 15px sans-serif";
    axis.lines.forEach((line, lineIndex) => {
      ctx.fillText(line, point.x, point.y + 12 + lineIndex * 18);
    });
  });

  return canvas.toDataURL("image/png");
}

function shortPhaseChartLabel(row) {
  const time = String(row.label || "").match(/(\d+[–-]\d+\s*dk)/i);
  const timeStr = time ? time[1].replace(/\s+/g, " ") : "";
  if (row.axisLabel && timeStr) return `${row.axisLabel} ${timeStr}`;
  if (timeStr) return timeStr;
  if (row.axisLabel) return row.axisLabel;
  const s = String(row.label || "").replace(/^[^—]+—\s*/, "").trim();
  return s.length > 16 ? `${s.slice(0, 14)}…` : s;
}

/** Tek endeks — tüm profil fazları, norm bandı + katılımcı. */
export function renderIndexPhaseChart(phaseRows, profileKey, indexKey, locale = "tr") {
  const INDEX_META = indexMeta(locale);
  const meta = INDEX_META[indexKey];
  const CL = getReportPdfStrings(locale).technical?.chartLabels ?? {};
  if (!phaseRows.length) return null;

  const n = phaseRows.length;
  const chartW = Math.min(540, 400 + n * 12);
  const chartH = 260;

  const labels = phaseRows.map(shortPhaseChartLabel);
  const userData = phaseRows.map((r) => r[meta.field]);
  const normMeans = [];
  const normLows = [];
  const normHighs = [];

  phaseRows.forEach((row) => {
    const pk = row.phaseKey ?? "temel1";
    const b = normBand(profileKey, pk, indexKey);
    normMeans.push(b.mean);
    normLows.push(b.low);
    normHighs.push(b.high);
  });

  return renderChart({
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: CL.normLow ?? "Norm lower",
          data: normLows,
          borderWidth: 0,
          pointRadius: 0,
          tension: 0.35
        },
        {
          label: CL.normBand ?? "Norm band",
          data: normHighs,
          backgroundColor: "rgba(148, 163, 184, 0.28)",
          borderWidth: 0,
          pointRadius: 0,
          fill: "-1",
          tension: 0.35
        },
        {
          label: CL.normRef ?? "Normative reference",
          data: normMeans,
          borderColor: "#94a3b8",
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 3,
          pointBackgroundColor: "#94a3b8",
          fill: false,
          tension: 0.35
        },
        {
          label: CL.participant ?? "Participant",
          data: userData,
          borderColor: meta.color,
          backgroundColor: meta.color,
          borderWidth: 3,
          borderDash: meta.borderDash,
          pointRadius: 6,
          pointStyle: meta.pointStyle,
          fill: false,
          tension: 0.35
        }
      ]
    },
    options: {
      layout: { padding: { top: 4, right: 8, bottom: 4, left: 4 } },
      scales: {
        y: chartYScale(20),
        x: {
          grid: { display: false },
          ticks: { font: { size: 8 }, maxRotation: 32, minRotation: 28, autoSkip: false }
        }
      },
      plugins: {
        legend: { display: false },
        title: { display: false }
      }
    }
  }, chartW, chartH);
}

/** Dört endeks — profil fazları (8–9 nokta). */
export function renderCombinedPhaseChart(phaseSeries, profileKey, locale = "tr") {
  if (!phaseSeries.length) return null;
  const INDEX_META = indexMeta(locale);
  const pdf = getReportPdfStrings(locale);
  const labels = phaseSeries.map(shortPhaseChartLabel);

  const datasets = Object.entries(COMBINED_COLORS).map(([key, color]) => {
    const meta = INDEX_META[key];
    return {
      label: meta.title,
      data: phaseSeries.map((p) => p[key]),
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2.5,
      pointRadius: 5,
      pointStyle: "circle",
      pointHoverRadius: 5,
      tension: 0.3,
      borderDash: key === "timing" ? [6, 4] : key === "impulsivity" ? [3, 3] : []
    };
  });

  return renderChart(
    {
      type: "line",
      data: { labels, datasets },
      options: {
        layout: { padding: { top: 4, right: 8, bottom: 4, left: 4 } },
        scales: {
          y: chartYScale(10),
          x: { ticks: { font: { size: 8 }, maxRotation: 32, minRotation: 28, autoSkip: false } }
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              boxWidth: 10,
              boxHeight: 10,
              padding: 10,
              font: { size: 9 }
            }
          },
          title: {
            display: true,
            text: pdf.chartCombinedTitle,
            align: "start",
            font: { size: 13, weight: "600" },
            color: "#4c1d95",
            padding: { bottom: 6 }
          }
        }
      }
    },
    540,
    280
  );
}

/**
 * PDF için tüm rapor grafikleri.
 * @returns {Promise<{ attention, timing, impulsivity, hyperactivity, combined, timeline? }>}
 */
export async function buildReportChartImages(logs, profile, age = null, pressTimeline = [], locale = "tr") {
  const profileKey = profile.key ?? "adult";
  const phaseRows = getReportPhaseChartScores(logs, profile, age, pressTimeline, locale);
  const phaseSeries = phaseRows;
  const metrics = computeDetailedMetrics(logs, profile.lateResponseMs, { pressTimeline, age, locale });
  const scores = getScores(metrics);
  const radarScores = {
    ...scores,
    distractor: distractorResistanceScore(phaseRows, scores)
  };

  return {
    radar: renderProfileRadar(radarScores, locale),
    attention: renderIndexPhaseChart(phaseRows, profileKey, "attention", locale),
    timing: renderIndexPhaseChart(phaseRows, profileKey, "timing", locale),
    impulsivity: renderIndexPhaseChart(phaseRows, profileKey, "impulsivity", locale),
    hyperactivity: renderIndexPhaseChart(phaseRows, profileKey, "hyperactivity", locale),
    combined: renderCombinedPhaseChart(phaseSeries, profileKey, locale)
  };
}
