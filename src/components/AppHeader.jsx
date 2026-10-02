import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { BrandLogo } from "./BrandLogo.jsx";
import { LocaleToggle } from "./LocaleToggle.jsx";
import { AppNavLink, Button } from "./ui.jsx";

export function AppHeader() {
  const { user, profile, signOut, isSupabaseReady, isAdmin } = useAuth();
  const { strings, t } = useLocale();
  const { pathname } = useLocation();
  const isMarketingHome =
    !user &&
    (pathname === "/" ||
      pathname.startsWith("/urun/") ||
      pathname.startsWith("/kurumsal-basvuru") ||
      pathname.startsWith("/uzman-basvuru") ||
      pathname.startsWith("/merkezler") ||
      pathname.startsWith("/iletisim") ||
      pathname.startsWith("/olcum/"));
  const onHome = pathname === "/";
  const nav = strings.home?.marketing?.nav;

  return (
    <header className={`fp-header${isMarketingHome ? " fp-header--marketing" : ""}`}>
      <div className="fp-header-inner">
        <Link to="/" className="fp-brand" aria-label="Focus Pro Lab">
          <BrandLogo variant="header" />
        </Link>

        {isMarketingHome && nav && (
          <nav className="fp-mkt-topnav" aria-label="Marketing">
            <a href="/">{nav.home}</a>
            <a href={onHome ? "#nedir" : "/#nedir"}>{nav.about}</a>
            <Link to="/merkezler">{nav.centers}</Link>
            <a href={onHome ? "#sss" : "/#sss"}>{nav.faq}</a>
            <Link to="/iletisim">{nav.contact}</Link>
          </nav>
        )}

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
              ) : isMarketingHome ? (
                <>
                  <Button asLink to="/uzman-basvuru" variant="secondary" size="sm" className="fp-mkt-apply-btn">
                    {nav.apply}
                  </Button>
                  <Button asLink to="/giris" variant="primary" size="sm" className="fp-mkt-login-btn">
                    {nav.login}
                  </Button>
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
