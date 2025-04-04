import { Icon } from "@iconify/react";
import { Badge } from "@heroui/react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import axios from "axios";

interface Project {
  ProjectId: number;
  CompanyName: string;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: string;
  ProjectEndDate: string | null;
  StatusId: number;
  UniqueCode: string;
  StatusName?: string;
}

interface Status {
  StatusId: number;
  StatusName: string;
  StatusColor: string;
}

type BadgeColorType =
  | "default"
  | "success"
  | "warning"
  | "primary"
  | "secondary"
  | "danger"
  | undefined;

export default function ActiveProjectsCard({}: { customerId: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsResponse = await axios.get(
          "/Project/GET/GetProjectsByCustomerId",
          { withCredentials: true }
        );
        const statusResponse = await axios.get("/Project/GET/GetAllStatus");

        console.log(projectsResponse.data);
        setProjects(projectsResponse.data);
        setStatusList(statusResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Errore nel recupero dei progetti:", error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filtra progetti attivi e non scaduti
  const activeProjects = projects.filter((project) => {
    const isActiveStatus = [1, 2, 3, 7].includes(Number(project.StatusId));
    const today = dayjs();
    const isNotExpired =
      project.ProjectEndDate === null ||
      dayjs(project.ProjectEndDate).isAfter(today);

    return isActiveStatus && isNotExpired;
  });

  // Ottieni stato
  const getStatusInfo = (
    statusId: number
  ): { color: BadgeColorType; name: string; borderColor: string } => {
    const id = Number(statusId);
    const status = statusList.find((s) => s.StatusId === id);

    let color: BadgeColorType;
    let borderColor: string;

    switch (id) {
      case 1:
        color = "success";
        borderColor = "#10B981";
        break;
      case 2:
        color = "warning";
        borderColor = "#FFB800";
        break;
      case 3:
        color = "primary";
        borderColor = "#0090FF";
        break;
      case 7:
        color = "secondary";
        borderColor = "#8B5CF6";
        break;
      default:
        color = "default";
        borderColor = "#94A3B8";
    }

    return {
      color,
      borderColor,
      name: status ? status.StatusName : "Sconosciuto",
    };
  };

  // Formatta la data di scadenza
  const formatEndDate = (endDate: string | null): string => {
    if (!endDate) return "Senza scadenza";
    return `Scadenza: ${dayjs(endDate).format("DD/MM/YYYY")}`;
  };

  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-md font-medium text-gray-800 flex items-center gap-2">
          <Icon icon="solar:folder-linear" className="text-primary" />
          Progetti Attivi
        </h2>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="py-2 flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {activeProjects.map((project) => {
              const statusInfo = getStatusInfo(project.StatusId);

              return (
                <a
                  key={project.ProjectId}
                  href={`/projects/${project.UniqueCode}`}
                  className="block"
                >
                  <div
                    className="border-l-3 border border-gray-100 px-3 py-2 rounded-lg bg-gray-50 hover:bg-white transition-colors"
                    style={{ borderLeftColor: statusInfo.borderColor }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-800 truncate max-w-[70%]">
                        {project.ProjectName}
                      </h3>
                      <Badge color={statusInfo.color} size="sm" variant="flat">
                        {project.StatusName || statusInfo.name}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span className="italic">
                        {formatEndDate(project.ProjectEndDate)}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="py-3 flex items-center justify-center text-gray-500 text-sm">
            <Icon icon="solar:folder-linear" className="mr-2 text-gray-400" />
            Nessun progetto attivo
          </div>
        )}
      </div>
    </div>
  );
}
