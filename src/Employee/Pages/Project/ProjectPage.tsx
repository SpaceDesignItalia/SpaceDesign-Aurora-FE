import { Tabs, Tab, Button, Tooltip, Link, Chip } from "@nextui-org/react";
import { API_URL_IMG } from "../../../API/API";
import FindInPageRoundedIcon from "@mui/icons-material/FindInPageRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import FolderCopyRoundedIcon from "@mui/icons-material/FolderCopyRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ChangeProjectTheme from "../../Components/Project/Other/ChangeProjectTheme";
import OverviewContainer from "../../Components/Project/Other/ProjectPage/OverviewContainer";
import TeamContainer from "../../Components/Project/Other/ProjectPage/TeamContainer";
import TaskContainer from "../../Components/Project/Other/ProjectPage/TaskContainer";
import { usePermissions } from "../../Components/Layout/PermissionProvider";
import TicketContainer from "../../Components/Project/Other/ProjectPage/TicketContainer";
import FolderContainer from "../../Components/Project/Other/ProjectPage/FolderContainer";

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: Date;
  ProjectEndDate: Date;
  CompanyId: number;
  ProjectBannerId: number;
  ProjectBannerPath: string;
  StatusName: string;
  ProjectManagerId: number;
  ProjectManagerFullName: string;
  ProjectManagerEmail: string;
  RoleName: string;
  StafferImageUrl: string;
}

interface ModalData {
  ProjectId: number;
  ProjectBannerId: number;
  open: boolean;
}

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

