import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { AppNavLink, Button } from "./ui.jsx";

export function AppHeader() {
  const { user, profile, signOut, isSupabaseReady } = useAuth();

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        <Link to={user ? "/" : "/giris"} className="fp-brand">
          <span className="fp-brand-mark" aria-hidden>
            FP
          </span>
          <span className="fp-brand-text">
            <span className="fp-brand-name">FocusProLab</span>
            <span className="fp-brand-tagline">Sürekli performans değerlendirmesi</span>
          </span>
        </Link>

        {isSupabaseReady && (
          <nav className="fp-nav" aria-label="Main">
            {user ? (
              <>
                <AppNavLink to="/" end>
                  Panel
                </AppNavLink>
                <AppNavLink to="/test">Test</AppNavLink>
                {profile?.role === "admin" && <AppNavLink to="/admin">Yönetim</AppNavLink>}
                <div className="fp-nav-user">
                  <span className="fp-nav-user-name">{profile?.full_name}</span>
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    Çıkış
                  </Button>
                </div>
              </>
            ) : (
              <>
                <AppNavLink to="/giris">Giriş</AppNavLink>
                <Button asLink to="/kayit" variant="primary" size="sm">
                  Kayıt ol
                </Button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
