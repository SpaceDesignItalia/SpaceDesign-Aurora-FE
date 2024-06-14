import axios from "axios";
import { useEffect, useState } from "react";

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: string;
  ProjectEndDate: string;
  ProjectManagerId: number;
  ProjectBannerId: number;
  CompanyId: number;
  ProjectStatusId: number;
}

interface Company {
  CompanyId: number;
  CompanyName: string;
  CompnayPhoto: string;
}

interface Status {
  StatusId: number;
  StatusName: string;
  StatusColor: string;
}

export default function TableCard({ project }: { project: Project }) {
  const [company, setCompany] = useState<Company>({
    CompanyId: 4,
    CompanyName: "Smoke di Macherelli Armando",
    CompnayPhoto:
      "https://lh3.googleusercontent.com/p/AF1QipPBceBZK41EDAWKbpzA4j6ENBSjzFPqJ0GfW9AI=s1360-w1360-h1020",
  });

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
      if (status.StatusId == project.ProjectStatusId) {
        return (
          <span
            key={status.StatusId}
            className={classNames(
              statuses[project.ProjectStatusId - 1],
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

  return (
    <div
      key={project.ProjectId}
      className="overflow-hidden rounded-xl border border-gray-200 list-none"
    >
      <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
        <img
          src={company.CompnayPhoto}
          alt={String(project.CompanyId)}
          className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
        />
        <div className="flex flex-col">
          <div className="text-sm font-medium leading-6 text-gray-900">
            {project.ProjectName}
          </div>
          <div className="text-sm font-medium leading-6 text-gray-500">
            {company.CompanyName}
          </div>
        </div>
      </div>
      <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Task da fare</dt>
          <dd className="text-gray-700">1</dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Team</dt>
          <dd className="text-gray-700">
            {/* <AvatarGroup isBordered max={2} total={10} size="sm">
              {project.team !== undefined && (
                <>
                  {project.team.map((member: string, index: number) => (
                    <Avatar key={index} src={member} />
                  ))}
                </>
              )}
            </AvatarGroup> */}
          </dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Status progetto</dt>
          <dd className="flex items-start gap-x-2">{displayStatus()}</dd>
        </div>
      </dl>
    </div>
  );
}
