import { createBrowserRouter } from "react-router-dom";

// Auth & Layout
import LoginPage from "../pages/auth/LoginPage";
import UnauthorizedPage from "../pages/auth/UnauthorizedPage";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

// Resources
import DashboardPage from "../pages/dashboard/DashboardPage";
import ResourceListPage from "../pages/resources/ResourceListPage";
import ResourceFormPage from "../pages/resources/ResourceFormPage";
import ResourceDetailsPage from "../pages/resources/ResourceDetailsPage";

// Bookings
import BookingListPage from "../pages/bookings/BookingListPage";
import BookingFormPage from "../pages/bookings/BookingFormPage";
import BookingDetailsPage from "../pages/bookings/BookingDetailsPage";

// Tickets — user
import MyTicketsPage from "../pages/tickets/MyTicketsPage";
import CreateTicketPage from "../pages/tickets/CreateTicketPage";
import TicketDetailsPage from "../pages/tickets/TicketDetailsPage";
import EditTicketPage from "../pages/tickets/EditTicketPage";

// Tickets — admin
import AdminTicketsPage from "../pages/admin/AdminTicketsPage";
import AdminTicketDetailPage from "../pages/admin/AdminTicketDetailPage";

// Tickets — technician
import TechnicianTicketsPage from "../pages/technician/TechnicianTicketsPage";
import TechnicianTicketDetailPage from "../pages/technician/TechnicianTicketDetailPage";

// Misc
import NotificationPanelPage from "../pages/notifications/NotificationPanelPage";
import ProfilePage from "../pages/profile/ProfilePage";
import RouteErrorPage from "../pages/common/RouteErrorPage";

const router = createBrowserRouter([
  // --- PUBLIC ROUTES ---
  { path: "/login", element: <LoginPage />, errorElement: <RouteErrorPage /> },
  { path: "/unauthorized", element: <UnauthorizedPage />, errorElement: <RouteErrorPage /> },

  // --- PROTECTED ROUTES ---
  {
    path: "/",
    errorElement: <RouteErrorPage />,
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      { path: "dashboard", element: <DashboardPage /> },

      // --- RESOURCES ---
      { path: "resources", element: <ResourceListPage /> },
      { path: "resources/new", element: <ResourceFormPage /> },
      { path: "resources/edit/:id", element: <ResourceFormPage /> },
      { path: "resources/:id", element: <ResourceDetailsPage /> },

      // --- BOOKINGS ---
      { path: "bookings", element: <BookingListPage /> },
      { path: "bookings/new", element: <BookingFormPage /> },
      { path: "bookings/:id", element: <BookingDetailsPage /> },

      // --- TICKETS (user) ---
      { path: "tickets/my", element: <MyTicketsPage /> },
      { path: "tickets/create", element: <CreateTicketPage /> },
      { path: "tickets/new", element: <CreateTicketPage /> },
      { path: "tickets/:id", element: <TicketDetailsPage /> },
      { path: "tickets/:id/edit", element: <EditTicketPage /> },

      // --- TICKETS (admin) ---
      { path: "admin/tickets", element: <AdminTicketsPage /> },
      { path: "admin/tickets/:id", element: <AdminTicketDetailPage /> },

      // --- TICKETS (technician) ---
      { path: "technician/tickets", element: <TechnicianTicketsPage /> },
      { path: "technician/tickets/:id", element: <TechnicianTicketDetailPage /> },

      // --- NOTIFICATIONS & PROFILE ---
      { path: "notifications", element: <NotificationPanelPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);

export default router;
