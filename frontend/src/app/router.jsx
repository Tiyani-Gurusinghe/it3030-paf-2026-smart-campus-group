import { Routes, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/auth/LoginPage";
import UnauthorizedPage from "../pages/auth/UnauthorizedPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ResourceListPage from "../pages/resources/ResourceListPage";
import ResourceDetailsPage from "../pages/resources/ResourceDetailsPage";
import ResourceFormPage from "../pages/resources/ResourceFormPage";
import BookingListPage from "../pages/bookings/BookingListPage";
import BookingDetailsPage from "../pages/bookings/BookingDetailsPage";
import BookingFormPage from "../pages/bookings/BookingFormPage";
import TicketListPage from "../pages/tickets/TicketListPage";
import TicketDetailsPage from "../pages/tickets/TicketDetailsPage";
import TicketFormPage from "../pages/tickets/TicketFormPage";
import NotificationPanelPage from "../pages/notifications/NotificationPanelPage";
import ProfilePage from "../pages/profile/ProfilePage";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="resources" element={<ResourceListPage />} />
        <Route path="resources/:id" element={<ResourceDetailsPage />} />
        <Route path="resources/new" element={<ResourceFormPage />} />
        <Route path="bookings" element={<BookingListPage />} />
        <Route path="bookings/:id" element={<BookingDetailsPage />} />
        <Route path="bookings/new" element={<BookingFormPage />} />
        <Route path="tickets" element={<TicketListPage />} />
        <Route path="tickets/:id" element={<TicketDetailsPage />} />
        <Route path="tickets/new" element={<TicketFormPage />} />
        <Route path="notifications" element={<NotificationPanelPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;