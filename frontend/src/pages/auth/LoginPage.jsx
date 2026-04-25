import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSuccess(credentialResponse) {
    setError("");
    setLoading(true);
    try {
      const response = await authApi.googleLogin(credentialResponse.credential);
      // The response is now LoginResponse { token, user }
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
      // the fallback local login now also expects a token if backend implements it,
      // but if not, we can just pass the user object.
      // (Backend does return new LoginResponse(jwt, userDto) in the updated code!)
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

          <button
            type="submit"
            disabled={loading}
            className="btn login-btn"
          >
            {loading ? "⏳ Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#666', fontSize: '14px' }}>
            OR
        </div>

        <div className="google-login-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError("Google Sign-In was unsuccessful. Try again later.");
            }}
            useOneTap
            shape="rectangular"
            theme="filled_black"
            text="signin_with"
            size="large"
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
            Don't have an account? <Link to="/signup" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' }}>Sign Up here</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
