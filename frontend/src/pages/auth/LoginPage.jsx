import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { authApi } from "../../features/auth/api/authApi";
import { getLandingRoute as computeLandingRoute } from "../../features/auth/context/AuthContext";
import useAuth from "../../features/auth/hooks/useAuth";

const TEST_EMAILS = [
  { email: "user2@test.com", role: "USER", hint: "Normal user" },
  { email: "alice@test.com", role: "TECHNICIAN", hint: "Technician" },
  { email: "admin2@test.com", role: "ADMIN", hint: "Admin" },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, getLandingRoute } = useAuth();
  const [email, setEmail] = useState("user@test.com");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userData = await authApi.login({ email });
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

        {error && (
          <div className="error-box">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
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
                onClick={() => setEmail(e)}
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
      </div>
    </div>
  );
}

export default LoginPage;
