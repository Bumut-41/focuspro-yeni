import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { AdminPressTimeline } from "../components/AdminPressTimeline.jsx";
import {
  downloadParticipantReportFromSession,
  downloadPressReportFromSession
} from "../lib/adminSessionPdf.js";
import {
  ROLE_DESCRIPTIONS,
  USER_ROLES,
  assignableRoles,
  formatRoleError,
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

export default function AdminPage() {
  const { isAdmin, isSuperAdmin, user: authUser } = useAuth();
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

  async function openStoredPdf(pdfPath, busyKey) {
    if (!pdfPath) return;
    setPdfBusy(busyKey);
    try {
      const url = await getReportPdfSignedUrl(pdfPath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setMsg(e.message || "Kayıtlı PDF açılamadı.");
    } finally {
      setPdfBusy(null);
    }
  }

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([fetchAllProfiles(), fetchAllSessions(200)]);
    setProfiles(p);
    setSessions(s);
    setCreditDrafts(Object.fromEntries(p.map((row) => [row.id, String(row.test_credits ?? 0)])));
  }, []);

  useEffect(() => {
    if (isAdmin) load().catch((e) => setMsg(e.message));
  }, [isAdmin, load]);

  if (!isAdmin) return <Navigate to="/" replace />;

  async function loadSessionBundle(sessionId) {
    const [sess, tl] = await Promise.all([
      fetchSessionDetail(sessionId),
      fetchAdminPressTimeline(sessionId)
    ]);
    return { sess, tl: tl ?? [] };
  }

  async function openOrDownloadTestReport(sessionRow) {
    if (sessionRow.pdf_path) {
      await openStoredPdf(sessionRow.pdf_path, `${sessionRow.id}-test-open`);
      return;
    }
    const busyId = `${sessionRow.id}-test`;
    setPdfBusy(busyId);
    setMsg("");
    try {
      const { sess, tl } = await loadSessionBundle(sessionRow.id);
      await downloadParticipantReportFromSession(sess, tl);
    } catch (e) {
      setMsg(e.message || "Test raporu PDF oluşturulamadı.");
    } finally {
      setPdfBusy(null);
    }
  }

  async function downloadPressReportPdf(sessionRow) {
    if (sessionRow.admin_pdf_path) {
      await openStoredPdf(sessionRow.admin_pdf_path, `${sessionRow.id}-basis-open`);
      return;
    }
    const busyId = `${sessionRow.id}-basis`;
    setPdfBusy(busyId);
    setMsg("");
    try {
      const { sess, tl } = await loadSessionBundle(sessionRow.id);
      await downloadPressReportFromSession(sess, tl);
    } catch (e) {
      setMsg(e.message || "Basış raporu PDF oluşturulamadı.");
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
      setMsg("Kredi eklendi.");
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
      setMsg(`${profileRow.full_name} → ${roleLabel(newRole)} olarak güncellendi.`);
      await load();
    } catch (e) {
      setMsg(formatRoleError(e));
    } finally {
      setRoleBusy(null);
    }
  }

  async function saveUserCredits(profileRow) {
    const raw = creditDrafts[profileRow.id];
    const credits = Number(raw);
    if (!Number.isFinite(credits) || credits < 0) {
      setMsg("Geçerli bir kredi değeri girin (0 veya üzeri).");
      return;
    }
    if (credits === profileRow.test_credits) return;
    setCreditBusy(profileRow.id);
    setMsg("");
    try {
      await superAdminSetCredits(profileRow.id, credits);
      setMsg(`${profileRow.full_name} kredisi ${credits} olarak kaydedildi.`);
      await load();
    } catch (e) {
      setMsg(formatRoleError(e));
    } finally {
      setCreditBusy(null);
    }
  }

  async function deleteUser(profileRow) {
    if (
      !window.confirm(
        `${profileRow.full_name} (${profileRow.email ?? "e-posta yok"}) silinsin mi? Bu işlem geri alınamaz.`
      )
    ) {
      return;
    }
    setDeleteBusy(profileRow.id);
    setMsg("");
    try {
      await superAdminDeleteUser(profileRow.id);
      setMsg(`${profileRow.full_name} silindi.`);
      if (selectedId && detail?.owner_id === profileRow.id) {
        setSelectedId(null);
        setDetail(null);
        setTimeline(null);
      }
      await load();
    } catch (e) {
      setMsg(formatRoleError(e));
    } finally {
      setDeleteBusy(null);
    }
  }

  const rolesForPicker = assignableRoles(isSuperAdmin);

  return (
    <Page wide>
      <Card>
        <CardHeader
          title="Yönetim"
          description="Tüm kullanıcılar ve test sonuçları. Her oturum için test raporu ve basış raporu PDF indirilebilir."
        />
        <Stack wrap gap={12} style={{ alignItems: "flex-end" }}>
          <Field label="Kullanıcıya kredi ver" className="fp-field--grow">
            <Select value={grantUser} onChange={(e) => setGrantUser(e.target.value)}>
              <option value="">Seçin</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.role}) — {p.test_credits} kredi
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Adet">
            <Input
              type="number"
              min={1}
              value={grantAmount}
              onChange={(e) => setGrantAmount(e.target.value)}
              style={{ width: 88 }}
            />
          </Field>
          <Button type="button" variant="secondary" onClick={grant}>
            Ekle
          </Button>
        </Stack>
        {msg && (
          <Alert
            variant={msg.includes("eklendi") || msg.includes("güncellendi") || msg.includes("kaydedildi") || msg.includes("silindi") ? "success" : "info"}
            style={{ marginTop: 12 }}
          >
            {msg}
          </Alert>
        )}
      </Card>

      <Card>
        <CardHeader
          title={`Kullanıcılar (${profiles.length})`}
          description={
            isSuperAdmin
              ? "Super Admin: rol, manuel kredi ve kullanıcı silme. Değişiklikler anında uygulanır."
              : "Rol ve yetki: listeden seçin; kayıt anında uygulanır."
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
              <strong>{roleLabel(r)}</strong> — {ROLE_DESCRIPTIONS[r]}
            </li>
          ))}
        </ul>
        <DataTable
          columns={[
            { key: "full_name", label: "Ad" },
            {
              label: "E-posta",
              render: (p) => (
                <span style={{ fontSize: "0.875rem" }}>{p.email ?? "—"}</span>
              )
            },
            {
              label: "Rol / yetki",
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
                      {roleLabel(r)}
                    </option>
                  ))}
                </Select>
              )
            },
            {
              label: "Kredi",
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
                      {creditBusy === p.id ? "…" : "Kaydet"}
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
                    <span style={{ fontSize: "0.75rem", color: "var(--fp-text-muted)" }}>Siz</span>
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
                      {deleteBusy === p.id ? "…" : "Sil"}
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
          title={`Tüm testler (${sessions.length})`}
          description="Test bitince PDF'ler otomatik kaydedilir. Test raporu: katılımcı A/T/I/H. Basış raporu: yalnızca admin."
        />
        <DataTable
          columns={[
            { label: "Tarih", render: (s) => new Date(s.created_at).toLocaleString("tr-TR") },
            { label: "Uygulayan", render: (s) => s.profiles?.full_name ?? s.owner_id?.slice(0, 8) },
            { key: "participant_name", label: "Katılımcı" },
            {
              label: "Skor",
              render: (s) => (s.metrics?.overallScore != null ? Math.round(s.metrics.overallScore) : "—")
            },
            {
              label: "Kayıt",
              render: (s) => (
                <span style={{ fontSize: "0.8rem", color: "var(--fp-text-muted)" }}>
                  {s.pdf_path ? "Test ✓" : "Test …"}
                  {s.admin_pdf_path ? " · Basış ✓" : ""}
                </span>
              )
            },
            {
              label: "Raporlar",
              render: (s) => (
                <Stack gap={6} wrap>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={pdfBusy?.startsWith(`${s.id}-test`)}
                    onClick={() => openOrDownloadTestReport(s)}
                  >
                    {pdfBusy?.startsWith(`${s.id}-test`) ? "…" : s.pdf_path ? "Test raporu aç" : "Test raporu indir"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pdfBusy?.startsWith(`${s.id}-basis`)}
                    onClick={() => downloadPressReportPdf(s)}
                  >
                    {pdfBusy?.startsWith(`${s.id}-basis`) ? "…" : s.admin_pdf_path ? "Basış raporu aç" : "Basış raporu indir"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openSession(s.id)}>
                    {selectedId === s.id ? "Kapat" : "Basış detayı"}
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

      {detailLoading && <p className="fp-loading">Yükleniyor…</p>}
      {detail && !detailLoading && (
        <AdminPressTimeline
          session={detail}
          timeline={timeline ?? []}
          target={detail.target}
          onDownloadTestPdf={async () => {
            setPdfBusy(`${detail.id}-detail-test`);
            try {
              await downloadParticipantReportFromSession(detail, timeline ?? []);
            } catch (e) {
              setMsg(e.message || "Test raporu PDF oluşturulamadı.");
            } finally {
              setPdfBusy(null);
            }
          }}
          onDownloadPressPdf={async () => {
            setPdfBusy(`${detail.id}-detail-basis`);
            try {
              await downloadPressReportFromSession(detail, timeline ?? []);
            } catch (e) {
              setMsg(e.message || "Basış raporu PDF oluşturulamadı.");
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
