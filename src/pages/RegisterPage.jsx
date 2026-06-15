import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { supabase } from "../lib/supabase.js";
import { ageFromBirthDate } from "../profiles.js";
import { BrandLogo } from "../components/BrandLogo.jsx";
import { OAuthButtons } from "../components/OAuthButtons.jsx";
import { Alert, Button, Card, Field, Input, Page, Select } from "../components/ui.jsx";

export default function RegisterPage() {
  const { user, isSupabaseReady, needsProfileCompletion } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [birth, setBirth] = useState("");
  const [role, setRole] = useState("individual");
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
          <p className="fp-auth-sub">{t("auth.setupDescRegister")}</p>
        </Card>
      </Page>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const age = ageFromBirthDate(birth);
    if (age === null || age < 18) {
      setMsg(t("auth.age18Required"));
      return;
    }
    if (password.length < 6) {
      setMsg(t("auth.passwordMin"));
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
    setMsg(t("auth.registerSuccess"));
    setTimeout(() => navigate("/giris"), 2500);
  }

  const msgVariant = msg === t("auth.registerSuccess") ? "success" : msg ? "error" : null;

  return (
    <Page narrow>
      <Card as="form" onSubmit={submit} style={{ maxWidth: 520 }}>
        <div className="fp-auth-logo-wrap">
          <BrandLogo variant="auth" />
        </div>
        <h1 className="fp-auth-title">{t("auth.registerTitle")}</h1>
        <p className="fp-auth-sub">{t("auth.registerSub")}</p>
        <OAuthButtons />
        <p className="fp-hint" style={{ textAlign: "center", margin: "8px 0 0" }}>
          {t("auth.registerEmailHint")}
        </p>
        <Field label={t("auth.fullName")}>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
        </Field>
        <Field label={t("auth.birthDateMember")}>
          <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} required />
        </Field>
        <Field label={t("auth.accountType")}>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="individual">{t("auth.roleIndividual")}</option>
            <option value="psychologist">{t("auth.rolePsychologist")}</option>
          </Select>
        </Field>
        <Field label={t("auth.email")}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </Field>
        <Field label={t("auth.password")}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </Field>
        {msgVariant && <Alert variant={msgVariant}>{msg}</Alert>}
        <Button type="submit" variant="primary" className="fp-btn--block" disabled={busy} style={{ marginTop: 20 }}>
          {busy ? t("common.wait") : t("auth.registerBtn")}
        </Button>
        <p style={{ marginTop: 16, fontSize: "0.875rem" }}>
          <Link to="/giris">{t("auth.hasAccount")}</Link>
        </p>
      </Card>
    </Page>
  );
}
