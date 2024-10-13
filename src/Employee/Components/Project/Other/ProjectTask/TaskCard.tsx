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
  Tooltip,
} from "@nextui-org/react";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
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
import { usePermissions } from "../../../Layout/PermissionProvider";
import ReactQuill from "react-quill";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

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

  const [commentsCount, setCommentsCount] = useState(0);
  useEffect(() => {
    const fetchComments = async () => {
      const commentResponse = await axios.get<Comment[]>(
        "/Project/GET/GetCommentsByTaskId",
        {
          params: { ProjectTaskId: task.ProjectTaskId },
        }
      );
      setCommentsCount(commentResponse.data.length);
    };
    fetchComments();
  }, [update]);

  const [checkboxCount, setCheckboxCount] = useState(0);
  useEffect(() => {
    const fetchCheckboxes = async () => {
      const checkboxResponse = await axios.get(
        "/Project/GET/GetChecklistsByTaskId",
        {
          params: { TaskId: task.ProjectTaskId },
        }
      );
      setCheckboxCount(checkboxResponse.data.length);
    };
    fetchCheckboxes();
  }, [update]);

  function formatDate(date: DateValue) {
    let formatter = useDateFormatter({ dateStyle: "full" });
    return dayjs(formatter.format(new Date(date.toString()))).format(
      "DD MMM YYYY"
    );
  }

  async function DeleteTask(taskId: number) {
    await axios.delete("/Project/DELETE/DeleteTask", {
      params: { ProjectTaskId: taskId },
    });
    socket.emit("task-news", projectId);
    setUpdate(!update);
  }

  useEffect(() => {
    setModalData({
      ...modalData,
      Task: task,
    });
    setModalDeleteData({
      ...modalDeleteData,
      Task: task,
    });
    setModalEditData({
      ...modalEditData,
      Task: task,
    });
  }, [task]);

  return (
    <>
      <ViewTaskModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        TaskData={modalData.Task}
        socket={socket}
        update={update}
        setUpdate={setUpdate}
      />
      <EditTaskModal
        isOpen={modalEditData.open}
        isClosed={() => setModalEditData({ ...modalEditData, open: false })}
        TaskData={modalEditData.Task}
        socket={socket}
      />
      <ConfirmDeleteTaskModal
        isOpen={modalDeleteData.open}
        isClosed={() => setModalDeleteData({ ...modalDeleteData, open: false })}
        TaskData={modalDeleteData.Task}
        DeleteTask={DeleteTask}
      />
      <div
        onClick={(e) =>
          setModalData({
            ...modalData,
            open: true,
            Task: task,
          })
        }
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Card className="h-full p-2" radius="sm">
          <CardHeader className="justify-between items-start">
            <div className="flex gap-5">
              <div className="flex flex-col gap-3 items-start justify-center w-auto h-fit">
                <h1 className="text-normal font-bold text-default-600">
                  {task.ProjectTaskName}
                </h1>
              </div>
            </div>
            <div className="flex flex-row">
              {/*  {Number(task.ProjectTaskStatusId) > 1 && (
                <Button
                  variant="light"
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

              {task.ProjectTaskStatusId < columnCount && (
                <Button
                  variant="light"
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
              )} */}
            </div>
          </CardHeader>
          <CardBody className="flex flex-row gap-3 px-3 py-0 text-small">
            {task.ProjectTaskDescription && (
              <Tooltip
                content="Questa task ha una descrizione"
                showArrow
                placement="bottom"
              >
                <NotesRoundedIcon />
              </Tooltip>
            )}
            {commentsCount > 0 && (
              <Tooltip
                content="Commenti riguardo la task"
                showArrow
                placement="bottom"
              >
                <div className="flex flex-row justify-center items-center gap-1 font-semibold">
                  <ChatRoundedIcon />
                  {commentsCount}
                </div>
              </Tooltip>
            )}
            {checkboxCount > 0 && (
              <Tooltip
                content="Checklist assegnata alla task"
                showArrow
                placement="bottom"
              >
                <div className="flex flex-row justify-center items-center gap-1 font-semibold">
                  <CheckCircleOutlineRoundedIcon />
                  {checkboxCount}
                </div>
              </Tooltip>
            )}
            {task.ProjectTaskTags.length > 0 && (
              <Tooltip
                content="Tags assegnati alla task"
                showArrow
                placement="bottom"
              >
                <div className="flex flex-row justify-center items-center gap-1 font-semibold">
                  <LocalOfferRoundedIcon />
                  {task.ProjectTaskTags.length}
                </div>
              </Tooltip>
            )}
          </CardBody>
          <CardFooter className="gap-3 flex flex-col items-end">
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
              <Tooltip content="Scadenza task" showArrow placement="bottom">
                <span className="flex flex-row gap-2 justify-center items-center font-semibold text-sm">
                  <CalendarMonthRoundedIcon sx={{ fontSize: 20 }} />
                  {formatDate(task.ProjectTaskExpiration)}
                </span>
              </Tooltip>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
