import React from "react";
import ReactDOM from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import { BrowserRouter as Router } from "react-router-dom";
import { PermissionsProvider } from "./Employee/Components/Layout/PermissionProvider";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NextUIProvider>
      <Router>
        <PermissionsProvider>
          <App />
        </PermissionsProvider>
      </Router>
    </NextUIProvider>
  </React.StrictMode>
);
