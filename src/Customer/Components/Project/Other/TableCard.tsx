import axios from "axios";
import { Progress } from "@nextui-org/react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

interface Project {
  ProjectId: number;
  CompanyName: string;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: string;
  ProjectEndDate: string;
  StatusId: number;
}

interface Status {
  StatusId: number;
  StatusName: string;
  StatusColor: string;
}

export default function TableCard({ project }: { project: Project }) {
  const [statusList, setStatusList] = useState<Status[]>([]);

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

  function displayStatus() {
    return statusList.map((status) => {
      if (status.StatusId === project.StatusId) {
        return (
          <span
            key={status.StatusId}
            className={classNames(
              statuses[project.StatusId - 1],
              "rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset"
            )}
          >
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
  function calculateProgress(startDate: string, endDate: string): number {
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
    project.ProjectEndDate
  );

  return (
    <>
      <a
        href={
          "/projects/" +
          project.CompanyName +
          "/" +
          project.ProjectId +
          "/" +
          project.ProjectName
        }
      >
        <div
          key={project.ProjectId}
          className="overflow-hidden rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
            <div className="flex flex-col gap-2">
              <div className="text-lg font-semibold leading-6 text-gray-900">
                {project.ProjectName}
              </div>
            </div>
          </div>
          <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
            <div className="flex flex-col gap-3 py-3">
              <dt className="text-gray-500">Progresso sviluppo</dt>
              <div className="flex justify-between items-center gap-x-4">
                <dt className="text-gray-700">
                  {dayjs(project.ProjectCreationDate).format("DD/MM/YYYY")}
                </dt>
                <dd className="text-gray-700">
                  {dayjs(project.ProjectEndDate).format("DD/MM/YYYY")}
                </dd>
              </div>
              <Progress
                value={progressPercent >= 100 ? 100 : progressPercent}
                color="primary"
                size="sm"
                aria-labelledby="Project Card"
              />
            </div>
            <div className="flex justify-between items-center gap-4 py-3">
              <dt className="text-gray-500">Status progetto</dt>
              <dd className="flex items-center gap-x-2">{displayStatus()}</dd>
            </div>
          </dl>
        </div>
      </a>
    </>
  );
}
