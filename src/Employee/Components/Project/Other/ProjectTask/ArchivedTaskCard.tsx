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
    try {
      // Se la data è già una stringa, la convertiamo direttamente
      if (typeof date === "string") {
        const formattedDate = dayjs(date).format("DD MMM YYYY");
        return formattedDate === "Invalid Date"
          ? "Nessuna scadenza"
          : formattedDate;
      }

      // Se è un DateValue, lo convertiamo prima in una data JavaScript
      const jsDate = new Date(date.toString());
      if (isNaN(jsDate.getTime())) {
        return "Nessuna scadenza";
      }

      return dayjs(jsDate).format("DD MMM YYYY");
    } catch (error) {
      console.error("Errore nella formattazione della data:", error);
      return "Nessuna scadenza";
    }
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
        className="w-full cursor-pointer transition-all duration-300"
        onClick={(e) =>
          setModalData({
            ...modalData,
            open: true,
            Task: task,
          })
        }
      >
        <Card className="w-full border-none" radius="lg">
          <CardHeader className="flex flex-col gap-2 px-5 pt-4 pb-2">
            <div className="flex flex-col gap-2.5 flex-grow">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-slate-800 line-clamp-2 tracking-tight">
                  {task.ProjectTaskName}
                </h1>
              </div>
              {task.ProjectTaskTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {task.ProjectTaskTags.slice(0, 2).map((tag) => (
                    <Chip
                      key={tag.ProjectTaskTagId}
                      size="sm"
                      className="text-xs font-medium px-2.5 py-1 bg-white/50 text-slate-700 hover:bg-white/80 transition-colors border-2"
                    >
                      {tag.ProjectTaskTagName}
                    </Chip>
                  ))}
                  {task.ProjectTaskTags.length > 2 && (
                    <Tooltip
                      onClick={(e) => e.stopPropagation()}
                      content={
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm">
                            Altri tag:
                          </span>
                          {task.ProjectTaskTags.slice(2).map((tag) => (
                            <span
                              key={tag.ProjectTaskTagId}
                              className="text-sm pl-2"
                            >
                              • {tag.ProjectTaskTagName}
                            </span>
                          ))}
                        </div>
                      }
                      showArrow
                      className="bg-white/90 backdrop-blur-sm"
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <Chip
                          size="sm"
                          className="text-xs font-medium px-2.5 py-1 bg-white/50 text-slate-700 hover:bg-white/80 transition-colors border-2"
                        >
                          +{task.ProjectTaskTags.length - 2}
                        </Chip>
                      </div>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          <CardBody className="px-5 py-3">
            <div className="flex flex-wrap gap-2 text-slate-700">
              {hasValidDescription(task.ProjectTaskDescription) && (
                <Tooltip
                  content="Descrizione presente"
                  showArrow
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-full transition-all border border-blue-200 shadow-sm">
                    <Icon
                      icon="fluent:text-description-16-filled"
                      className="text-blue-600"
                      fontSize={14}
                    />
                    <span className="font-medium tracking-wide text-blue-600">
                      Descrizione
                    </span>
                  </div>
                </Tooltip>
              )}
              {fileCount > 0 && (
                <Tooltip
                  content={`${fileCount} file allegati`}
                  showArrow
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-full transition-all border border-blue-200 shadow-sm">
                    <Icon
                      icon="solar:paperclip-linear"
                      className="text-blue-600"
                      fontSize={14}
                    />
                    <span className="font-medium tracking-wide text-blue-600">
                      {fileCount} file
                    </span>
                  </div>
                </Tooltip>
              )}
              {checkboxCount > 0 && (
                <Tooltip
                  content={`${checkboxCount} checklist items`}
                  showArrow
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-full transition-all border border-blue-200 shadow-sm">
                    <Icon
                      icon="solar:checklist-linear"
                      className="text-blue-600"
                      fontSize={14}
                    />
                    <span className="font-medium tracking-wide text-blue-600">
                      {checkboxCount} task
                    </span>
                  </div>
                </Tooltip>
              )}
              {commentsCount > 0 && (
                <Tooltip
                  content={`${commentsCount} commenti`}
                  showArrow
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-full transition-all border border-blue-200 shadow-sm">
                    <Icon
                      icon="solar:chat-round-line-linear"
                      className="text-blue-600"
                      fontSize={14}
                    />
                    <span className="font-medium tracking-wide text-blue-600">
                      {commentsCount} commenti
                    </span>
                  </div>
                </Tooltip>
              )}
            </div>
          </CardBody>

          <CardFooter className="flex flex-col gap-3 px-5 pb-4 pt-2 border-t border-slate-200">
            <div className="flex justify-between items-center w-full">
              {task.ProjectTaskMembers.length > 0 && (
                <AvatarGroup
                  isBordered
                  max={3}
                  size="sm"
                  className="justify-start"
                  radius="full"
                >
                  {task.ProjectTaskMembers.map((member) => (
                    <Tooltip
                      key={member.StafferId}
                      content={member.StafferFullName}
                      showArrow
                      className="bg-white/90 backdrop-blur-sm"
                    >
                      <Avatar
                        src={
                          member.StafferImageUrl &&
                          `${API_URL_IMG}/profileIcons/${member.StafferImageUrl}`
                        }
                        alt={member.StafferFullName}
                        className="border-2 border-white"
                      />
                    </Tooltip>
                  ))}
                </AvatarGroup>
              )}
              <Tooltip
                content="Data creazione → Data scadenza"
                showArrow
                className="bg-white/90 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 text-xs bg-slate-100 hover:bg-slate-200/80 border-slate-300 text-slate-700 px-3 py-1.5 rounded-full transition-all border shadow-sm">
                  <Icon
                    icon="solar:calendar-linear"
                    className="text-slate-700"
                    fontSize={14}
                  />
                  <span className="font-medium tracking-wide">
                    {formatDate(task.ProjectTaskCreation)}
                    <span className="mx-2 opacity-50">→</span>
                    {task.ProjectTaskExpiration
                      ? formatDate(task.ProjectTaskExpiration)
                      : "Nessuna scadenza"}
                  </span>
                </div>
              </Tooltip>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
