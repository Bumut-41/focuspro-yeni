import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { profileLabel } from "../i18n/index.js";
import { AdminPressTimeline } from "../components/AdminPressTimeline.jsx";
import {
  downloadParticipantReportFromSession,
  downloadPressReportFromSession
} from "../lib/adminSessionPdf.js";
import { downloadPdfFromUrl } from "../lib/triggerBlobDownload.js";
import {
  USER_ROLES,
  assignableRoles,
  formatRoleError,
  roleDescription,
  roleLabel
} from "../lib/userRoles.js";
import {
  adminAddCredits,
  adminSetUserRole,
  fetchAllProfiles,
  superAdminDeleteUser,
  superAdminSetCredits
} from "../services/credits.js";
import {
  fetchAdminPressTimeline,
  fetchAllSessions,
  fetchSessionDetail,
  getReportPdfSignedUrl
} from "../services/sessions.js";
import { fetchCorporateApplications } from "../services/corporateApplications.js";
import { fetchSpecialistApplications, getSpecialistDocumentUrl } from "../services/specialistApplications.js";
import { fetchContactMessages } from "../services/contactMessages.js";
import { SpecialistApplicationDetail } from "../components/SpecialistApplicationDetail.jsx";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  DataTable,
  Field,
  Input,
  Page,
  Select,
  Stack
} from "../components/ui.jsx";

