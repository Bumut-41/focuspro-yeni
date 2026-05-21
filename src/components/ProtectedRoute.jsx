import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { card } from "./ui.js";

export function ProtectedRoute({ children }) {
  const { user, loading, isSupabaseReady, needsProfileCompletion } = useAuth();
  const location = useLocation();

  if (!isSupabaseReady) {
    return (
      <div style={card}>
        <h2>Kurulum</h2>
        <p>Supabase bağlantısı için `.env` dosyasını doldurun. Bkz. docs/SAAS_SENARYO.md</p>
      </div>
    );
  }

  if (loading) {
    return <p style={{ color: "#64748b" }}>Yükleniyor…</p>;
  }

  if (!user) return <Navigate to="/giris" replace />;

  if (needsProfileCompletion && location.pathname !== "/profil-tamamla") {
    return <Navigate to="/profil-tamamla" replace />;
  }

  return children;
}
