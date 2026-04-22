import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { authApi } from "../../features/auth/api/authApi";
import useAuth from "../../features/auth/hooks/useAuth";

function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, getLandingRoute } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: "",
    campusId: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    
    const campusId = formData.campusId.trim();
    
    // Basic frontend validations
    if (!/^IT\d{8}$/.test(campusId)) {
      return setError("Campus ID must start with 'IT' followed by exactly 8 numbers (e.g., IT20000000).");
    }
    if (formData.password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/.test(formData.password)) {
      return setError("Password must contain letters, numbers, and symbols.");
    }
    
    setLoading(true);
    try {
      // Register user
      await authApi.signup({ ...formData, campusId });
      
      // Navigate to login so they can sign in with new credentials
      navigate("/login", { replace: true, state: { message: "Account created successfully! Please log in." } });
    } catch (err) {
      const responseData = err?.response?.data;
      if (responseData?.validationErrors) {
        const firstError = Object.values(responseData.validationErrors)[0];
        setError(firstError);
      } else {
        setError(
          responseData?.message ||
            responseData ||
            err.message ||
            "Signup failed"
        );
      }
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
          <p className="login-subtitle">Create a new account</p>
        </div>

        {error && (
          <div className="error-box">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          <div className="form-field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="form-field">
            <label htmlFor="campusId">Campus ID</label>
            <input
              id="campusId"
              name="campusId"
              type="text"
              value={formData.campusId}
              onChange={handleChange}
              placeholder="e.g. IT20000000"
              required
              pattern="^IT\d{8}$"
              title="Campus ID must start with 'IT' followed by exactly 8 numbers (e.g., IT20000000)."
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@test.com"
              required
              autoComplete="off"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 chars, letters, numbers, symbols"
              required
              minLength={8}
              pattern="(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}"
              title="Password must be at least 8 characters and include letters, numbers, and symbols."
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn login-btn"
          >
            {loading ? "⏳ Creating Account..." : "Sign Up →"}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
