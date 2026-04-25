import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authApi } from "../../features/auth/api/authApi";
import useAuth from "../../features/auth/hooks/useAuth";
import { getLandingRoute as computeLandingRoute } from "../../features/auth/context/AuthContext";

const TEST_EMAILS = [
  { email: "admin@test.com", role: "ADMIN", hint: "Admin User" },
  { email: "user@test.com", role: "USER", hint: "Normal User" },
  { email: "alice@test.com", role: "TECHNICIAN", hint: "Alice Technician" },
  { email: "bob@test.com", role: "TECHNICIAN", hint: "Bob Electrician" },
  { email: "charlie@test.com", role: "TECHNICIAN", hint: "Charlie HVAC" },
  { email: "nimal@test.com", role: "USER", hint: "Nimal Perera" },
  { email: "ayesha@test.com", role: "USER", hint: "Ayesha Silva" },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, getLandingRoute, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSuccess(credentialResponse) {
    setError("");
    setLoading(true);
    try {
      const response = await authApi.googleLogin(credentialResponse.credential);
      const normalized = login(response.user, response.token);
      const destination = computeLandingRoute(normalized.roles);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Google Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const normalized = login(response.user, response.token);
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
    return <Navigate to={computeLandingRoute(user?.roles ?? [])} replace />;
  }

  return (
    <div className="login-layout">
      {/* Left side: Image banner matching home page */}
      <div className="login-banner">
        <img src="/home/library-collaboration.jpg" alt="Campus Learning Space" className="login-banner-image" />
        <div className="login-banner-overlay" />
        <div className="login-banner-content">
          <Link to="/home" className="login-brand-link">
            <span className="login-logo-icon">SC</span>
            <div>
              <h2>Smart Campus</h2>
              <p>SLIIT Operations Hub</p>
            </div>
          </Link>
          <div className="login-banner-text">
            <h1>Manage your campus spaces.</h1>
            <p>Access facilities, report issues, and book resources through a unified portal.</p>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="login-form-container">
        <div className="login-card-clean">
          <div className="login-header-clean">
            <h1 className="login-title-clean">Sign In</h1>
            <p className="login-subtitle-clean">Continue to your workspace</p>
          </div>

          {error && (
            <div className="error-box">
              <span>Error</span> {error}
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
              />
            </div>

            <button type="submit" disabled={loading} className="btn login-btn">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div className="google-login-container">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Sign-In was unsuccessful. Try again later.")}
              useOneTap
              shape="rectangular"
              theme="filled_black"
              text="signin_with"
              size="large"
            />
          </div>

          <div className="login-signup-link">
            Don't have an account? <Link to="/signup">Sign Up here</Link>
          </div>

          <div className="login-hints-clean">
            <p>Quick login (dev mode)</p>
            <div className="login-hints-grid">
              {TEST_EMAILS.map(({ email: e, role, hint }) => (
                <button
                  key={e}
                  className={`login-hint-btn-clean ${email === e ? "selected" : ""}`}
                  onClick={() => setEmail(e)}
                  type="button"
                  title={hint}
                >
                  <span className={`role-badge role-badge-${role.toLowerCase()}`}>{role}</span>
                  <span className="login-hint-name">{hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
