import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../features/auth/api/authApi";
import useAuth from "../../features/auth/hooks/useAuth";

// Helper to match paths defined in router.jsx
const getLandingRoute = (role) => {
  if (role === 'ADMIN') return '/dashboard';
  if (role === 'TECHNICIAN') return '/tickets';
  return '/resources';
};

const TEST_EMAILS = [
  { email: "user2@test.com", role: "USER", hint: "Normal user" },
  { email: "alice@test.com", role: "TECHNICIAN", hint: "Technician" },
  { email: "admin2@test.com", role: "ADMIN", hint: "Admin" },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, primaryRole } = useAuth(); 
  const [email, setEmail] = useState("admin2@test.com"); // Set default to admin for your testing
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Use the primaryRole provided by your AuthContext
      const role = primaryRole || (user.roles && user.roles[0]) || 'USER';
      const destination = getLandingRoute(role);
      
      if (window.location.pathname === '/login') {
        navigate(destination, { replace: true });
      }
    }
  }, [isAuthenticated, user, primaryRole, navigate]);
  
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userData = await authApi.login({ email });
      
      // Update Context
      const sessionUser = login(userData);
      
      // Determine role from the session data
      const role = sessionUser.primaryRole || (sessionUser.roles && sessionUser.roles[0]) || 'USER';
      const destination = getLandingRoute(role);
      
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Login failed. Please check if the user exists in the database."
      );
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated && user) return null;

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