import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LegalShell } from "./components/legal/LegalShell";
import { Auth } from "./pages/Auth";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { ComingSoon } from "./pages/ComingSoon";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Landing } from "./pages/Landing";
import { ProRoute } from "./components/ProRoute";
import { Pricing } from "./pages/Pricing";
import { Tracker } from "./pages/Tracker";
import { Contact } from "./pages/legal/Contact";
import { Privacy } from "./pages/legal/Privacy";
import { Refunds } from "./pages/legal/Refunds";
import { Terms } from "./pages/legal/Terms";
import { isSiteLocked } from "./lib/siteLock";

function legalRoutes() {
  return (
    <>
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/refunds" element={<Refunds />} />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/pricing" element={<Pricing />} />
        {legalRoutes()}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracker"
          element={
            <ProtectedRoute>
              <ProRoute>
                <Tracker />
              </ProRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function LockedRoutes() {
  return (
    <Routes>
      <Route element={<LegalShell />}>{legalRoutes()}</Route>
      <Route path="*" element={<ComingSoon />} />
    </Routes>
  );
}

function App() {
  if (isSiteLocked()) {
    return (
      <BrowserRouter>
        <LockedRoutes />
      </BrowserRouter>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
