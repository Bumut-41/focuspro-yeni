import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { supabase } from "../lib/supabase.js";
import { ageFromBirthDate } from "../profiles.js";
import { btnPrimary, card, input } from "../components/ui.js";

export default function CompleteProfilePage() {
  const { user, profile, refreshProfile, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [birth, setBirth] = useState("");
  const [role, setRole] = useState(profile?.role === "psychologist" ? "psychologist" : "individual");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return <Navigate to="/giris" replace />;
  if (!needsProfileCompletion) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const age = ageFromBirthDate(birth);
    if (age === null || age < 18) {
      setMsg("Üyelik için 18 yaş ve üzeri olmalısınız.");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || profile?.full_name,
        birth_date: birth,
        role,
        profile_completed: true
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    await refreshProfile();
    navigate("/");
  }

  return (
    <form onSubmit={submit} style={{ ...card, maxWidth: 480 }}>
      <h2 style={{ marginTop: 0 }}>Profilinizi tamamlayın</h2>
      <p style={{ color: "#64748b", fontSize: 14 }}>
        Google ile giriş yaptınız. Devam etmek için bir kez bu bilgileri girin.
      </p>
      <label style={{ fontWeight: 600 }}>Ad soyad</label>
      <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={input} required />
      <label style={{ fontWeight: 600, display: "block", marginTop: 12 }}>Doğum tarihi (üye — 18+)</label>
      <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} style={input} required />
      <label style={{ fontWeight: 600, display: "block", marginTop: 12 }}>Hesap türü</label>
      <select value={role} onChange={(e) => setRole(e.target.value)} style={input}>
        <option value="individual">Bireysel</option>
        <option value="psychologist">Psikolog</option>
      </select>
      {msg && <p style={{ color: "#b91c1c", marginTop: 12 }}>{msg}</p>}
      <button type="submit" disabled={busy} style={{ ...btnPrimary, width: "100%", marginTop: 20 }}>
        {busy ? "Kaydediliyor…" : "Devam et"}
      </button>
    </form>
  );
}
