import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { supabase, supabaseConfigured } from "../lib/supabase.js";
import { ageFromBirthDate } from "../profiles.js";
import { OAuthButtons } from "../components/OAuthButtons.jsx";
import { Alert, Button, Card, Field, Input, Page, Select } from "../components/ui.jsx";

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
      <Page narrow>
        <Card>
          <h1 className="fp-auth-title">Supabase ayarı gerekli</h1>
          <p className="fp-auth-sub">docs/SAAS_SENARYO.md dosyasına bakın.</p>
        </Card>
      </Page>
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

  const msgVariant = msg.includes("oluşturuldu") ? "success" : msg ? "error" : null;

  return (
    <Page narrow>
      <Card as="form" onSubmit={submit} style={{ maxWidth: 520 }}>
        <h1 className="fp-auth-title">Üye ol</h1>
        <p className="fp-auth-sub">Üyelik için 18 yaş ve üzeri zorunludur.</p>
        <OAuthButtons />
        <p className="fp-hint" style={{ textAlign: "center", margin: "8px 0 0" }}>
          veya e-posta ile kayıt
        </p>
        <Field label="Ad soyad">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
        </Field>
        <Field label="Doğum tarihi (üye)">
          <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} required />
        </Field>
        <Field label="Hesap türü">
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="individual">Bireysel kullanıcı</option>
            <option value="psychologist">Psikolog</option>
          </Select>
        </Field>
        <Field label="E-posta">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </Field>
        <Field label="Şifre">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </Field>
        {msgVariant && <Alert variant={msgVariant}>{msg}</Alert>}
        <Button type="submit" variant="primary" className="fp-btn--block" disabled={busy} style={{ marginTop: 20 }}>
          {busy ? "Bekleyin…" : "Kayıt ol"}
        </Button>
        <p style={{ marginTop: 16, fontSize: "0.875rem" }}>
          <Link to="/giris">Zaten hesabım var</Link>
        </p>
      </Card>
    </Page>
  );
}
