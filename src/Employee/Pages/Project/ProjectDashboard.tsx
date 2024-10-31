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
import ProjectList from "../../Components/Project/Table/ProjectList";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import axios from "axios";
import dayjs from "dayjs";

// Funzione per impostare un cookie
function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; Secure; SameSite=Strict`;
  document.cookie = cookieString;
}

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop();
    if (cookieValue) {
      return cookieValue.split(";").shift();
    }
  }
  return undefined;
}

const exportCSV = async () => {
  const headers = [
    "Id Progetto",
    "Nome Progetto",
    "Azienda",
    "Data inizio",
    "Data fine",
    "Project Manager",
    "Stato",
  ];

  const wrapInQuotes = (value: any) => {
    return typeof value === "string" ? `"${value}"` : value;
  };

  try {
    const response = await axios.get("/Project/GET/GetAllProjectsTable");
    const projects = response.data;

    const rows = [];
    projects.forEach((project) => {
      rows.push([
        wrapInQuotes(project.ProjectId),
        wrapInQuotes(project.ProjectName),
        wrapInQuotes(project.CompanyName),
        wrapInQuotes(dayjs(project.ProjectCreationDate).format("DD/MM/YYYY")),
        wrapInQuotes(dayjs(project.ProjectEndDate).format("DD/MM/YYYY")),
        wrapInQuotes(project.ProjectManagerName),
        wrapInQuotes(project.StatusName),
      ]);
    });

    let csvContent =
      "data:text/csv;charset=utf-8," +
      headers.map(wrapInQuotes).join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "projects_table.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Errore nell'esportazione dei progetti:", error);
  }
};

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

  useEffect(() => {
    setCookie("activeTab", activeTab, 7);
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
              <div className="flex flex-row w-full items-center gap-3 justify-end">
                <Button
                  color="primary"
                  radius="full"
                  startContent={<FileDownloadOutlinedIcon />}
                  onClick={exportCSV}
                >
                  Esporta tabella progetti
                </Button>
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
            {activeTab === "Lista" && <ProjectList />}
          </div>
        </div>
      </main>
    </div>
  );
}
