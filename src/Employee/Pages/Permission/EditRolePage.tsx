import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EditRoleModel from "../../Components/Permission/Other/EditRoleModel";
import { usePermissions } from "../../Components/Layout/PermissionProvider";
import { useEffect } from "react";

export default function EditRolePage() {
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function fetchData() {
      const permission = await hasPermission("EDIT_ROLE");

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
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900">
            Modifica ruolo
          </h1>
          <Breadcrumbs variant="bordered" radius="full">
            <BreadcrumbItem href="/">
              <DashboardOutlinedIcon />
            </BreadcrumbItem>
            <BreadcrumbItem href="/administration/permission">
              Permessi
            </BreadcrumbItem>
            <BreadcrumbItem>Modifica ruolo</BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          <EditRoleModel />
        </div>
      </main>
    </div>
  );
}
