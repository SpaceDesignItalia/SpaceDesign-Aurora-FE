import { useState, useEffect } from "react";
import { usePermissions } from "../../Components/Layout/PermissionProvider";
import RoleTable from "../../Components/Permission/Tables/RoleTable";
import PermissionTable from "../../Components/Permission/Tables/PermissionTable";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";

export default function PermissionDashboard() {
  const { hasPermission } = usePermissions();
  const [permissions, setPermissions] = useState({
    role: false,
    permission: false,
  });

  useEffect(() => {
    async function fetchData() {
      const role = await hasPermission("VIEW_ROLE");
      const permission = await hasPermission("VIEW_PERMISSION");

      setPermissions({
        role,
        permission,
      });
      if (!role && !permission) {
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
            Ruoli
          </h1>
          <Breadcrumbs variant="bordered" radius="full">
            <BreadcrumbItem href="/">
              <DashboardOutlinedIcon />
            </BreadcrumbItem>
            <BreadcrumbItem href="/administration/permission">
              Ruoli
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">{permissions.role && <RoleTable />}</div>
        {permissions.permission && (
          <>
            <header>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Permessi
              </h1>
            </header>
            <div className="py-6 lg:py-8">
              <PermissionTable />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
