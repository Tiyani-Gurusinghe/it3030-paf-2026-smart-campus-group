import { createBrowserRouter } from "react-router-dom";
import TicketsPage from "../pages/tickets/TicketsPage";
import CreateTicketPage from "../pages/tickets/CreateTicketPage";
import EditTicketPage from "../pages/tickets/EditTicketPage";
import TicketDetailsPage from "../../src/pages/tickets/TicketDetailsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <TicketsPage />,
  },
  {
    path: "/tickets/new",
    element: <CreateTicketPage />,
  },
  {
    path: "/tickets/:id",
    element: <TicketDetailsPage />,
  },
  {
    path: "/tickets/:id/edit",
    element: <EditTicketPage />,
  },
]);

export default router;