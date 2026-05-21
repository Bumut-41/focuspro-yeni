import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { supabase, supabaseConfigured } from "../lib/supabase.js";
import { ageFromBirthDate } from "../profiles.js";
import { OAuthButtons } from "../components/OAuthButtons.jsx";
import { btnPrimary, card, input } from "../components/ui.js";

export default function RegisterPage() {
  const { user, isSupabaseReady, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [birth, setBirth] = useState("");
  const [role, setRole] = useState("individual");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={needsProfileCompletion ? "/profil-tamamla" : "/"} replace />;

  if (!isSupabaseReady) {
    return (
      <div style={card}>
        <h2>Supabase ayarı gerekli</h2>
        <p>docs/SAAS_SENARYO.md dosyasına bakın.</p>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const age = ageFromBirthDate(birth);
    if (age === null || age < 18) {
      setMsg("Üyelik için 18 yaş ve üzeri olmalısınız.");
      return;
    }
    if (password.length < 6) {
      setMsg("Şifre en az 6 karakter olmalı.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          birth_date: birth,
          role
        }
      }
    });
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg("Kayıt oluşturuldu. E-posta onayı açıksa gelen kutusunu kontrol edin, ardından giriş yapın.");
    setTimeout(() => navigate("/giris"), 2500);
  }

  return (
    <form onSubmit={submit} style={{ ...card, maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>Üye ol</h2>
      <OAuthButtons />
      <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, margin: "8px 0 16px" }}>veya e-posta ile</p>
      <p style={{ color: "#64748b", fontSize: 14 }}>Üyelik için 18 yaş ve üzeri zorunludur.</p>
      <label style={{ fontWeight: 600 }}>Ad soyad</label>
      <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={input} required />
      <label style={{ fontWeight: 600, display: "block", marginTop: 12 }}>Doğum tarihi (üye)</label>
      <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} style={input} required />
      <label style={{ fontWeight: 600, display: "block", marginTop: 12 }}>Hesap türü</label>
      <select value={role} onChange={(e) => setRole(e.target.value)} style={input}>
        <option value="individual">Bireysel kullanıcı</option>
        <option value="psychologist">Psikolog</option>
      </select>
      <label style={{ fontWeight: 600, display: "block", marginTop: 12 }}>E-posta</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} required />
      <label style={{ fontWeight: 600, display: "block", marginTop: 12 }}>Şifre</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} required />
      {msg && (
        <p style={{ color: msg.includes("oluşturuldu") ? "#166534" : "#b91c1c", marginTop: 12, background: "#f8fafc", padding: 12, borderRadius: 10 }}>
          {msg}
        </p>
      )}
      <button type="submit" disabled={busy} style={{ ...btnPrimary, width: "100%", marginTop: 20 }}>
        {busy ? "Bekleyin…" : "Kayıt ol"}
      </button>
      <p style={{ marginTop: 16 }}>
        <Link to="/giris">Zaten hesabım var</Link>
      </p>
    </form>
  );
}
