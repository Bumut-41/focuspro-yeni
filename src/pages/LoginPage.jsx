import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { supabase, supabaseConfigured } from "../lib/supabase.js";
import { OAuthButtons } from "../components/OAuthButtons.jsx";
import { Alert, Button, Card, Field, Input, Page } from "../components/ui.jsx";

export default function LoginPage() {
  const { user, isSupabaseReady, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={needsProfileCompletion ? "/profil-tamamla" : "/panel"} replace />;

  if (!isSupabaseReady) {
    return (
      <Page narrow>
        <Card>
          <h1 className="fp-auth-title">Supabase ayarı gerekli</h1>
          <p className="fp-auth-sub">
            `.env` dosyasına <code>VITE_SUPABASE_URL</code> ve <code>VITE_SUPABASE_ANON_KEY</code> ekleyin.
          </p>
        </Card>
      </Page>
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
    navigate("/panel");
  }

  return (
    <Page narrow>
      <Card as="form" onSubmit={submit}>
        <h1 className="fp-auth-title">Giriş</h1>
        <p className="fp-auth-sub">Hesabınıza erişin ve değerlendirmelere devam edin.</p>
        <Field label="E-posta">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </Field>
        <Field label="Şifre">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </Field>
        {msg && <Alert variant="error">{msg}</Alert>}
        <Button type="submit" variant="primary" className="fp-btn--block" disabled={busy} style={{ marginTop: 20 }}>
          {busy ? "Bekleyin…" : "E-posta ile giriş"}
        </Button>
        <OAuthButtons />
        <p style={{ marginTop: 16, color: "var(--fp-text-muted)", fontSize: "0.875rem" }}>
          Hesabınız yok mu? <Link to="/kayit">Kayıt olun</Link>
        </p>
      </Card>
    </Page>
  );
}
