import { Tabs, Tab, Button, Tooltip } from "@nextui-org/react";
import { API_URL_IMG } from "../../API/API";
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
}

interface ModalData {
  ProjectId: number;
  ProjectBannerId: number;
  open: boolean;
}

export default function ProjectPage() {
  const { ProjectId, ProjectName } = useParams<{
    ProjectId: string;
    ProjectName: string;
  }>();
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
    ProjectManagerFullName: "",
    ProjectManagerEmail: "",
    RoleName: "",
  });

  const [modalData, setModalData] = useState<ModalData>({
    ProjectId: 0,
    ProjectBannerId: 0,
    open: false,
  });

  const [activeTab, setActiveTab] = useState("Panoramica");

  const tabs = [
    { title: "Panoramica", icon: FindInPageRoundedIcon },
    { title: "Tasks", icon: AssignmentTurnedInRoundedIcon },
    { title: "Team", icon: GroupsRoundedIcon },
    { title: "Files", icon: FolderCopyRoundedIcon },
    { title: "Ticket", icon: ConfirmationNumberRoundedIcon },
  ];

  useEffect(() => {
    axios
      .get("/Project/GET/GetProjectByIdAndName", {
        params: { ProjectId: ProjectId, ProjectName: ProjectName },
      })
      .then((res) => {
        console.log(res.data);
        setProjectData(res.data);
      });
  }, [ProjectId, ProjectName]);

  return (
    <>
      <ChangeProjectTheme
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        ProjectId={ProjectId ? parseInt(ProjectId) : 0}
        ProjectBannerId={projectData.ProjectBannerId}
      />
      <div className="py-10 m-0 lg:ml-72 h-screen flex flex-col items-start px-4 sm:px-6 lg:px-8">
        <main className="w-full">
          <div className="w-full h-60 overflow-hidden rounded-xl relative">
            <img
              src={API_URL_IMG + "/banners/" + projectData.ProjectBannerPath}
              className="w-full h-auto object-cover rotate-180"
              alt="Banner del progetto"
            />
            <div className="absolute top-2 right-2">
              <Button
                color="primary"
                radius="sm"
                size="sm"
                isIconOnly
                onClick={() => setModalData({ ...modalData, open: true })}
              >
                <ModeOutlinedIcon />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-5 py-6 lg:py-8">
            <header className="flex flex-col xl:flex-row xl:justify-between w-full gap-5">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                {projectData.ProjectName}
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Tabs
                  aria-label="Options"
                  color="primary"
                  radius="sm"
                  variant="bordered"
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
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
                      itemKey={tab.title}
                    />
                  ))}
                </Tabs>
                <Tooltip
                  content="Impostazioni progetto"
                  color="primary"
                  placement="bottom"
                  closeDelay={0}
                >
                  <Button color="primary" radius="sm" isIconOnly>
                    <TuneRoundedIcon />
                  </Button>
                </Tooltip>
              </div>
            </header>
            {activeTab === "Panoramica" && (
              <OverviewContainer projectData={projectData} />
            )}
            {activeTab === "Tasks" && <div>Tasks content</div>}
            {activeTab === "Team" && (
              <div>
                <TeamContainer />
              </div>
            )}
            {activeTab === "Files" && <div>Files content</div>}
            {activeTab === "Ticket" && <div>Ticket content</div>}
          </div>
        </main>
      </div>
    </>
  );
}