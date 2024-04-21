import CompanyTable from "../../Components/Customer/Tables/CompanyTable";
import CustomersTable from "../../Components/Customer/Tables/CustomersTable";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

export default function CustomerDashboard() {
  return (
    <div className="py-10 m-0 lg:ml-72">
      <header>
        <div className="flex flex-col gap-3 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Clienti
          </h1>
          <Breadcrumbs variant="bordered" radius="sm">
            <BreadcrumbItem href="/">
              <DashboardOutlinedIcon />
            </BreadcrumbItem>
            <BreadcrumbItem href="/administration/customer">
              Clienti
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          <CustomersTable />
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
          Aziende
        </h1>
        <div className="py-6 lg:py-8">
          <CompanyTable />
        </div>
      </main>
    </div>
  );
}
