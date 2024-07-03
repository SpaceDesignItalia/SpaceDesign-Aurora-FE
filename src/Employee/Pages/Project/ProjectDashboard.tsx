import { useEffect } from "react";
import { usePermissions } from "../../Components/Layout/PermissionProvider";
import ProjectTable from "../../Components/Project/Table/ProjectTable";

export default function ProjectDashboard() {
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function fetchData() {
      const permission = await hasPermission("VIEW_PROJECT");

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
            Progetti
          </h1>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          <ProjectTable />
        </div>
      </main>
    </div>
  );
}
