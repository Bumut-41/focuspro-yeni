import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { BrandLogo } from "./BrandLogo.jsx";
import { LocaleToggle } from "./LocaleToggle.jsx";
import { AppNavLink, Button } from "./ui.jsx";

export function AppHeader() {
  const { user, profile, signOut, isSupabaseReady, isAdmin } = useAuth();
  const { t } = useLocale();

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        <Link to="/" className="fp-brand" aria-label="Focus Pro Lab">
          <BrandLogo variant="header" />
        </Link>

        <div className="fp-header-end">
          <nav className="fp-nav" aria-label="Main">
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
          <LocaleToggle />
        </div>
      </div>
    </header>
  );
}
