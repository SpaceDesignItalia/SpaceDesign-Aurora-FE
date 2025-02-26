"use client";

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
import { parseDate, type DateValue } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import type React from "react";

// Import modali
import ViewTaskModal from "./ViewTaskModal";
import { API_URL_IMG } from "../../../../../API/API";

// Interfacce
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
  ProjectTaskExpiration?: DateValue | null | undefined;
  ProjectTaskCreation: DateValue;
  ProjectTaskStatusId: number;
  ProjectTaskTags: Tag[];
  ProjectTaskMembers: Member[];
  ProjectTaskComments: Comment[];
  ProjectId: number;
  ProjectTaskChecklists: any[];
  PriorityId: number;
}

interface ModalData {
  Task: Task;
  open: boolean;
}

interface TaskCardProps {
  task: Task;
  setUpdate: (value: boolean | ((prev: boolean) => boolean)) => void;
  update: boolean;
  socket: any;
  projectId: number;
  updateTaskStatus: (taskId: number, statusId: number) => void;
  columnCount: number;
  isMultiSelect: boolean;
  handleTaskSelect: (taskId: number, isDragging?: boolean) => void;
  isSelected: boolean;
  isDragging?: boolean;
  isCtrlPressed?: boolean;
  isPartOfGroup: boolean;
}

interface Priority {
  ProjectTaskPriorityId: number;
  ProjectTaskPriorityName: string;
}

