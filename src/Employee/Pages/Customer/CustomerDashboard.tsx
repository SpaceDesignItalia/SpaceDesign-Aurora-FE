import { usePermissions } from "../../Components/Layout/PermissionProvider";
import CompanyTable from "../../Components/Customer/Tables/CompanyTable";
import CustomersTable from "../../Components/Customer/Tables/CustomersTable";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { useState, useEffect } from "react";
import CustomerStats from "../../Components/Customer/Other/CustomerStats";
import { Icon } from "@iconify/react";
export default function CustomerDashboard() {
  const { hasPermission } = usePermissions();
  const [permissions, setPermissions] = useState({
    customer: false,
    company: false,
  });

  useEffect(() => {
    async function fetchData() {
      const customer = await hasPermission("VIEW_CUSTOMER");
      const company = await hasPermission("VIEW_COMPANY");

      setPermissions({
        customer,
        company,
      });
      if (!customer && !company) {
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
            Clienti
          </h1>
          <Breadcrumbs variant="bordered" radius="full">
            <BreadcrumbItem href="/">
              <Icon icon="solar:home-2-linear" fontSize={18} />
            </BreadcrumbItem>
            <BreadcrumbItem href="/administration/customer">
              Clienti
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <CustomerStats />
        <div className="py-6 lg:py-8">
          {permissions.customer && <CustomersTable />}
        </div>
        {permissions.company && (
          <>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Aziende
            </h1>
            <div className="py-6 lg:py-8">
              <CompanyTable />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
