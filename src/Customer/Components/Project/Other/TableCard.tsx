import axios from "axios";
import { Progress } from "@heroui/react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Icon } from "@iconify/react";

interface Project {
  ProjectId: number;
  CompanyName: string;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: string;
  ProjectEndDate: string;
  StatusId: number;
  UniqueCode: string;
}

interface Status {
  StatusId: number;
  StatusName: string;
  StatusColor: string;
}

export default function TableCard({ project }: { project: Project }) {
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    axios.get("/Project/GET/GetAllStatus").then((res) => {
      setStatusList(res.data);
    });
  }, []);

  const statuses = [
    "text-green-700 bg-green-50 ring-green-600/20",
    "text-orange-600 bg-orange-50 ring-orange-500/20",
    "text-red-700 bg-red-50 ring-red-600/10",
  ];

  const statusIcons = [
    "solar:check-circle-bold", // Completato/Attivo
    "solar:clock-circle-bold", // In progresso
    "solar:close-circle-bold", // Bloccato/Chiuso
  ];

  function displayStatus() {
    return statusList.map((status) => {
      if (status.StatusId === project.StatusId) {
        return (
          <span
            key={status.StatusId}
            className={classNames(
              statuses[project.StatusId - 1],
              "rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset flex items-center gap-1"
            )}
          >
            <Icon icon={statusIcons[project.StatusId - 1]} fontSize={14} />
            {status.StatusName}
          </span>
        );
      }
      return null;
    });
  }

  function classNames(...classes: (string | boolean | undefined)[]): string {
    return classes.filter((className) => !!className).join(" ");
  }

  // Calcola la percentuale di completamento del progetto
  function calculateProgress(
    startDate: string,
    endDate: string | null
  ): number {
    if (!endDate) return 0;

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const today = dayjs();

    if (today.isBefore(start)) return 0;
    if (today.isAfter(end)) return 100;

    const totalDuration = end.diff(start, "day");
    const elapsedDuration = today.diff(start, "day");

    return Math.round((elapsedDuration / totalDuration) * 100);
  }

  const progressPercent = calculateProgress(
    project.ProjectCreationDate,
    project.ProjectEndDate || null
  );

  // Ottieni il colore del progresso in base alla percentuale
  const getProgressColor = (percent: number) => {
    if (percent < 50) return "primary";
    if (percent < 80) return "warning";
    return "success";
  };

  // Determina se il progetto è scaduto
  const isOverdue = () => {
    if (!project.ProjectEndDate) return false;
    return (
      dayjs().isAfter(dayjs(project.ProjectEndDate)) && progressPercent < 100
    );
  };

  return (
    <a
      href={"/projects/" + project.UniqueCode}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        key={project.ProjectId}
        className={`overflow-hidden rounded-xl border ${
          isHovered ? "border-primary-400" : "border-gray-200"
        } transition-all duration-300 cursor-pointer ${
          isHovered ? "shadow-lg transform -translate-y-1" : "shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-x-4 border-b border-gray-900/5 bg-white p-6">
          <div className="flex flex-col gap-2">
            <div className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
              <Icon
                icon="solar:document-text-linear"
                className={isHovered ? "text-primary-500" : "text-gray-500"}
                fontSize={20}
              />
              {project.ProjectName}
            </div>
          </div>
        </div>
        <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
          <div className="flex flex-col gap-3 py-3">
            <dt className="text-gray-500 flex items-center gap-1">
              <Icon icon="solar:calendar-linear" fontSize={16} />
              Progresso sviluppo
            </dt>
            <div className="flex justify-between items-center gap-x-4">
              <dt className="text-gray-700 text-xs">
                {dayjs(project.ProjectCreationDate).format("DD/MM/YYYY")}
              </dt>
              <dd
                className={`text-xs font-medium ${
                  isOverdue() ? "text-red-600" : "text-gray-700"
                }`}
              >
                {project.ProjectEndDate
                  ? dayjs(project.ProjectEndDate).format("DD/MM/YYYY")
                  : "Nessuna scadenza"}
                {isOverdue() && (
                  <Icon
                    icon="solar:danger-triangle-bold"
                    className="inline ml-1"
                    fontSize={14}
                  />
                )}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Progress
                value={progressPercent >= 100 ? 100 : progressPercent}
                color={getProgressColor(progressPercent)}
                size="sm"
                aria-labelledby="Project Card"
                className="flex-1 h-2"
              />
              <span className="text-xs font-medium text-gray-700">
                {progressPercent}%
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center gap-4 py-3">
            <dt className="text-gray-500 flex items-center gap-1">
              <Icon icon="solar:flag-linear" fontSize={16} />
              Status progetto
            </dt>
            <dd className="flex items-center gap-x-2">{displayStatus()}</dd>
          </div>
        </dl>
      </div>
    </a>
  );
}
