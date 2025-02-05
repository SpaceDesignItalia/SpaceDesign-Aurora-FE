import { Button, Card, cn, Link, Progress, Tooltip, User } from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { API_URL_IMG } from "../../../../../API/API";
import { usePermissions } from "../../../Layout/PermissionProvider";
import StatusAlert from "../../../Layout/StatusAlert";
import AddProjectLink from "../AddProjectLink";
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

  const daysUntilDeadline = projectData.ProjectEndDate
    ? dayjs(projectData.ProjectEndDate).diff(dayjs(), "day") + 1
    : null;

  const totalDays =
    dayjs(projectData.ProjectEndDate).diff(
      dayjs(projectData.ProjectCreationDate),
      "day"
    ) + 1;
  const progressPercent = daysUntilDeadline
    ? Math.floor(((totalDays - daysUntilDeadline) / totalDays) * 100)
    : null;

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
    if (!daysUntilDeadline) {
      return <p className="text-gray-500">N/A</p>;
    }
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

      {/* Stats Cards */}
      <dl className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-1">
        <Card className="mt-5 border-2 dark:border-default-100 shadow-none">
          <section className="flex flex-nowrap justify-between p-4">
            <div className="flex flex-col justify-between gap-y-2">
              <div className="flex flex-col gap-y-4">
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Icon
                    icon="material-symbols:groups-2-rounded"
                    className="w-5 h-5"
                  />
                  Membri del team
                </dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {totalTeamMembers || "Dati non disponibili"}
                </dd>
              </div>
            </div>
          </section>
        </Card>

        <Card className="mt-5 border-2 dark:border-default-100 shadow-none">
          <section className="flex flex-nowrap justify-between p-4">
            <div className="flex flex-col justify-between gap-y-2">
              <div className="flex flex-col gap-y-4">
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Icon
                    icon="material-symbols:checklist-rounded"
                    className="w-5 h-5"
                  />
                  Task totali
                </dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {totalTasks || "Dati non disponibili"}
                </dd>
              </div>
            </div>
          </section>
        </Card>

        <Card className="mt-5 border-2 dark:border-default-100 shadow-none">
          <section className="flex flex-nowrap justify-between p-4">
            <div className="flex flex-col justify-between gap-y-2">
              <div className="flex flex-col gap-y-4">
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Icon
                    icon="material-symbols:timer-outline"
                    className="w-5 h-5"
                  />
                  Tempo rimanente
                </dt>
                <dd
                  className={cn(
                    "text-3xl font-semibold",
                    progressPercent && {
                      "text-warning-500":
                        progressPercent >= 70 && progressPercent < 85,
                      "text-danger-500": progressPercent >= 85,
                      "text-gray-900": progressPercent < 70,
                    }
                  )}
                >
                  {calculateDeadline()}
                </dd>
              </div>
            </div>
          </section>
        </Card>
      </dl>

      <div className="grid grid-cols-1 sm:grid-cols-6 gap-5 h-fit">
        {/* Dettagli progetto */}
        <div className="col-span-6 md:col-span-4">
          <Card className="border-2 dark:border-default-100 shadow-none">
            <section className="p-6">
              <h1 className="text-xl font-semibold mb-4">Dettagli progetto</h1>
              <p className="text-gray-600 mb-6">
                {projectData.ProjectDescription}
              </p>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col gap-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Data di creazione
                  </dt>
                  <dd className="text-base font-semibold">
                    {dayjs(projectData.ProjectCreationDate).format(
                      "DD/MM/YYYY"
                    )}
                  </dd>
                </div>
                <div className="flex flex-col gap-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Deadline
                  </dt>
                  <dd className="text-base font-semibold">
                    {dayjs(projectData.ProjectEndDate).format("DD/MM/YYYY")}
                  </dd>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <dt className="text-sm font-medium text-gray-500">
                  Project manager
                </dt>
                <dd>
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
                </dd>
              </div>
            </section>
          </Card>
        </div>

        {/* Colonna destra */}
        <div className="flex flex-col gap-5 col-span-6 md:col-span-2">
          {/* Collegamenti esterni */}
          <Card className="border-2 dark:border-default-100 shadow-none">
            <section className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <dt className="text-sm font-medium text-gray-500">
                    Collegamenti esterni
                  </dt>
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
                      <Icon icon="solar:pen-linear" fontSize={22} />
                    </Button>
                  )}
                </div>

                <dd className="flex flex-wrap gap-2">
                  {links.map((link, index) => (
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
                  ))}

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
                        <Icon icon="mynaui:plus-solid" fontSize={22} />
                      </Button>
                    </Tooltip>
                  )}
                </dd>
              </div>
            </section>
          </Card>

          {/* Progress bar */}
          {progressPercent && (
            <Card className="border-2 dark:border-default-100 shadow-none">
              <section className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-gray-500">
                      Completamento
                    </dt>
                    <dd className="text-base font-semibold">
                      {progressPercent >= 100 ? 100 : progressPercent}%
                    </dd>
                  </div>
                  <Progress
                    value={progressPercent >= 100 ? 100 : progressPercent}
                    color="primary"
                    size="sm"
                  />
                </div>
              </section>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
