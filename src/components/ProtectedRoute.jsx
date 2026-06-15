import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { Card, Page } from "./ui.jsx";

export function ProtectedRoute({ children }) {
  const { user, loading, isSupabaseReady, needsProfileCompletion } = useAuth();
  const { t } = useLocale();
  const location = useLocation();

  if (!isSupabaseReady) {
    return (
      <Page narrow>
        <Card>
          <h2 className="fp-card-title">{t("setup.title")}</h2>
          <p className="fp-card-desc">{t("setup.desc")}</p>
        </Card>
      </Page>
    );
  }

  if (loading) {
    return <p className="fp-loading">{t("common.loading")}</p>;
  }

  if (!user) return <Navigate to="/giris" replace />;

  if (needsProfileCompletion && location.pathname !== "/profil-tamamla") {
    return <Navigate to="/profil-tamamla" replace />;
  }

  return children;
}
