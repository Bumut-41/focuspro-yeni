import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { profileLabel } from "../i18n/index.js";
import { AdminPressTimeline } from "../components/AdminPressTimeline.jsx";
import { ScoringComparisonPanel } from "../components/ScoringComparisonPanel.jsx";
import {
  downloadParticipantReportFromSession,
  downloadPressReportFromSession,
  sessionToParticipantReportArgs
} from "../lib/adminSessionPdf.js";
import { getProfile } from "../profiles.js";
import { includesText, inDateRange } from "../lib/listFilters.js";
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
import { downloadPurchasesCsv, downloadSpecialistPurchasesCsv, fetchIndividualPurchases, fetchSpecialistPurchases, formatTl } from "../services/purchases.js";
import {
  createPromoCode,
  deletePromoCode,
  fetchPromoCodes,
  updatePromoCode
} from "../services/promoCodes.js";
import { deliverSessionReport, formatReportEmailStatus, sendSessionReportEmail } from "../services/emailReport.js";
import {
  downloadContactCsv,
  downloadCorporateCsv,
  downloadProfilesCsv,
  downloadSessionsCsv,
  downloadSpecialistApplicationsCsv
} from "../services/adminExport.js";
import { AdminInvitesPanel } from "../components/AdminInvitesPanel.jsx";
import { AlgorithmAuditPanel } from "../components/AlgorithmAuditPanel.jsx";
import { ReportRefreshPanel } from "../components/ReportRefreshPanel.jsx";
import { RecordFilters } from "../components/RecordFilters.jsx";
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
  const [purchases, setPurchases] = useState([]);
  const [purchasesError, setPurchasesError] = useState("");
  const [purchaseId, setPurchaseId] = useState(null);
  const [packPurchases, setPackPurchases] = useState([]);
  const [packPurchasesError, setPackPurchasesError] = useState("");
  const [packPurchaseId, setPackPurchaseId] = useState(null);
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoError, setPromoError] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    note: "",
    active: true
  });
  const [grantQuery, setGrantQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userRole, setUserRole] = useState("");
  const [testQuery, setTestQuery] = useState("");
  const [testProfile, setTestProfile] = useState("");
  const [testFrom, setTestFrom] = useState("");
  const [testTo, setTestTo] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(testQuery), 300);
    return () => clearTimeout(timer);
  }, [testQuery]);

  const { pathname } = useLocation();

  const load = useCallback(async () => {
    const [profilesResult, applicationsResult, specialistResult, contactResult, purchasesResult, packResult, promoResult] =
      await Promise.allSettled([
        fetchAllProfiles(),
        fetchCorporateApplications(5000),
        fetchSpecialistApplications(5000),
        fetchContactMessages(5000),
        fetchIndividualPurchases(5000),
        fetchSpecialistPurchases(5000),
        isSuperAdmin ? fetchPromoCodes() : Promise.resolve([])
      ]);
    const loadedProfiles = profilesResult.status === "fulfilled" ? profilesResult.value : [];
    const ownerIds =
      debouncedQuery.trim().length >= 2
        ? loadedProfiles
            .filter((row) => includesText(debouncedQuery, row.full_name, row.email))
            .map((row) => row.id)
        : [];
    const sessionsResult = await fetchAllSessions({
      limit: 5000,
      query: debouncedQuery.trim().length >= 2 ? debouncedQuery : "",
      profile: testProfile,
      from: testFrom,
      to: testTo,
      ownerIds
    })
      .then((value) => ({ status: "fulfilled", value }))
      .catch((reason) => ({ status: "rejected", reason }));
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
    if (purchasesResult.status === "fulfilled") {
      setPurchases(purchasesResult.value);
      setPurchasesError("");
    } else {
      setPurchases([]);
      setPurchasesError(t("admin.purchasesFailed"));
    }
    if (packResult.status === "fulfilled") {
      setPackPurchases(packResult.value);
      setPackPurchasesError("");
    } else {
      setPackPurchases([]);
      setPackPurchasesError(t("admin.specialistPurchasesFailed"));
    }
    if (promoResult.status === "fulfilled") {
      setPromoCodes(promoResult.value);
      setPromoError("");
    } else {
      setPromoCodes([]);
      if (isSuperAdmin) {
        const reason = promoResult.reason?.message || "";
        setPromoError(
          /schema cache|does not exist|Could not find/i.test(reason)
            ? t("admin.promoErrSetup")
            : reason || t("admin.promoErrSetup")
        );
      }
    }
  }, [t, debouncedQuery, testProfile, testFrom, testTo, isSuperAdmin]);

  const profileOptions = useMemo(
    () => ["child", "teen", "adult"].map((key) => ({ value: key, label: profileLabel(key, locale) })),
    [locale]
  );
  const roleOptions = useMemo(
    () => USER_ROLES.map((role) => ({ value: role, label: roleLabel(role, locale) })),
    [locale]
  );
  const grantOptions = useMemo(
    () => profiles.filter((row) => !grantQuery.trim() || includesText(grantQuery, row.full_name, row.email) || row.id === grantUser),
    [profiles, grantQuery, grantUser]
  );
  const usersFiltered = Boolean(userQuery.trim() || userRole);
  const filteredUsers = useMemo(
    () => profiles.filter((row) => (!userRole || row.role === userRole) && includesText(userQuery, row.full_name, row.email)),
    [profiles, userQuery, userRole]
  );
  const visibleUsers = filteredUsers.slice(0, 100);
  const testsFiltered = Boolean(testQuery.trim() || testProfile || testFrom || testTo);
  const filteredSessions = useMemo(
    () =>
      sessions.filter(
        (session) =>
          (!testProfile || session.profile_key === testProfile) &&
          inDateRange(session.created_at, testFrom, testTo) &&
          includesText(testQuery, session.participant_name, session.owner?.full_name, session.profiles?.full_name)
      ),
    [sessions, testQuery, testProfile, testFrom, testTo]
  );
  const visibleSessions = filteredSessions.slice(0, 100);

  function filterStatus(active, shown, matched, source) {
    if (shown < matched) return t("filters.narrow", { shown, total: matched });
    if (active && matched !== source) return t("filters.shown", { shown: matched, total: source });
    return "";
  }

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
    // Güncel V4 üret + Storage’a yaz (e-posta / kayıtlı dosya eski kalmasın)
    const busyId = `${sessionRow.id}-test`;
    setPdfBusy(busyId);
    setMsg("");
    try {
      const { sess, tl } = await loadSessionBundle(sessionRow.id);
      if (sess.owner_id) {
        const args = sessionToParticipantReportArgs(sess, tl);
        await deliverSessionReport({
          userId: sess.owner_id,
          sessionId: sess.id,
          participant: args.participant,
          profile: args.profile || getProfile(sess.profile_key ?? "adult"),
          logs: args.logs,
          target: args.target,
          pressTimeline: args.pressTimeline,
          locale,
          sendEmail: false
        });
      }
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

  async function resendReportEmail(sessionRow) {
    const busyId = `${sessionRow.id}-mail`;
    setPdfBusy(busyId);
    setMsg("");
    try {
      if (!sessionRow.pdf_path) {
        setMsg(t("admin.emailErr.pdf_not_ready"));
        return;
      }
      const alreadySent = Boolean(sessionRow.report_email_sent_at || sessionRow.report_email_status === "sent");
      const mail = await sendSessionReportEmail(sessionRow.id, locale, null, alreadySent);
      const email = Array.isArray(mail?.emails) ? mail.emails[0] : mail?.to;
      setMsg(email ? t("admin.emailSendOk", { email }) : t("admin.emailResendOk"));
      await load();
    } catch (e) {
      const code = e?.code;
      const reason =
        code && t(`admin.emailErr.${code}`) !== `admin.emailErr.${code}`
          ? t(`admin.emailErr.${code}`)
          : e?.message || t("admin.emailErr.unexpected");
      setMsg(t("admin.emailResendFailed", { reason }));
      await load().catch(() => {});
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
  const section = pathname.replace(/\/$/, "") || "/admin";
  const adminPages = new Set([
    "/admin",
    "/admin/kredi",
    "/admin/satin-almalar",
    "/admin/uzman-satin-almalar",
    "/admin/kurumsal",
    "/admin/uzman",
    "/admin/iletisim",
    "/admin/kullanicilar",
    "/admin/davetler",
    "/admin/testler",
    "/admin/algoritma-dogrulama",
    ...(isSuperAdmin ? ["/admin/promosyon"] : [])
  ]);

  if (!adminPages.has(section)) return <Navigate to="/admin" replace />;

  async function savePromo(event) {
    event.preventDefault();
    const code = promoForm.code.trim();
    const value = Number(promoForm.discountValue);
    if (!code || !Number.isFinite(value) || value <= 0) {
      setMsg(t("admin.promoErr"));
      return;
    }
    if (promoForm.discountType === "percent" && value > 100) {
      setMsg(t("admin.promoErr"));
      return;
    }
    setPromoBusy(true);
    setMsg("");
    try {
      await createPromoCode({
        code,
        discountType: promoForm.discountType,
        discountValue: value,
        note: promoForm.note,
        active: promoForm.active
      });
      setPromoForm({ code: "", discountType: "percent", discountValue: "", note: "", active: true });
      setMsg(t("admin.promoSaved"));
      await load();
    } catch (e) {
      const text = e?.message || "";
      if (/duplicate|23505/i.test(text)) setMsg(t("admin.promoErrDuplicate"));
      else if (/schema cache|does not exist/i.test(text)) setMsg(t("admin.promoErrSetup"));
      else setMsg(text || t("admin.promoErr"));
    } finally {
      setPromoBusy(false);
    }
  }

  async function togglePromo(row) {
    setPromoBusy(true);
    try {
      await updatePromoCode(row.id, { active: !row.active });
      setMsg(t("admin.promoUpdated"));
      await load();
    } catch (e) {
      setMsg(e?.message || t("admin.promoErr"));
    } finally {
      setPromoBusy(false);
    }
  }

  async function removePromo(row) {
    if (!window.confirm(t("admin.promoDeleteConfirm", { code: row.code }))) return;
    setPromoBusy(true);
    try {
      await deletePromoCode(row.id);
      setMsg(t("admin.promoDeleted"));
      await load();
    } catch (e) {
      setMsg(e?.message || t("admin.promoErr"));
    } finally {
      setPromoBusy(false);
    }
  }

  return (
    <Page wide>
      {section === "/admin" ? (
        <Card>
          <CardHeader title={t("admin.title")} description={t("admin.description")} />
          <nav className="fp-admin-menu" aria-label={t("admin.title")}>
            <Link to="/admin/kredi">{t("admin.grantLabel")}</Link>
            <Link to="/admin/satin-almalar">{t("admin.purchasesTitle", { count: purchases.length })}</Link>
            <Link to="/admin/uzman-satin-almalar">{t("admin.specialistPurchasesTitle", { count: packPurchases.length })}</Link>
            <Link to="/admin/kurumsal">{t("admin.applicationsTitle", { count: applications.length })}</Link>
            <Link to="/admin/uzman">{t("admin.specialistApplicationsTitle", { count: specialistApplications.length })}</Link>
            <Link to="/admin/iletisim">{t("admin.contactMessagesTitle", { count: contactMessages.length })}</Link>
            <Link to="/admin/kullanicilar">{t("admin.usersTitle", { count: filteredUsers.length })}</Link>
            <Link to="/admin/davetler">{t("admin.invitesNav")}</Link>
            <Link to="/admin/testler">{t("admin.sessionsTitle", { count: filteredSessions.length })}</Link>
            <Link to="/admin/algoritma-dogrulama">{t("admin.algorithmAuditNav")}</Link>
            {isSuperAdmin ? (
              <Link to="/admin/promosyon">{t("admin.promoTitle", { count: promoCodes.length })}</Link>
            ) : null}
          </nav>
        </Card>
      ) : (
        <Link to="/admin" className="fp-back-link">
          ← {t("admin.title")}
        </Link>
      )}
      {msg && (
        <Alert
          variant={/eklendi|güncellendi|kaydedildi|silindi|added|updated|saved|deleted/i.test(msg) ? "success" : "info"}
          style={{ marginTop: 12 }}
        >
          {msg}
        </Alert>
      )}

      {section === "/admin/promosyon" && isSuperAdmin && (
        <Card>
          <CardHeader
            title={t("admin.promoTitle", { count: promoCodes.length })}
            description={t("admin.promoDesc")}
          />
          {promoError ? <Alert variant="warning">{promoError}</Alert> : null}
          <Card as="form" onSubmit={savePromo} style={{ padding: 16, marginBottom: 16, background: "var(--fp-surface-muted)" }}>
            <Stack wrap gap={12} style={{ alignItems: "flex-end" }}>
              <Field label={t("admin.promoCode")}>
                <Input
                  value={promoForm.code}
                  onChange={(e) => setPromoForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder="FNSBNK OZYGN"
                  required
                />
              </Field>
              <Field label={t("admin.promoType")}>
                <Select
                  value={promoForm.discountType}
                  onChange={(e) => setPromoForm((f) => ({ ...f, discountType: e.target.value }))}
                >
                  <option value="percent">{t("admin.promoTypePercent")}</option>
                  <option value="fixed">{t("admin.promoTypeFixed")}</option>
                </Select>
              </Field>
              <Field label={t("admin.promoValue")}>
                <Input
                  type="number"
                  min={1}
                  max={promoForm.discountType === "percent" ? 100 : 1499}
                  step="1"
                  value={promoForm.discountValue}
                  onChange={(e) => setPromoForm((f) => ({ ...f, discountValue: e.target.value }))}
                  required
                />
              </Field>
              <Field label={t("admin.promoNote")}>
                <Input
                  value={promoForm.note}
                  onChange={(e) => setPromoForm((f) => ({ ...f, note: e.target.value }))}
                />
              </Field>
              <label className="fp-hint" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={promoForm.active}
                  onChange={(e) => setPromoForm((f) => ({ ...f, active: e.target.checked }))}
                />
                {t("admin.promoActive")}
              </label>
              <Button type="submit" variant="primary" disabled={promoBusy}>
                {promoBusy ? t("common.wait") : t("admin.promoSave")}
              </Button>
            </Stack>
          </Card>
          {!promoCodes.length && !promoError ? (
            <Alert variant="info">{t("admin.promoEmpty")}</Alert>
          ) : null}
          {promoCodes.length > 0 ? (
            <DataTable
              columns={[
                { key: "code", label: t("admin.promoCode") },
                {
                  label: t("admin.promoType"),
                  render: (row) =>
                    row.discount_type === "percent"
                      ? t("admin.promoTypePercent")
                      : t("admin.promoTypeFixed")
                },
                {
                  label: t("admin.promoValue"),
                  render: (row) =>
                    row.discount_type === "percent"
                      ? `%${row.discount_value}`
                      : formatTl(row.discount_value, locale)
                },
                {
                  label: t("admin.promoActive"),
                  render: (row) => (row.active ? t("admin.promoActive") : t("admin.promoInactive"))
                },
                {
                  key: "note",
                  label: t("admin.promoNote"),
                  render: (row) => row.note || "—"
                },
                {
                  label: t("admin.promoActions"),
                  render: (row) => (
                    <Stack gap={6} wrap>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={promoBusy}
                        onClick={() => togglePromo(row)}
                      >
                        {t("admin.promoToggle")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={promoBusy}
                        onClick={() => removePromo(row)}
                      >
                        {t("common.delete")}
                      </Button>
                    </Stack>
                  )
                }
              ]}
              rows={promoCodes}
              rowKey={(row) => row.id}
            />
          ) : null}
        </Card>
      )}

      {section === "/admin/kredi" && (
      <Card>
        <CardHeader
          title={t("admin.grantLabel")}
          description={t("admin.grantDesc")}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!profiles.length}
              onClick={() =>
                downloadProfilesCsv(
                  profiles,
                  {
                    date: t("admin.date"),
                    name: t("admin.name"),
                    email: t("admin.email"),
                    role: t("admin.roleCol"),
                    credits: t("admin.credits"),
                    birth: t("auth.birthDate"),
                    id: t("admin.recordId")
                  },
                  { dateLocale, roleName: (role) => roleLabel(role, locale) }
                )
              }
            >
              {t("admin.exportPurchases")}
            </Button>
          }
        />
        {isSuperAdmin && (
          <p style={{ margin: "0 0 12px", fontSize: "0.875rem", color: "var(--fp-text-secondary)" }}>
            {t("admin.superHint")}
          </p>
        )}
        <Stack wrap gap={12}>
          <Field label={t("filters.search")} className="fp-field--grow">
            <Input
              value={grantQuery}
              onChange={(e) => setGrantQuery(e.target.value)}
              placeholder={t("filters.userPlaceholder")}
            />
          </Field>
          <Field label={t("admin.grantLabel")} className="fp-field--grow">
            <Select value={grantUser} onChange={(e) => setGrantUser(e.target.value)}>
              <option value="">{t("common.select")}</option>
              {grantOptions.map((p) => (
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
      </Card>
      )}

      {section === "/admin/satin-almalar" && (
      <Card>
        <CardHeader
          title={t("admin.purchasesTitle", { count: purchases.length })}
          description={t("admin.purchasesDesc")}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!purchases.length}
              onClick={() =>
                downloadPurchasesCsv(purchases, {
                  date: t("admin.date"),
                  invoiceType: t("admin.invoiceType"),
                  name: t("admin.name"),
                  taxId: t("admin.taxId"),
                  taxOffice: t("purchase.taxOffice"),
                  email: t("admin.email"),
                  phone: t("admin.phone"),
                  city: t("admin.city"),
                  district: t("purchase.district"),
                  address: t("purchase.address"),
                  quantity: t("admin.amount"),
                  unitPrice: t("purchase.unit"),
                  total: t("purchase.total"),
                  id: t("admin.recordId"),
                  company: t("purchase.typeCompany"),
                  individual: t("purchase.typeIndividual")
                })
              }
            >
              {t("admin.exportPurchases")}
            </Button>
          }
        />
        {purchasesError && <Alert variant="error">{purchasesError}</Alert>}
        {!purchasesError && !purchases.length && (
          <p style={{ margin: 0, color: "var(--fp-text-secondary)" }}>{t("admin.purchasesEmpty")}</p>
        )}
        {purchases.length > 0 && (
          <DataTable
            columns={[
              {
                label: t("admin.date"),
                render: (row) => new Date(row.created_at).toLocaleString(dateLocale)
              },
              { key: "invoice_name", label: t("admin.name") },
              {
                label: t("admin.invoiceType"),
                render: (row) =>
                  row.invoice_type === "company" ? t("purchase.typeCompany") : t("purchase.typeIndividual")
              },
              { key: "quantity", label: t("admin.amount") },
              {
                label: t("purchase.total"),
                render: (row) => formatTl(row.total_tl, locale)
              },
              { key: "email", label: t("admin.email") }
            ]}
            rows={purchases}
            rowKey={(row) => row.id}
            onRowClick={(row) => setPurchaseId(row.id)}
            activeKey={purchaseId}
          />
        )}
        {purchases.find((row) => row.id === purchaseId) && (
          <div className="fp-spec-detail">
            {(() => {
              const row = purchases.find((item) => item.id === purchaseId);
              const lines = [
                [t("admin.date"), new Date(row.created_at).toLocaleString(dateLocale)],
                [t("admin.name"), row.invoice_name],
                [
                  t("admin.invoiceType"),
                  row.invoice_type === "company" ? t("purchase.typeCompany") : t("purchase.typeIndividual")
                ],
                [t("admin.taxId"), row.tax_id],
                [t("purchase.taxOffice"), row.tax_office],
                [t("admin.email"), row.email],
                [t("admin.phone"), row.phone],
                [t("admin.city"), row.city],
                [t("purchase.district"), row.district],
                [t("purchase.address"), row.address],
                [t("admin.amount"), row.quantity],
                [t("purchase.unit"), formatTl(row.unit_price_tl, locale)],
                [t("purchase.total"), formatTl(row.total_tl, locale)]
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
      )}

      {section === "/admin/uzman-satin-almalar" && (
      <Card>
        <CardHeader
          title={t("admin.specialistPurchasesTitle", { count: packPurchases.length })}
          description={t("admin.specialistPurchasesDesc")}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!packPurchases.length}
              onClick={() =>
                downloadSpecialistPurchasesCsv(packPurchases, {
                  date: t("admin.date"),
                  invoiceType: t("admin.invoiceType"),
                  name: t("admin.name"),
                  taxId: t("admin.taxId"),
                  taxOffice: t("purchase.taxOffice"),
                  email: t("admin.email"),
                  phone: t("admin.phone"),
                  city: t("admin.city"),
                  district: t("purchase.district"),
                  address: t("purchase.address"),
                  quantity: t("admin.amount"),
                  unitPrice: t("purchase.unit"),
                  net: t("purchase.net"),
                  vatRate: t("admin.vatRate"),
                  vat: t("admin.vatAmount"),
                  total: t("purchase.gross"),
                  id: t("admin.recordId"),
                  company: t("purchase.typeCompany"),
                  individual: t("purchase.typeIndividual")
                })
              }
            >
              {t("admin.exportPurchases")}
            </Button>
          }
        />
        {packPurchasesError && <Alert variant="error">{packPurchasesError}</Alert>}
        {!packPurchasesError && !packPurchases.length && (
          <p style={{ margin: 0, color: "var(--fp-text-secondary)" }}>{t("admin.specialistPurchasesEmpty")}</p>
        )}
        {packPurchases.length > 0 && (
          <DataTable
            columns={[
              {
                label: t("admin.date"),
                render: (row) => new Date(row.created_at).toLocaleString(dateLocale)
              },
              { key: "invoice_name", label: t("admin.name") },
              { key: "quantity", label: t("admin.amount") },
              {
                label: t("purchase.unit"),
                render: (row) => formatTl(row.unit_price_tl, locale)
              },
              {
                label: t("purchase.gross"),
                render: (row) => formatTl(row.total_tl, locale)
              },
              { key: "email", label: t("admin.email") }
            ]}
            rows={packPurchases}
            rowKey={(row) => row.id}
            onRowClick={(row) => setPackPurchaseId(row.id)}
            activeKey={packPurchaseId}
          />
        )}
        {packPurchases.find((row) => row.id === packPurchaseId) && (
          <div className="fp-spec-detail">
            {(() => {
              const row = packPurchases.find((item) => item.id === packPurchaseId);
              const lines = [
                [t("admin.date"), new Date(row.created_at).toLocaleString(dateLocale)],
                [t("admin.name"), row.invoice_name],
                [
                  t("admin.invoiceType"),
                  row.invoice_type === "company" ? t("purchase.typeCompany") : t("purchase.typeIndividual")
                ],
                [t("admin.taxId"), row.tax_id],
                [t("purchase.taxOffice"), row.tax_office],
                [t("admin.email"), row.email],
                [t("admin.phone"), row.phone],
                [t("admin.city"), row.city],
                [t("purchase.district"), row.district],
                [t("purchase.address"), row.address],
                [t("admin.amount"), row.quantity],
                [t("purchase.unit"), formatTl(row.unit_price_tl, locale)],
                [t("purchase.net"), formatTl(row.net_tl, locale)],
                [t("admin.vatRate"), `%${row.vat_rate}`],
                [t("purchase.vat", { rate: row.vat_rate }), formatTl(row.vat_tl, locale)],
                [t("purchase.gross"), formatTl(row.total_tl, locale)]
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
      )}

      {section === "/admin/kurumsal" && (
      <Card>
        <CardHeader
          title={t("admin.applicationsTitle", { count: applications.length })}
          description={t("admin.applicationsDesc")}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!applications.length}
              onClick={() =>
                downloadCorporateCsv(
                  applications,
                  {
                    date: t("admin.date"),
                    organization: t("admin.organization"),
                    contact: t("admin.contact"),
                    jobTitle: t("admin.jobTitle"),
                    phone: t("admin.phone"),
                    email: t("admin.email"),
                    country: t("admin.country"),
                    city: t("admin.city"),
                    institutionType: t("admin.institutionType"),
                    experts: t("admin.experts"),
                    monthlyClients: t("admin.monthlyClients"),
                    message: t("admin.message"),
                    id: t("admin.recordId")
                  },
                  {
                    dateLocale,
                    countryName: (code) => (code ? countryName(code, locale) : "")
                  }
                )
              }
            >
              {t("admin.exportPurchases")}
            </Button>
          }
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
      )}

      {section === "/admin/uzman" && (
      <Card>
        <CardHeader
          title={t("admin.specialistApplicationsTitle", { count: specialistApplications.length })}
          description={t("admin.specialistApplicationsDesc")}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!specialistApplications.length}
              onClick={() =>
                downloadSpecialistApplicationsCsv(
                  specialistApplications,
                  { date: t("admin.date"), id: t("admin.recordId") },
                  { dateLocale, page: strings.home.marketing.specialist }
                )
              }
            >
              {t("admin.exportPurchases")}
            </Button>
          }
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
      )}

      {section === "/admin/iletisim" && (
      <Card>
        <CardHeader
          title={t("admin.contactMessagesTitle", { count: contactMessages.length })}
          description={t("admin.contactMessagesDesc")}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!contactMessages.length}
              onClick={() =>
                downloadContactCsv(
                  contactMessages,
                  {
                    date: t("admin.date"),
                    name: t("admin.name"),
                    email: t("admin.email"),
                    phone: t("admin.phone"),
                    profession: t("admin.profession"),
                    organization: t("admin.organization"),
                    location: t("admin.location"),
                    subject: t("admin.subject"),
                    message: t("admin.message"),
                    id: t("admin.recordId")
                  },
                  {
                    dateLocale,
                    subjectLabel: (key) =>
                      strings.home.marketing.contactPage.subjects.find((item) => item.key === key)?.label || key || ""
                  }
                )
              }
            >
              {t("admin.exportPurchases")}
            </Button>
          }
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
      )}

      {section === "/admin/kullanicilar" && (
      <Card>
        <CardHeader
          title={t("admin.usersTitle", { count: filteredUsers.length })}
          description={isSuperAdmin ? t("admin.usersDescSuper") : t("admin.usersDesc")}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!filteredUsers.length}
              onClick={() =>
                downloadProfilesCsv(
                  filteredUsers,
                  {
                    date: t("admin.date"),
                    name: t("admin.name"),
                    email: t("admin.email"),
                    role: t("admin.roleCol"),
                    credits: t("admin.credits"),
                    birth: t("auth.birthDate"),
                    id: t("admin.recordId")
                  },
                  { dateLocale, roleName: (role) => roleLabel(role, locale) }
                )
              }
            >
              {t("admin.exportPurchases")}
            </Button>
          }
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
        <RecordFilters
          t={t}
          query={userQuery}
          onQuery={setUserQuery}
          queryPlaceholder={t("filters.userPlaceholder")}
          role={userRole}
          onRole={setUserRole}
          roleOptions={roleOptions}
          active={usersFiltered}
          onClear={() => {
            setUserQuery("");
            setUserRole("");
          }}
          statusText={filterStatus(usersFiltered, visibleUsers.length, filteredUsers.length, profiles.length)}
        />
        {profiles.length > 0 && filteredUsers.length === 0 && (
          <p style={{ margin: 0, color: "var(--fp-text-secondary)" }}>{t("filters.noMatch")}</p>
        )}
        {visibleUsers.length > 0 && (
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
          rows={visibleUsers}
          rowKey={(p) => p.id}
        />
        )}
      </Card>
      )}

      {section === "/admin/davetler" && <AdminInvitesPanel />}

      {section === "/admin/algoritma-dogrulama" && (
        <ReportRefreshPanel locale={locale} />
        <AlgorithmAuditPanel sessions={sessions} dateLocale={dateLocale} locale={locale} />
      )}

      {section === "/admin/testler" && (
      <>
      <ScoringComparisonPanel sessions={filteredSessions} dateLocale={dateLocale} />
      <Card>
        <CardHeader
          title={t("admin.sessionsTitle", { count: filteredSessions.length })}
          description={t("admin.sessionsDesc")}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!filteredSessions.length}
              onClick={() =>
                downloadSessionsCsv(
                  filteredSessions,
                  {
                    date: t("admin.date"),
                    operator: t("admin.operator"),
                    participant: t("admin.participant"),
                    age: t("admin.age"),
                    profile: t("dashboard.profile"),
                    overall: t("dashboard.overallScore"),
                    attention: t("report.attention"),
                    timing: t("report.timing"),
                    impulsivity: t("report.impulsivity"),
                    hyperactivity: t("report.hyperactivity"),
                    record: t("admin.record"),
                    testSaved: t("admin.testSaved"),
                    testPending: t("admin.testPending"),
                    pressSaved: t("admin.pressSaved"),
                    id: t("admin.recordId")
                  },
                  { dateLocale, profileName: (key) => (key ? profileLabel(key, locale) : "") }
                )
              }
            >
              {t("admin.exportPurchases")}
            </Button>
          }
        />
        {(sessions.length > 0 || testsFiltered) && (
          <RecordFilters
            t={t}
            query={testQuery}
            onQuery={setTestQuery}
            queryPlaceholder={t("filters.testPlaceholder")}
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
            statusText={filterStatus(testsFiltered, visibleSessions.length, filteredSessions.length, sessions.length)}
          />
        )}
        {testsFiltered && filteredSessions.length === 0 && (
          <p style={{ margin: 0, color: "var(--fp-text-secondary)" }}>{t("filters.noMatch")}</p>
        )}
        {visibleSessions.length > 0 && (
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
              label: t("admin.emailStatus"),
              render: (s) => (
                <span
                  style={{
                    display: "block",
                    maxWidth: 280,
                    fontSize: "0.8125rem",
                    lineHeight: 1.45,
                    color:
                      s.report_email_sent_at || s.report_email_status === "sent"
                        ? "var(--fp-success)"
                        : "var(--fp-text-secondary)"
                  }}
                >
                  {formatReportEmailStatus(s, t, dateLocale)}
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
                    {pdfBusy?.startsWith(`${s.id}-test`) ? "…" : t("admin.downloadTestReport")}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pdfBusy?.startsWith(`${s.id}-basis`)}
                    onClick={() => downloadPressReportPdf(s)}
                  >
                    {pdfBusy?.startsWith(`${s.id}-basis`) ? "…" : s.admin_pdf_path ? t("admin.openPressReport") : t("admin.downloadPressReport")}
                  </Button>
                  {s.pdf_path ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pdfBusy?.startsWith(`${s.id}-mail`)}
                      onClick={() => resendReportEmail(s)}
                    >
                      {pdfBusy?.startsWith(`${s.id}-mail`)
                        ? "…"
                        : s.report_email_sent_at || s.report_email_status === "sent"
                          ? t("admin.emailResend")
                          : t("admin.emailSendReport")}
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="sm" onClick={() => openSession(s.id)}>
                    {selectedId === s.id ? t("common.close") : t("admin.pressDetail")}
                  </Button>
                </Stack>
              )
            }
          ]}
          rows={visibleSessions}
          rowKey={(s) => s.id}
          activeKey={selectedId}
        />
        )}
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
      </>
      )}
    </Page>
  );
}
