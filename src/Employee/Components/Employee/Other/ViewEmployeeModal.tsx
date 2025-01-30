import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  cn,
  Tabs,
  Tab,
} from "@heroui/react";
import { API_URL_IMG } from "../../../../API/API";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Employee {
  EmployeeId: number;
  EmployeeFullName: string;
  EmployeeEmail: string;
  EmployeePhone: string;
  RoleName: string;
  EmployeeImageUrl?: string;
}

interface ViewEmployeeModalProps {
  isOpen: boolean;
  isClosed: () => void;
  EmployeeData: Employee;
}

interface UserPostProps {
  avatar: string;
  name: string;
  text: string;
  tasks: number;
  date: string;
}

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectEndDate: string;
  CompanyImageUrl: string;
  ProjectTaskCount: number;
}

export default function ViewEmployeeModal({
  isOpen,
  isClosed,
  EmployeeData,
}: ViewEmployeeModalProps) {
  const [employeeProjects, setEmployeeProjects] = useState<Project[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProjects = async () => {
      const res = await axios.get("/Staffer/GET/GetStafferProjectsForModal", {
        params: { EmployeeId: EmployeeData.EmployeeId },
      });
      console.log(res.data);
      setEmployeeProjects(res.data);
    };

    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const UserPost = ({
    avatar,
    name,
    text,
    tasks,
    date,
    ...props
  }: UserPostProps) => (
    <div className="mb-4 flex items-center gap-4" {...props}>
      <Avatar className="flex" size="md" src={avatar} />
      <div className="flex flex-col justify-center">
        <div className="flex gap-1 text-small">
          <p>{name}</p>
          <span className="text-default-400">·</span>
          <p className="text-default-400">
            {new Intl.DateTimeFormat("it-IT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(date))}
          </p>
        </div>
        <p className="text-xs text-default-400">{text}</p>
        <p>
          <span className="text-small font-medium text-default-500">
            {tasks}
          </span>
          &nbsp;
          <span className="text-small text-default-400">task assegnate</span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {
        isClosed();
        navigate("/administration/employee");
      }}
      scrollBehavior="outside"
      backdrop="blur"
      className="w-0 h-0 absolute top-[25%]"
      hideCloseButton
    >
      <ModalContent>
        {(isClosed) => (
          <>
            <ModalBody className="flex justify-center items-center">
              <Card className="w-96">
                <CardHeader className="relative flex h-[100px] flex-col justify-end overflow-visible bg-gradient-to-br from-orange-300 via-red-400 to-rose-500">
                  {EmployeeData.EmployeeImageUrl && (
                    <Avatar
                      className="h-20 w-20 translate-y-12"
                      src={
                        API_URL_IMG +
                        "/profileIcons/" +
                        EmployeeData.EmployeeImageUrl
                      }
                    />
                  )}
                  <div className="absolute right-3 top-3 flex flex-row gap-2">
                    <Button
                      className="bg-white/20 text-white dark:bg-black/20"
                      radius="full"
                      size="sm"
                      variant="light"
                      href={
                        "/administration/employee/edit-employee/" +
                        EmployeeData.EmployeeId
                      }
                      as="a"
                    >
                      Modifica
                    </Button>
                    <Button
                      className="bg-white/20 text-white dark:bg-black/20 h-8 w-8"
                      radius="full"
                      isIconOnly
                      variant="light"
                      onPress={() => {
                        isClosed();
                        navigate("/administration/employee");
                      }}
                      startContent={<CloseRoundedIcon className="h-1 w-1" />}
                    />
                  </div>
                </CardHeader>
                <CardBody>
                  <div
                    className={cn(
                      EmployeeData.EmployeeImageUrl && "pt-6",
                      "pb-4"
                    )}
                  >
                    <p className="text-large font-medium">
                      {EmployeeData.EmployeeFullName}
                    </p>
                    <p className="max-w-[90%] text-small text-default-400">
                      {EmployeeData.EmployeeEmail}
                    </p>
                    <div className="flex gap-2 pb-1 pt-2">
                      <span className="inline-flex my-auto items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium text-gray-900 ring-2 ring-inset ring-gray-200 bg-white">
                        <svg
                          viewBox="0 0 6 6"
                          aria-hidden="true"
                          className="h-1.5 w-1.5 fill-blue-500"
                        >
                          <circle r={3} cx={3} cy={3} />
                        </svg>
                        {EmployeeData.RoleName}
                      </span>
                    </div>
                    {EmployeeData.EmployeePhone && (
                      <p className="py-2 text-small text-foreground">
                        +39 {EmployeeData.EmployeePhone}
                      </p>
                    )}
                  </div>
                  {employeeProjects.length > 0 && (
                    <Tabs
                      fullWidth
                      classNames={{
                        panel: "mt-2",
                      }}
                    >
                      <Tab key="projects" title="Progetti">
                        {employeeProjects.map((project: Project) => (
                          <UserPost
                            key={project.ProjectId}
                            avatar={
                              project.CompanyImageUrl
                                ? API_URL_IMG +
                                  "/profileIcons" +
                                  project.CompanyImageUrl
                                : ""
                            }
                            name={project.ProjectName}
                            text={project.ProjectDescription}
                            tasks={project.ProjectTaskCount}
                            date={project.ProjectEndDate}
                          />
                        ))}
                      </Tab>
                    </Tabs>
                  )}
                </CardBody>
              </Card>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
