import { Line } from "react-chartjs-2";
import { scoreSeries } from "../metrics.js";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { profileLabel } from "../i18n/index.js";
import { computeReportMetrics, getScores } from "../reportHelpers.js";
import {
  buildClinicalFlags,
  buildDistractorAnalysisFriendly,
  buildSustainabilityReport,
  computeTestValidity
} from "../report/reportClinical.js";
import { ShapeView } from "../shapeUtils.jsx";
import { downloadPdf } from "../pdfReport.js";
import { triggerBlobDownload } from "../lib/triggerBlobDownload.js";
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
  const validity = metrics && logs.length ? computeTestValidity(logs, metrics, profile, pressTimeline, participant.age, locale) : null;
  const distractor = metrics && logs.length ? buildDistractorAnalysisFriendly(logs, profile, participant.age, pressTimeline, locale) : null;
  const sustainability = metrics && logs.length ? buildSustainabilityReport(logs, profile, participant.age, pressTimeline, locale) : null;
  const clinicalFlags =
    scores && validity && distractor && sustainability
      ? buildClinicalFlags(scores, metrics, validity, distractor, sustainability, locale)
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
            {validity.band.emoji} {t("report.validity")}: {validity.score}/100 — {validity.band.label}
          </strong>
          <p style={{ margin: "8px 0 0", fontSize: "0.875rem" }}>{validity.summary}</p>
        </Alert>
      )}
      {clinicalFlags && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 10px", color: "var(--fp-primary)" }}>{t("report.clinicalFlags")}</h4>
          <div style={{ display: "grid", gap: 8 }}>
            {clinicalFlags.map((f) => {
              const bg =
                f.level === "green"
                  ? "#ecfdf5"
                  : f.level === "yellow"
                    ? "#fefce8"
                    : f.level === "orange"
                      ? "#fff7ed"
                      : "#fef2f2";
              return (
                <div
                  key={f.text}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: bg,
                    fontSize: "0.9375rem",
                    fontWeight: 600
                  }}
                >
                  {f.emoji} {f.text}
                </div>
              );
            })}
          </div>
        </div>
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
              if (persistPdf) {
                const blob = await persistPdf();
                if (!blob) throw new Error(t("report.pdfCreateFailed"));
                const filename = `FocusProLab_${participant.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
                triggerBlobDownload(blob, filename);
                return;
              }
              await downloadPdf({ participant, profile, logs, target, pressTimeline, locale });
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
