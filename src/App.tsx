import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import EmployeeDashboard from "./Pages/Employee/EmployeeDashboard";
import AddEmployeePage from "./Pages/Employee/AddEmployeePage";
import EditEmployeePage from "./Pages/Employee/EditEmployeePage";
import Login from "./Pages/Login/Login";

const App: React.FC = () => {
  axios.defaults.baseURL = API_URL;
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get("/Authentication/GET/CheckSession", { withCredentials: true })
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
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="absolute left-0 w-full h-full flex flex-col justify-center items-center">
        <Spinner size="lg" color="danger" />
      </div>
    );
  }

  return (
    <>
      {isAuth && <Sidebar />}
      <Routes>
        <Route element={<Login />} path="/login" />
        <Route
          path="/*"
          element={
            isAuth ? <ProtectedRoutes /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </>
  );
};

const ProtectedRoutes: React.FC = () => {
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
          element={<EmployeeDashboard />}
          path="/administration/employee"
        />
        <Route
          element={<AddEmployeePage />}
          path="/administration/employee/add-employee"
        />
        <Route
          element={<EditEmployeePage />}
          path="/administration/employee/edit-employee/:EmployeeId"
        />
        <Route
          element={<PermissionDashboard />}
          path="/administration/permission"
        />
        <Route
          element={<AddRolePage />}
          path="/administration/permission/add-permission"
        />
      </Route>
    </Routes>
  );
};

export default App;
