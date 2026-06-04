import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { AdminPressTimeline } from "../components/AdminPressTimeline.jsx";
import { adminAddCredits, fetchAllProfiles } from "../services/credits.js";
import { downloadAdminTimelinePdf } from "../pdfAdminTimeline.js";
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
  const { isAdmin } = useAuth();
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

  async function openPdf(pdfPath, id) {
    if (!pdfPath) return;
    setPdfBusy(id);
    try {
      const url = await getReportPdfSignedUrl(pdfPath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setMsg(e.message || "PDF açılamadı.");
    } finally {
      setPdfBusy(null);
    }
  }

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([fetchAllProfiles(), fetchAllSessions(200)]);
    setProfiles(p);
    setSessions(s);
  }, []);

  useEffect(() => {
    if (isAdmin) load().catch((e) => setMsg(e.message));
  }, [isAdmin, load]);

  if (!isAdmin) return <Navigate to="/" replace />;

  async function downloadPressPdf(sessionRow) {
    const busyId = `${sessionRow.id}-basis`;
    setPdfBusy(busyId);
    setMsg("");
    try {
      const [sess, tl] = await Promise.all([
        fetchSessionDetail(sessionRow.id),
        fetchAdminPressTimeline(sessionRow.id)
      ]);
      if (!tl?.length) {
        setMsg("Bu test için basış kaydı yok (eski kayıt veya SQL güncellemesi öncesi).");
        return;
      }
      await downloadAdminTimelinePdf({
        session: { ...sess, logs: sess.logs ?? [] },
        timeline: tl,
        target: sess.target
      });
    } catch (e) {
      setMsg(e.message || "Basış PDF oluşturulamadı.");
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
      const [sess, tl] = await Promise.all([fetchSessionDetail(id), fetchAdminPressTimeline(id)]);
      setDetail(sess);
      setTimeline(tl);
      if (!tl?.length) {
        setMsg("Bu test için basış çizelgesi yok (eski kayıt veya SQL güncellemesi öncesi).");
      }
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

  return (
    <Page wide>
      <Card>
        <CardHeader
          title="Yönetim"
          description="Tüm kullanıcılar ve test sonuçları (admin yetkisi)."
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
          <Alert variant={msg.includes("eklendi") ? "success" : "info"} style={{ marginTop: 12 }}>
            {msg}
          </Alert>
        )}
      </Card>

      <Card>
        <CardHeader title={`Kullanıcılar (${profiles.length})`} />
        <DataTable
          columns={[
            { key: "full_name", label: "Ad" },
            { key: "role", label: "Rol" },
            { key: "test_credits", label: "Kredi" }
          ]}
          rows={profiles}
          rowKey={(p) => p.id}
        />
      </Card>

      <Card>
        <CardHeader title={`Tüm testler (${sessions.length})`} />
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
              label: "İşlemler",
              render: (s) => (
                <Stack gap={6} wrap>
                  <Button variant="secondary" size="sm" onClick={() => openSession(s.id)}>
                    {selectedId === s.id ? "Kapat" : "Basış raporu"}
                  </Button>
                  {s.pdf_path && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pdfBusy === `${s.id}-p`}
                      onClick={() => openPdf(s.pdf_path, `${s.id}-p`)}
                    >
                      {pdfBusy === `${s.id}-p` ? "…" : "Katılımcı PDF"}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pdfBusy === `${s.id}-basis`}
                    onClick={() => downloadPressPdf(s)}
                  >
                    {pdfBusy === `${s.id}-basis` ? "…" : "Basış PDF indir"}
                  </Button>
                  {s.admin_pdf_path && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pdfBusy === `${s.id}-a`}
                      onClick={() => openPdf(s.admin_pdf_path, `${s.id}-a`)}
                    >
                      {pdfBusy === `${s.id}-a` ? "…" : "Kayıtlı PDF"}
                    </Button>
                  )}
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
        <AdminPressTimeline session={detail} timeline={timeline ?? []} target={detail.target} />
      )}
    </Page>
  );
}
