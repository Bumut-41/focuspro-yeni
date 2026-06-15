import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { LocaleToggle } from "./LocaleToggle.jsx";
import { AppNavLink, Button } from "./ui.jsx";

export function AppHeader() {
  const { user, profile, signOut, isSupabaseReady, isAdmin } = useAuth();
  const { t } = useLocale();

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        <Link to="/" className="fp-brand">
          <span className="fp-brand-mark" aria-hidden>
            FP
          </span>
          <span className="fp-brand-text">
            <span className="fp-brand-name">FocusProLab</span>
            <span className="fp-brand-tagline">{t("nav.brandTagline")}</span>
          </span>
        </Link>

        <nav className="fp-nav" aria-label="Main">
          <LocaleToggle />
          {isSupabaseReady &&
            (user ? (
              <>
                <AppNavLink to="/panel" end>
                  {t("nav.panel")}
                </AppNavLink>
                <AppNavLink to="/test">{t("nav.test")}</AppNavLink>
                {isAdmin && <AppNavLink to="/admin">{t("nav.admin")}</AppNavLink>}
                <div className="fp-nav-user">
                  <span className="fp-nav-user-name">{profile?.full_name}</span>
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    {t("nav.logout")}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <AppNavLink to="/" end>
                  {t("nav.home")}
                </AppNavLink>
                <AppNavLink to="/giris">{t("nav.login")}</AppNavLink>
                <Button asLink to="/kayit" variant="primary" size="sm">
                  {t("nav.register")}
                </Button>
              </>
            ))}
        </nav>
      </div>
    </header>
  );
}
