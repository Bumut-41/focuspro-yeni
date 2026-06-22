import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { LocaleProvider } from "./i18n/LocaleContext.jsx";
import { useLocale } from "./i18n/LocaleContext.jsx";
import { AppHeader } from "./components/AppHeader.jsx";
import { TestChromeProvider, useTestChrome } from "./test/TestChromeContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import CompleteProfilePage from "./pages/CompleteProfilePage.jsx";
import InvitePage from "./pages/InvitePage.jsx";

const TestFlowPage = lazy(() => import("./pages/TestFlowPage.jsx"));

function Shell({ children }) {
  const { immersive } = useTestChrome();
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  return (
    <div className={immersive ? "app-shell app-shell--immersive" : "app-shell"}>
      {!immersive && <AppHeader />}
      <main
        className={
          immersive
            ? "app-shell-main app-shell-main--immersive"
            : isLanding
              ? "app-shell-main app-shell-main--landing"
              : "app-shell-main"
        }
      >
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { t } = useLocale();

  return (
    <Routes>
      <Route path="/giris" element={<LoginPage />} />
      <Route path="/kayit" element={<RegisterPage />} />
      <Route path="/davet/:token" element={<InvitePage />} />
      <Route
        path="/profil-tamamla"
        element={
          <ProtectedRoute>
            <CompleteProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<HomePage />} />
      <Route
        path="/panel"
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
            <Suspense fallback={<p className="fp-loading">{t("common.testLoading")}</p>}>
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
    <LocaleProvider>
      <AuthProvider>
        <TestChromeProvider>
          <BrowserRouter>
            <Shell>
              <AppRoutes />
            </Shell>
          </BrowserRouter>
        </TestChromeProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
