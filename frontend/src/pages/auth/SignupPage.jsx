import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { authApi } from "../../features/auth/api/authApi";
import { getLandingRoute as computeLandingRoute } from "../../features/auth/context/AuthContext";
import useAuth from "../../features/auth/hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";

function SignupPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, getLandingRoute } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    campusId: "",
    password: "",
    confirmPassword: ""
  });
  
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
          "Google Signup failed"
      );
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!formData.campusId.match(/^IT\d{8}$/)) {
      setError("Campus ID must start with 'IT' followed by exactly 8 numbers (e.g. IT12345678)");
      return;
    }

    if (!formData.password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)) {
      setError("Password must be at least 6 characters long and contain both letters and numbers.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        campusId: formData.campusId,
        password: formData.password
      };
      
      await authApi.signup(payload);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Signup failed"
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
      <div className="login-card" style={{ maxWidth: '500px' }}>
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

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
              autoFocus
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
              placeholder="IT12345678"
              required
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
              placeholder="Enter your email"
              required
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
              placeholder="Min 6 chars, letters & numbers"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn login-btn"
            style={{ marginTop: '10px' }}
          >
            {loading ? "⏳ Creating Account..." : "Sign Up →"}
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
            text="signup_with"
            size="large"
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
            Already have an account? <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' }}>Sign In here</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