export default function ProjectPage() {
  const { UniqueCode } = useParams<{
    UniqueCode: string;
  }>();
  const [ProjectId, setProjectId] = useState("");
  const [ProjectName, setProjectName] = useState("");
  const [projectData, setProjectData] = useState<Project>({
    ProjectId: 0,
    ProjectName: "",
    ProjectDescription: "",
    ProjectCreationDate: new Date(),
    ProjectEndDate: new Date(),
    CompanyId: 0,
    ProjectBannerId: 0,
    ProjectBannerPath: "",
    StatusName: "",
    ProjectManagerId: 0,
    StafferImageUrl: "",
    ProjectManagerFullName: "",
    ProjectManagerEmail: "",
    RoleName: "",
  });
  const [modalData, setModalData] = useState<ModalData>({
    ProjectId: 0,
    ProjectBannerId: 0,
    open: false,
  });
  const [activeTab, setActiveTab] = useState(
    getCookie("activeProjectTab") || "Panoramica"
  );
  const [adminPermission, setAdminPermission] = useState({
    editProject: false,
  });
  const { hasPermission } = usePermissions();

  const tabs = [
    { title: "Panoramica", icon: FindInPageRoundedIcon },
    { title: "Tasks", icon: AssignmentTurnedInRoundedIcon },
    { title: "Team", icon: GroupsRoundedIcon },
    { title: "Files", icon: FolderCopyRoundedIcon },
    { title: "Ticket", icon: ConfirmationNumberRoundedIcon },
  ];

  useEffect(() => {
    axios
      .get("/Project/GET/GetProjectByUniqueCode", { params: { UniqueCode } })
      .then((res) => {
        setProjectId(res.data.ProjectId);
        setProjectName(res.data.ProjectName);

        return axios
          .get("/Project/GET/GetProjectByIdAndName", {
            params: {
              ProjectId: res.data.ProjectId,
              ProjectName: res.data.ProjectName,
            },
          })
          .then((res) => {
            setProjectData(res.data);
          });
      })
      .then(() => {
        async function checkPermissions() {
          setAdminPermission({
            editProject: await hasPermission("EDIT_PROJECT"),
          });
        }
        checkPermissions();
      });
  }, [UniqueCode, ProjectId, ProjectName]);

  // Aggiorna il cookie ogni volta che cambia la scheda
  useEffect(() => {
    setCookie("activeProjectTab", activeTab, 7); // Salva per 7 giorni
  }, [activeTab]);

  console.log(projectData.ProjectId);

  return (
    <>
      <ChangeProjectTheme
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        ProjectId={ProjectId ? parseInt(ProjectId) : 0}
        ProjectBannerId={projectData.ProjectBannerId}
      />
      <div className="py-10 m-0 lg:ml-72 h-screen flex flex-col items-start px-4 sm:px-6 lg:px-8">
        <main className="w-full flex flex-col gap-3">
          <div className="flex flex-row justify-between items-center sm:hidden">
            {adminPermission.editProject && (
              <Tooltip
                content="Impostazioni progetto"
                color="primary"
                placement="bottom"
                radius="full"
                closeDelay={0}
              >
                <Button
                  as={Link}
                  color="primary"
                  radius="full"
                  href={"/projects/" + UniqueCode}
                  isIconOnly
                >
                  <TuneRoundedIcon />
                </Button>
              </Tooltip>
            )}
            <Chip color="primary" radius="full">
              {projectData.StatusName}
            </Chip>
          </div>
          <div className="w-full sm:h-60 overflow-hidden rounded-xl relative">
            <img
              src={API_URL_IMG + "/banners/" + projectData.ProjectBannerPath}
              className="w-full h-auto object-cover rotate-180"
              alt="Banner del progetto"
            />
            <div className="absolute top-2 right-2">
              {adminPermission.editProject && (
                <Button
                  color="primary"
                  radius="sm"
                  size="sm"
                  startContent={<ModeOutlinedIcon />}
                  isIconOnly
                  onClick={() => setModalData({ ...modalData, open: true })}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 py-6 lg:py-8 mb-20">
            <header className="flex flex-col xl:justify-between w-full gap-5">
              <div className="flex flex-row items-center gap-3">
                <Chip color="primary" radius="full" className="hidden sm:flex">
                  {projectData.StatusName}
                </Chip>
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 w-full text-wrap">
                  {projectData.ProjectName}
                </h1>
              </div>

              <div className="flex flex-row items-center justify-between sm:justify-end gap-5">
                <div>
                  <Tabs
                    aria-label="Options"
                    color="primary"
                    radius="full"
                    variant="bordered"
                    selectedKey={activeTab}
                    className="hidden sm:flex"
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
                  <div className="sm:hidden bg-white p-4 fixed bottom-0 z-50 w-full left-0 border-t-1 shadow-large rounded-tr-xl rounded-tl-xl">
                    <Tabs
                      aria-label="Options"
                      color="primary"
                      size="lg"
                      variant="light"
                      selectedKey={activeTab}
                      className="sm:hidden"
                      fullWidth
                      onSelectionChange={(key) => setActiveTab(key as string)}
                    >
                      {tabs.map((tab) => (
                        <Tab
                          key={tab.title}
                          title={
                            <div className="flex items-center space-x-2">
                              <tab.icon />
                            </div>
                          }
                        />
                      ))}
                    </Tabs>
                  </div>
                </div>

                {adminPermission.editProject && (
                  <Tooltip
                    content="Impostazioni progetto"
                    color="primary"
                    placement="bottom"
                    radius="full"
                    closeDelay={0}
                  >
                    <Button
                      as={Link}
                      color="primary"
                      radius="full"
                      href={"/projects/" + UniqueCode + "/edit-project"}
                      className="hidden sm:flex"
                      isIconOnly
                    >
                      <TuneRoundedIcon />
                    </Button>
                  </Tooltip>
                )}
              </div>
            </header>
            {activeTab === "Panoramica" && (
              <OverviewContainer projectData={projectData} />
            )}
            {activeTab === "Tasks" && (
              <div>
                <TaskContainer projectData={projectData} />
              </div>
            )}
            {activeTab === "Team" && (
              <div>
                <TeamContainer projectData={projectData} />
              </div>
            )}
            {activeTab === "Files" && (
              <div>
                <FolderContainer projectData={projectData} />
              </div>
            )}
            {activeTab === "Ticket" && (
              <div>
                <TicketContainer projectData={projectData} />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
