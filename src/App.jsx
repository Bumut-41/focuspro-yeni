import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { TestChromeProvider, useTestChrome } from "./test/TestChromeContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import CompleteProfilePage from "./pages/CompleteProfilePage.jsx";
import TestFlowPage from "./pages/TestFlowPage.jsx";

function Shell({ children }) {
  const { user, profile, signOut, isSupabaseReady } = useAuth();
  const { immersive } = useTestChrome();

  return (
    <div
      className={immersive ? "app-shell app-shell--immersive" : "app-shell"}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: immersive ? 0 : "24px 16px 48px",
        background: immersive ? "#fff" : "#f1f5f9"
      }}
    >
      {!immersive && (
        <header style={{ textAlign: "center", marginBottom: 20, width: "100%", maxWidth: 1000 }}>
          <h1 style={{ margin: 0, color: "#0f172a" }}>FocusProLab</h1>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>Dikkat testi — üyelik ve kredi sistemi</p>
          {isSupabaseReady && (
            <nav style={{ marginTop: 14, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", fontSize: 14 }}>
              {user ? (
                <>
                  <Link to="/">Panel</Link>
                  <Link to="/test">Test</Link>
                  {profile?.role === "admin" && <Link to="/admin">Yönetim</Link>}
                  <button
                    type="button"
                    onClick={() => signOut()}
                    style={{ border: "none", background: "none", color: "#2563eb", cursor: "pointer", fontSize: 14 }}
                  >
                    Çıkış ({profile?.full_name})
                  </button>
                </>
              ) : (
                <>
                  <Link to="/giris">Giriş</Link>
                  <Link to="/kayit">Kayıt ol</Link>
                </>
              )}
            </nav>
          )}
        </header>
      )}
      <div className={immersive ? "app-shell-main app-shell-main--immersive" : "app-shell-main"}>{children}</div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/giris" element={<LoginPage />} />
      <Route path="/kayit" element={<RegisterPage />} />
      <Route
        path="/profil-tamamla"
        element={
          <ProtectedRoute>
            <CompleteProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test"
        element={
          <ProtectedRoute>
            <TestFlowPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TestChromeProvider>
        <BrowserRouter>
          <Shell>
            <AppRoutes />
          </Shell>
        </BrowserRouter>
      </TestChromeProvider>
    </AuthProvider>
  );
}
