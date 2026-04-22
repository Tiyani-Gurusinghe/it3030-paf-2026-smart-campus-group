import { useState } from "react";
import { Navigate, useNavigate, Link, useLocation } from "react-router-dom";
import { authApi } from "../../features/auth/api/authApi";
import { getLandingRoute as computeLandingRoute } from "../../features/auth/context/AuthContext";
import useAuth from "../../features/auth/hooks/useAuth";

const TEST_EMAILS = [
  { email: "user@test.com", role: "USER", hint: "Normal user" },
  { email: "tech@test.com", role: "TECHNICIAN", hint: "Technician" },
  { email: "admin@test.com", role: "ADMIN", hint: "Admin" },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, getLandingRoute } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userData = await authApi.login({ email, password });
      const normalized = login(userData);
      const destination = computeLandingRoute(normalized.roles);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) {
    return <Navigate to={getLandingRoute()} replace />;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏛️</div>
          <h1 className="login-title">Smart Campus</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {successMessage && (
          <div className="success-box" style={{ background: 'rgba(46, 213, 115, 0.1)', color: '#2ed573', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(46, 213, 115, 0.3)' }}>
            <span>✅</span> {successMessage}
          </div>
        )}

        {error && (
          <div className="error-box">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn login-btn"
          >
            {loading ? "⏳ Signing in..." : "Sign In →"}
          </button>
        </form>

        <div className="login-hints">
          <p className="login-hints-label">Quick login (dev mode):</p>
          <div className="login-hints-list">
            {TEST_EMAILS.map(({ email: e, role, hint }) => (
              <button
                key={e}
                className="login-hint-btn"
                onClick={() => { setEmail(e); setPassword("SmartCampus!2026"); }}
                type="button"
                title={hint}
              >
                <span className={`role-badge role-badge-${role.toLowerCase()}`}>
                  {role}
                </span>
                <span className="login-hint-email">{e}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="login-footer" style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
