import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { profileLabel } from "../i18n/index.js";
import { roleLabel } from "../lib/userRoles.js";
import { fetchAdminPressTimeline, fetchMySessions, fetchSessionDetail, getReportPdfSignedUrl } from "../services/sessions.js";
import { fetchMyClients } from "../services/clients.js";
import { fetchMyInvites } from "../services/invites.js";
import {
  downloadParticipantReportFromSession,
  downloadPressReportFromSession,
  sessionToParticipantReportArgs
} from "../lib/adminSessionPdf.js";
import { downloadPilotReportsFromSessionId } from "../lib/downloadPilotReports.js";
import { downloadPdfFromUrl } from "../lib/triggerBlobDownload.js";
import { deliverSessionReport, formatReportEmailStatus, sendSessionReportEmail } from "../services/emailReport.js";
import { getProfile } from "../profiles.js";
import { includesText, inDateRange } from "../lib/listFilters.js";
import { isStaleChunkError, reloadStaleChunk } from "../lib/reloadStaleChunk.js";
import { RecordFilters } from "../components/RecordFilters.jsx";
import { PsychologistInvitesPanel } from "../components/PsychologistInvitesPanel.jsx";
import { SpecialistClientsPanel } from "../components/SpecialistClientsPanel.jsx";
import { MyPurchasesPanel } from "../components/MyPurchasesPanel.jsx";
import { ScoringComparisonPanel } from "../components/ScoringComparisonPanel.jsx";
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

function resolveReportEmailFallback(session, clients, invites) {
  const stored = (session?.report_email_to || "").trim();
  if (stored) return stored;
  if (session?.invite_id && invites?.length) {
    const inv = invites.find((row) => row.id === session.invite_id);
    if (inv?.recipient_email) return inv.recipient_email;
  }
  const name = (session?.participant_name || "").trim().toLocaleLowerCase("tr");
  if (!name || !clients?.length) return null;
  const client = clients.find((c) => c.full_name.trim().toLocaleLowerCase("tr") === name);
  return client?.email || null;
}

