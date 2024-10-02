import React, { useState, useEffect } from "react";
import { usePermissions } from "./Employee/Components/Layout/PermissionProvider";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Spinner } from "@nextui-org/react";
import axios from "axios";
import { API_URL } from "./API/API";
import Dashboard from "./Employee/Pages/Dashboard/Dashboard";
import Sidebar from "./Employee/Components/Layout/Sidebar";
import CustomerDashboard from "./Employee/Pages/Customer/CustomerDashboard";
import PermissionDashboard from "./Employee/Pages/Permission/PermissionDashboard";
import AddCustomerPage from "./Employee/Pages/Customer/AddCustomerPage";
import AddCompanyPage from "./Employee/Pages/Customer/AddCompanyPage";
import EditCompanyPage from "./Employee/Pages/Customer/EditCompanyPage";
import EditCustomerPage from "./Employee/Pages/Customer/EditCustomerPage";
import AddRolePage from "./Employee/Pages/Permission/AddRolePage";
import EmployeeDashboard from "./Employee/Pages/Employee/EmployeeDashboard";
import AddEmployeePage from "./Employee/Pages/Employee/AddEmployeePage";
import EditEmployeePage from "./Employee/Pages/Employee/EditEmployeePage";
import Login from "./Employee/Pages/Login/Login";
import EditRolePage from "./Employee/Pages/Permission/EditRolePage";
import ChatDashboard from "./Employee/Pages/Chat/ChatDashboard";
import AddProjectPage from "./Employee/Pages/Project/AddProjectPage";
import ProjectDashboard from "./Employee/Pages/Project/ProjectDashboard";
import ProjectPage from "./Employee/Pages/Project/ProjectPage";
import EditPermissionPage from "./Employee/Pages/Permission/EditPermissionPage";
import AddPermissionPage from "./Employee/Pages/Permission/AddPermissionPage";
import EditProjectPage from "./Employee/Pages/Project/EditProjectPage";
import LeadDashboard from "./Employee/Pages/Lead/LeadDashboard";

import DashboardCustomer from "./Customer/Pages/Dashboard/DashboardCustomer";
import Navbar from "./Customer/Components/Layout/Navbar";
import Error404 from "./Employee/Pages/Errors/Error404";
import ProjectCustomerDashboard from "./Customer/Pages/Project/ProjectCustomerDashboard";
import ProjectCustomerPage from "./Customer/Pages/Project/ProjectCustomerPage";
import AddTicketPage from "./Customer/Pages/Project/AddTicketPage";
import SettingsDashboard from "./Employee/Pages/Settings/SettingsDashboard";
import SettingsCustomerDashboard from "./Customer/Pages/Settings/SettingsCustomerDashboard";

import PasswordRecovery from "./Employee/Components/Login/PasswordRecovery";
import PasswordReset from "./Employee/Components/Login/PasswordReset";

const App: React.FC = () => {
  axios.defaults.baseURL = API_URL;
  axios.defaults.withCredentials = true;
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStaffer, setIsStaffer] = useState<boolean>(false);
  const { loadPermissions, setStafferId, permissionsLoaded } = usePermissions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/Authentication/GET/CheckSession", {
          withCredentials: true,
        });

        if (res.status === 200 && res.data) {
          setIsAuth(true);
          const sessionRes = await axios.get(
            "/Authentication/GET/GetSessionData",
            {
              withCredentials: true,
            }
          );
          if (
            sessionRes.status === 200 &&
            sessionRes.data &&
            sessionRes.data.IsStaffer
          ) {
            setIsStaffer(sessionRes.data.IsStaffer);
            console.log(isStaffer);
            await loadPermissions(sessionRes.data.StafferId);
          }
        } else {
          setIsAuth(false);
        }
      } catch (error) {
        console.error("Errore durante il controllo della sessione:", error);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loadPermissions, permissionsLoaded, setStafferId]);

  if (isLoading) {
    return (
      <div className="absolute left-0 w-full h-full flex flex-col justify-center items-center">
        <Spinner size="lg" color="danger" />
      </div>
    );
  }

  return (
    <>
      {isAuth && isStaffer && <Sidebar />}
      {isAuth && !isStaffer && <Navbar />}
      <Routes>
        <Route path="/password-recovery" element={<PasswordRecovery />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        {!isAuth && <Route element={<Login />} path="/login" />}
        <Route
          path="/*"
          element={
            isAuth ? (
              isStaffer ? (
                <EmployeeProtectedRoutes />
              ) : (
                <CustomerProtectedRoutes />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
};

const CustomerProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route element={<DashboardCustomer />} path="/" />
        <Route element={<SettingsCustomerDashboard />} path="/settings" />
        <Route element={<ProjectCustomerDashboard />} path="/projects" />
        <Route
          element={<ProjectCustomerPage />}
          path="/projects/:CompanyName/:ProjectId/:ProjectName"
        />
        <Route
          element={<AddTicketPage />}
          path="/projects/:CompanyName/:ProjectId/:ProjectName/open-new-ticket"
        />
      </Route>
    </Routes>
  );
};

const EmployeeProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="*" element={<Error404 />} />
        <Route path="/settings" element={<SettingsDashboard />} />
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
          path="/administration/permission/add-role"
        />
        <Route
          element={<AddPermissionPage />}
          path="/administration/permission/add-permission"
        />
        <Route
          element={<EditRolePage />}
          path="/administration/permission/edit-role/:RoleId"
        />
        <Route element={<ChatDashboard />} path="/comunications/chat" />
        <Route element={<ProjectDashboard />} path="/projects" />
        <Route element={<AddProjectPage />} path="/projects/add-project" />
        <Route
          element={<ProjectPage />}
          path="/projects/:CompanyName/:ProjectId/:ProjectName"
        />
        <Route
          element={<EditProjectPage />}
          path="/projects/:CompanyName/:ProjectId/:ProjectName/edit-project"
        />
        <Route
          element={<EditPermissionPage />}
          path="/administration/permission/edit-permission/:PermissionId"
        />
        <Route element={<LeadDashboard />} path="/lead" />
      </Route>
    </Routes>
  );
};

export default App;
