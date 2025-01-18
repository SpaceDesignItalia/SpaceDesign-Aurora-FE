import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { BrowserRouter as Router } from "react-router-dom";
import { PermissionsProvider } from "./Employee/Components/Layout/PermissionProvider";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <Router>
        <PermissionsProvider>
          <App />
        </PermissionsProvider>
      </Router>
    </HeroUIProvider>
  </React.StrictMode>
);