export default function DashboardPage() {
  const { profile, isAdmin, isPsychologist, credits } = useAuth();
  const { t, locale, dateLocale } = useLocale();
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [invites, setInvites] = useState([]);
  const [msg, setMsg] = useState("");
  const [pdfBusy, setPdfBusy] = useState(null);
  const [testQuery, setTestQuery] = useState("");
  const [testProfile, setTestProfile] = useState("");
  const [testFrom, setTestFrom] = useState("");
  const [testTo, setTestTo] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const canViewSessions = isAdmin || isPsychologist;
  const profileOptions = useMemo(
    () => ["child", "teen", "adult"].map((key) => ({ value: key, label: profileLabel(key, locale) })),
    [locale]
  );

  async function resolveClientIdForSession(session) {
    if (!isPsychologist || session.invite_id) return null;
    const list = clients.length ? clients : await fetchMyClients().catch(() => []);
    const name = (session.participant_name || "").trim().toLocaleLowerCase("tr");
    const match = list.find((c) => c.full_name.trim().toLocaleLowerCase("tr") === name);
    return match?.id ?? null;
  }

  async function downloadTestReport(session) {
    setPdfBusy(`${session.id}-test`);
    setMsg("");
    try {
      if (session.pdf_path) {
        const url = await getReportPdfSignedUrl(session.pdf_path);
        await downloadPdfFromUrl(url, `FocusProLab_${session.participant_name ?? "report"}.pdf`);
        return;
      }
      // PDF yoksa: yeniden üret, sisteme kaydet — sonra indir
      const detail = await fetchSessionDetail(session.id);
      const timeline = await fetchAdminPressTimeline(session.id).catch(() => []);
      const ownerId = detail.owner_id;
      if (!ownerId) {
        await downloadParticipantReportFromSession(detail, timeline ?? [], locale);
        return;
      }
      const clientId = await resolveClientIdForSession(detail);
      const args = sessionToParticipantReportArgs(detail, timeline ?? []);
      const delivery = await deliverSessionReport({
        userId: ownerId,
        sessionId: detail.id,
        participant: args.participant,
        profile: args.profile || getProfile(detail.profile_key ?? "adult"),
        logs: args.logs,
        target: args.target,
        pressTimeline: args.pressTimeline,
        locale,
        clientId,
        // Rapor oluşturma mail göndermez; e-posta ayrı butonla
        sendEmail: false
      });
      await load();
      if (delivery.ok || delivery.result?.testSaved) {
        const path = detail.pdf_path;
        const fresh = await fetchSessionDetail(session.id).catch(() => null);
        const pdfPath = fresh?.pdf_path || path;
        if (pdfPath) {
          const url = await getReportPdfSignedUrl(pdfPath);
          await downloadPdfFromUrl(url, `FocusProLab_${session.participant_name ?? "report"}.pdf`);
          setMsg(t("dashboard.reportSavedSendEmailHint"));
          return;
        }
      }
      await downloadParticipantReportFromSession(detail, timeline ?? [], locale);
      if (!delivery.ok) {
        setMsg(t("dashboard.reportGeneratePartial", { reason: delivery.code || "pdf_not_saved" }));
      }
    } catch (e) {
      if (isStaleChunkError(e) && reloadStaleChunk(e)) return;
      setMsg(isStaleChunkError(e) ? t("dashboard.pdfChunkFailed") : e.message || t("dashboard.pdfOpenFailed"));
    } finally {
      setPdfBusy(null);
    }
  }

  /** Eski oturumlar: V1 → karşılaştırma → V2 → V3 → V4 (logs’tan yeniden üretir; kayıtlı V1 değişmez). */
  async function downloadPilotReportTrio(session) {
    setPdfBusy(`${session.id}-pilot`);
    setMsg("");
    try {
      await downloadPilotReportsFromSessionId(session.id, locale);
      setMsg("V1 → karşılaştırma → V2 → V3 → V4 raporları indirildi.");
    } catch (e) {
      if (isStaleChunkError(e) && reloadStaleChunk(e)) return;
      setMsg(isStaleChunkError(e) ? t("dashboard.pdfChunkFailed") : e.message || t("dashboard.pdfOpenFailed"));
    } finally {
      setPdfBusy(null);
    }
  }

  async function resendTestReportEmail(session) {
    setPdfBusy(`${session.id}-mail`);
    setMsg("");
    try {
      if (!session.pdf_path) {
        setMsg(t("admin.emailErr.pdf_not_ready"));
        return;
      }
      const clientId = await resolveClientIdForSession(session);
      const alreadySent = Boolean(session.report_email_sent_at || session.report_email_status === "sent");
      const mail = await sendSessionReportEmail(session.id, locale, clientId, alreadySent);
      await load();
      const email = Array.isArray(mail?.emails) ? mail.emails[0] : mail?.to;
      setMsg(email ? t("admin.emailSendOk", { email }) : t("admin.emailResendOk"));
    } catch (e) {
      const code = e?.code;
      const reason =
        code && t(`admin.emailErr.${code}`) !== `admin.emailErr.${code}`
          ? t(`admin.emailErr.${code}`)
          : e?.message || t("admin.emailErr.send_failed");
      setMsg(t("admin.emailResendFailed", { reason }));
    } finally {
      setPdfBusy(null);
    }
  }

  async function downloadPressReport(session) {
    setPdfBusy(`${session.id}-press`);
    setMsg("");
    try {
      if (session.admin_pdf_path) {
        const url = await getReportPdfSignedUrl(session.admin_pdf_path);
        await downloadPdfFromUrl(url, `FocusProLab_${session.participant_name ?? "report"}-press.pdf`);
        return;
      }
      const [detail, timeline] = await Promise.all([
        fetchSessionDetail(session.id),
        fetchAdminPressTimeline(session.id)
      ]);
      await downloadPressReportFromSession(detail, timeline);
    } catch (e) {
      if (isStaleChunkError(e) && reloadStaleChunk(e)) return;
      setMsg(isStaleChunkError(e) ? t("dashboard.pdfChunkFailed") : e.message || t("admin.pressPdfFailed"));
    } finally {
      setPdfBusy(null);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(testQuery), 300);
    return () => clearTimeout(timer);
  }, [testQuery]);

  const load = useCallback(async () => {
    if (!canViewSessions) {
      setSessions([]);
      return;
    }
    const searching = debouncedQuery.trim().length >= 2 || Boolean(testProfile || testFrom || testTo);
    try {
      const rows = await fetchMySessions({
        limit: searching ? 400 : 200,
        query: debouncedQuery.trim().length >= 2 ? debouncedQuery : "",
        profile: testProfile,
        from: testFrom,
        to: testTo
      });
      if (!isPsychologist) {
        setClients([]);
        setInvites([]);
        setSessions(rows);
        return;
      }
      const [clientRows, inviteRows] = await Promise.all([
        fetchMyClients().catch(() => []),
        fetchMyInvites(200).catch(() => [])
      ]);
      setClients(clientRows);
      setInvites(inviteRows);
      const names = new Set(clientRows.map((client) => client.full_name.trim().toLocaleLowerCase("tr")));
      setSessions(
        rows.filter(
          (session) =>
            session.invite_id || names.has((session.participant_name || "").trim().toLocaleLowerCase("tr"))
        )
      );
    } catch (e) {
      setMsg(e.message);
    }
  }, [canViewSessions, isPsychologist, debouncedQuery, testProfile, testFrom, testTo]);

  useEffect(() => {
    load();
  }, [load]);

  const testsFiltered = Boolean(testQuery.trim() || testProfile || testFrom || testTo);
  const filteredSessions = useMemo(
    () =>
      sessions.filter(
        (session) =>
          (!testProfile || session.profile_key === testProfile) &&
          inDateRange(session.created_at, testFrom, testTo) &&
          includesText(testQuery, session.participant_name)
      ),
    [sessions, testQuery, testProfile, testFrom, testTo]
  );
  const visibleSessions = filteredSessions.slice(0, 100);

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
          {profile?.role === "individual" || profile?.role === "psychologist" ? (
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--fp-text-secondary)" }}>
              {t("purchase.credits", { count: credits })}
            </p>
          ) : null}
          {(profile?.role === "individual" || profile?.role === "psychologist") && credits < 1 ? (
            <>
              <Alert variant="info">{t("dashboard.noTestCredits")}</Alert>
              <Button asLink to={profile?.role === "psychologist" ? "/uzman-test-satin-al" : "/test-satin-al"} variant="primary">
                {t("nav.buyTest")}
              </Button>
            </>
          ) : (
            <Button asLink to="/test" variant="primary">
              {isPsychologist ? t("clients.startTest") : t("dashboard.newTest")}
            </Button>
          )}
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

      {(profile?.role === "individual" || profile?.role === "psychologist") && <MyPurchasesPanel />}

      {isPsychologist && <SpecialistClientsPanel />}
      {isPsychologist && <PsychologistInvitesPanel />}

      {canViewSessions && (
        <ScoringComparisonPanel sessions={filteredSessions} dateLocale={dateLocale} />
      )}

      {canViewSessions && (
      <Card>
        <CardHeader
          title={
            isPsychologist
              ? t("dashboard.historyTitleClients", { count: filteredSessions.length })
              : t("dashboard.historyTitle", { count: filteredSessions.length })
          }
          description={isPsychologist ? t("dashboard.historyDescClients") : t("dashboard.historyDesc")}
        />
        {(sessions.length > 0 || testsFiltered) && (
          <RecordFilters
            t={t}
            query={testQuery}
            onQuery={setTestQuery}
            queryPlaceholder={t("filters.participantPlaceholder")}
            profile={testProfile}
            onProfile={setTestProfile}
            profileOptions={profileOptions}
            from={testFrom}
            onFrom={setTestFrom}
            to={testTo}
            onTo={setTestTo}
            active={testsFiltered}
            onClear={() => {
              setTestQuery("");
              setTestProfile("");
              setTestFrom("");
              setTestTo("");
            }}
            statusText={
              visibleSessions.length < filteredSessions.length
                ? t("filters.narrow", { shown: visibleSessions.length, total: filteredSessions.length })
                : testsFiltered && filteredSessions.length !== sessions.length
                  ? t("filters.shown", { shown: filteredSessions.length, total: sessions.length })
                  : ""
            }
          />
        )}
        {!testsFiltered && !sessions.length && (
          <EmptyState title={t("dashboard.noTests")} description={t("dashboard.noTestsDesc")} />
        )}
        {testsFiltered && filteredSessions.length === 0 && (
          <p style={{ margin: 0, color: "var(--fp-text-secondary)" }}>{t("filters.noMatch")}</p>
        )}
        {visibleSessions.length > 0 && (
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
                  <Stack gap={6} wrap>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={pdfBusy === `${s.id}-test` || pdfBusy === `${s.id}-pilot`}
                      onClick={() => downloadTestReport(s)}
                    >
                      {pdfBusy === `${s.id}-test`
                        ? "…"
                        : s.pdf_path
                          ? t("dashboard.downloadReport")
                          : t("dashboard.generateReport")}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      title="V1 → V1/V2/V3 karşılaştırma → V2 → V3 → V4"
                      disabled={pdfBusy === `${s.id}-test` || pdfBusy === `${s.id}-pilot`}
                      onClick={() => downloadPilotReportTrio(s)}
                    >
                      {pdfBusy === `${s.id}-pilot` ? "…" : "V1…V4 (5 PDF)"}
                    </Button>
                  </Stack>
                )
              },
              {
                label: t("admin.emailStatus"),
                render: (s) => (
                  <Stack gap={6}>
                    <span
                      style={{
                        display: "block",
                        maxWidth: 260,
                        fontSize: "0.8125rem",
                        lineHeight: 1.45,
                        color:
                          s.report_email_sent_at || s.report_email_status === "sent"
                            ? "var(--fp-success)"
                            : "var(--fp-text-secondary)"
                      }}
                    >
                      {formatReportEmailStatus(
                        s,
                        t,
                        dateLocale,
                        resolveReportEmailFallback(s, clients, invites)
                      )}
                    </span>
                    {s.pdf_path ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={pdfBusy === `${s.id}-mail`}
                        onClick={() => resendTestReportEmail(s)}
                      >
                        {pdfBusy === `${s.id}-mail`
                          ? "…"
                          : s.report_email_sent_at || s.report_email_status === "sent"
                            ? t("admin.emailResend")
                            : t("admin.emailSendReport")}
                      </Button>
                    ) : null}
                  </Stack>
                )
              },
              ...(isAdmin
                ? [
                    {
                      label: t("dashboard.pressReport"),
                      render: (s) => (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={pdfBusy === `${s.id}-press`}
                          onClick={() => downloadPressReport(s)}
                        >
                          {pdfBusy === `${s.id}-press`
                            ? "…"
                            : s.admin_pdf_path
                              ? t("admin.openPressReport")
                              : t("admin.downloadPressReport")}
                        </Button>
                      )
                    }
                  ]
                : [])
            ]}
            rows={visibleSessions}
            rowKey={(s) => s.id}
          />
        )}
      </Card>
      )}
    </Page>
  );
}
