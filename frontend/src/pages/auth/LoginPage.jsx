import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { authApi } from "../../features/auth/api/authApi";
import useAuth from "../../features/auth/hooks/useAuth";

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("user@test.com");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await authApi.login({ email });
      login(user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page">
      <form className="ticket-form card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <p className="subtext">Use `user@test.com` for the normal user or `admin@test.com` for admin.</p>

        {error && <div className="error-box">{error}</div>}

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
