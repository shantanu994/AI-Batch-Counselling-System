import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./layout/AppLayout";
import AdminDashboard from "./pages/AdminDashboard";
import BatchesPage from "./pages/BatchesPage";
import CounsellorDashboard from "./pages/CounsellorDashboard";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import StudentDashboard from "./pages/StudentDashboard";
import StudentsPage from "./pages/StudentsPage";

function getDefaultRoute(role) {
  if (role === "student") return "/student";
  if (role === "counsellor") return "/counsellor";
  return "/dashboard";
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, authReady } = useAuth();
  if (!authReady) {
    return <div className="loader-wrap"><span className="loader" /><p>Checking session...</p></div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) {
    return <Navigate to={getDefaultRoute(user?.role)} replace />;
  }
  return children;
}

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route
            path="/login"
            element={
              user ? <Navigate to={getDefaultRoute(user?.role)} replace /> : <LoginPage />
            }
          />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout
                  theme={theme}
                  onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                >
                  <Routes>
                    <Route
                      path="/dashboard"
                      element={
                        <RoleRoute roles={["admin"]}>
                          <AdminDashboard />
                        </RoleRoute>
                      }
                    />
                    <Route
                      path="/students"
                      element={
                        <RoleRoute roles={["admin", "counsellor"]}>
                          <StudentsPage />
                        </RoleRoute>
                      }
                    />
                    <Route
                      path="/batches"
                      element={
                        <RoleRoute roles={["admin"]}>
                          <BatchesPage />
                        </RoleRoute>
                      }
                    />
                    <Route
                      path="/counsellor"
                      element={
                        <RoleRoute roles={["admin", "counsellor"]}>
                          <CounsellorDashboard />
                        </RoleRoute>
                      }
                    />
                    <Route
                      path="/student"
                      element={
                        <RoleRoute roles={["admin", "student"]}>
                          <StudentDashboard />
                        </RoleRoute>
                      }
                    />
                    <Route path="/" element={<Navigate to={getDefaultRoute(user?.role)} replace />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
