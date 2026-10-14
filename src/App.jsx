import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import OAuthCallback from "./pages/OAuthCallback";

// ERR-019 & ERR-021 FIX: Protected Route component guarding /dashboard
function ProtectedRoute({ children }) {
  const { user, authReady } = useAuth();

  if (!authReady) return <main className="loading-screen">Loading your profile…</main>;
  
  // If user is authenticated or demo session is initialized, permit access
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.demo && !user.onboardingComplete) return <Navigate to="/onboarding" replace />;

  return children;
}

function OnboardingRoute() {
  const { user, authReady } = useAuth();
  const location = useLocation();
  if (!authReady) return <main className="loading-screen">Loading your profile…</main>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.demo) return <Navigate to="/dashboard" replace />;
  if (user.onboardingComplete && !new URLSearchParams(location.search).has('edit')) return <Navigate to="/dashboard" replace />;
  return <Onboarding />;
}

function BackendAdminRedirect() {
  const configuredAdminUrl = import.meta.env.VITE_ADMIN_URL;
  const configuredApiUrl = import.meta.env.VITE_API_BASE_URL;
  const defaultAdminUrl = import.meta.env.PROD
    ? "https://skilltwin-l25l.onrender.com/admin"
    : "http://localhost:5001/admin";
  const adminUrl = configuredAdminUrl || (configuredApiUrl?.startsWith("http")
    ? new URL("/admin", configuredApiUrl).toString()
    : defaultAdminUrl);

  useEffect(() => { window.location.replace(adminUrl); }, [adminUrl]);
  return <main className="loading-screen">Opening the SkillTwin admin dashboard…</main>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<OnboardingRoute />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          {/* Guarded dashboard route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin" element={<BackendAdminRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
