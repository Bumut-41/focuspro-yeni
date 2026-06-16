import { useCallback, useEffect, useState } from "react";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { profileLabel } from "../i18n/index.js";
import {
  ensurePsychologistShareCode,
  fetchSharedSessionsAsPsychologist,
  mapShareError
} from "../services/psychologistShare.js";
import { getReportPdfSignedUrl } from "../services/sessions.js";
import { Alert, Button, Card, CardHeader, DataTable, EmptyState } from "./ui.jsx";

export function PsychologistSharedSessionsCard() {
  const { t, locale, dateLocale } = useLocale();
  const [shareCode, setShareCode] = useState("");
  const [sessions, setSessions] = useState([]);
  const [err, setErr] = useState("");
  const [pdfBusy, setPdfBusy] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const [code, rows] = await Promise.all([
        ensurePsychologistShareCode(),
        fetchSharedSessionsAsPsychologist()
      ]);
      setShareCode(code);
      setSessions(rows);
      setErr("");
    } catch (e) {
      setErr(mapShareError(e.message, t));
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function copyCode() {
    if (!shareCode) return;
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("share.copyCodeManual"), shareCode);
    }
  }

  async function openPdf(session) {
    if (!session.pdf_path) return;
    setPdfBusy(session.id);
    try {
      const url = await getReportPdfSignedUrl(session.pdf_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setErr(e.message || t("dashboard.pdfOpenFailed"));
    } finally {
      setPdfBusy(null);
    }
  }

  return (
    <>
      <Card>
        <CardHeader
          title={t("share.psychCodeCardTitle")}
          description={t("share.psychCodeCardDesc")}
        />
        {err && (
          <Alert variant="error" style={{ marginBottom: 12 }}>
            {err}
          </Alert>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <code
            style={{
              fontSize: "1.25rem",
              letterSpacing: "0.12em",
              padding: "8px 14px",
              background: "var(--fp-bg)",
              borderRadius: "var(--fp-radius-md)",
              border: "1px solid var(--fp-border)"
            }}
          >
            {shareCode || "…"}
          </code>
          <Button type="button" variant="secondary" size="sm" onClick={copyCode} disabled={!shareCode}>
            {copied ? t("share.copied") : t("share.copyCode")}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={t("share.sharedListTitle")}
          description={t("share.sharedListDesc")}
        />
        {!sessions.length && (
          <EmptyState title={t("share.noShared")} description={t("share.noSharedDesc")} />
        )}
        {sessions.length > 0 && (
          <DataTable
            columns={[
              {
                label: t("dashboard.date"),
                render: (s) => new Date(s.created_at).toLocaleString(dateLocale)
              },
              {
                label: t("share.clientAccount"),
                render: (s) => s.profiles?.full_name ?? "—"
              },
              { key: "participant_name", label: t("dashboard.participant") },
              {
                key: "profile_key",
                label: t("dashboard.profile"),
                render: (s) => profileLabel(s.profile_key, locale)
              },
              {
                label: t("dashboard.overallScore"),
                render: (s) =>
                  s.metrics?.overallScore != null ? Math.round(s.metrics.overallScore) : "—"
              },
              {
                label: t("dashboard.testReport"),
                render: (s) =>
                  s.pdf_path ? (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={pdfBusy === s.id}
                      onClick={() => openPdf(s)}
                    >
                      {pdfBusy === s.id ? "…" : t("dashboard.openReport")}
                    </Button>
                  ) : (
                    <span style={{ color: "var(--fp-text-muted)", fontSize: "0.875rem" }}>
                      {t("dashboard.pdfPreparing")}
                    </span>
                  )
              }
            ]}
            rows={sessions}
            rowKey={(s) => s.id}
          />
        )}
      </Card>
    </>
  );
}
