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
import ViewTaskModal from "./ViewTaskModal";
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
      <ViewTaskModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        TaskData={modalData.Task}
        socket={socket}
        update={update}
        setUpdate={setUpdate}
        hasValidDescription={hasValidDescription}
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
        className="w-full cursor-pointer"
      >
        <Card
          className="w-full hover:shadow-lg transition-shadow duration-200"
          radius="sm"
        >
          <CardHeader className="flex justify-between items-start gap-3 px-4 pt-4 pb-2">
            <div className="flex flex-col gap-2 flex-grow">
              <h1 className="text-lg font-semibold text-default-700 line-clamp-2">
                {task.ProjectTaskName}
              </h1>
              {task.ProjectTaskTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {task.ProjectTaskTags.map((tag) => (
                    <Chip
                      key={tag.ProjectTaskTagId}
                      size="sm"
                      variant="flat"
                      className="text-xs px-2 py-1 bg-default-100"
                    >
                      {tag.ProjectTaskTagName}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>

          <CardBody className="px-4 py-3">
            <div className="flex flex-wrap gap-3 text-default-500">
              {hasValidDescription(task.ProjectTaskDescription) && (
                <Tooltip content="Descrizione presente" showArrow>
                  <div className="flex items-center gap-1.5 text-sm bg-default-100 px-2.5 py-1 rounded-lg">
                    <Icon
                      icon="fluent:text-description-16-filled"
                      fontSize={22}
                    />
                    <span>Descrizione</span>
                  </div>
                </Tooltip>
              )}
              {fileCount > 0 && (
                <Tooltip content={`${fileCount} file allegati`} showArrow>
                  <div className="flex items-center gap-1.5 text-sm bg-default-100 px-2.5 py-1 rounded-lg">
                    <Icon icon="solar:paperclip-linear" fontSize={22} />
                    <span>{fileCount} file</span>
                  </div>
                </Tooltip>
              )}
              {checkboxCount > 0 && (
                <Tooltip content={`${checkboxCount} checklist items`} showArrow>
                  <div className="flex items-center gap-1.5 text-sm bg-default-100 px-2.5 py-1 rounded-lg">
                    <Icon icon="solar:checklist-linear" fontSize={22} />
                    <span>{checkboxCount} task</span>
                  </div>
                </Tooltip>
              )}
              {commentsCount > 0 && (
                <Tooltip content={`${commentsCount} commenti`} showArrow>
                  <div className="flex items-center gap-1.5 text-sm bg-default-100 px-2.5 py-1 rounded-lg">
                    <Icon icon="solar:chat-round-line-linear" fontSize={22} />
                    <span>{commentsCount} commenti</span>
                  </div>
                </Tooltip>
              )}
            </div>
          </CardBody>

          <CardFooter className="flex flex-col gap-3 px-4 pb-4 pt-2 border-t border-default-200">
            <div className="flex justify-between items-center w-full">
              {task.ProjectTaskMembers.length > 0 && (
                <AvatarGroup
                  isBordered
                  max={3}
                  size="sm"
                  className="justify-start ml-3"
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
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
