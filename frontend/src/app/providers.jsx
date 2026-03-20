import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router";
import { AuthProvider } from "../features/auth/context/AuthContext";

function AppProviders() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppProviders;