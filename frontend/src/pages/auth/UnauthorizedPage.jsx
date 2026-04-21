import { Link } from "react-router-dom";
import useAuth from "../../features/auth/hooks/useAuth";

export default function UnauthorizedPage() {
  const { getLandingRoute } = useAuth();
  return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>🚫</div>
      <h1 className="page-title" style={{ marginBottom: 12 }}>Access Denied</h1>
      <p className="page-subtitle" style={{ marginBottom: 32 }}>
        You don't have permission to view this page.
      </p>
      <Link to={getLandingRoute()} className="btn">← Go to My Dashboard</Link>
    </div>
  );
}