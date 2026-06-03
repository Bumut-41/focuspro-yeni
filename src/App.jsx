import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { AppHeader } from "./components/AppHeader.jsx";
import { TestChromeProvider, useTestChrome } from "./test/TestChromeContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import CompleteProfilePage from "./pages/CompleteProfilePage.jsx";

const TestFlowPage = lazy(() => import("./pages/TestFlowPage.jsx"));

function Shell({ children }) {
  const { immersive } = useTestChrome();

  return (
    <div className={immersive ? "app-shell app-shell--immersive" : "app-shell"}>
      {!immersive && <AppHeader />}
      <main className={immersive ? "app-shell-main app-shell-main--immersive" : "app-shell-main"}>
        {children}
      </main>
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
            <Suspense fallback={<p className="fp-loading">Test yükleniyor…</p>}>
              <TestFlowPage />
            </Suspense>
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
