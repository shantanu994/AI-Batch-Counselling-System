import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login, loading, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "admin@college.edu", password: "Password@123" });
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const result = await login(form.email, form.password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <section className="login-page">
      <aside className="login-hero">
        <p className="hero-kicker">College Intelligence Platform</p>
        <h1>Mentoring Decisions, Powered by AI Precision</h1>
        <p>
          Track every learner, detect risk early, and run high-impact counselling programs with one
          unified command center.
        </p>
        <ul>
          <li>Live performance and attendance intelligence</li>
          <li>Automated AI-based batch allocation</li>
          <li>Role-secured dashboards for admin, counsellor, and student</li>
        </ul>
      </aside>

      <div className="login-card">
        <h2>AI-Driven Batch Counselling System</h2>
        <p>Secure sign in for Admin, Counsellor, and Student users.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            required
          />

          {error ? <p className="error-msg">{error}</p> : null}
          <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
        </form>

        <div className="quick-credentials">
          <p>Quick access (demo seed)</p>
          <span>admin@college.edu / Password@123</span>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
