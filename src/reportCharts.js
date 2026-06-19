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
  attention: "#7c3aed",
  timing: "#6366f1",
  impulsivity: "#ef4444",
  hyperactivity: "#d4a574"
};

function indexMeta(locale = "tr") {
  const r = getStrings(locale).report;
  return {
    attention: {
      title: r.attention.replace(/^A — /, ""),
      field: "attention",
      color: "#7c3aed",
      pointStyle: "circle",
      borderDash: []
    },
    timing: {
      title: r.timing.replace(/^T — /, ""),
      field: "timing",
      color: "#4f46e5",
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
        y: { min: 0, max: 100, ticks: { stepSize: 20 }, grid: { color: "#e2e8f0" } },
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
          y: { min: 0, max: 100, ticks: { stepSize: 10 }, grid: { color: "#e2e8f0" } },
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
          title: { display: false }
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

  return {
    attention: renderIndexPhaseChart(phaseRows, profileKey, "attention", locale),
    timing: renderIndexPhaseChart(phaseRows, profileKey, "timing", locale),
    impulsivity: renderIndexPhaseChart(phaseRows, profileKey, "impulsivity", locale),
    hyperactivity: renderIndexPhaseChart(phaseRows, profileKey, "hyperactivity", locale),
    combined: renderCombinedPhaseChart(phaseSeries, profileKey, locale)
  };
}
