import { Line } from "react-chartjs-2";
import { scoreSeries, summaryText } from "../metrics.js";
import { computeReportMetrics, getScores } from "../reportHelpers.js";
import { ShapeView } from "../shapeUtils.jsx";
import { createPdfBlob } from "../pdfReport.js";
import { Alert, Button, CardHeader, Stack } from "./ui.jsx";

export function ReportPanel({
  logs,
  profile,
  participant,
  target,
  pressTimeline = [],
  chartRef,
  savedHint,
  extraActions,
  persistPdf
}) {
  const metrics = logs.length
    ? computeReportMetrics(logs, profile.lateResponseMs, { pressTimeline, age: participant.age })
    : null;
  const scores = metrics ? getScores(metrics) : null;
  const series = logs.length ? scoreSeries(logs, profile.lateResponseMs) : null;

  const chartData = series
    ? {
        labels: logs.map((t) => t.trialNumber),
        datasets: [
          { label: "A — Dikkat", data: series.att, borderColor: "#7c3aed", tension: 0.2, pointRadius: 0 },
          { label: "T — Zamanlama", data: series.spd, borderColor: "#4f46e5", tension: 0.2, pointRadius: 0 },
          { label: "I — Dürtüsellik", data: series.imp, borderColor: "#dc2626", tension: 0.2, pointRadius: 0 },
          { label: "H — Hiper-reaktivite", data: series.hyp, borderColor: "#d97706", tension: 0.2, pointRadius: 0 }
        ]
      }
    : null;

  if (!metrics || !scores || !target) return null;

  return (
    <div>
      {savedHint && <Alert variant="success">{savedHint}</Alert>}
      <CardHeader
        title="Değerlendirme raporu"
        description={`${participant.name} · yaş ${participant.age} · ${profile.label}`}
      />
      <div className="fp-stat-grid" style={{ marginBottom: 20 }}>
        {[
          ["Genel", scores.overall],
          ["A — Dikkat", scores.attention],
          ["T — Zamanlama", scores.timing],
          ["I — Dürtüsellik", scores.impulsivity],
          ["H — Hiper-reaktivite", scores.hyperactivity]
        ].map(([t, v]) => (
          <div key={t} className="fp-score-tile">
            <div className="fp-score-tile-label">{t}</div>
            <div className="fp-score-tile-value">{v}</div>
          </div>
        ))}
      </div>
      <p style={{ lineHeight: 1.6, color: "var(--fp-text-secondary)", fontSize: "0.9375rem" }}>
        {summaryText(metrics, profile.label)}
      </p>
      {chartData && (
        <div
          style={{
            height: 300,
            marginTop: 24,
            padding: 16,
            border: "1px solid var(--fp-border)",
            borderRadius: "var(--fp-radius-lg)",
            background: "var(--fp-bg)"
          }}
        >
          <Line
            ref={chartRef}
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              scales: {
                y: { min: 0, max: 100, grid: { color: "#e2e8f0" } },
                x: { grid: { display: false } }
              },
              plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } }
            }}
          />
        </div>
      )}
      <Stack wrap gap={12} style={{ marginTop: 24, justifyContent: "center" }}>
        <Button
          type="button"
          variant="primary"
          onClick={async () => {
            try {
              const blob = persistPdf
                ? await persistPdf()
                : await createPdfBlob({ participant, profile, logs, target, pressTimeline });
              if (!blob) throw new Error("PDF oluşturulamadı.");
              const href = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = href;
              a.download = `FocusProLab_${participant.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
              a.click();
              URL.revokeObjectURL(href);
            } catch (e) {
              console.warn(e);
              window.alert(e?.message || "PDF işlemi başarısız. Lütfen tekrar deneyin.");
            }
          }}
        >
          {persistPdf ? "PDF kaydet / indir" : "PDF indir"}
        </Button>
        {extraActions}
      </Stack>
    </div>
  );
}
