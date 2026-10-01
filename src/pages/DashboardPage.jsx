import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { profileLabel } from "../i18n/index.js";
import { roleLabel } from "../lib/userRoles.js";
import { fetchMySessions, fetchSessionDetail, getReportPdfSignedUrl } from "../services/sessions.js";
import { fetchMyClients } from "../services/clients.js";
import { downloadParticipantReportFromSession } from "../lib/adminSessionPdf.js";
import { downloadPdfFromUrl } from "../lib/triggerBlobDownload.js";
import { isStaleChunkError, reloadStaleChunk } from "../lib/reloadStaleChunk.js";
import { PsychologistInvitesPanel } from "../components/PsychologistInvitesPanel.jsx";
import { SpecialistClientsPanel } from "../components/SpecialistClientsPanel.jsx";
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
  const { profile, isAdmin, isPsychologist } = useAuth();
  const { t, locale, dateLocale } = useLocale();
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState("");
  const [pdfBusy, setPdfBusy] = useState(null);
  const canViewSessions = isAdmin || isPsychologist;

  async function downloadTestReport(session) {
    setPdfBusy(session.id);
    setMsg("");
    try {
      if (session.pdf_path) {
        const url = await getReportPdfSignedUrl(session.pdf_path);
        await downloadPdfFromUrl(url, `FocusProLab_${session.participant_name ?? "report"}.pdf`);
        return;
      }
      const detail = await fetchSessionDetail(session.id);
      await downloadParticipantReportFromSession(detail, [], locale);
    } catch (e) {
      if (isStaleChunkError(e) && reloadStaleChunk(e)) return;
      setMsg(isStaleChunkError(e) ? t("dashboard.pdfChunkFailed") : e.message || t("dashboard.pdfOpenFailed"));
    } finally {
      setPdfBusy(null);
    }
  }

  const load = useCallback(async () => {
    if (!canViewSessions) {
      setSessions([]);
      return;
    }
    try {
      const rows = await fetchMySessions();
      if (!isPsychologist) {
        setSessions(rows);
        return;
      }
      const clients = await fetchMyClients().catch(() => []);
      const names = new Set(clients.map((client) => client.full_name.trim().toLocaleLowerCase("tr")));
      setSessions(
        rows.filter(
          (session) =>
            session.invite_id || names.has((session.participant_name || "").trim().toLocaleLowerCase("tr"))
        )
      );
    } catch (e) {
      setMsg(e.message);
    }
  }, [canViewSessions, isPsychologist]);

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
        <Alert variant={canViewSessions ? "success" : "info"}>
          {isPsychologist
            ? t("dashboard.clientResultsHint")
            : canViewSessions
              ? t("dashboard.pdfAutoSave")
              : t("dashboard.resultsPrivate")}
        </Alert>
        {!canViewSessions && (
          <p style={{ margin: "12px 0 0", fontSize: "0.875rem", color: "var(--fp-text-secondary)", lineHeight: 1.55 }}>
            {t("dashboard.guideHint")}
          </p>
        )}
        <Stack gap={12} style={{ marginTop: 20 }}>
          <Button asLink to="/test" variant="primary">
            {isPsychologist ? t("clients.startTest") : t("dashboard.newTest")}
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

      {isPsychologist && <SpecialistClientsPanel />}
      {isPsychologist && <PsychologistInvitesPanel />}

      {canViewSessions && (
      <Card>
        <CardHeader
          title={isPsychologist ? t("dashboard.historyTitleClients") : t("dashboard.historyTitle")}
          description={isPsychologist ? t("dashboard.historyDescClients") : t("dashboard.historyDesc")}
        />
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
