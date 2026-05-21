import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { fetchMySessions } from "../services/sessions.js";
import { btnGhost, btnPrimary, card } from "../components/ui.js";

const roleLabel = {
  admin: "Yönetici",
  psychologist: "Psikolog",
  individual: "Bireysel"
};

export default function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState("");

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
    <div style={{ width: "100%", maxWidth: 900 }}>
      <div style={{ ...card, maxWidth: 900, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Hoş geldiniz, {profile?.full_name}</h2>
        <p style={{ color: "#475569" }}>
          Rol: <strong>{roleLabel[profile?.role] ?? profile?.role}</strong>
        </p>
        <p style={{ color: "#166534", background: "#ecfdf5", padding: 12, borderRadius: 10, marginTop: 10 }}>
          Şimdilik <strong>sınırsız ücretsiz</strong> test yapabilirsiniz. Ücretli paketler ve ödeme sistemi daha sonra eklenecek.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
          <Link to="/test" style={{ ...btnPrimary, textDecoration: "none", display: "inline-block" }}>
            Yeni test başlat
          </Link>
          {isAdmin && (
            <Link to="/admin" style={{ ...btnGhost, textDecoration: "none", display: "inline-block" }}>
              Yönetim paneli
            </Link>
          )}
        </div>
        {msg && <p style={{ marginTop: 12, color: "#334155" }}>{msg}</p>}
      </div>

      <div style={{ ...card, maxWidth: 900 }}>
        <h3 style={{ marginTop: 0 }}>Geçmiş testleriniz</h3>
        {!sessions.length && <p style={{ color: "#64748b" }}>Henüz kayıtlı test yok.</p>}
        {sessions.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: 8 }}>Tarih</th>
                <th style={{ padding: 8 }}>Katılımcı</th>
                <th style={{ padding: 8 }}>Profil</th>
                <th style={{ padding: 8 }}>Genel skor</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: 8 }}>{new Date(s.created_at).toLocaleString("tr-TR")}</td>
                  <td style={{ padding: 8 }}>{s.participant_name}</td>
                  <td style={{ padding: 8 }}>{s.profile_key}</td>
                  <td style={{ padding: 8 }}>{s.metrics?.overallScore != null ? Math.round(s.metrics.overallScore) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
