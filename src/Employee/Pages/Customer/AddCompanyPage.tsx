import { usePermissions } from "../../Components/Layout/PermissionProvider";
import AddCompanyModel from "../../Components/Customer/Other/AddCompanyModel";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { useEffect } from "react";
import { Icon } from "@iconify/react";

export default function AddCompanyPage() {
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function fetchData() {
      const permission = await hasPermission("CREATE_COMPANY");

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
            Aggiungi azienda
          </h1>
          <Breadcrumbs variant="bordered" radius="full">
            <BreadcrumbItem href="/">
              <Icon icon="solar:home-2-linear" fontSize={18} />
            </BreadcrumbItem>
            <BreadcrumbItem href="/administration/customer">
              Clienti
            </BreadcrumbItem>
            <BreadcrumbItem>Aggiungi azienda</BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          <AddCompanyModel />
        </div>
      </main>
    </div>
  );
}
