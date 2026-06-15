import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { supabase } from "../lib/supabase.js";
import { ageFromBirthDate } from "../profiles.js";
import { Alert, Button, Card, Field, Input, Page, Select } from "../components/ui.jsx";

export default function CompleteProfilePage() {
  const { user, profile, refreshProfile, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [birth, setBirth] = useState("");
  const [role, setRole] = useState(profile?.role === "psychologist" ? "psychologist" : "individual");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return <Navigate to="/giris" replace />;
  if (!needsProfileCompletion) return <Navigate to="/panel" replace />;

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
    navigate("/panel");
  }

  return (
    <Page narrow>
      <Card as="form" onSubmit={submit}>
        <h1 className="fp-auth-title">Profilinizi tamamlayın</h1>
        <p className="fp-auth-sub">Google ile giriş yaptınız. Devam etmek için bir kez bu bilgileri girin.</p>
        <Field label="Ad soyad">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </Field>
        <Field label="Doğum tarihi (üye — 18+)">
          <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} required />
        </Field>
        <Field label="Hesap türü">
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="individual">Bireysel</option>
            <option value="psychologist">Psikolog</option>
          </Select>
        </Field>
        {msg && <Alert variant="error">{msg}</Alert>}
        <Button type="submit" variant="primary" className="fp-btn--block" disabled={busy} style={{ marginTop: 20 }}>
          {busy ? "Kaydediliyor…" : "Devam et"}
        </Button>
      </Card>
    </Page>
  );
}
