import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import TicketsPage from "../pages/tickets/TicketsPage";
import CreateTicketPage from "../pages/tickets/CreateTicketPage";
import EditTicketPage from "../pages/tickets/EditTicketPage";
import TicketDetailsPage from "../pages/tickets/TicketDetailsPage";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <TicketsPage />,
      },
      {
        path: "tickets",
        element: <TicketsPage />,
      },
      {
        path: "tickets/new",
        element: <CreateTicketPage />,
      },
      {
        path: "tickets/:id",
        element: <TicketDetailsPage />,
      },
      {
        path: "tickets/:id/edit",
        element: <EditTicketPage />,
      },
    ],
  },
]);

export default router;
