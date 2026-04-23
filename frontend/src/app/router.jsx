import { createBrowserRouter } from "react-router-dom";

// Auth & Layout
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

// Add these imports to match your file structure (adjust paths if needed)
import DashboardPage from "../pages/dashboard/DashboardPage";
import ResourceListPage from "../pages/resources/ResourceListPage";
import ResourceFormPage from "../pages/resources/ResourceFormPage";
import ResourceDetailsPage from "../pages/resources/ResourceDetailsPage";
import BookingListPage from "../pages/bookings/BookingListPage";
import BookingFormPage from "../pages/bookings/BookingFormPage";
import BookingDetailsPage from "../pages/bookings/BookingDetailsPage";
import TicketsPage from "../pages/tickets/TicketsPage";
import CreateTicketPage from "../pages/tickets/CreateTicketPage";
import TicketDetailsPage from "../pages/tickets/TicketDetailsPage";
import NotificationPanelPage from "../pages/notifications/NotificationPanelPage";
import ProfilePage from "../pages/profile/ProfilePage";
import EditTicketPage from "../pages/tickets/EditTicketPage";
import UnauthorizedPage from "../pages/auth/UnauthorizedPage";

const router = createBrowserRouter([
  // Public
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
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
      // Default / Index Route
      {
        index: true,
        element: <DashboardPage />,
      },
      
      // --- RESOURCES ---
      { path: "resources", element: <ResourceListPage /> },
      { path: "resources/new", element: <ResourceFormPage /> },
      { path: "resources/edit/:id", element: <ResourceFormPage /> },
      { path: "resources/:id", element: <ResourceDetailsPage /> },

      // --- BOOKINGS ---
      { path: "bookings", element: <BookingListPage /> },
      { path: "bookings/new", element: <BookingFormPage /> },
      { path: "bookings/:id", element: <BookingDetailsPage /> },

      // --- TICKETS ---
      { path: "tickets", element: <TicketsPage /> },
      { path: "tickets/new", element: <CreateTicketPage /> },
      { path: "tickets/:id", element: <TicketDetailsPage /> },
      { path: "tickets/:id/edit", element: <EditTicketPage /> },

      // --- NOTIFICATIONS & PROFILE ---
      { path: "notifications", element: <NotificationPanelPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);

// Only ONE default export at the bottom!
export default router;