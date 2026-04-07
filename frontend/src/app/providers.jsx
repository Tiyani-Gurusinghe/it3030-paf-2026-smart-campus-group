import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthContext";
import router from "./router";

function AppProviders() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default AppProviders;
