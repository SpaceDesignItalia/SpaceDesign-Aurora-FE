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
} from "@heroui/react";
import { API_URL_IMG } from "../../../../../API/API";
import dayjs from "dayjs";
import { useDateFormatter } from "@react-aria/i18n";
import { useState } from "react";
import { parseDate } from "@internationalized/date";
import ConfirmDeleteTaskModal from "./ConfirmDeleteTaskModal";
import ViewArchivedTaskModal from "./ViewArchivedTaskModal";
import axios from "axios";
import { useEffect } from "react";
import { usePermissions } from "../../../Layout/PermissionProvider";
import ReactQuill from "react-quill";
import { Icon } from "@iconify/react";

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
  ProjectTaskExpiration?: DateValue | null;
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
  task,
  setUpdate,
  update,
  socket,
  projectId,
  columnCount,
}: {
  task: Task;
  setUpdate: any;
  update: any;
  socket: any;
  projectId: number;
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
  const [permissions, setPermissions] = useState({
    editActivity: false,
    removeActivity: false,
  });

  const { hasPermission } = usePermissions();
  useEffect(() => {
    async function fetchPermissions() {
      const editActivity = await hasPermission("EDIT_ACTIVITY");
      const removeActivity = await hasPermission("REMOVE_ACTIVITY");

      setPermissions({
        ...permissions,
        editActivity: editActivity,
        removeActivity: removeActivity,
      });
    }
    fetchPermissions();
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

  const [fileCount, setFileCount] = useState(0);
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get("/Project/GET/GetFilesByTaskId", {
          params: { TaskId: task.ProjectTaskId },
        });
        setFileCount(response.data.length);
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };
    fetchFiles();
  }, [update]);

  function formatDate(date: DateValue) {
    if (!date) return "Nessuna scadenza";
    let formatter = useDateFormatter({ dateStyle: "full" });
    return dayjs(formatter.format(new Date(date.toString()))).format(
      "DD MMM YYYY"
    );
  }

  function hasValidDescription(content) {
    let splittedContent: string[] = content.split(">");
    let valid = false;
    splittedContent.forEach((element) => {
      if (!element.startsWith("<") && element.length > 0) {
        valid = true;
      }
    });
    if (valid) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <>
      <ViewArchivedTaskModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        TaskData={modalData.Task}
        socket={socket}
        update={update}
        setUpdate={setUpdate}
        hasValidDescription={hasValidDescription}
      />

      <div
        className="h-44"
        onClick={(e) =>
          setModalData({
            ...modalData,
            open: true,
            Task: task,
          })
        }
      >
        <Card className="h-full p-2" radius="sm">
          <CardHeader className="justify-between items-start">
            <h1 className="text-normal font-semibold text-default-600 text-ellipsis overflow-hidden">
              {task.ProjectTaskName}
            </h1>

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
          <CardBody className="flex flex-row gap-3 px-3 py-0 text-small items-start">
            {hasValidDescription(task.ProjectTaskDescription) && (
              <Tooltip
                content="Questa task ha una descrizione"
                showArrow
                placement="bottom"
              >
                <Icon icon="fluent:text-description-16-filled" fontSize={22} />
              </Tooltip>
            )}
            {task.ProjectTaskTags.length > 0 && (
              <Tooltip
                content="Tags assegnati alla task"
                showArrow
                placement="bottom"
              >
                <div className="flex flex-row justify-center items-center gap-1 font-semibold">
                  <Icon icon="solar:tag-linear" fontSize={22} />
                  {task.ProjectTaskTags.length}
                </div>
              </Tooltip>
            )}
            {fileCount > 0 && (
              <Tooltip
                content="File assegnati alla task"
                showArrow
                placement="bottom"
              >
                <div className="flex flex-row justify-center items-center gap-1 font-semibold">
                  <Icon icon="solar:paperclip-linear" fontSize={22} />
                  {fileCount}
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
                  <Icon icon="solar:checklist-linear" fontSize={22} />
                  {checkboxCount}
                </div>
              </Tooltip>
            )}
            {commentsCount > 0 && (
              <Tooltip
                content="Commenti riguardo la task"
                showArrow
                placement="bottom"
              >
                <div className="flex flex-row justify-center items-center gap-1 font-semibold">
                  <Icon icon="solar:chat-round-line-linear" fontSize={22} />
                  {commentsCount}
                </div>
              </Tooltip>
            )}
          </CardBody>
          <CardFooter className="gap-3 flex flex-col items-end">
            {task.ProjectTaskMembers.length !== 0 && (
              <AvatarGroup
                isBordered
                isGrid
                className={
                  task.ProjectTaskMembers.length > 3
                    ? `grid-cols-4`
                    : `grid-cols-${task.ProjectTaskMembers.length}`
                }
                max={3}
              >
                {task.ProjectTaskMembers.map((member) => (
                  <Tooltip
                    key={member.StafferId}
                    content={member.StafferFullName}
                  >
                    <Avatar
                      size="sm"
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
            <div className="flex flex-row items-center justify-between gap-3 w-full">
              <Tooltip content="Scadenza task" showArrow placement="bottom">
                <span className="flex flex-row gap-2 justify-center items-center font-semibold text-sm">
                  <Icon icon="solar:calendar-linear" fontSize={22} />
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
