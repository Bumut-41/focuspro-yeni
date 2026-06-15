import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { supabase } from "../lib/supabase.js";
import { BrandLogo } from "../components/BrandLogo.jsx";
import { OAuthButtons } from "../components/OAuthButtons.jsx";
import { Alert, Button, Card, Field, Input, Page } from "../components/ui.jsx";

export default function LoginPage() {
  const { user, isSupabaseReady, needsProfileCompletion } = useAuth();
  const { t } = useLocale();
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
          <div className="fp-auth-logo-wrap">
            <BrandLogo variant="auth" />
          </div>
          <h1 className="fp-auth-title">{t("auth.setupTitle")}</h1>
          <p className="fp-auth-sub">{t("auth.setupDesc")}</p>
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
        <div className="fp-auth-logo-wrap">
          <BrandLogo variant="auth" />
        </div>
        <h1 className="fp-auth-title">{t("auth.loginTitle")}</h1>
        <p className="fp-auth-sub">{t("auth.loginSub")}</p>
        <Field label={t("auth.email")}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </Field>
        <Field label={t("auth.password")}>
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
          {busy ? t("common.wait") : t("auth.loginBtn")}
        </Button>
        <OAuthButtons />
        <p style={{ marginTop: 16, color: "var(--fp-text-muted)", fontSize: "0.875rem" }}>
          {t("auth.noAccount")} <Link to="/kayit">{t("auth.registerLink")}</Link>
        </p>
      </Card>
    </Page>
  );
}