function countryName(code, locale) {
  if (!code) return "—";
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

export default function AdminPage() {
  const { isAdmin, isSuperAdmin, user: authUser } = useAuth();
  const { t, locale, dateLocale, strings } = useLocale();
  const [profiles, setProfiles] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [grantUser, setGrantUser] = useState("");
  const [grantAmount, setGrantAmount] = useState(10);
  const [msg, setMsg] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(null);
  const [roleBusy, setRoleBusy] = useState(null);
  const [creditDrafts, setCreditDrafts] = useState({});
  const [creditBusy, setCreditBusy] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicationsError, setApplicationsError] = useState("");
  const [specialistApplications, setSpecialistApplications] = useState([]);
  const [specialistApplicationsError, setSpecialistApplicationsError] = useState("");
  const [specialistId, setSpecialistId] = useState(null);
  const [contactMessages, setContactMessages] = useState([]);
  const [contactMessagesError, setContactMessagesError] = useState("");
  const [contactId, setContactId] = useState(null);

  async function openStoredPdf(pdfPath, busyKey, filename = "FocusProLab-report.pdf") {
    if (!pdfPath) return;
    setPdfBusy(busyKey);
    try {
      const url = await getReportPdfSignedUrl(pdfPath);
      await downloadPdfFromUrl(url, filename);
    } catch (e) {
      setMsg(e.message || t("admin.storedPdfFailed"));
    } finally {
      setPdfBusy(null);
    }
  }

  const load = useCallback(async () => {
    const [profilesResult, sessionsResult, applicationsResult, specialistResult, contactResult] = await Promise.allSettled([
      fetchAllProfiles(),
      fetchAllSessions(200),
      fetchCorporateApplications(),
      fetchSpecialistApplications(),
      fetchContactMessages()
    ]);
    if (profilesResult.status === "fulfilled") {
      const p = profilesResult.value;
      setProfiles(p);
      setCreditDrafts(Object.fromEntries(p.map((row) => [row.id, String(row.test_credits ?? 0)])));
    } else {
      setProfiles([]);
      setMsg(profilesResult.reason?.message || String(profilesResult.reason));
    }
    if (sessionsResult.status === "fulfilled") {
      setSessions(sessionsResult.value);
    } else {
      setSessions([]);
      if (profilesResult.status === "fulfilled") {
        setMsg(sessionsResult.reason?.message || String(sessionsResult.reason));
      }
    }
    if (applicationsResult.status === "fulfilled") {
      setApplications(applicationsResult.value);
      setApplicationsError("");
    } else {
      setApplications([]);
      setApplicationsError(t("admin.applicationsFailed"));
    }
    if (specialistResult.status === "fulfilled") {
      setSpecialistApplications(specialistResult.value);
      setSpecialistApplicationsError("");
    } else {
      setSpecialistApplications([]);
      setSpecialistApplicationsError(t("admin.specialistApplicationsFailed"));
    }
    if (contactResult.status === "fulfilled") {
      setContactMessages(contactResult.value);
      setContactMessagesError("");
    } else {
      setContactMessages([]);
      setContactMessagesError(t("admin.contactMessagesFailed"));
    }
  }, [t]);

  useEffect(() => {
    if (isAdmin) load().catch((e) => setMsg(e.message));
  }, [isAdmin, load]);

  if (!isAdmin) return <Navigate to="/panel" replace />;

  async function loadSessionBundle(sessionId) {
    const [sess, tl] = await Promise.all([
      fetchSessionDetail(sessionId),
      fetchAdminPressTimeline(sessionId)
    ]);
    return { sess, tl: tl ?? [] };
  }

  async function openOrDownloadTestReport(sessionRow) {
    if (sessionRow.pdf_path) {
      await openStoredPdf(sessionRow.pdf_path, `${sessionRow.id}-test-open`, `FocusProLab_${sessionRow.participant_name ?? "report"}.pdf`);
      return;
    }
    const busyId = `${sessionRow.id}-test`;
    setPdfBusy(busyId);
    setMsg("");
    try {
      const { sess, tl } = await loadSessionBundle(sessionRow.id);
      await downloadParticipantReportFromSession(sess, tl, locale);
    } catch (e) {
      setMsg(e.message || t("admin.testPdfFailed"));
    } finally {
      setPdfBusy(null);
    }
  }

  async function downloadPressReportPdf(sessionRow) {
    if (sessionRow.admin_pdf_path) {
      await openStoredPdf(
        sessionRow.admin_pdf_path,
        `${sessionRow.id}-basis-open`,
        `FocusProLab_${sessionRow.participant_name ?? "report"}-press.pdf`
      );
      return;
    }
    const busyId = `${sessionRow.id}-basis`;
    setPdfBusy(busyId);
    setMsg("");
    try {
      const { sess, tl } = await loadSessionBundle(sessionRow.id);
      await downloadPressReportFromSession(sess, tl);
    } catch (e) {
      setMsg(e.message || t("admin.pressPdfFailed"));
    } finally {
      setPdfBusy(null);
    }
  }

  async function openSession(id) {
    if (selectedId === id) {
      setSelectedId(null);
      setDetail(null);
      setTimeline(null);
      return;
    }
    setSelectedId(id);
    setDetail(null);
    setTimeline(null);
    setDetailLoading(true);
    setMsg("");
    try {
      const { sess, tl } = await loadSessionBundle(id);
      setDetail(sess);
      setTimeline(tl);
    } catch (e) {
      setMsg(e.message);
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function grant() {
    if (!grantUser) return;
    try {
      await adminAddCredits(grantUser, Number(grantAmount));
      setMsg(t("admin.creditAdded"));
      load();
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function changeUserRole(profileRow, newRole) {
    if (!newRole || newRole === profileRow.role) return;
    setRoleBusy(profileRow.id);
    setMsg("");
    try {
      await adminSetUserRole(profileRow.id, newRole);
      setMsg(t("admin.roleUpdated", { name: profileRow.full_name, role: roleLabel(newRole, locale) }));
      await load();
    } catch (e) {
      setMsg(formatRoleError(e, locale));
    } finally {
      setRoleBusy(null);
    }
  }

  async function saveUserCredits(profileRow) {
    const raw = creditDrafts[profileRow.id];
    const credits = Number(raw);
    if (!Number.isFinite(credits) || credits < 0) {
      setMsg(t("admin.invalidCredit"));
      return;
    }
    if (credits === profileRow.test_credits) return;
    setCreditBusy(profileRow.id);
    setMsg("");
    try {
      await superAdminSetCredits(profileRow.id, credits);
      setMsg(t("admin.creditSaved", { name: profileRow.full_name, credits }));
      await load();
    } catch (e) {
      const detail = e?.message || e?.details || "";
      setMsg(detail ? `${formatRoleError(e, locale)} (${detail})` : formatRoleError(e, locale));
    } finally {
      setCreditBusy(null);
    }
  }

  async function deleteUser(profileRow) {
    if (
      !window.confirm(
        t("admin.deleteConfirm", {
          name: profileRow.full_name,
          email: profileRow.email ?? t("admin.noEmail")
        })
      )
    ) {
      return;
    }
    setDeleteBusy(profileRow.id);
    setMsg("");
    try {
      await superAdminDeleteUser(profileRow.id);
      setMsg(t("admin.userDeleted", { name: profileRow.full_name }));
      if (selectedId && detail?.owner_id === profileRow.id) {
        setSelectedId(null);
        setDetail(null);
        setTimeline(null);
      }
      await load();
    } catch (e) {
      const detail = e?.message || e?.details || "";
      setMsg(detail ? `${formatRoleError(e, locale)} (${detail})` : formatRoleError(e, locale));
    } finally {
      setDeleteBusy(null);
    }
  }

  const rolesForPicker = assignableRoles(isSuperAdmin);

  return (
    <Page wide>
      <Card>
        <CardHeader title={t("admin.title")} description={t("admin.description")} />
        {isSuperAdmin && (
          <p style={{ margin: "0 0 12px", fontSize: "0.875rem", color: "var(--fp-text-secondary)" }}>
            {t("admin.superHint")}
          </p>
        )}
        <Stack wrap gap={12} style={{ alignItems: "flex-end" }}>
          <Field label={t("admin.grantLabel")} className="fp-field--grow">
            <Select value={grantUser} onChange={(e) => setGrantUser(e.target.value)}>
              <option value="">{t("common.select")}</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.role}) — {p.test_credits} kredi
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("admin.amount")}>
            <Input
              type="number"
              min={1}
              value={grantAmount}
              onChange={(e) => setGrantAmount(e.target.value)}
              style={{ width: 88 }}
            />
          </Field>
          <Button type="button" variant="secondary" onClick={grant}>
            {t("admin.add")}
          </Button>
        </Stack>
        {msg && (
          <Alert
            variant={/eklendi|güncellendi|kaydedildi|silindi|added|updated|saved|deleted/i.test(msg) ? "success" : "info"}
            style={{ marginTop: 12 }}
          >
            {msg}
          </Alert>
        )}
      </Card>

      <Card>
        <CardHeader
          title={t("admin.applicationsTitle", { count: applications.length })}
          description={t("admin.applicationsDesc")}
        />
        {applicationsError && <Alert variant="error">{applicationsError}</Alert>}
        {!applicationsError && !applications.length && (
          <p style={{ margin: 0, color: "var(--fp-text-secondary)" }}>{t("admin.applicationsEmpty")}</p>
        )}
        {applications.length > 0 && (
          <DataTable
            columns={[
              {
                label: t("admin.date"),
                render: (row) => new Date(row.created_at).toLocaleString(dateLocale)
              },
              { key: "organization_name", label: t("admin.organization") },
              { key: "contact_name", label: t("admin.contact") },
              { key: "role", label: t("admin.jobTitle") },
              { key: "phone", label: t("admin.phone") },
              { key: "email", label: t("admin.email") },
              {
                label: t("admin.country"),
                render: (row) => countryName(row.country_code, locale)
              },
              { key: "city", label: t("admin.city") },
              { key: "institution_type", label: t("admin.institutionType") },
              { key: "expert_count", label: t("admin.experts") },
              { key: "monthly_clients", label: t("admin.monthlyClients") },
              {
                label: t("admin.message"),
                render: (row) => (
                  <span style={{ display: "block", maxWidth: 280, whiteSpace: "pre-wrap" }}>{row.message || "—"}</span>
                )
              }
            ]}
            rows={applications}
            rowKey={(row) => row.id}
          />
        )}
      </Card>

      <Card>
        <CardHeader
          title={t("admin.specialistApplicationsTitle", { count: specialistApplications.length })}
          description={t("admin.specialistApplicationsDesc")}
        />
        {specialistApplicationsError && <Alert variant="error">{specialistApplicationsError}</Alert>}
        {!specialistApplicationsError && !specialistApplications.length && (
          <p style={{ margin: 0, color: "var(--fp-text-secondary)" }}>{t("admin.specialistApplicationsEmpty")}</p>
        )}
        {specialistApplications.length > 0 && (
          <DataTable
            columns={[
              {
                label: t("admin.date"),
                render: (row) => new Date(row.created_at).toLocaleString(dateLocale)
              },
              { key: "full_name", label: t("admin.name") },
              { key: "email", label: t("admin.email") },
              { key: "phone", label: t("admin.phone") },
              { key: "city", label: t("admin.city") },
              {
                label: t("admin.profession"),
                render: (row) =>
                  (row.professions || [])
                    .map((key) => strings.home.marketing.specialist.professions.find((item) => item.key === key)?.label || key)
                    .join(", ")
              }
            ]}
            rows={specialistApplications}
            rowKey={(row) => row.id}
            onRowClick={(row) => setSpecialistId(row.id)}
            activeKey={specialistId}
          />
        )}
        <SpecialistApplicationDetail
          row={specialistApplications.find((row) => row.id === specialistId) || null}
          page={strings.home.marketing.specialist}
          dateLocale={dateLocale}
          onOpenDoc={async (path) => {
            try {
              const url = await getSpecialistDocumentUrl(path);
              window.open(url, "_blank", "noopener,noreferrer");
            } catch (error) {
              setMsg(error.message || t("admin.storedPdfFailed"));
            }
          }}
        />
      </Card>

      <Card>
        <CardHeader
          title={t("admin.contactMessagesTitle", { count: contactMessages.length })}
          description={t("admin.contactMessagesDesc")}
        />
        {contactMessagesError && <Alert variant="error">{contactMessagesError}</Alert>}
        {!contactMessagesError && !contactMessages.length && (
          <p style={{ margin: 0, color: "var(--fp-text-secondary)" }}>{t("admin.contactMessagesEmpty")}</p>
        )}
        {contactMessages.length > 0 && (
          <DataTable
            columns={[
              {
                label: t("admin.date"),
                render: (row) => new Date(row.created_at).toLocaleString(dateLocale)
              },
              { key: "full_name", label: t("admin.name") },
              { key: "email", label: t("admin.email") },
              {
                label: t("admin.phone"),
                render: (row) => row.phone || "—"
              },
              {
                label: t("admin.subject"),
                render: (row) =>
                  strings.home.marketing.contactPage.subjects.find((item) => item.key === row.subject)?.label || row.subject
              }
            ]}
            rows={contactMessages}
            rowKey={(row) => row.id}
            onRowClick={(row) => setContactId(row.id)}
            activeKey={contactId}
          />
        )}
        {contactMessages.find((row) => row.id === contactId) && (
          <div className="fp-spec-detail">
            {(() => {
              const row = contactMessages.find((item) => item.id === contactId);
              const subject =
                strings.home.marketing.contactPage.subjects.find((item) => item.key === row.subject)?.label || row.subject;
              const lines = [
                [t("admin.name"), row.full_name],
                [t("admin.email"), row.email],
                [t("admin.phone"), row.phone],
                [t("admin.profession"), row.profession],
                [t("admin.organization"), row.organization],
                [t("admin.location"), row.location],
                [t("admin.subject"), subject],
                [t("admin.message"), row.message]
              ];
              return (
                <dl>
                  {lines.map(([label, value]) => (
                    <div key={label} className="fp-spec-detail-row">
                      <dt>{label}</dt>
                      <dd>{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              );
            })()}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title={t("admin.usersTitle", { count: profiles.length })}
          description={isSuperAdmin ? t("admin.usersDescSuper") : t("admin.usersDesc")}
        />
        <ul
          style={{
            margin: "0 0 16px",
            paddingLeft: 20,
            fontSize: "0.875rem",
            color: "var(--fp-text-secondary)",
            lineHeight: 1.55
          }}
        >
          {USER_ROLES.map((r) => (
            <li key={r}>
              <strong>{roleLabel(r, locale)}</strong> — {roleDescription(r, locale)}
            </li>
          ))}
        </ul>
        <DataTable
          columns={[
            { key: "full_name", label: t("admin.name") },
            {
              label: t("admin.email"),
              render: (p) => (
                <span style={{ fontSize: "0.875rem" }}>{p.email ?? "—"}</span>
              )
            },
            {
              label: t("admin.roleCol"),
              render: (p) => (
                <Select
                  value={p.role}
                  disabled={roleBusy === p.id || p.id === authUser?.id}
                  onChange={(e) => changeUserRole(p, e.target.value)}
                  style={{ minWidth: 140 }}
                  aria-label={`${p.full_name} rolü`}
                >
                  {rolesForPicker.map((r) => (
                    <option key={r} value={r}>
                      {roleLabel(r, locale)}
                    </option>
                  ))}
                </Select>
              )
            },
            {
              label: t("admin.credits"),
              render: (p) =>
                isSuperAdmin ? (
                  <Stack gap={6} wrap style={{ alignItems: "center" }}>
                    <Input
                      type="number"
                      min={0}
                      value={creditDrafts[p.id] ?? String(p.test_credits ?? 0)}
                      disabled={creditBusy === p.id}
                      onChange={(e) =>
                        setCreditDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      style={{ width: 96 }}
                      aria-label={`${p.full_name} kredi`}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={creditBusy === p.id}
                      onClick={() => saveUserCredits(p)}
                    >
                      {creditBusy === p.id ? "…" : t("common.save")}
                    </Button>
                  </Stack>
                ) : (
                  <span>{p.test_credits}</span>
                )
            },
            {
              label: "",
              render: (p) => (
                <Stack gap={6} wrap style={{ alignItems: "center" }}>
                  {p.id === authUser?.id && (
                    <span style={{ fontSize: "0.75rem", color: "var(--fp-text-muted)" }}>{t("common.you")}</span>
                  )}
                  {isSuperAdmin && p.id !== authUser?.id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={deleteBusy === p.id}
                      onClick={() => deleteUser(p)}
                      style={{ color: "#dc2626" }}
                    >
                      {deleteBusy === p.id ? "…" : t("common.delete")}
                    </Button>
                  )}
                </Stack>
              )
            }
          ]}
          rows={profiles}
          rowKey={(p) => p.id}
        />
      </Card>

      <Card>
        <CardHeader
          title={t("admin.sessionsTitle", { count: sessions.length })}
          description={t("admin.sessionsDesc")}
        />
        <DataTable
          columns={[
            { label: t("admin.date"), render: (s) => new Date(s.created_at).toLocaleString(dateLocale) },
            { label: t("admin.operator"), render: (s) => s.owner?.full_name ?? s.profiles?.full_name ?? s.owner_id?.slice(0, 8) },
            { key: "participant_name", label: t("admin.participant") },
            {
              label: t("admin.score"),
              render: (s) => (s.metrics?.overallScore != null ? Math.round(s.metrics.overallScore) : "—")
            },
            {
              label: t("admin.record"),
              render: (s) => (
                <span style={{ fontSize: "0.8rem", color: "var(--fp-text-muted)" }}>
                  {s.pdf_path ? t("admin.testSaved") : t("admin.testPending")}
                  {s.admin_pdf_path ? t("admin.pressSaved") : ""}
                </span>
              )
            },
            {
              label: t("admin.reports"),
              render: (s) => (
                <Stack gap={6} wrap>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={pdfBusy?.startsWith(`${s.id}-test`)}
                    onClick={() => openOrDownloadTestReport(s)}
                  >
                    {pdfBusy?.startsWith(`${s.id}-test`) ? "…" : s.pdf_path ? t("admin.openTestReport") : t("admin.downloadTestReport")}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pdfBusy?.startsWith(`${s.id}-basis`)}
                    onClick={() => downloadPressReportPdf(s)}
                  >
                    {pdfBusy?.startsWith(`${s.id}-basis`) ? "…" : s.admin_pdf_path ? t("admin.openPressReport") : t("admin.downloadPressReport")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openSession(s.id)}>
                    {selectedId === s.id ? t("common.close") : t("admin.pressDetail")}
                  </Button>
                </Stack>
              )
            }
          ]}
          rows={sessions}
          rowKey={(s) => s.id}
          activeKey={selectedId}
        />
      </Card>

      {detailLoading && <p className="fp-loading">{t("common.loading")}</p>}
      {detail && !detailLoading && (
        <AdminPressTimeline
          session={detail}
          timeline={timeline ?? []}
          target={detail.target}
          onDownloadTestPdf={async () => {
            setPdfBusy(`${detail.id}-detail-test`);
            try {
              await downloadParticipantReportFromSession(detail, timeline ?? [], locale);
            } catch (e) {
              setMsg(e.message || t("admin.testPdfFailed"));
            } finally {
              setPdfBusy(null);
            }
          }}
          onDownloadPressPdf={async () => {
            setPdfBusy(`${detail.id}-detail-basis`);
            try {
              await downloadPressReportFromSession(detail, timeline ?? []);
            } catch (e) {
              setMsg(e.message || t("admin.pressPdfFailed"));
            } finally {
              setPdfBusy(null);
            }
          }}
          pdfBusy={pdfBusy?.startsWith(`${detail.id}-detail`) ?? false}
        />
      )}
    </Page>
  );
}
