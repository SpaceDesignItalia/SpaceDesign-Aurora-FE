// @ts-nocheck
import {
  Avatar,
  AvatarGroup,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownItem,
  DropdownMenu,
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
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { API_URL_IMG } from "../../../../../API/API";
import dayjs from "dayjs";
import { useDateFormatter } from "@react-aria/i18n";
import { useState } from "react";
import { parseDate } from "@internationalized/date";
import EditTaskModal from "./EditTaskModal";
import ConfirmDeleteTaskModal from "./ConfirmDeleteTaskModal";
import ViewTaskModal from "./ViewTaskModal";
import AddCommentModal from "./AddCommentModal";
import axios from "axios";
import { useEffect } from "react";
import { usePermissions } from "../../../Layout/PermissionProvider";
import ReactQuill from "react-quill";

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

interface Comment {
  ProjectTaskCommentId: number;
  StafferId: number;
  StafferFullName: string;
  StafferImageUrl: string;
  Text: string;
  CommentDate: Date;
}

interface Task {
  ProjectTaskId: number;
  ProjectTaskName: string;
  ProjectTaskDescription?: string;
  ProjectTaskExpiration: DateValue;
  ProjectTaskCreation: DateValue;
  ProjectTaskStatusId: number;
  ProjectTaskTags: Tag[];
  ProjectTaskMembers: Member[];
  ProjectTaskComments: Comment[];
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
  task,
  setUpdate,
  update,
  socket,
  projectId,
  updateTaskStatus,
  columnCount,
}: {
  provided: any;
  task: Task;
  setUpdate: any;
  update: any;
  socket: any;
  projectId: number;
  updateTaskStatus: any;
  columnCount: number;
}) {
  const [modalData, setModalData] = useState<ModalData>({
    Task: {
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskExpiration: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskCreation: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectTaskComments: [],
      ProjectId: 0,
    },
    open: false,
  });
  const [modalDeleteData, setModalDeleteData] = useState<ModalDeleteData>({
    Task: {
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskExpiration: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskCreation: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectTaskComments: [],
      ProjectId: 0,
    },
    open: false,
  });
  const [modalEditData, setModalEditData] = useState<ModalEditData>({
    Task: {
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskExpiration: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskCreation: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectTaskComments: [],
      ProjectId: 0,
    },
    open: false,
  });
  const [modalCommentData, setModalCommentData] = useState<ModalCommentData>({
    Task: {
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskExpiration: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskCreation: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectTaskComments: [],
      ProjectId: 0,
    },
    open: false,
  });

  const [permissions, setPermissions] = useState({
    editActivity: false,
    removeActivity: false,
  });

  const { hasPermission } = usePermissions();

  useEffect(() => {
    socket.on("task-update", () => {
      setUpdate(!update);
    });
  }, []);

  useEffect(() => {
    async function fetchData() {
      const editActivity = await hasPermission("EDIT_ACTIVITY");
      const removeActivity = await hasPermission("REMOVE_ACTIVITY");

      setPermissions({
        ...permissions,
        editActivity: editActivity,
        removeActivity: removeActivity,
      });
    }
    fetchData();
  }, [hasPermission]);
  console.log(columnCount);
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
      <AddCommentModal
        isOpen={modalCommentData.open}
        isClosed={() =>
          setModalCommentData({ ...modalCommentData, open: false })
        }
        TaskData={modalCommentData.Task}
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
            <div className="flex flex-row gap-3">
              {Number(task.ProjectTaskStatusId) > 1 && (
                <Button
                  isIconOnly
                  size="sm"
                  onClick={() =>
                    updateTaskStatus(
                      task.ProjectTaskId,
                      Number(task.ProjectTaskStatusId) - 1
                    )
                  }
                >
                  <ArrowBackIosNewRoundedIcon />
                </Button>
              )}
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
                  {permissions.editActivity && (
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
                  )}
                  {permissions.removeActivity && (
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
                  )}
                </DropdownMenu>
              </Dropdown>
              {task.ProjectTaskStatusId < columnCount && (
                <Button
                  isIconOnly
                  size="sm"
                  onClick={() =>
                    updateTaskStatus(
                      task.ProjectTaskId,
                      Number(task.ProjectTaskStatusId) + 1
                    )
                  }
                >
                  <ArrowForwardIosRoundedIcon />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardBody className="px-3 py-0 text-small">
            <ReactQuill
              className="sm:col-span-2 sm:mt-0 h-fit"
              theme="bubble"
              value={task.ProjectTaskDescription}
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
            <div className="flex flex-row items-center justify-between gap-3 w-full">
              <span className="font-semibold">
                {formatDate(task.ProjectTaskExpiration)}
              </span>
              <Button
                color="primary"
                isIconOnly
                size="sm"
                onClick={() =>
                  setModalCommentData({
                    ...modalCommentData,
                    open: true,
                    Task: task,
                  })
                }
              >
                <SmsRoundedIcon />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
