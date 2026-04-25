import { Link, useRouteError } from "react-router-dom";

function RouteErrorPage() {
  const error = useRouteError();
  const status = error?.status || "Error";
  const message =
    error?.status === 404
      ? "The page you requested does not exist."
      : error?.statusText || error?.message || "Something went wrong.";

  return (
    <div className="route-error-page">
      <div className="card route-error-card">
        <div className="route-error-code">{status}</div>
        <h1>Page not available</h1>
        <p>{message}</p>
        <div className="card-actions">
          <Link to="/dashboard" className="btn primary">Go to Dashboard</Link>
          <Link to="/login" className="btn secondary">Go to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default RouteErrorPage;
