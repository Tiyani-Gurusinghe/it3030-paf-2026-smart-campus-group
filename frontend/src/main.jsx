import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from './features/auth/context/AuthContext'; // Path might vary

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>  {/* <--- THIS MUST WRAP EVERYTHING */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);