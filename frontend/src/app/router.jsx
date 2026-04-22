import { createBrowserRouter } from "react-router-dom";

// Auth & Layout
import LoginPage from "../pages/auth/LoginPage";
import UnauthorizedPage from "../pages/auth/UnauthorizedPage";
import { AuthProvider } from "../features/auth/context/AuthContext";
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
import MyTicketsPage from "../pages/tickets/MyTicketsPage"; // Added missing import

// Misc
import NotificationPanelPage from "../pages/notifications/NotificationPanelPage";
import ProfilePage from "../pages/profile/ProfilePage";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> }, // Added this for security redirects
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // This handles the base "/" URL
        element: <DashboardPage />,
      },
      {
        path: "dashboard", // 🚨 ADDED THIS: This handles the "/dashboard" URL
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
      { path: "tickets/my", element: <MyTicketsPage /> },
      { path: "tickets/new", element: <CreateTicketPage /> },
      { path: "tickets/create", element: <CreateTicketPage /> },
      { path: "tickets/:id", element: <TicketDetailsPage /> },
      //{ path: "tickets/:id/edit", element: <EditTicketPage /> },

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