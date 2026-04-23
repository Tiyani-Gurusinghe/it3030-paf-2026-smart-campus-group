import { createBrowserRouter } from "react-router-dom";

// Auth & Layout
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import UnauthorizedPage from "../pages/auth/UnauthorizedPage"; // Added missing import
import { AuthProvider } from "../features/auth/context/AuthContext"; // Import the Provider
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

// Tickets
import TicketsPage from "../pages/tickets/TicketsPage";
import CreateTicketPage from "../pages/tickets/CreateTicketPage";
import TicketDetailsPage from "../pages/tickets/TicketDetailsPage";
import EditTicketPage from "../pages/tickets/EditTicketPage"; // Added missing import

// Misc
import NotificationPanelPage from "../pages/notifications/NotificationPanelPage";
import ProfilePage from "../pages/profile/ProfilePage";

const router = createBrowserRouter([
  // --- PUBLIC ROUTES ---
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },

  // --- PROTECTED ROUTES ---
  {
    path: "/",
    element: (
      /* Wrapping AuthProvider here ensures all protected 
         routes have access to 'isAuthenticated' 
      */
      <AuthProvider> 
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      
      // --- RESOURCES (Your Hierarchy Work) ---
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

export default router;