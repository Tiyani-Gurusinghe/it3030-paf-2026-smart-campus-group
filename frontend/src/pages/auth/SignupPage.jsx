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
    <div className="login-layout">
      {/* Left side: Image banner */}
      <div className="login-banner">
        <img src="/home/it-lab-students.jpg" alt="Campus IT Lab" className="login-banner-image" />
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
            <h1>Join the Smart Campus network.</h1>
            <p>Register your account to start managing bookings, tickets, and facilities.</p>
          </div>
        </div>
      </div>

      {/* Right side: Signup form */}
      <div className="login-form-container">
        <div className="login-card-clean">
          <div className="login-header-clean">
            <h1 className="login-title-clean">Create Account</h1>
            <p className="login-subtitle-clean">Sign up for your workspace</p>
          </div>

          {error && (
            <div className="error-box">
              <span>Error</span> {error}
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

            <button type="submit" disabled={loading} className="btn login-btn">
              {loading ? "Creating Account..." : "Sign Up"}
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
              text="signup_with"
              size="large"
            />
          </div>

          <div className="login-signup-link">
            Already have an account? <Link to="/login">Sign In here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
