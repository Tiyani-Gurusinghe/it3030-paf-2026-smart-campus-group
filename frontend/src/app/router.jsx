import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import TicketsPage from "../pages/tickets/TicketsPage";
import CreateTicketPage from "../pages/tickets/CreateTicketPage";
import EditTicketPage from "../pages/tickets/EditTicketPage";
import TicketDetailsPage from "../../src/pages/tickets/TicketDetailsPage";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <TicketsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tickets/new",
    element: (
      <ProtectedRoute>
        <CreateTicketPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tickets/:id",
    element: (
      <ProtectedRoute>
        <TicketDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tickets/:id/edit",
    element: (
      <ProtectedRoute>
        <EditTicketPage />
      </ProtectedRoute>
    ),
  },
]);

export default router;
