import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import EditPermissionModel from "../../Components/Permission/Other/EditPermissionModel";
import { usePermissions } from "../../Components/Layout/PermissionProvider";
import { useEffect } from "react";
import { Icon } from "@iconify/react";

export default function EditPermissionPage() {
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function fetchData() {
      const permission = await hasPermission("EDIT_PERMISSION");

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
            Modifica permesso
          </h1>
          <Breadcrumbs variant="bordered" radius="full">
            <BreadcrumbItem href="/">
              <Icon icon="solar:home-2-linear" fontSize={18} />
            </BreadcrumbItem>
            <BreadcrumbItem href="/administration/permission">
              Permessi
            </BreadcrumbItem>
            <BreadcrumbItem>Modifica permesso</BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          <EditPermissionModel />
        </div>
      </main>
    </div>
  );
}
