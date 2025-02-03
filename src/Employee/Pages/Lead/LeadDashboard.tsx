import LeadTable from "../../Components/Lead/Tables/LeadTable";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { usePermissions } from "../../Components/Layout/PermissionProvider";
import { useEffect } from "react";
import LeadStats from "../../Components/Lead/Other/LeadStats";
import LeadGraph from "../../Components/Lead/Other/LeadGraph";

export default function LeadDashboard() {
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function fetchData() {
      const permission = await hasPermission("VIEW_LEAD");
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
            Lead
          </h1>
          <Breadcrumbs variant="bordered" radius="sm">
            <BreadcrumbItem href="/">
              <DashboardOutlinedIcon />
            </BreadcrumbItem>
            <BreadcrumbItem href="/administration/lead">Lead</BreadcrumbItem>
          </Breadcrumbs>
          <LeadStats />
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          <LeadTable />
        </div>
        <LeadGraph />
      </main>
    </div>
  );
}
