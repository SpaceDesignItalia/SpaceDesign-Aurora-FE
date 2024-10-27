import axios from "axios";
import { Avatar, AvatarGroup, Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { API_URL_IMG } from "../../../../API/API";

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: string;
  ProjectEndDate: string;
  ProjectManagerId: number;
  ProjectBannerId: number;
  CompanyId: number;
  StatusId: number;
}

interface Member {
  StafferId: number;
  StafferImageUrl: string;
  StafferFullName: string;
  StafferEmail: string;
  RoleName: string;
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
    CompanyId: 0,
    CompanyName: "",
    CompnayPhoto: "",
  });
  const [toDoTasks, setToDoTasks] = useState<number>(0);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);

  useEffect(() => {
    axios.get("/Project/GET/GetAllStatus").then((res) => {
      setStatusList(res.data);
    });
    axios
      .get("/Company/GET/GetCompanyById", {
        params: { CompanyId: project.CompanyId },
      })
      .then((res) => {
        setCompany(res.data[0]);
      });

    axios
      .get("/Project/GET/GetProjetTeamMembers", {
        params: { ProjectId: project.ProjectId },
      })
      .then((res) => {
        setTeamMembers(res.data);
      });
    axios
      .get("/Project/GET/GetTaskToDo", {
        params: { ProjectId: project.ProjectId },
      })
      .then((res) => {
        setToDoTasks(res.data[0].TasksNumber);
      });
  }, []);

  const statuses = [
    "text-green-700 bg-green-50 ring-green-600/20",
    "text-orange-600 bg-orange-50 ring-orange-500/20",
    "text-red-700 bg-red-50 ring-red-600/10",
  ];

  function displayStatus() {
    return statusList.map((status) => {
      if (status.StatusId == project.StatusId) {
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

  return (
    <>
      <a
        href={
          company
            ? "/projects/" +
              company.CompanyName +
              "/" +
              project.ProjectId +
              "/" +
              project.ProjectName
            : "#"
        }
        key={project.ProjectId}
        className="overflow-hidden rounded-xl border border-gray-200 list-none"
      >
        <div className="flex items-center justify-between gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
          <div className="flex flex-row gap-5">
            <Avatar
              size="lg"
              radius="sm"
              src={
                company?.CompnayPhoto
                  ? company.CompnayPhoto
                  : API_URL_IMG + "/companyImages/defaultLogo.png"
              }
              alt={String(project.CompanyId)}
              isBordered
            />
            <div className="flex flex-col">
              <div className="text-sm font-medium leading-6 text-gray-900">
                {project.ProjectName}
              </div>
              <div className="text-sm font-medium leading-6 text-gray-500">
                {company?.CompanyName || ""}
              </div>
            </div>
          </div>
        </div>
        <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
          <div className="flex justify-between gap-x-4 py-3">
            <dt className="text-gray-500">Task da fare</dt>
            <dd className="text-gray-700">{toDoTasks}</dd>
          </div>
          <div className="flex justify-between gap-x-4 py-3">
            <dt className="text-gray-500">Team</dt>
            <dd className="text-gray-700">
              <AvatarGroup
                isBordered
                isGrid
                className={
                  teamMembers.length > 4
                    ? `grid-cols-4`
                    : `grid-cols-${teamMembers.length}`
                }
                max={3}
                size="sm"
              >
                {teamMembers.map((member: Member, index: number) => (
                  <Tooltip
                    key={member.StafferId}
                    content={member.StafferFullName}
                  >
                    <Avatar
                      key={index}
                      src={
                        member.StafferImageUrl &&
                        API_URL_IMG + "/profileIcons/" + member.StafferImageUrl
                      }
                    />
                  </Tooltip>
                ))}
              </AvatarGroup>
            </dd>
          </div>
          <div className="flex justify-between gap-x-4 py-3">
            <dt className="text-gray-500">Status progetto</dt>
            <dd className="flex items-start gap-x-2">{displayStatus()}</dd>
          </div>
        </dl>
      </a>
    </>
  );
}
