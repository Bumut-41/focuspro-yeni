import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { profileLabel } from "../i18n/index.js";
import { roleLabel } from "../lib/userRoles.js";
import { fetchMySessions, fetchAdminPressTimeline, fetchSessionDetail, getReportPdfSignedUrl } from "../services/sessions.js";
import { downloadParticipantReportFromSession } from "../lib/adminSessionPdf.js";
import { downloadPdfFromUrl } from "../lib/triggerBlobDownload.js";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  DataTable,
  EmptyState,
  Page,
  Stack
} from "../components/ui.jsx";

export default function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const { t, locale, dateLocale } = useLocale();
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState("");
  const [pdfBusy, setPdfBusy] = useState(null);

  async function downloadTestReport(session) {
    setPdfBusy(session.id);
    setMsg("");
    try {
      if (session.pdf_path) {
        const url = await getReportPdfSignedUrl(session.pdf_path);
        await downloadPdfFromUrl(url, `FocusProLab_${session.participant_name ?? "report"}.pdf`);
        return;
      }
      const [detail, timeline] = await Promise.all([
        fetchSessionDetail(session.id),
        fetchAdminPressTimeline(session.id).catch(() => [])
      ]);
      await downloadParticipantReportFromSession(detail, timeline ?? [], locale);
    } catch (e) {
      setMsg(e.message || t("dashboard.pdfOpenFailed"));
    } finally {
      setPdfBusy(null);
    }
  }

  const load = useCallback(async () => {
    if (!isAdmin) {
      setSessions([]);
      return;
    }
    try {
      setSessions(await fetchMySessions());
    } catch (e) {
      setMsg(e.message);
    }
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Page wide>
      <Card>
        <CardHeader
          title={t("dashboard.welcome", { name: profile?.full_name })}
          description={t("dashboard.description")}
          action={<Badge variant="primary">{roleLabel(profile?.role, locale)}</Badge>}
        />
        <Alert variant={isAdmin ? "success" : "info"}>
          {isAdmin ? t("dashboard.pdfAutoSave") : t("dashboard.resultsPrivate")}
        </Alert>
        {!isAdmin && (
          <p style={{ margin: "12px 0 0", fontSize: "0.875rem", color: "var(--fp-text-secondary)", lineHeight: 1.55 }}>
            {t("dashboard.guideHint")}
          </p>
        )}
        <Stack gap={12} style={{ marginTop: 20 }}>
          <Button asLink to="/test" variant="primary">
            {t("dashboard.newTest")}
          </Button>
          {isAdmin && (
            <Button asLink to="/admin" variant="secondary">
              {t("dashboard.adminPanel")}
            </Button>
          )}
        </Stack>
        {msg && (
          <Alert variant="error" style={{ marginTop: 16 }}>
            {msg}
          </Alert>
        )}
      </Card>

      {isAdmin && (
      <Card>
        <CardHeader title={t("dashboard.historyTitle")} description={t("dashboard.historyDesc")} />
        {!sessions.length && (
          <EmptyState title={t("dashboard.noTests")} description={t("dashboard.noTestsDesc")} />
        )}
        {sessions.length > 0 && (
          <DataTable
            columns={[
              {
                label: t("dashboard.date"),
                render: (s) => new Date(s.created_at).toLocaleString(dateLocale)
              },
              { key: "participant_name", label: t("dashboard.participant") },
              {
                key: "profile_key",
                label: t("dashboard.profile"),
                render: (s) => profileLabel(s.profile_key, locale)
              },
              {
                label: t("dashboard.overallScore"),
                render: (s) => (s.metrics?.overallScore != null ? Math.round(s.metrics.overallScore) : "—")
              },
              {
                label: t("dashboard.testReport"),
                render: (s) => (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={pdfBusy === s.id}
                    onClick={() => downloadTestReport(s)}
                  >
                    {pdfBusy === s.id
                      ? "…"
                      : s.pdf_path
                        ? t("dashboard.downloadReport")
                        : t("dashboard.generateReport")}
                  </Button>
                )
              }
            ]}
            rows={sessions}
            rowKey={(s) => s.id}
          />
        )}
      </Card>
      )}
    </Page>
  );
}
