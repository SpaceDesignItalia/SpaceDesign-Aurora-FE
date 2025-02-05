import {
  Avatar,
  AvatarGroup,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import { API_URL_IMG } from "../../../../API/API";

interface Task {
  ProjectTaskId: number;
  ProjectTaskName: string;
  ProjectTaskDescription?: string;
  ProjectTaskExpiration?: string;
  ProjectTaskMembers: {
    StafferId: number;
    StafferFullName: string;
    StafferImageUrl: string;
  }[];
  ProjectName: string;
}

interface EndingTasksProps {
  projects: Array<{
    ProjectId: number;
    ProjectName: string;
    Tasks: Task[];
  }>;
}

export default function EndingTasks({ projects }: EndingTasksProps) {
  const formatDate = (date: string | undefined) => {
    if (!date) return "Nessuna scadenza";
    return dayjs(date).format("DD MMM YYYY");
  };

  const getGridCols = (projectCount: number) => {
    if (projectCount === 1) return "grid-cols-1";
    if (projectCount === 2) return "grid-cols-2";
    return "grid-cols-3";
  };

  console.log(projects);

  return (
    <div className={`overflow-x-auto`}>
      <div
        className={`grid ${getGridCols(projects.length)} gap-6 min-w-full ${
          projects.length > 3 ? "w-fit" : ""
        }`}
      >
        {projects.map((project) => (
          <div key={project.ProjectId} className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">{project.ProjectName}</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {project.Tasks.map((task) => (
                <Card
                  key={task.ProjectTaskId}
                  className="w-full border-2 transition-colors duration-200"
                  radius="sm"
                >
                  <CardHeader className="flex justify-between items-start gap-3 px-4 pt-4 pb-2">
                    <div className="flex flex-col gap-2 flex-grow">
                      <h4 className="text-base font-semibold text-default-700 line-clamp-2">
                        {task.ProjectTaskName}
                      </h4>
                      <Chip
                        size="sm"
                        variant="flat"
                        className="text-xs px-2 py-1 bg-default-100 w-fit"
                      >
                        {project.ProjectName}
                      </Chip>
                    </div>
                  </CardHeader>

                  <CardBody className="px-4 py-3">
                    {task.ProjectTaskDescription && (
                      <div className="flex items-center gap-1.5 text-sm text-default-500 bg-default-100 px-2.5 py-1 rounded-lg w-fit">
                        <Icon
                          icon="fluent:text-description-16-filled"
                          fontSize={22}
                        />
                        <span>Descrizione</span>
                      </div>
                    )}
                  </CardBody>

                  <CardFooter className="flex justify-between items-center px-4 pb-4 pt-2 border-t border-default-200">
                    {task.ProjectTaskMembers.length > 0 && (
                      <AvatarGroup
                        isBordered
                        max={3}
                        size="sm"
                        className="justify-start"
                      >
                        {task.ProjectTaskMembers.map((member) => (
                          <Tooltip
                            key={member.StafferId}
                            content={member.StafferFullName}
                            showArrow
                          >
                            <Avatar
                              src={
                                member.StafferImageUrl &&
                                `${API_URL_IMG}/profileIcons/${member.StafferImageUrl}`
                              }
                              alt={member.StafferFullName}
                            />
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                    )}
                    <Tooltip content="Data di scadenza" showArrow>
                      <div className="flex items-center gap-1.5 text-sm text-default-500 bg-default-100 px-2.5 py-1 rounded-lg">
                        <Icon icon="solar:calendar-linear" fontSize={22} />
                        <span>{formatDate(task.ProjectTaskExpiration)}</span>
                      </div>
                    </Tooltip>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
