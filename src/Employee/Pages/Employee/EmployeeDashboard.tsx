import EmployeeTable from "../../Components/Employee/Tables/EmployeeTable";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { usePermissions } from "../../Components/Layout/PermissionProvider";
import { useEffect } from "react";
import EmployeeStats from "../../Components/Employee/Other/EmployeeStats";

export default function EmployeeDashboard() {
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function fetchData() {
      const permission = await hasPermission("VIEW_EMPLOYEE");

      if (!permission) {
        return (window.location.href = "/");
      }
    }
    fetchData();
  }, [hasPermission]);
  return (
    <div className="py-10 m-0 lg:ml-72">
      <header>
        <div className="flex flex-col gap-3 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Dipendenti
          </h1>
          <Breadcrumbs variant="bordered" radius="full">
            <BreadcrumbItem href="/">
              <DashboardOutlinedIcon />
            </BreadcrumbItem>
            <BreadcrumbItem href="/administration/employee">
              Dipendenti
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <EmployeeStats />
        <div className="py-6 lg:py-8">
          <EmployeeTable />
        </div>
      </main>
    </div>
  );
}
