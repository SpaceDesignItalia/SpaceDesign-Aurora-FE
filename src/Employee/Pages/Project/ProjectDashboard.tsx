import { useEffect, useState } from "react";
import { usePermissions } from "../../Components/Layout/PermissionProvider";
import ProjectGrid from "../../Components/Project/Table/ProjectGrid";
import ProjectChart from "../../Components/Project/Other/ProjectChart";
import { Tab, Tabs, Button, Link } from "@nextui-org/react";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import VerticalSplitRoundedIcon from "@mui/icons-material/VerticalSplitRounded";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import ProjectTable from "../../Components/Project/Table/ProjectTable";

// Funzione per impostare un cookie
function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  // Construct the cookie string
  const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; Secure; SameSite=Strict`;

  document.cookie = cookieString;
}

// Funzione per ottenere un cookie
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop(); // Questo può essere undefined
    if (cookieValue) {
      return cookieValue.split(";").shift(); // Restituisce il valore del cookie
    }
  }
  return undefined; // Restituisce undefined se il cookie non esiste
}

export default function ProjectDashboard() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<string>(
    getCookie("activeTab") || "Grid"
  );
  const [adminPermission, setAdminPermission] = useState<{
    addProject: boolean;
  }>({
    addProject: false,
  });

  const tabs = [
    { title: "Griglia", icon: GridViewRoundedIcon },
    { title: "Tabella", icon: VerticalSplitRoundedIcon },
    { title: "Lista", icon: ViewListRoundedIcon },
  ];

  useEffect(() => {
    async function fetchData() {
      const permission = await hasPermission("VIEW_PROJECT");
      setAdminPermission({
        addProject: await hasPermission("CREATE_PROJECT"),
      });
      if (!permission) {
        return (window.location.href = "/");
      }
    }
    fetchData();
  }, [hasPermission]);

  // Aggiorna il cookie ogni volta che cambia la scheda
  useEffect(() => {
    setCookie("activeTab", activeTab, 7); // Salva per 7 giorni
  }, [activeTab]);

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
        <div className="py-6 lg:py-6">
          <ProjectChart />
        </div>
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center"
          >
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900">
              Progetti
            </span>
          </div>
        </div>
        <div className="py-6 lg:py-6">
          <div className="flex flex-row justify-between w-full">
            <Tabs
              aria-label="Options"
              color="primary"
              radius="full"
              variant="underlined"
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.title}
                  title={
                    <div className="flex items-center space-x-2">
                      <tab.icon />
                      <span>{tab.title}</span>
                    </div>
                  }
                />
              ))}
            </Tabs>
            {adminPermission.addProject && (
              <div className="flex flex-row w-full items-center justify-end">
                <Button
                  as={Link}
                  color="primary"
                  radius="full"
                  startContent={<CreateNewFolderIcon />}
                  href="/projects/add-project"
                  className="hidden sm:flex"
                >
                  Crea progetto
                </Button>
                <Button
                  as={Link}
                  color="primary"
                  radius="full"
                  href="/projects/add-project"
                  className="sm:hidden"
                  isIconOnly
                >
                  <CreateNewFolderIcon />
                </Button>
              </div>
            )}
          </div>
          <div className="py-5">
            {activeTab === "Griglia" && <ProjectGrid />}
            {activeTab === "Tabella" && <ProjectTable />}
            {activeTab === "Lista" && <div>Testone</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
