import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { usePermissions } from "../../Components/Layout/PermissionProvider";
import { useEffect } from "react";
import EditProjectModel from "../../Components/Project/Other/EditProjectModel";

export default function EditProjectPage() {
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function fetchData() {
      const permission = await hasPermission("EDIT_PROJECT");

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
            Modifica progetto
          </h1>
          <Breadcrumbs variant="bordered" radius="full">
            <BreadcrumbItem href="/">
              <DashboardOutlinedIcon />
            </BreadcrumbItem>
            <BreadcrumbItem href="/projects">Progetti</BreadcrumbItem>
            <BreadcrumbItem>Modifica progetto</BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          <EditProjectModel />
        </div>
      </main>
    </div>
  );
}
