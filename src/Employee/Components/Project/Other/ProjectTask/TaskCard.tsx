import {
  Avatar,
  AvatarGroup,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownItem,
  DropdownMenu,
  cn,
  DateValue,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
} from "@nextui-org/react";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { API_URL_IMG } from "../../../../../API/API";
import dayjs from "dayjs";
import { useDateFormatter } from "@react-aria/i18n";
import { useState } from "react";
import { parseDate } from "@internationalized/date";
import EditTaskModal from "./EditTaskModal";
import ConfirmDeleteTaskModal from "./ConfirmDeleteTaskModal";
import ViewTaskModal from "./ViewTaskModal";
import axios from "axios";
import { useEffect } from "react";

interface Tag {
  ProjectTaskTagId: number;
  ProjectTaskTagName: string;
}

interface Member {
  StafferId: number;
  StafferFullName: string;
  StafferEmail: string;
  StafferImageUrl: string;
}

interface Task {
  ProjectTaskId: number;
  ProjectTaskName: string;
  ProjectTaskDescription?: string;
  ProjectTaskExpiration: DateValue;
  ProjectTaskStatusId: number;
  ProjectTaskTags: Tag[];
  ProjectTaskMembers: Member[];
  ProjectId: number;
}

interface ModalData {
  Task: Task;
  open: boolean;
}

interface ModalDeleteData {
  Task: Task;
  open: boolean;
}

interface ModalEditData {
  Task: Task;
  open: boolean;
}

export default function TaskCard({
  provided,
  snapshot,
  task,
  setUpdate,
  update,
  socket,
  projectId,
}: {
  provided: any;
  snapshot: any;
  task: Task;
  setUpdate: any;
  update: any;
  socket: any;
  projectId: number;
}) {
  const [modalData, setModalData] = useState<ModalData>({
    Task: {
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskExpiration: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectId: 0,
    },
    open: false,
  });
  const [modalDeleteData, setModalDeleteData] = useState<ModalDeleteData>({
    Task: {
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskExpiration: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectId: 0,
    },
    open: false,
  });
  const [modalEditData, setModalEditData] = useState<ModalEditData>({
    Task: {
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskExpiration: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectId: 0,
    },
    open: false,
  });

  useEffect(() => {
    socket.on("task-update", () => {
      setUpdate(!update);
    });
  }, []);

  function formatDate(date: DateValue) {
    let formatter = useDateFormatter({ dateStyle: "full" });
    return dayjs(formatter.format(new Date(date.toString()))).format(
      "DD/MM/YYYY"
    );
  }

  async function DeleteTask(taskId: number) {
    await axios.delete("/Project/DELETE/DeleteTask", {
      params: { ProjectTaskId: taskId },
    });
    socket.emit("task-news", projectId);
    setUpdate(!update);
  }

  return (
    <>
      <ViewTaskModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        TaskData={modalData.Task}
      />
      <EditTaskModal
        isOpen={modalEditData.open}
        isClosed={() => setModalEditData({ ...modalEditData, open: false })}
        TaskData={modalEditData.Task}
      />
      <ConfirmDeleteTaskModal
        isOpen={modalDeleteData.open}
        isClosed={() => setModalDeleteData({ ...modalDeleteData, open: false })}
        TaskData={modalDeleteData.Task}
        DeleteTask={DeleteTask}
      />
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Card className="h-full" radius="sm">
          <CardHeader className="justify-between">
            <div className="flex gap-5">
              <div className="flex flex-col gap-3 items-start justify-center w-auto h-fit">
                <div className="flex flex-row flex-wrap gap-2">
                  {task.ProjectTaskTags.map((tag) => (
                    <Chip
                      key={tag.ProjectTaskTagId}
                      size="sm"
                      className="mr-1"
                      color="primary"
                      variant="faded"
                      radius="sm"
                    >
                      {tag.ProjectTaskTagName}
                    </Chip>
                  ))}
                </div>
                <h1 className="text-normal font-bold leading-none text-default-600">
                  {task.ProjectTaskName}
                </h1>
              </div>
            </div>
            <Dropdown radius="sm">
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertRoundedIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  color="primary"
                  startContent={<RemoveRedEyeOutlinedIcon />}
                  aria-label="View"
                  aria-labelledby="View"
                  onClick={() =>
                    setModalData({
                      ...modalData,
                      open: true,
                      Task: task,
                    })
                  }
                >
                  Visualizza
                </DropdownItem>

                <DropdownItem
                  color="warning"
                  startContent={<ModeOutlinedIcon />}
                  aria-label="Edit"
                  aria-labelledby="Edit"
                  onClick={() =>
                    setModalEditData({
                      ...modalEditData,
                      open: true,
                      Task: task,
                    })
                  }
                >
                  Modifica
                </DropdownItem>

                <DropdownItem
                  color="danger"
                  startContent={<DeleteOutlinedIcon />}
                  aria-label="Remove"
                  aria-labelledby="Remove"
                  onClick={() =>
                    setModalDeleteData({
                      ...modalDeleteData,
                      open: true,
                      Task: task,
                    })
                  }
                >
                  Rimuovi
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </CardHeader>
          <CardBody className="px-3 py-0 text-small text-default-400">
            <div
              dangerouslySetInnerHTML={{
                __html: task.ProjectTaskDescription,
              }}
            />
          </CardBody>
          <CardFooter className="gap-3 flex flex-col items-start">
            <AvatarGroup isBordered>
              {task.ProjectTaskMembers.map((member) => (
                <Avatar
                  size="sm"
                  key={member.StafferId}
                  src={
                    member.StafferImageUrl &&
                    API_URL_IMG + "/profileIcons/" + member.StafferImageUrl
                  }
                  alt={member.StafferFullName}
                />
              ))}
            </AvatarGroup>
            <div className="flex flex-row items-center gap-3 w-full">
              <span className="font-semibold">
                {formatDate(task.ProjectTaskExpiration)}
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
