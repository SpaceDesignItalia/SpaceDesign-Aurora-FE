import { Button, Progress, cn, User, Tooltip, Link } from "@nextui-org/react";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ModeEditRoundedIcon from "@mui/icons-material/ModeEditRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import AddProjectLink from "../AddProjectLink";
import axios from "axios";
import { API_URL_IMG } from "../../../../../API/API";
import DeleteLinkModal from "../DeleteLinkModal";
import { usePermissions } from "../../../Layout/PermissionProvider";
import StatusAlert from "../../../Layout/StatusAlert";

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
  Links: Link[];
}

interface ModalEditData {
  Links: Link[];
  open: boolean;
}

interface Link {
  ProjectId: number;
  ProjectLinkId: number;
  ProjectLinkTitle: string;
  ProjectLinkUrl: string;
  ProjectLinkTypeId: number;
  ProjectLinkTypeImage: string;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function OverviewContainer({
  projectData,
}: {
  projectData: Project;
}) {
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [totalTeamMembers, setTotalTeamMembers] = useState<number>(0);
  const [modalData, setModalData] = useState<ModalData>({
    ProjectId: 0,
    open: false,
    Links: [],
  });
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);

  const [modalEditData, setModalEditData] = useState<ModalEditData>({
    Links: new Array<Link>(),
    open: false,
  });
  const [adminPermission, setAdminPermission] = useState({
    editProject: false,
  });
  const { hasPermission } = usePermissions();

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
    async function checkPermissions() {
      setAdminPermission({
        editProject: await hasPermission("EDIT_PROJECT"),
      });
    }
    fetchAllData();
    checkPermissions();
  }, [projectData.ProjectId]);

  function fetchAllData() {
    axios
      .get("/Project/GET/GetAllLinkByProjectId", {
        params: { ProjectId: projectData.ProjectId },
      })
      .then((res) => {
        setLinks(res.data);
      });

    axios
      .get("Project/GET/GetTotalTasks", {
        params: { ProjectId: projectData.ProjectId },
      })
      .then((res) => {
        setTotalTasks(res.data[0].TotalTasks);
      });

    axios
      .get("Project/GET/GetTotalTeamMembers", {
        params: { ProjectId: projectData.ProjectId },
      })
      .then((res) => {
        setTotalTeamMembers(res.data[0].TotalTeamMembers);
      });
  }

  function calculateDeadline() {
    if (daysUntilDeadline < 0) {
      return <p className="text-red-500">Scaduto</p>;
    }
    return <>{daysUntilDeadline} g</>;
  }

  async function DeleteLink(LinkId: string) {
    try {
      const res = await axios.delete("/Project/DELETE/RemoveLinkFromProject", {
        params: {
          ProjectLinkId: Number(LinkId),
          ProjectId: projectData.ProjectId,
        },
      });

      if (res.status === 200) {
        fetchAllData();
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "Il collegamento è stato eliminato con successo.",
          alertColor: "green",
        });
      }
    } catch (error) {
      console.error("Errore nella cancellazione del progetto:", error);
      if (axios.isAxiosError(error)) {
        // General error handling
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Errore durante l'operazione",
          alertDescription:
            "Si è verificato un errore durante l'eliminazione del collegamento. Per favore, riprova più tardi.",
          alertColor: "red",
        });
      }
    }
  }

  return (
    <>
      <AddProjectLink
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        fetchAllData={fetchAllData}
        ProjectId={modalData.ProjectId}
      />
      <DeleteLinkModal
        isOpen={modalEditData.open}
        isClosed={() => {
          setModalEditData({ ...modalEditData, open: false });
        }}
        LinkData={modalEditData.Links}
        DeleteLink={DeleteLink}
      />
      <StatusAlert AlertData={alertData} />
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-5 h-fit">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-6 col-span-6 md:col-span-4 h-fit">
          <div className="border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6 col-span-6 h-fit">
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

          <div className="flex flex-row items-center justify-between border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6 col-span-6 sm:col-span-3">
            <div className="flex flex-col items-start">
              <h1 className="font-bold">Membri del team</h1>
              <span>{totalTeamMembers}</span>
            </div>
            <Groups2RoundedIcon className="text-gray-500" />
          </div>

          <div className="flex flex-row items-center justify-between border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6 col-span-6 sm:col-span-3">
            <div className="flex flex-col items-start">
              <h1 className="font-bold">Task totali</h1>
              <span>{totalTasks}</span>
            </div>
            <ChecklistRoundedIcon className="text-gray-500" />
          </div>
        </div>

        <div className="flex flex-col gap-5 col-span-6  md:col-span-2">
          <div className="grid grid-cols-1 2xl:grid-cols-1 gap-4">
            <div className="flex flex-row items-center justify-between border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6 col-span-6">
              <div className="flex flex-col gap-3 items-start w-full">
                <div className="flex flex-row justify-between w-full">
                  <h1 className="font-bold">Collegamenti esterni</h1>
                  {adminPermission.editProject && links.length > 0 && (
                    <Button
                      size="sm"
                      radius="full"
                      color="warning"
                      variant="light"
                      onClick={() =>
                        setModalEditData({
                          ...modalEditData,
                          open: true,
                          Links: links,
                        })
                      }
                      isIconOnly
                    >
                      <ModeEditRoundedIcon />
                    </Button>
                  )}
                </div>
                <div className="flex flex-row flex-wrap gap-3 items-center">
                  {links.map((link, index) => {
                    return (
                      <Tooltip
                        content={link.ProjectLinkTitle}
                        closeDelay={0}
                        key={index}
                      >
                        <Button
                          as={Link}
                          href={link.ProjectLinkUrl}
                          target="blank"
                          size="sm"
                          radius="full"
                          variant="faded"
                          isIconOnly
                        >
                          <img
                            src={
                              API_URL_IMG +
                              "/linkIcons/" +
                              link.ProjectLinkTypeImage
                            }
                            className="h-5 w-5"
                          />
                        </Button>
                      </Tooltip>
                    );
                  })}

                  {adminPermission.editProject && (
                    <Tooltip content="Aggiungi un nuovo link" closeDelay={0}>
                      <Button
                        size="sm"
                        color="primary"
                        radius="full"
                        variant="solid"
                        onClick={() =>
                          setModalData({
                            ...modalData,
                            open: true,
                            ProjectId: projectData.ProjectId,
                          })
                        }
                        isIconOnly
                      >
                        <AddRoundedIcon />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </div>

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
