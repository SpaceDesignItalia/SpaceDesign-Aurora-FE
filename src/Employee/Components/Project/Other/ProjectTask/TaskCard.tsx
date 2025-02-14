"use client"

import { Avatar, AvatarGroup, Card, CardHeader, CardBody, CardFooter, Chip, Tooltip } from "@heroui/react"
import { Icon } from "@iconify/react"
import dayjs from "dayjs"
import { parseDate, type DateValue } from "@internationalized/date"
import { useDateFormatter } from "@react-aria/i18n"
import axios from "axios"
import { useEffect, useState, useCallback } from "react"
import type React from "react"

// Import modali
import ViewTaskModal from "./ViewTaskModal"
import { API_URL_IMG } from "../../../../../API/API"
import { usePermissions } from "../../../Layout/PermissionProvider"

// Interfacce
interface Tag {
  ProjectTaskTagId: number
  ProjectTaskTagName: string
}

interface Member {
  StafferId: number
  StafferFullName: string
  StafferEmail: string
  StafferImageUrl: string
}

interface Comment {
  ProjectTaskCommentId: number
  StafferId: number
  StafferFullName: string
  StafferImageUrl: string
  Text: string
  CommentDate: Date
}

interface Task {
  ProjectTaskId: number
  ProjectTaskName: string
  ProjectTaskDescription?: string
  ProjectTaskExpiration?: DateValue | null
  ProjectTaskCreation: DateValue
  ProjectTaskStatusId: number
  ProjectTaskTags: Tag[]
  ProjectTaskMembers: Member[]
  ProjectTaskComments: Comment[]
  ProjectId: number
}

interface ModalData {
  Task: Task
  open: boolean
}

interface TaskCardProps {
  provided: any
  task: Task
  setUpdate: (value: boolean) => void
  update: boolean
  socket: any
  projectId: number
  updateTaskStatus: (taskId: number, statusId: number) => void
  columnCount: number
  isMultiSelect: boolean
  handleTaskSelect: (taskId: number, isDragging?: boolean) => void
  isSelected: boolean
  isDragging?: boolean
  isCtrlPressed?: boolean
  // Nuovi props per il multi-drag layer
  draggingTaskId?: number | null
  onDragStyleUpdate?: (style: any) => void
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
  isMultiSelect,
  handleTaskSelect,
  isSelected,
  isDragging,
  isCtrlPressed,
  draggingTaskId,
  onDragStyleUpdate,
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
    },
    open: false,
  })

  // Permessi
  const [permissions, setPermissions] = useState({
    editActivity: false,
    removeActivity: false,
  })

  const { hasPermission } = usePermissions()

  useEffect(() => {
    async function fetchPermissions() {
      const editActivity = await hasPermission("EDIT_ACTIVITY")
      const removeActivity = await hasPermission("REMOVE_ACTIVITY")
      setPermissions({
        editActivity,
        removeActivity,
      })
    }
    fetchPermissions()
  }, [hasPermission])

  // Conteggio commenti
  const [commentsCount, setCommentsCount] = useState(0)

  useEffect(() => {
    const fetchComments = async () => {
      const commentResponse = await axios.get<Comment[]>("/Project/GET/GetCommentsByTaskId", {
        params: { ProjectTaskId: task.ProjectTaskId },
      })
      setCommentsCount(commentResponse.data.length)
    }
    fetchComments()
  }, [task.ProjectTaskId])

  // Conteggio checklist
  const [checkboxCount, setCheckboxCount] = useState(0)

  useEffect(() => {
    const fetchCheckboxes = async () => {
      const checkboxResponse = await axios.get("/Project/GET/GetChecklistsByTaskId", {
        params: { TaskId: task.ProjectTaskId },
      })
      setCheckboxCount(checkboxResponse.data.length)
    }
    fetchCheckboxes()
  }, [task.ProjectTaskId])

  // Conteggio file
  const [fileCount, setFileCount] = useState(0)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get("/Project/GET/GetFilesByTaskId", {
          params: { TaskId: task.ProjectTaskId },
        })
        setFileCount(response.data.length)
      } catch (err) {
        console.error("Error fetching files:", err)
      }
    }
    fetchFiles()
  }, [task.ProjectTaskId])

  const formatter = useDateFormatter({ dateStyle: "full" })

  // Formatta data scadenza
  function formatDate(date: DateValue) {
    if (!date) return "Nessuna scadenza"
    return dayjs(formatter.format(new Date(date.toString()))).format("DD MMM YYYY")
  }

  // Verifica descrizione "valida"
  function hasValidDescription(content: string) {
    if (!content) return false
    const splittedContent: string[] = content.split(">")
    let valid = false
    splittedContent.forEach((element) => {
      if (!element.startsWith("<") && element.trim().length > 0) {
        valid = true
      }
    })
    return valid
  }

  // Gestione click sulla card
  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      if (e.ctrlKey || isCtrlPressed || isMultiSelect) {
        e.preventDefault()
        e.stopPropagation()
        handleTaskSelect(task.ProjectTaskId, false)
      } else {
        setModalData({ Task: task, open: true })
      }
    },
    [isDragging, isCtrlPressed, isMultiSelect, handleTaskSelect, task],
  )

  useEffect(() => {
    const handleTaskNews = () => {
      setUpdate((prev) => !prev)
    }

    socket.on("task-news", handleTaskNews)

    return () => {
      socket.off("task-news", handleTaskNews)
    }
  }, [socket, setUpdate])

  // Se questo è l’elemento attivo e si sta trascinando, aggiorno lo stile per il multi-drag layer
  useEffect(() => {
    if (isDragging && draggingTaskId === task.ProjectTaskId && provided.draggableProps.style && onDragStyleUpdate) {
      onDragStyleUpdate(provided.draggableProps.style)
    }
  }, [isDragging, provided.draggableProps.style, draggingTaskId, task.ProjectTaskId, onDragStyleUpdate])

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
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        onClick={handleCardClick}
        className={`w-full cursor-grab active:cursor-grabbing ${isDragging ? "z-50" : ""}`}
      >
        <Card
          className={`w-full hover:shadow-lg transition-all duration-200 ${
            isSelected ? "border-2 border-primary bg-primary-50" : ""
          } ${isDragging ? "opacity-70 shadow-xl scale-105" : ""}`}
          radius="sm"
        >
          <CardHeader className="flex justify-between items-start gap-3 px-4 pt-4 pb-2">
            <div className="flex flex-col gap-2 flex-grow">
              <h1 className="text-lg font-semibold text-default-700 line-clamp-2">{task.ProjectTaskName}</h1>

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
              {hasValidDescription(task.ProjectTaskDescription ?? "") && (
                <Tooltip content="Descrizione presente" showArrow>
                  <div className="flex items-center gap-1.5 text-sm bg-default-100 px-2.5 py-1 rounded-lg">
                    <Icon icon="fluent:text-description-16-filled" fontSize={22} />
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
                <AvatarGroup isBordered max={3} size="sm" className="justify-start ml-3">
                  {task.ProjectTaskMembers.map((member) => (
                    <Tooltip key={member.StafferId} content={member.StafferFullName} showArrow>
                      <Avatar
                        src={member.StafferImageUrl && `${API_URL_IMG}/profileIcons/${member.StafferImageUrl}`}
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
  )
}
