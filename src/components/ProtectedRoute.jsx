import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { Card, Page } from "./ui.jsx";

export function ProtectedRoute({ children }) {
  const { user, loading, isSupabaseReady, needsProfileCompletion } = useAuth();
  const location = useLocation();

  if (!isSupabaseReady) {
    return (
      <Page narrow>
        <Card>
          <h2 className="fp-card-title">Kurulum</h2>
          <p className="fp-card-desc">Supabase bağlantısı için `.env` dosyasını doldurun. Bkz. docs/SAAS_SENARYO.md</p>
        </Card>
      </Page>
    );
  }

  if (loading) {
    return <p className="fp-loading">Yükleniyor…</p>;
  }

  if (!user) return <Navigate to="/giris" replace />;

  if (needsProfileCompletion && location.pathname !== "/profil-tamamla") {
    return <Navigate to="/profil-tamamla" replace />;
  }

  return children;
}
