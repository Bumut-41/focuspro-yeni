import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { AdminPressTimeline } from "../components/AdminPressTimeline.jsx";
import { adminAddCredits, fetchAllProfiles } from "../services/credits.js";
import { fetchAdminPressTimeline, fetchAllSessions, fetchSessionDetail } from "../services/sessions.js";
import { btnGhost, card, input } from "../components/ui.js";

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

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([fetchAllProfiles(), fetchAllSessions(200)]);
    setProfiles(p);
    setSessions(s);
  }, []);

  useEffect(() => {
    if (isAdmin) load().catch((e) => setMsg(e.message));
  }, [isAdmin, load]);

  if (!isAdmin) return <Navigate to="/" replace />;

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
    <div style={{ width: "100%", maxWidth: 1000 }}>
      <div style={{ ...card, maxWidth: 1000, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Yönetim — Tüm sistem</h2>
        <p style={{ color: "#64748b" }}>Tüm kullanıcılar ve test sonuçları (admin yetkisi).</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Kullanıcıya kredi ver</label>
            <select value={grantUser} onChange={(e) => setGrantUser(e.target.value)} style={input}>
              <option value="">Seçin</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.role}) — {p.test_credits} kredi
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Adet</label>
            <input
              type="number"
              min={1}
              value={grantAmount}
              onChange={(e) => setGrantAmount(e.target.value)}
              style={{ ...input, width: 80 }}
            />
          </div>
          <button type="button" onClick={grant} style={btnGhost}>
            Ekle
          </button>
        </div>
        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </div>

      <div style={{ ...card, maxWidth: 1000, marginBottom: 20 }}>
        <h3>Kullanıcılar ({profiles.length})</h3>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: 6 }}>Ad</th>
              <th style={{ padding: 6 }}>Rol</th>
              <th style={{ padding: 6 }}>Kredi</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 6 }}>{p.full_name}</td>
                <td style={{ padding: 6 }}>{p.role}</td>
                <td style={{ padding: 6 }}>{p.test_credits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ ...card, maxWidth: 1000 }}>
        <h3>Tüm testler ({sessions.length})</h3>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: 6 }}>Tarih</th>
              <th style={{ padding: 6 }}>Uygulayan</th>
              <th style={{ padding: 6 }}>Katılımcı</th>
              <th style={{ padding: 6 }}>Skor</th>
              <th style={{ padding: 6 }} />
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr
                key={s.id}
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  background: selectedId === s.id ? "#eff6ff" : undefined
                }}
              >
                <td style={{ padding: 6 }}>{new Date(s.created_at).toLocaleString("tr-TR")}</td>
                <td style={{ padding: 6 }}>{s.profiles?.full_name ?? s.owner_id?.slice(0, 8)}</td>
                <td style={{ padding: 6 }}>{s.participant_name}</td>
                <td style={{ padding: 6 }}>{s.metrics?.overallScore != null ? Math.round(s.metrics.overallScore) : "—"}</td>
                <td style={{ padding: 6 }}>
                  <button type="button" onClick={() => openSession(s.id)} style={{ ...btnGhost, padding: "6px 12px", fontSize: 12 }}>
                    {selectedId === s.id ? "Kapat" : "Basış raporu"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailLoading && <p style={{ marginTop: 16, color: "#64748b" }}>Yükleniyor…</p>}
      {detail && !detailLoading && (
        <AdminPressTimeline session={detail} timeline={timeline ?? []} target={detail.target} />
      )}
    </div>
  );
}