export default function TaskCard({
  task,
  setUpdate,
  update,
  socket,
  isMultiSelect,
  handleTaskSelect,
  isSelected,
  isDragging,
  isCtrlPressed,
  isPartOfGroup,
}: TaskCardProps) {
  // Modale di view
  const [modalData, setModalData] = useState<ModalData>({
    Task: {
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskExpiration: parseDate(dayjs().format("YYYY-MM-DD")),
      ProjectTaskCreation: parseDate(dayjs().format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectTaskComments: [],
      ProjectId: 0,
      ProjectTaskChecklists: [],
      PriorityId: 4,
    },
    open: false,
  });

  // Conteggio commenti
  const [commentsCount, setCommentsCount] = useState(0);
  const [priorities, setPriorities] = useState<Priority[]>([]);
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
    const fetchPriorities = async () => {
      const priorityResponse = await axios.get<Priority[]>(
        "/Project/GET/GetAllPriorities"
      );
      setPriorities(priorityResponse.data);
    };
    fetchPriorities();
  }, [task.ProjectTaskId]);

  // Conteggio checklist
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
  }, [task.ProjectTaskId]);

  // Conteggio file
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
  }, [task.ProjectTaskId]);

  const formatter = useDateFormatter({ dateStyle: "full" });

  // Formatta data scadenza
  function formatDate(date: DateValue) {
    if (!date) return "Nessuna scadenza";
    return dayjs(formatter.format(new Date(date.toString()))).format(
      "DD MMM YYYY"
    );
  }

  // Verifica descrizione "valida"
  function hasValidDescription(content: string) {
    if (!content) return false;
    const splittedContent: string[] = content.split(">");
    let valid = false;
    splittedContent.forEach((element) => {
      if (!element.startsWith("<") && element.trim().length > 0) {
        valid = true;
      }
    });
    return valid;
  }

  // Gestione click sulla card
  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (e.ctrlKey || isCtrlPressed || isMultiSelect) {
        e.preventDefault();
        e.stopPropagation();
        handleTaskSelect(task.ProjectTaskId, false);
      } else {
        setModalData({ Task: task, open: true });
      }
    },
    [isDragging, isCtrlPressed, isMultiSelect, handleTaskSelect, task]
  );

  useEffect(() => {
    const handleTaskNews = () => {
      setUpdate((prev) => !prev);
    };

    socket.on("task-news", handleTaskNews);

    return () => {
      socket.off("task-news", handleTaskNews);
    };
  }, [socket, setUpdate]);

  const getPriorityStyles = (priorityId: number) => {
    console.log("Priority ID:", priorityId); // Debug

    switch (Number(priorityId)) {
      case 1: // Critica
        return {
          bgColor: "bg-red-100",
          borderColor: "border-red-300",
          textColor: "text-red-700",
          hoverBg: "hover:bg-red-200/80",
          icon: "ri:alarm-warning-fill",
        };
      case 2: // Molto Alta
        return {
          bgColor: "bg-orange-100",
          borderColor: "border-orange-300",
          textColor: "text-orange-700",
          hoverBg: "hover:bg-orange-200/80",
          icon: "solar:double-alt-arrow-up-linear",
        };
      case 3: // Alta
        return {
          bgColor: "bg-amber-100",
          borderColor: "border-amber-300",
          textColor: "text-amber-700",
          hoverBg: "hover:bg-amber-200/80",
          icon: "solar:alt-arrow-up-linear",
        };
      case 4: // Media
        return {
          bgColor: "bg-blue-100",
          borderColor: "border-blue-300",
          textColor: "text-blue-700",
          hoverBg: "hover:bg-blue-200/80",
          icon: "solar:alt-arrow-down-linear",
        };
      case 5: // Bassa
        return {
          bgColor: "bg-emerald-100",
          borderColor: "border-emerald-300",
          textColor: "text-emerald-700",
          hoverBg: "hover:bg-emerald-200/80",
          icon: "solar:alt-arrow-down-linear",
        };
      case 6: // Molto Bassa
        return {
          bgColor: "bg-green-100",
          borderColor: "border-green-300",
          textColor: "text-green-700",
          hoverBg: "hover:bg-green-200/80",
          icon: "solar:double-alt-arrow-down-linear",
        };
      default:
        return {
          bgColor: "bg-slate-50",
          borderColor: "border-slate-200",
          textColor: "text-slate-600",
          hoverBg: "hover:bg-slate-100/80",
          icon: "",
        };
    }
  };

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
        onClick={handleCardClick}
        className={`w-full cursor-grab active:cursor-grabbing transition-all duration-300 ${
          isDragging ? "z-50 opacity-90 scale-105" : ""
        }`}
      >
        <Card
          className={`w-full border-none ${
            isSelected ? "bg-white" : isPartOfGroup ? "bg-white" : "bg-white"
          }`}
          radius="lg"
        >
          <CardHeader className="flex flex-col gap-2 px-5 pt-4 pb-2">
            <div className="flex justify-end w-full">
              {priorities.length > 0 && (
                <Tooltip
                  content={`Priorità ${
                    priorities.find(
                      (priority) =>
                        priority.ProjectTaskPriorityId === task.PriorityId
                    )?.ProjectTaskPriorityName
                  }`}
                  showArrow
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <div
                    className={`flex items-center gap-1.5 text-xs ${
                      getPriorityStyles(task.PriorityId).bgColor
                    } ${
                      getPriorityStyles(task.PriorityId).hoverBg
                    } px-2.5 py-1.5 rounded-full transition-all border ${
                      getPriorityStyles(task.PriorityId).borderColor
                    } shadow-sm`}
                  >
                    <Icon
                      icon={getPriorityStyles(task.PriorityId).icon}
                      className={`${
                        getPriorityStyles(task.PriorityId).textColor
                      }`}
                      fontSize={14}
                    />
                    <span
                      className={`font-medium tracking-wide ${
                        getPriorityStyles(task.PriorityId).textColor
                      }`}
                    >
                      {priorities.find(
                        (priority) =>
                          priority.ProjectTaskPriorityId === task.PriorityId
                      )?.ProjectTaskPriorityName || "Non definita"}
                    </span>
                  </div>
                </Tooltip>
              )}
            </div>

            <div className="flex flex-col gap-2.5 flex-grow">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-slate-800 line-clamp-2 tracking-tight">
                  {task.ProjectTaskName}
                </h1>
                {isSelected && (
                  <Icon
                    icon="mdi:check-circle"
                    className="text-primary animate-pulse"
                    fontSize={26}
                  />
                )}
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
              {hasValidDescription(task.ProjectTaskDescription ?? "") && (
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
                content="Data di scadenza"
                showArrow
                className="bg-white/90 backdrop-blur-sm"
              >
                <div
                  className={`flex items-center gap-2 text-xs ${
                    task.ProjectTaskExpiration
                      ? dayjs(task.ProjectTaskExpiration.toString()).isBefore(
                          dayjs(),
                          "day"
                        )
                        ? "bg-red-100 hover:bg-red-200/80 border-red-300 text-red-700" // Scaduto
                        : dayjs(task.ProjectTaskExpiration.toString()).isSame(
                            dayjs(),
                            "day"
                          )
                        ? "bg-red-50 hover:bg-red-100/80 border-red-200 text-red-600" // Scade oggi
                        : "bg-slate-100 hover:bg-slate-200/80 border-slate-300 text-slate-700" // Futuro
                      : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-600" // Nessuna scadenza
                  } px-3 py-1.5 rounded-full transition-all border shadow-sm`}
                >
                  <Icon
                    icon="solar:calendar-linear"
                    className={
                      task.ProjectTaskExpiration
                        ? dayjs(task.ProjectTaskExpiration.toString()).isBefore(
                            dayjs(),
                            "day"
                          )
                          ? "text-red-700"
                          : dayjs(task.ProjectTaskExpiration.toString()).isSame(
                              dayjs(),
                              "day"
                            )
                          ? "text-red-600"
                          : "text-slate-700"
                        : "text-slate-700"
                    }
                    fontSize={14}
                  />
                  <span className="font-medium tracking-wide">
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
