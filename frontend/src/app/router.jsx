/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layout & Guards
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import RoleGuard from "../features/auth/components/RoleGuard";
import useAuth from "../features/auth/hooks/useAuth";

// Auth pages
import LoginPage from "../pages/auth/LoginPage";
import UnauthorizedPage from "../pages/auth/UnauthorizedPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import NotificationPanelPage from "../pages/notifications/NotificationPanelPage";
import ProfilePage from "../pages/profile/ProfilePage";
import ResourceListPage from "../pages/resources/ResourceListPage";
import ResourceDetailsPage from "../pages/resources/ResourceDetailsPage";
import ResourceFormPage from "../pages/resources/ResourceFormPage";
import BookingListPage from "../pages/bookings/BookingListPage";
import BookingDetailsPage from "../pages/bookings/BookingDetailsPage";
import BookingFormPage from "../pages/bookings/BookingFormPage";

// USER pages
import MyTicketsPage from "../pages/tickets/MyTicketsPage";
import CreateTicketPage from "../pages/tickets/CreateTicketPage";
import TicketDetailsPage from "../pages/tickets/TicketDetailsPage";
import TicketsPage from "../pages/tickets/TicketsPage";

// TECHNICIAN pages
import TechnicianTicketsPage from "../pages/technician/TechnicianTicketsPage";
import TechnicianTicketDetailPage from "../pages/technician/TechnicianTicketDetailPage";

// ADMIN pages
import AdminTicketsPage from "../pages/admin/AdminTicketsPage";
import AdminTicketDetailPage from "../pages/admin/AdminTicketDetailPage";

function RoleHomeRedirect() {
  const { getLandingRoute } = useAuth();
  return <Navigate to={getLandingRoute()} replace />;
}

const router = createBrowserRouter([
  // Public
  { path: "/login", element: <LoginPage /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },

  // Protected shell
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      // Root redirect to role-specific landing handled by ProtectedRoute / LoginPage
      {
        index: true,
        element: <RoleHomeRedirect />,
      },
      {
        path: "dashboard",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <DashboardPage />
          </RoleGuard>
        ),
      },
      {
        path: "notifications",
        element: <NotificationPanelPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "resources",
        element: <ResourceListPage />,
      },
      {
        path: "resources/new",
        element: <ResourceFormPage />,
      },
      {
        path: "resources/:id",
        element: <ResourceDetailsPage />,
      },
      {
        path: "resources/:id/edit",
        element: <ResourceFormPage />,
      },
      {
        path: "bookings",
        element: <BookingListPage />,
      },
      {
        path: "bookings/new",
        element: <BookingFormPage />,
      },
      {
        path: "bookings/:id",
        element: <BookingDetailsPage />,
      },
      {
        path: "bookings/:id/edit",
        element: <BookingFormPage />,
      },

      // ─── USER routes ────────────────────────────────────────
      {
        path: "tickets",
        element: (
          <RoleGuard allowedRoles={["USER", "ADMIN", "TECHNICIAN"]}>
            <TicketsPage />
          </RoleGuard>
        ),
      },
      {
        path: "tickets/my",
        element: (
          <RoleGuard allowedRoles={["USER", "ADMIN", "TECHNICIAN"]}>
            <MyTicketsPage />
          </RoleGuard>
        ),
      },
      {
        path: "tickets/create",
        element: (
          <RoleGuard allowedRoles={["USER", "ADMIN"]}>
            <CreateTicketPage />
          </RoleGuard>
        ),
      },
      {
        path: "tickets/new",
        element: (
          <RoleGuard allowedRoles={["USER", "ADMIN"]}>
            <CreateTicketPage />
          </RoleGuard>
        ),
      },
      {
        path: "tickets/:id",
        element: (
          <RoleGuard allowedRoles={["USER", "ADMIN", "TECHNICIAN"]}>
            <TicketDetailsPage />
          </RoleGuard>
        ),
      },

      // ─── TECHNICIAN routes ──────────────────────────────────
      {
        path: "technician/tickets",
        element: (
          <RoleGuard allowedRoles={["TECHNICIAN", "ADMIN"]}>
            <TechnicianTicketsPage />
          </RoleGuard>
        ),
      },
      {
        path: "technician/tickets/:id",
        element: (
          <RoleGuard allowedRoles={["TECHNICIAN", "ADMIN"]}>
            <TechnicianTicketDetailPage />
          </RoleGuard>
        ),
      },

      // ─── ADMIN routes ───────────────────────────────────────
      {
        path: "admin/tickets",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <AdminTicketsPage />
          </RoleGuard>
        ),
      },
      {
        path: "admin/tickets/:id",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <AdminTicketDetailPage />
          </RoleGuard>
        ),
      },
    ],
  },
]);

export default router;
