import React, { useState, useEffect } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Spinner } from "@nextui-org/react";
import axios from "axios";
import { API_URL } from "./API/API";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Sidebar from "./Components/Layout/Sidebar";
import CustomerDashboard from "./Pages/Customer/CustomerDashboard";
import PermissionDashboard from "./Pages/Permission/PermissionDashboard";
import AddCustomerPage from "./Pages/Customer/AddCustomerPage";
import AddCompanyPage from "./Pages/Customer/AddCompanyPage";
import EditCompanyPage from "./Pages/Customer/EditCompanyPage";
import EditCustomerPage from "./Pages/Customer/EditCustomerPage";
import AddRolePage from "./Pages/Permission/AddRolePage";

const App: React.FC = () => {
  axios.defaults.baseURL = API_URL;
  const [isAuth, setIsAuth] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /* useEffect(() => {
    axios
      .get(API_URL + "/Customer/CheckSession", { withCredentials: true })
      .then((res) => {
        if (res.status === 200 && res.data) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      })
      .catch((err) => {
        console.error("Errore durante il controllo della sessione:", err);
        setIsAuth(false);
      })
      .finally(() => {
        setIsLoading(false); // Aggiorna lo stato di caricamento quando la richiesta è completata
      });
  }, []); */

  if (isLoading) {
    return (
      <div className="absolute left-0 w-full h-full flex flex-col justify-center items-center">
        <Spinner size="lg" color="danger" />
      </div>
    );
  }

  return (
    <>
      <Sidebar />

      <Routes>{/* <Route element={<Dashboard />} path="/login" /> */}</Routes>
      <ProtectedRoutes isAuth={isAuth} />
    </>
  );
};

const ProtectedRoutes: React.FC<{ isAuth: boolean }> = ({ isAuth }) => {
  // Definiamo i percorsi protetti
  const protectedPaths = ["/"];

  // Verifichiamo se l'utente sta tentando di accedere a un percorso protetto
  const isAccessingProtectedPath = protectedPaths.some((path) =>
    window.location.pathname.startsWith(path)
  );

  // Se l'utente non è autenticato e sta tentando di accedere a un percorso protetto, lo reindirizziamo a /
  if (!isAuth && isAccessingProtectedPath) {
    return <Navigate to="/login" />;
  }

  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route element={<Dashboard />} path="/" />
        <Route
          element={<CustomerDashboard />}
          path="/administration/customer"
        />
        <Route
          element={<AddCustomerPage />}
          path="/administration/customer/add-customer"
        />
        <Route
          element={<EditCustomerPage />}
          path="/administration/customer/edit-customer/:CustomerId"
        />
        <Route
          element={<AddCompanyPage />}
          path="/administration/customer/add-company"
        />
        <Route
          element={<EditCompanyPage />}
          path="/administration/customer/edit-company/:CompanyId/:CompanyName"
        />
        <Route
          element={<PermissionDashboard />}
          path="/administration/permission"
        />
        <Route
          element={<AddRolePage />}
          path="/administration/permission/add-permission"
        />
        <Route
          //element={<EditRolePage />}
          path="/administration/permission/edit-permission"
        />
      </Route>
    </Routes>
  );
};

export default App;
