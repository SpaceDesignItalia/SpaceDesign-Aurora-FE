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
  const formatDate = (date: DateValue | string | null | undefined) => {
    if (!date) return "Nessuna data";

    // Se la data è già una stringa, la convertiamo direttamente
    if (typeof date === "string") {
      return dayjs(date).format("DD MMM YYYY");
    }

    // Altrimenti usiamo il formatter per DateValue
    return dayjs(formatter.format(new Date(date.toString()))).format(
      "DD MMM YYYY"
    );
  };

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
          <CardHeader className="flex flex-col gap-2 xs:gap-2.5 sm:gap-3 px-2.5 xs:px-3 sm:px-4 md:px-5 pt-3 xs:pt-3.5 sm:pt-4 pb-1.5 xs:pb-2 w-full">
            <div className="flex items-center justify-between w-full gap-1.5 xs:gap-2">
              <h1 className="text-sm xs:text-base sm:text-lg font-semibold text-slate-800 line-clamp-1 tracking-tight flex-grow">
                {task.ProjectTaskName}
              </h1>
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
                    className={`flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 text-[10px] xs:text-[11px] sm:text-xs ${
                      getPriorityStyles(task.PriorityId).bgColor
                    } ${
                      getPriorityStyles(task.PriorityId).hoverBg
                    } px-1.5 xs:px-2 sm:px-2.5 py-0.5 xs:py-1 sm:py-1.5 rounded-full transition-all border ${
                      getPriorityStyles(task.PriorityId).borderColor
                    } shadow-sm flex-shrink-0`}
                  >
                    <Icon
                      icon={getPriorityStyles(task.PriorityId).icon}
                      className={`${
                        getPriorityStyles(task.PriorityId).textColor
                      }`}
                      fontSize={10}
                    />
                    <span
                      className={`font-medium tracking-wide ${
                        getPriorityStyles(task.PriorityId).textColor
                      } hidden xs:inline`}
                    >
                      {priorities.find(
                        (priority) =>
                          priority.ProjectTaskPriorityId === task.PriorityId
                      )?.ProjectTaskPriorityName || "Non definita"}
                    </span>
                  </div>
                </Tooltip>
              )}
              {isSelected && (
                <Icon
                  icon="mdi:check-circle"
                  className="text-primary animate-pulse flex-shrink-0"
                  fontSize={20}
                />
              )}
            </div>

            <div className="flex flex-col gap-1 xs:gap-1.5 w-full">
              {task.ProjectTaskTags.length > 0 && (
                <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-2 w-full">
                  {task.ProjectTaskTags.slice(0, 2).map((tag) => (
                    <Chip
                      key={tag.ProjectTaskTagId}
                      size="sm"
                      className="text-[10px] xs:text-[11px] sm:text-xs font-medium px-1.5 xs:px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/50 text-slate-700 hover:bg-white/80 transition-colors border-2"
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
                          className="text-[10px] xs:text-[11px] sm:text-xs font-medium px-1.5 xs:px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/50 text-slate-700 hover:bg-white/80 transition-colors border-2"
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

          <CardBody className="px-2.5 xs:px-3 sm:px-4 md:px-5 py-1 xs:py-1.5 sm:py-2 md:py-3">
            <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-2 text-slate-700">
              {hasValidDescription(task.ProjectTaskDescription ?? "") && (
                <Tooltip
                  content="Descrizione presente"
                  showArrow
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 text-[10px] xs:text-[11px] sm:text-xs bg-blue-50 hover:bg-blue-100/80 px-1.5 xs:px-2 sm:px-2.5 py-0.5 xs:py-1 sm:py-1.5 rounded-full transition-all border border-blue-200 shadow-sm">
                    <Icon
                      icon="fluent:text-description-16-filled"
                      className="text-blue-600"
                      fontSize={10}
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
                  <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 text-[10px] xs:text-[11px] sm:text-xs bg-blue-50 hover:bg-blue-100/80 px-1.5 xs:px-2 sm:px-2.5 py-0.5 xs:py-1 sm:py-1.5 rounded-full transition-all border border-blue-200 shadow-sm">
                    <Icon
                      icon="solar:paperclip-linear"
                      className="text-blue-600"
                      fontSize={10}
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
                  <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 text-[10px] xs:text-[11px] sm:text-xs bg-blue-50 hover:bg-blue-100/80 px-1.5 xs:px-2 sm:px-2.5 py-0.5 xs:py-1 sm:py-1.5 rounded-full transition-all border border-blue-200 shadow-sm">
                    <Icon
                      icon="solar:checklist-linear"
                      className="text-blue-600"
                      fontSize={10}
                    />
                    <span className="font-medium tracking-wide text-blue-600">
                      {checkboxCount} task
                    </span>
                  </div>
                </Tooltip>
              )}
              {commentsCount > 0 && (
                <Tooltip
                  content={`${commentsCount} ${
                    commentsCount === 1 ? "commento" : "commenti"
                  }`}
                  showArrow
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 text-[10px] xs:text-[11px] sm:text-xs bg-blue-50 hover:bg-blue-100/80 px-1.5 xs:px-2 sm:px-2.5 py-0.5 xs:py-1 sm:py-1.5 rounded-full transition-all border border-blue-200 shadow-sm">
                    <Icon
                      icon="solar:chat-round-line-linear"
                      className="text-blue-600"
                      fontSize={10}
                    />
                    <span className="font-medium tracking-wide text-blue-600">
                      {commentsCount}{" "}
                      {commentsCount === 1 ? "commento" : "commenti"}
                    </span>
                  </div>
                </Tooltip>
              )}
            </div>
          </CardBody>

          <CardFooter className="flex flex-col gap-1.5 xs:gap-2 sm:gap-3 px-2.5 xs:px-3 sm:px-4 md:px-5 pb-2.5 xs:pb-3 sm:pb-4 pt-1 xs:pt-1.5 sm:pt-2 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-1.5 xs:gap-2">
              {task.ProjectTaskMembers.length > 0 && (
                <AvatarGroup
                  isBordered
                  max={3}
                  size="sm"
                  className="justify-start px-1 py-0.5"
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
                        className="border-2 border-white w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8"
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
                <div
                  className={`flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 text-[10px] xs:text-[11px] sm:text-xs ${
                    task.ProjectTaskExpiration
                      ? dayjs(task.ProjectTaskExpiration.toString()).isBefore(
                          dayjs(),
                          "day"
                        )
                        ? "bg-red-100 hover:bg-red-200/80 border-red-300 text-red-700"
                        : dayjs(task.ProjectTaskExpiration.toString()).isSame(
                            dayjs(),
                            "day"
                          )
                        ? "bg-red-50 hover:bg-red-100/80 border-red-200 text-red-600"
                        : "bg-slate-100 hover:bg-slate-200/80 border-slate-300 text-slate-700"
                      : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-600"
                  } px-1.5 xs:px-2 sm:px-2.5 py-0.5 xs:py-1 sm:py-1.5 rounded-full transition-all border shadow-sm w-full md:w-auto text-center max-w-full md:max-w-[14rem] lg:max-w-none overflow-hidden`}
                >
                  <Icon
                    icon="solar:calendar-linear"
                    className="text-slate-700 flex-shrink-0"
                    fontSize={10}
                  />
                  <span className="font-medium tracking-wide whitespace-nowrap text-[9px] xs:text-[10px] sm:text-xs overflow-hidden text-ellipsis">
                    {formatDate(task.ProjectTaskCreation).split(" ")[0]}{" "}
                    {formatDate(task.ProjectTaskCreation).split(" ")[1]}{" "}
                    {formatDate(task.ProjectTaskCreation).split(" ")[2]}
                    <span className="mx-0.5 xs:mx-1 opacity-50">→</span>
                    {task.ProjectTaskExpiration
                      ? `${
                          formatDate(task.ProjectTaskExpiration).split(" ")[0]
                        } ${
                          formatDate(task.ProjectTaskExpiration).split(" ")[1]
                        } ${
                          formatDate(task.ProjectTaskExpiration).split(" ")[2]
                        }`
                      : "Nessuna"}
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
