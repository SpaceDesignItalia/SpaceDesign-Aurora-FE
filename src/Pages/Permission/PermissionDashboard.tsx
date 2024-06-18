import { useEffect } from "react";
import { usePermissions } from "../../Components/Layout/PermissionProvider";
import RoleTable from "../../Components/Permission/Tables/RoleTable";
import PermissionTable from "../../Components/Permission/Tables/PermissionTable";

export default function PermissionDashboard() {
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function fetchData() {
      const permission = await hasPermission("VIEW_ROLE");

      if (!permission) {
        return (window.location.href = "/");
      }
    }
    fetchData();
  }, [hasPermission]);
  return (
    <div className="py-10 m-0 lg:ml-72">
      <header>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Ruoli
          </h1>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          <RoleTable />
        </div>
        <header>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Permessi
          </h1>
        </header>
        <div className="py-6 lg:py-8">
          <PermissionTable />
        </div>
      </main>
    </div>
  );
}
