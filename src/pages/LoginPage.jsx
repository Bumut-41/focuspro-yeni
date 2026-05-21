import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { supabase, supabaseConfigured } from "../lib/supabase.js";
import { OAuthButtons } from "../components/OAuthButtons.jsx";
import { btnPrimary, card, input } from "../components/ui.js";

export default function LoginPage() {
  const { user, isSupabaseReady, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={needsProfileCompletion ? "/profil-tamamla" : "/"} replace />;

  if (!isSupabaseReady) {
    return (
      <div style={card}>
        <h2>Supabase ayarı gerekli</h2>
        <p>`.env` dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin. Detay: docs/SAAS_SENARYO.md</p>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    navigate("/");
  }

  return (
    <form onSubmit={submit} style={card}>
      <h2 style={{ marginTop: 0 }}>Giriş</h2>
      <label style={{ fontWeight: 600 }}>E-posta</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} required />
      <label style={{ fontWeight: 600, display: "block", marginTop: 12 }}>Şifre</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} required />
      {msg && <p style={{ color: "#b91c1c", marginTop: 12 }}>{msg}</p>}
      <button type="submit" disabled={busy} style={{ ...btnPrimary, width: "100%", marginTop: 20 }}>
        {busy ? "Bekleyin…" : "E-posta ile giriş"}
      </button>
      <OAuthButtons />
      <p style={{ marginTop: 16, color: "#64748b" }}>
        Hesabınız yok mu? <Link to="/kayit">Kayıt olun</Link>
      </p>
    </form>
  );
}
