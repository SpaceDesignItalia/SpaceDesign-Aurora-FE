import { Tabs, Tab, Chip } from "@nextui-org/react";
import { API_URL_IMG } from "../../../API/API";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import FolderCopyRoundedIcon from "@mui/icons-material/FolderCopyRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import OverviewContainer from "../../Components/Project/Other/ProjectPage/OverviewContainer";
import TicketContainer from "../../Components/Project/Other/ProjectPage/TicketContainer";
import FilesCustomerContainer from "../../Components/Project/Other/ProjectPage/FilesCustomerContainer";

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
  StafferImageUrl: string;
  ProjectManagerFullName: string;
  ProjectManagerEmail: string;
  RoleName: string;
}

export default function ProjectCustomerPage() {
  const { ProjectId, ProjectName, CompanyName } = useParams<{
    ProjectId: string;
    ProjectName: string;
    CompanyName: string;
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
    StafferImageUrl: "",
    ProjectManagerFullName: "",
    ProjectManagerEmail: "",
    RoleName: "",
  });
  const [activeTab, setActiveTab] = useState("Panoramica");

  const tabs = [
    { title: "Panoramica", icon: PublicRoundedIcon },
    { title: "Files", icon: FolderCopyRoundedIcon },
    { title: "Ticket", icon: ConfirmationNumberRoundedIcon },
  ];

  useEffect(() => {
    axios
      .get("/Project/GET/GetProjectByIdAndName", {
        params: { ProjectId: ProjectId, ProjectName: ProjectName },
      })
      .then((res) => {
        setProjectData(res.data);
      });
  }, [ProjectId, ProjectName]);

  return (
    <>
      <div className="py-10 m-0 h-screen flex flex-col items-start px-4 sm:px-6 lg:px-8">
        <main className="w-full">
          <div className="w-full h-60 overflow-hidden rounded-xl relative">
            <img
              src={API_URL_IMG + "/banners/" + projectData.ProjectBannerPath}
              className="w-full h-auto object-cover rotate-180"
              alt="Banner del progetto"
            />
          </div>

          <div className="flex flex-col gap-5 py-6 lg:py-8">
            <header className="flex flex-col md:flex-row md:justify-between w-full gap-5">
              <div className="flex flex-row items-center gap-3">
                <Chip color="primary" radius="sm">
                  {projectData.StatusName}
                </Chip>
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                  {projectData.ProjectName}
                </h1>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
                <Tabs
                  aria-label="Options"
                  aria-labelledby="Navbar"
                  color="primary"
                  radius="sm"
                  variant="bordered"
                  className="hidden sm:flex"
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                >
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.title}
                      aria-labelledby={tab.title}
                      title={
                        <div className="flex items-center space-x-2">
                          <tab.icon />
                          <span>{tab.title}</span>
                        </div>
                      }
                    />
                  ))}
                </Tabs>

                <Tabs
                  aria-label="Options"
                  aria-labelledby="Navbar"
                  color="primary"
                  radius="sm"
                  variant="bordered"
                  className="flex sm:hidden"
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                >
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.title}
                      aria-labelledby={tab.title}
                      title={
                        <div className="flex items-center space-x-2">
                          <tab.icon />
                        </div>
                      }
                    />
                  ))}
                </Tabs>
              </div>
            </header>
            {activeTab === "Panoramica" && (
              <OverviewContainer projectData={projectData} />
            )}
            {activeTab === "Files" && <FilesCustomerContainer />}
            {activeTab === "Ticket" && <TicketContainer />}
          </div>
        </main>
      </div>
    </>
  );
}
