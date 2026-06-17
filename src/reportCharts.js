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
import { normBand } from "./reportNorms.js";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Legend, Tooltip, Filler);

const INDEX_META = {
  attention: {
    title: "Dikkat",
    field: "attention",
    color: "#7c3aed",
    pointStyle: "circle",
    borderDash: []
  },
  timing: {
    title: "Zamanlama",
    field: "timing",
    color: "#4f46e5",
    pointStyle: "rect",
    borderDash: [8, 4]
  },
  impulsivity: {
    title: "Dürtüsellik",
    field: "impulsivity",
    color: "#dc2626",
    pointStyle: "rectRot",
    borderDash: [4, 4]
  },
  hyperactivity: {
    title: "Hiperaktivite (motor)",
    field: "hyperactivity",
    color: "#d97706",
    pointStyle: "triangle",
    borderDash: [6, 3]
  }
};

const COMBINED_COLORS = {
  attention: "#7c3aed",
  timing: "#6366f1",
  impulsivity: "#ef4444",
  hyperactivity: "#d4a574"
};

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

/** Tek endeks — tüm profil fazları, norm bandı + katılımcı. */
export function renderIndexPhaseChart(phaseRows, profileKey, indexKey) {
  const meta = INDEX_META[indexKey];
  if (!phaseRows.length) return null;

  const n = phaseRows.length;
  const chartW = Math.min(560, 420 + n * 14);
  const chartH = n > 6 ? 340 : 300;

  const labels = phaseRows.map((r) => (r.axisLabel ? `${r.axisLabel}\n${r.label}` : r.label));
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
          label: "Norm alt",
          data: normLows,
          borderWidth: 0,
          pointRadius: 0,
          tension: 0.35
        },
        {
          label: "Norm aralığı",
          data: normHighs,
          backgroundColor: "rgba(148, 163, 184, 0.28)",
          borderWidth: 0,
          pointRadius: 0,
          fill: "-1",
          tension: 0.35
        },
        {
          label: "Normatif referans",
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
          label: "Katılımcı",
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
      scales: {
        y: { min: 0, max: 100, ticks: { stepSize: 20 }, grid: { color: "#e2e8f0" } },
        x: {
          grid: { display: false },
          ticks: { font: { size: n > 6 ? 7 : 9 }, maxRotation: 55, minRotation: n > 6 ? 40 : 25 }
        }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: meta.title,
          align: "start",
          font: { size: 16, weight: "600" },
          color: "#0f172a",
          padding: { bottom: 12 }
        }
      }
    }
  }, chartW, chartH);
}

/** Dört endeks — profil fazları (8–9 nokta). */
export function renderCombinedPhaseChart(phaseSeries, profileKey) {
  if (!phaseSeries.length) return null;
  const labels = phaseSeries.map((p) => (p.axisLabel ? `${p.axisLabel} · ${p.label}` : p.label));

  const datasets = Object.entries(COMBINED_COLORS).map(([key, color]) => {
    const meta = INDEX_META[key];
    return {
      label: meta.title,
      data: phaseSeries.map((p) => p[key]),
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      pointRadius: 4,
      tension: 0.3,
      borderDash: key === "timing" ? [6, 4] : key === "impulsivity" ? [3, 3] : []
    };
  });

  return renderChart(
    {
      type: "line",
      data: { labels, datasets },
      options: {
        scales: {
          y: { min: 0, max: 100, ticks: { stepSize: 10 }, grid: { color: "#e2e8f0" } },
          x: { ticks: { font: { size: 8 }, maxRotation: 55, minRotation: 35 } }
        },
        plugins: {
          legend: { display: true, position: "top", labels: { boxWidth: 12, font: { size: 10 } } },
          title: {
            display: true,
            text: "Dört İndeks Genelinde Performans",
            align: "start",
            font: { size: 15, weight: "600" },
            color: "#4c1d95",
            padding: { bottom: 8 }
          }
        }
      }
    },
    540,
    320
  );
}

/**
 * PDF için tüm rapor grafikleri.
 * @returns {Promise<{ attention, timing, impulsivity, hyperactivity, combined, timeline? }>}
 */
export async function buildReportChartImages(logs, profile, age = null, pressTimeline = []) {
  const profileKey = profile.key ?? "adult";
  const phaseRows = getReportPhaseChartScores(logs, profile, age, pressTimeline);
  const phaseSeries = phaseRows;

  return {
    attention: renderIndexPhaseChart(phaseRows, profileKey, "attention"),
    timing: renderIndexPhaseChart(phaseRows, profileKey, "timing"),
    impulsivity: renderIndexPhaseChart(phaseRows, profileKey, "impulsivity"),
    hyperactivity: renderIndexPhaseChart(phaseRows, profileKey, "hyperactivity"),
    combined: renderCombinedPhaseChart(phaseSeries, profileKey)
  };
}
