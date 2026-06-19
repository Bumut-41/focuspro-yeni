import { Line } from "react-chartjs-2";
import { scoreSeries } from "../metrics.js";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { profileLabel } from "../i18n/index.js";
import { computeReportMetrics, getScores } from "../reportHelpers.js";
import {
  buildClinicalFlags,
  buildDistractorAnalysisFriendly,
  buildExecutiveSummary,
  buildSustainabilityReport,
  computeTestValidity
} from "../report/reportClinical.js";
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
  const { t, locale } = useLocale();
  const profileDisplay = profileLabel(profile.key ?? profile.profileKey, locale) || profile.label;
  const metricOpts = { pressTimeline, age: participant.age, locale };

  const metrics = logs.length ? computeReportMetrics(logs, profile.lateResponseMs, metricOpts) : null;
  const scores = metrics ? getScores(metrics) : null;
  const validity = metrics && logs.length ? computeTestValidity(logs, metrics, profile, pressTimeline, participant.age) : null;
  const distractor = metrics && logs.length ? buildDistractorAnalysisFriendly(logs, profile, participant.age, pressTimeline) : null;
  const sustainability = metrics && logs.length ? buildSustainabilityReport(logs, profile, participant.age, pressTimeline, locale) : null;
  const clinicalFlags =
    scores && validity && distractor && sustainability
      ? buildClinicalFlags(scores, metrics, validity, distractor, sustainability)
      : null;
  const executive =
    scores && validity && clinicalFlags && distractor
      ? buildExecutiveSummary(scores, metrics, validity, clinicalFlags, distractor)
      : null;
  const series = logs.length ? scoreSeries(logs, profile.lateResponseMs, metricOpts) : null;

  const chartData = series
    ? {
        labels: logs.map((trial) => trial.trialNumber),
        datasets: [
          { label: t("report.attention"), data: series.att, borderColor: "#7c3aed", tension: 0.2, pointRadius: 0 },
          { label: t("report.timing"), data: series.spd, borderColor: "#4f46e5", tension: 0.2, pointRadius: 0 },
          { label: t("report.impulsivity"), data: series.imp, borderColor: "#dc2626", tension: 0.2, pointRadius: 0 },
          { label: t("report.hyperactivity"), data: series.hyp, borderColor: "#d97706", tension: 0.2, pointRadius: 0 }
        ]
      }
    : null;

  if (!metrics || !scores || !target) return null;

  return (
    <div>
      {savedHint && <Alert variant="success">{savedHint}</Alert>}
      <CardHeader
        title={t("report.title")}
        description={t("report.meta", {
          name: participant.name,
          age: participant.age,
          profile: profileDisplay
        })}
      />
      <div className="fp-stat-grid" style={{ marginBottom: 20 }}>
        {[
          [t("report.overall"), scores.overall],
          [t("report.attention"), scores.attention],
          [t("report.timing"), scores.timing],
          [t("report.impulsivity"), scores.impulsivity],
          [t("report.hyperactivity"), scores.hyperactivity]
        ].map(([label, value]) => (
          <div key={label} className="fp-score-tile">
            <div className="fp-score-tile-label">{label}</div>
            <div className="fp-score-tile-value">{value}</div>
          </div>
        ))}
      </div>
      {validity && (
        <Alert variant={validity.isInvalid ? "error" : validity.score < 75 ? "warning" : "success"}>
          <strong>
            {validity.band.emoji} Geçerlilik: {validity.score}/100 — {validity.band.label}
          </strong>
          <p style={{ margin: "8px 0 0", fontSize: "0.875rem" }}>{validity.summary}</p>
        </Alert>
      )}
      {executive && (
        <p style={{ lineHeight: 1.6, color: "var(--fp-text-secondary)", fontSize: "0.9375rem", marginBottom: 16 }}>
          {executive.shortComment}
        </p>
      )}
      {clinicalFlags && (
        <p style={{ fontSize: "0.875rem", marginBottom: 16 }}>
          {clinicalFlags.map((f) => `${f.emoji} ${f.text}`).join(" · ")}
        </p>
      )}
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
                : await createPdfBlob({ participant, profile, logs, target, pressTimeline, locale });
              if (!blob) throw new Error(t("report.pdfCreateFailed"));
              const href = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = href;
              a.download = `FocusProLab_${participant.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
              a.click();
              URL.revokeObjectURL(href);
            } catch (e) {
              console.warn(e);
              window.alert(e?.message || t("report.pdfFailed"));
            }
          }}
        >
          {persistPdf ? t("report.pdfSaveDownload") : t("report.pdfDownload")}
        </Button>
        {extraActions}
      </Stack>
    </div>
  );
}
