import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Clear old persistent auth from previous versions.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    const token = sessionStorage.getItem("token");
    if (!token) {
      setUser(null);
      setAuthReady(true);
      return;
    }

    const verify = async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (data?.user) {
          setUser(data.user);
          sessionStorage.setItem("user", JSON.stringify(data.user));
        } else {
          throw new Error("Invalid auth session");
        }
      } catch (error) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    };

    verify();
  }, []);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      sessionStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      const status = error.response?.status;

      const fallbackMessage = !error.response
        ? "Unable to reach backend API. Start backend server and verify MySQL connection."
        : status === 401
        ? "Invalid email or password"
        : status >= 500
        ? "Backend server error. Check backend logs for details."
        : "Login failed. Please try again.";

      return {
        success: false,
        message: error.response?.data?.message || fallbackMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      authReady,
      login,
      logout,
      isAuthenticated: Boolean(user && sessionStorage.getItem("token")),
    }),
    [user, loading, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
