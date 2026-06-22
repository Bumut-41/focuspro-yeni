import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { setStoredInviteToken } from "../lib/inviteStorage.js";
import { acceptTestInvite, getInviteByToken, parseRpcError } from "../services/invites.js";
import { BrandLogo } from "../components/BrandLogo.jsx";
import { Alert, Button, Card, Page } from "../components/ui.jsx";

export default function InvitePage() {
  const { token } = useParams();
  const { user, needsProfileCompletion } = useAuth();
  const { t, dateLocale } = useLocale();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) return;
    setStoredInviteToken(token);
    let cancelled = false;
    (async () => {
      setLoading(true);
      setMsg("");
      try {
        const data = await getInviteByToken(token);
        if (!cancelled) setInvite(data);
      } catch (e) {
        if (!cancelled) setMsg(parseRpcError(e, t));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  useEffect(() => {
    if (!user || !token || loading || !invite || invite.expired || invite.completed) return;
    if (needsProfileCompletion) return;

    let cancelled = false;
    (async () => {
      setAccepting(true);
      try {
        await acceptTestInvite(token);
        if (!cancelled) navigate("/test", { replace: true });
      } catch (e) {
        if (!cancelled) setMsg(parseRpcError(e, t));
      } finally {
        if (!cancelled) setAccepting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, token, loading, invite, needsProfileCompletion, navigate, t]);

  const expiresLabel =
    invite?.expires_at &&
    new Date(invite.expires_at).toLocaleString(dateLocale, {
      dateStyle: "medium",
      timeStyle: "short"
    });

  return (
    <Page narrow>
      <Card>
        <div className="fp-auth-logo-wrap">
          <BrandLogo variant="auth" />
        </div>
        <h1 className="fp-auth-title">{t("invite.pageTitle")}</h1>
        {loading && <p className="fp-loading">{t("common.loading")}</p>}
        {!loading && invite && (
          <>
            <p className="fp-auth-sub">
              {t("invite.pageDesc", {
                psychologist: invite.psychologist_name,
                email: invite.recipient_email
              })}
            </p>
            <p className="fp-hint" style={{ marginTop: 8 }}>
              {t("invite.expiresAt", { date: expiresLabel })}
            </p>
            {invite.expired && <Alert variant="warning">{t("invite.expired")}</Alert>}
            {invite.completed && <Alert variant="info">{t("invite.alreadyCompleted")}</Alert>}
            {!invite.expired && !invite.completed && !user && (
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <Button asLink to={`/kayit?davet=${token}`} variant="primary">
                  {t("invite.registerBtn")}
                </Button>
                <Button asLink to={`/giris?davet=${token}`} variant="secondary">
                  {t("invite.loginBtn")}
                </Button>
              </div>
            )}
            {accepting && <p className="fp-loading">{t("invite.accepting")}</p>}
          </>
        )}
        {msg && (
          <Alert variant="error" style={{ marginTop: 16 }}>
            {msg}
          </Alert>
        )}
        <p style={{ marginTop: 20, fontSize: "0.875rem" }}>
          <Link to="/">{t("invite.backHome")}</Link>
        </p>
      </Card>
    </Page>
  );
}
