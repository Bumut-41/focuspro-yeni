import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { profileLabel } from "../i18n/index.js";
import { roleLabel } from "../lib/userRoles.js";
import { fetchMySessions, getReportPdfSignedUrl } from "../services/sessions.js";
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

  async function openPdf(session) {
    if (!session.pdf_path) return;
    setPdfBusy(session.id);
    setMsg("");
    try {
      const url = await getReportPdfSignedUrl(session.pdf_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setMsg(e.message || t("dashboard.pdfOpenFailed"));
    } finally {
      setPdfBusy(null);
    }
  }

  const load = useCallback(async () => {
    try {
      setSessions(await fetchMySessions());
    } catch (e) {
      setMsg(e.message);
    }
  }, []);

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
        <Alert variant="success">{t("dashboard.pdfAutoSave")}</Alert>
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
                render: (s) =>
                  s.pdf_path ? (
                    <Button variant="primary" size="sm" disabled={pdfBusy === s.id} onClick={() => openPdf(s)}>
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
    </Page>
  );
}
