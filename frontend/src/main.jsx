// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./index.css";
// import { AuthProvider } from './features/auth/context/AuthContext'; // Path might vary

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <AuthProvider>  {/* <--- THIS MUST WRAP EVERYTHING */}
//       <App />
//     </AuthProvider>
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client'; // This is the line you were missing!
import { RouterProvider } from 'react-router-dom';
import router from './app/router'; 
import { AuthProvider } from './features/auth/context/AuthContext'; 
import './index.css'; 

// Make sure the path to 'router' and 'AuthProvider' matches your folder structure

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);