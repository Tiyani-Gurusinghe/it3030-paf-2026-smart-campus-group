import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import router from "./router";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

function AppProviders() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default AppProviders;
