import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

// ERR-019 & ERR-021 FIX: Protected Route component guarding /dashboard
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  // If user is authenticated or demo session is initialized, permit access
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function BackendAdminRedirect() {
  const configuredAdminUrl = import.meta.env.VITE_ADMIN_URL;
  const configuredApiUrl = import.meta.env.VITE_API_BASE_URL;
  const adminUrl = configuredAdminUrl || (configuredApiUrl?.startsWith("http")
    ? new URL("/admin", configuredApiUrl).toString()
    : "http://localhost:5001/admin");

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
