import { Button, Progress, cn, User, Tooltip, Link } from "@nextui-org/react";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ModeEditRoundedIcon from "@mui/icons-material/ModeEditRounded";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import AddProjectLink from "../AddProjectLink";
import axios from "axios";
import { API_URL_IMG } from "../../../../../API/API";
import DeleteLinkModal from "../DeleteLinkModal";

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

interface ModalData {
  ProjectId: number;
  open: boolean;
}

interface ModalEditData {
  Links: Link[];
  open: boolean;
}

interface Link {
  ProjectId: number;
  ProjectLinkTitle: string;
  ProjectLinkUrl: string;
  ProjectLinkTypeId: number;
  ProjectLinkTypeImage: string;
}

export default function OverviewContainer({
  projectData,
}: {
  projectData: Project;
}) {
  const [modalData, setModalData] = useState<ModalData>({
    ProjectId: 0,
    open: false,
  });

  const [modalEditData, setModalEditData] = useState<ModalEditData>({
    Links: new Array<Link>(),
    open: false,
  });

  const daysUntilDeadline =
    dayjs(projectData.ProjectEndDate).diff(dayjs(), "day") + 1;
  const totalDays =
    dayjs(projectData.ProjectEndDate).diff(
      dayjs(projectData.ProjectCreationDate),
      "day"
    ) + 1;
  const progressPercent = Math.floor(
    ((totalDays - daysUntilDeadline) / totalDays) * 100
  );

  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    axios
      .get("/Project/GET/GetAllLinkByProjectId", {
        params: { ProjectId: projectData.ProjectId },
      })
      .then((res) => {
        setLinks(res.data);
      });
  }, [projectData.ProjectId]);

  function calculateDeadline() {
    if (daysUntilDeadline < 0) {
      return <p className="text-red-500">Scaduto</p>;
    }
    return <>{daysUntilDeadline} g</>;
  }

  function DeleteLink(LinkId: number) {
    axios
      .delete("/Project/DELETE/RemoveLinkFromProject", {
        params: { ProjectLinkId: LinkId, ProjectId: projectData.ProjectId },
      })
      .then((res) => {
        if (res.status === 200) {
          window.location.reload();
        }
      });
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-5 h-screen">
        <div className="grid grid-cols-1 xl:grid-cols-6 gap-6 col-span-6 md:col-span-4">
          <div className="border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6 col-span-6 xl:col-span-6 h-fit">
            <h1 className="text-xl font-bold mb-4">Dettagli progetto</h1>

            <p className="text-gray-600 mb-4">
              {projectData.ProjectDescription}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <h1 className="text-sm font-semibold">Data di creazione</h1>
                <p className="text-gray-600">
                  {dayjs(projectData.ProjectCreationDate).format("DD/MM/YYYY")}
                </p>
              </div>
              <div>
                <h1 className="text-sm font-semibold">Deadline</h1>
                <p className="text-gray-600">
                  {dayjs(projectData.ProjectEndDate).format("DD/MM/YYYY")}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 items-start">
              <h1 className="text-sm font-semibold">Project manager</h1>
              <User
                name={projectData.ProjectManagerFullName}
                description={projectData.RoleName}
                avatarProps={{
                  src:
                    projectData.StafferImageUrl &&
                    API_URL_IMG +
                      "/profileIcons/" +
                      projectData.StafferImageUrl,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 col-span-6  md:col-span-2">
          <div className="border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold mb-4">Completato</h1>
              <span className="font-bold">
                {progressPercent >= 100 ? 100 : progressPercent}%
              </span>
            </div>
            <Progress
              value={progressPercent >= 100 ? 100 : progressPercent}
              color="primary"
              size="sm"
            />
          </div>
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            <div className="flex flex-row items-center justify-between border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6">
              <div className="flex flex-col items-start">
                <h1 className="font-bold">Tempo rimanente</h1>
                <span
                  className={cn(
                    "font-semibold text-gray-500",
                    progressPercent >= 70 &&
                      progressPercent < 85 &&
                      "text-orange-500",
                    progressPercent >= 85 && "text-red-500"
                  )}
                >
                  {calculateDeadline()}
                </span>
              </div>
              <TimerRoundedIcon className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
