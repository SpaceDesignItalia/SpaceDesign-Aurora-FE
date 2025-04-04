import { Tabs, Tab, Chip } from "@heroui/react";
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
  UniqeCode: string;
}

export default function ProjectCustomerPage() {
  const { UniqueCode } = useParams<{
    UniqueCode: string;
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
    UniqeCode: "",
  });
  const [activeTab, setActiveTab] = useState("Panoramica");

  const tabs = [
    { title: "Panoramica", icon: PublicRoundedIcon },
    { title: "Files", icon: FolderCopyRoundedIcon },
    { title: "Ticket", icon: ConfirmationNumberRoundedIcon },
  ];

  useEffect(() => {
    axios
      .get("/Project/GET/GetProjectByUniqueCode", {
        params: { UniqueCode },
      })
      .then((res) => {
        setProjectData(res.data);
      });
  }, [UniqueCode]);

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
                <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900">
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
              </div>
            </header>
            {activeTab === "Panoramica" && (
              <OverviewContainer projectData={projectData} />
            )}
            {activeTab === "Files" && (
              <FilesCustomerContainer projectData={projectData} />
            )}
            {activeTab === "Ticket" && (
              <TicketContainer projectData={projectData} />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
