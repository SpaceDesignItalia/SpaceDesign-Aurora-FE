"use client"

import { Button, Chip, cn, type DateValue, Select, SelectItem, Spinner, Tab, Tabs } from "@heroui/react"
import { Icon } from "@iconify/react"
import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { DragDropContext, Draggable, Droppable, type DropResult, type DragStart } from "react-beautiful-dnd"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"
import { API_WEBSOCKET_URL } from "../../../../../API/API"
import { usePermissions } from "../../../Layout/PermissionProvider"
import AddTaskModal from "../ProjectTask/AddTaskModal"
import ArchivedTaskCard from "../ProjectTask/ArchivedTaskCard"
import TaskCard from "../ProjectTask/TaskCard"
import ConfirmDeleteTaskModal from "../ProjectTask/ConfirmDeleteTaskModal"

const socket = io(API_WEBSOCKET_URL)

interface Status {
  ProjectTaskStatusId: number
  ProjectTaskStatusName: string
}

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
  ProjectTaskExpiration?: DateValue | null | undefined
  ProjectTaskCreation: DateValue
  ProjectTaskStatusId: number
  ProjectTaskTags: Tag[]
  ProjectTaskMembers: Member[]
  ProjectTaskComments: Comment[]
  ProjectId: number
  ProjectTaskChecklists: any[]
}

interface Project {
  ProjectId: number
  ProjectName: string
  ProjectDescription: string
  ProjectCreationDate: Date
  ProjectEndDate: Date
  CompanyId: number
  ProjectBannerId: number
  ProjectBannerPath: string
  StatusName: string
  ProjectManagerId: number
  ProjectManagerFullName: string
  ProjectManagerEmail: string
  RoleName: string
}

interface ModalAddData {
  ProjectId: number
  open: boolean
}

// Può essere un singolo task o un gruppo di task
type RenderItem = { type: "single"; task: Task } | { type: "group"; tasks: Task[] }

export default function TaskContainer({ projectData }: { projectData: Project }) {
  const { Action } = useParams<{ Action: string }>()
  const [columns, setColumns] = useState<Status[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [update, setUpdate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const projectId = projectData.ProjectId

  const [modalAddData, setModalAddData] = useState<ModalAddData>({
    ProjectId: projectId,
    open: false,
  })

  // Gestione route "add-task"
  useEffect(() => {
    if (Action === "add-task") {
      setModalAddData((prev) => ({ ...prev, open: true }))
    }
  }, [Action])

  // Gestione permessi
  const [permissions, setPermissions] = useState({ assignActivity: false })
  const { hasPermission } = usePermissions()

  useEffect(() => {
    async function fetchPermission() {
      const permission = await hasPermission("ASSIGN_ACTIVITY")
      setPermissions((prev) => ({ ...prev, assignActivity: permission }))
    }
    fetchPermission()
  }, [hasPermission])

  // Fetch colonne e task
  useEffect(() => {
    fetchData()
  }, [update, projectData.ProjectId])

  async function fetchData() {
    try {
      setIsLoading(true)
      const statusResponse = await axios.get<Status[]>("/Project/GET/GetTaskStatuses")
      setColumns(statusResponse.data)

      const res = await axios.get<Task[]>("/Project/GET/GetTasksByProjectId", {
        params: { ProjectId: projectId },
      })
      if (res.status === 200) {
        const fetchedTasks = res.data
        socket.emit("join", projectId)

        const updatedTasks = await Promise.all(
          fetchedTasks.map(async (task: Task) => {
            const tagsResponse = await axios.get<Tag[]>("/Project/GET/GetTagsByTaskId", {
              params: { ProjectTaskId: task.ProjectTaskId },
            })
            const membersResponse = await axios.get<Member[]>("/Project/GET/GetMembersByTaskId", {
              params: { ProjectTaskId: task.ProjectTaskId },
            })
            const commentResponse = await axios.get<Comment[]>("/Project/GET/GetCommentsByTaskId", {
              params: { ProjectTaskId: task.ProjectTaskId },
            })
            return {
              ...task,
              ProjectTaskTags: tagsResponse.data,
              ProjectTaskMembers: membersResponse.data,
              ProjectTaskComments: commentResponse.data,
            }
          }),
        )
        setTasks(updatedTasks)
      }
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  }

  // ------------------- MULTI-SELEZIONE -------------------
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<number[]>([])
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)

  // Gestisco il CTRL premuto
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") setIsCtrlPressed(true)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") setIsCtrlPressed(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Se non premo più Ctrl e non ho task selezionati, disabilita multiSelect
  useEffect(() => {
    if (!isCtrlPressed && selectedTasks.length === 0) {
      setIsMultiSelect(false)
    }
  }, [isCtrlPressed, selectedTasks])

  // Selezione/deselezione di un task
  function handleTaskSelect(taskId: number, isDragging = false) {
    if (isDragging) return
    if (isCtrlPressed) {
      setIsMultiSelect(true)
      setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
    } else if (isMultiSelect) {
      setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
    }
  }

  // Cambio di stato di tutti i task selezionati
  function changeSelectedTasksStatus(newStatusId: number) {
    selectedTasks.forEach((taskId) => {
      updateTaskStatus(taskId, newStatusId)
    })
    setSelectedTasks([])
    setIsMultiSelect(false)
  }

  // Toggle multi select
  function toggleMultiSelect() {
    if (isMultiSelect) setSelectedTasks([])
    setIsMultiSelect(!isMultiSelect)
  }

  // Cancellazione di tutti i task selezionati
  function deleteSelectedTasks(taskList: Task[]) {
    taskList.forEach((task) => {
      axios
        .delete("/Project/DELETE/DeleteTask", {
          params: { ProjectTaskId: task.ProjectTaskId },
        })
        .then(() => {
          socket.emit("task-news", projectId)
          setUpdate((prev) => !prev)
          setSelectedTasks([])
          setIsMultiSelect(false)
        })
        .catch((error) => {
          console.error("Error deleting task:", error)
        })
    })
  }

  // Update singolo
  function updateTaskStatus(taskId: number, statusId: number) {
    axios
      .post("/Project/POST/UpdateTaskStatus", {
        ProjectTaskId: taskId,
        ProjectTaskStatusId: statusId,
      })
      .then(() => {
        socket.emit("task-news", projectId)
        setUpdate((prev) => !prev)
      })
      .catch((error) => {
        console.error("Error updating task status:", error)
      })
  }

  // ---------------- RAGGRUPPAMENTO PER COLONNA ----------------
  // Se ho multiSelect, i task selezionati e consecutivi vengono "gruppati" in un unico Draggable
  function renderListForColumn(tasksInColumn: Task[]): RenderItem[] {
    if (!isMultiSelect) {
      return tasksInColumn.map((task) => ({ type: "single", task }))
    }

    // Return single tasks with selection state, no grouping needed
    return tasksInColumn.map((task) => ({
      type: "single",
      task,
    }))
  }

  // ---------------- GROUP DRAGGABLE CON OFFSET ----------------
  const SelectedTaskCard = ({ task, index }: { task: Task; index: number }) => (
    <Draggable draggableId={task.ProjectTaskId.toString()} index={index}>
      {(provided, snapshot) => {
        const style = {
          ...provided.draggableProps.style,
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          boxShadow: snapshot.isDragging ? "0 10px 20px rgba(0,0,0,0.4)" : "none",
          zIndex: snapshot.isDragging ? 999 : "auto",
        }

        return (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={style}>
            <TaskCard
              task={task}
              setUpdate={setUpdate}
              update={update}
              socket={socket}
              projectId={projectId}
              updateTaskStatus={updateTaskStatus}
              columnCount={columns.length}
              isMultiSelect={true}
              handleTaskSelect={handleTaskSelect}
              isSelected={selectedTasks.includes(task.ProjectTaskId)}
              isCtrlPressed={isCtrlPressed}
              isDragging={snapshot.isDragging}
              isPartOfGroup={selectedTasks.includes(task.ProjectTaskId)}
            />
          </div>
        )
      }}
    </Draggable>
  )

  // ---------------- CALCOLO PER COLONNA, ARCHIVIATE, ETC. ----------------
  const columnTasks = useMemo(() => {
    const tasksByColumn: { [key: number]: Task[] } = {}
    columns.forEach((column) => {
      tasksByColumn[column.ProjectTaskStatusId] = tasks.filter(
        (task) => task.ProjectTaskStatusId === column.ProjectTaskStatusId,
      )
    })
    return tasksByColumn
  }, [tasks, columns])

  const [activeTab, setActiveTab] = useState("Attive")

  const tabs = [
    { title: "Attive", icon: <Icon icon="solar:check-read-linear" fontSize={22} /> },
    { title: "Archiviate", icon: <Icon icon="solar:archive-linear" fontSize={22} /> },
  ]

  const [archivedTasks, setArchivedTasks] = useState<Task[]>([])

  useEffect(() => {
    async function fetchArchivedTasks() {
      const res = await axios.get("/Project/GET/GetArchivedTasksByProjectId", {
        params: { ProjectId: projectId },
      })
      if (res.status === 200) {
        const fetchedTasks = res.data
        socket.emit("join", projectId)

        const updatedTasks = await Promise.all(
          fetchedTasks.map(async (task: Task) => {
            const tagsResponse = await axios.get<Tag[]>("/Project/GET/GetTagsByTaskId", {
              params: { ProjectTaskId: task.ProjectTaskId },
            })
            const membersResponse = await axios.get<Member[]>("/Project/GET/GetMembersByTaskId", {
              params: { ProjectTaskId: task.ProjectTaskId },
            })
            const commentResponse = await axios.get<Comment[]>("/Project/GET/GetCommentsByTaskId", {
              params: { ProjectTaskId: task.ProjectTaskId },
            })
            return {
              ...task,
              ProjectTaskTags: tagsResponse.data,
              ProjectTaskMembers: membersResponse.data,
              ProjectTaskComments: commentResponse.data,
            }
          }),
        )
        setArchivedTasks(updatedTasks)
      }
    }
    fetchArchivedTasks()
  }, [projectId, update])

  // ---------------- LOGICA DRAG & DROP PRINCIPALE ----------------
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null)

  function onDragStart(start: DragStart) {
    const idStr = start.draggableId
    if (!idStr.startsWith("group-")) {
      // Se sto iniziando a trascinare un singolo task
      const id = Number.parseInt(idStr, 10)
      setDraggingTaskId(id)

      if (isMultiSelect && selectedTasks.includes(id)) {
        const element = document.getElementById(`task-${id}`)
        if (element) {
          const ghostElement = element.cloneNode(true) as HTMLElement
          ghostElement.style.transform = "none"
          ghostElement.style.width = `${element.offsetWidth}px`

          const stackContainer = document.createElement("div")
          stackContainer.appendChild(ghostElement)

          selectedTasks.forEach((taskId, index) => {
            if (taskId !== id) {
              const indicator = document.createElement("div")
              indicator.style.height = "10px"
              indicator.style.width = `${element.offsetWidth}px`
              indicator.style.backgroundColor = "lightblue"
              indicator.style.marginTop = "-5px"
              indicator.style.borderRadius = "5px"
              stackContainer.appendChild(indicator)
            }
          })

          stackContainer.style.position = "fixed"
          stackContainer.style.pointerEvents = "none"
          stackContainer.style.zIndex = "1000"
          stackContainer.style.opacity = "0.8"

          document.body.appendChild(stackContainer)
          start.source.index = selectedTasks.indexOf(id)
          start.dataTransfer.setDragImage(stackContainer, 0, 0)

          setTimeout(() => {
            document.body.removeChild(stackContainer)
          }, 0)
        }
      }
    }
  }

  async function onDragEnd(result: DropResult) {
    setIsLoading(true)
    setDraggingTaskId(null)

    const { source, destination, draggableId } = result
    if (!destination) {
      setIsLoading(false)
      return
    }

    const newStatusId = Number.parseInt(destination.droppableId, 10)
    const taskId = Number.parseInt(draggableId.replace("group-", ""), 10)

    let tasksToMove: number[]

    if (draggableId.startsWith("group-")) {
      tasksToMove = selectedTasks
    } else if (selectedTasks.includes(taskId)) {
      tasksToMove = selectedTasks
    } else {
      tasksToMove = [taskId]
    }

    const updatePromises = tasksToMove.map((id) =>
      axios.post("/Project/POST/UpdateTaskStatus", {
        ProjectTaskId: id,
        ProjectTaskStatusId: newStatusId,
      }),
    )

    await Promise.all(updatePromises)

    socket.emit("task-news", projectId)
    setUpdate((prev) => !prev)
    setSelectedTasks([])
    setIsMultiSelect(false)
    setIsLoading(false)
  }

  return (
    <>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <AddTaskModal
          isOpen={modalAddData.open}
          isClosed={() => setModalAddData((prev) => ({ ...prev, open: false }))}
          fetchData={fetchData}
          ProjectId={projectId}
        />

        {isLoading ? (
          <div className="w-full flex justify-center items-center h-screen">
            <Spinner />
          </div>
        ) : (
          <>
            {/* Barra in alto con tabs e pulsanti */}
            <div className="w-full flex justify-between">
              <Tabs
                aria-label="Options"
                color="primary"
                radius="full"
                variant="bordered"
                selectedKey={activeTab}
                className="hidden sm:flex"
                onSelectionChange={(key) => setActiveTab(key as string)}
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.title}
                    title={
                      <div className="flex items-center space-x-2">
                        {tab.icon}
                        <span>{tab.title}</span>
                      </div>
                    }
                  />
                ))}
              </Tabs>

              {permissions.assignActivity && (
                <div className="flex justify-end flex-row gap-2 w-full">
                  <div className="flex justify-end items-center w-full gap-2">
                    {isMultiSelect && selectedTasks.length > 0 && (
                      <>
                        <Select
                          onChange={(e) => changeSelectedTasksStatus(Number(e.target.value))}
                          placeholder="Seleziona Stato"
                          className="w-48"
                          color="primary"
                          variant="bordered"
                          radius="full"
                        >
                          {columns.map((column) => (
                            <SelectItem key={column.ProjectTaskStatusId} value={column.ProjectTaskStatusId}>
                              {column.ProjectTaskStatusName}
                            </SelectItem>
                          ))}
                        </Select>
                        <ConfirmDeleteTaskModal
                          TaskData={selectedTasks
                            .map((id) => tasks.find((task) => task.ProjectTaskId === id))
                            .filter((task): task is Task => task !== undefined)}
                          DeleteTasks={deleteSelectedTasks}
                        />
                      </>
                    )}
                    <Button
                      variant={isMultiSelect ? "solid" : "bordered"}
                      color="primary"
                      radius="full"
                      className="w-fit"
                      onPress={toggleMultiSelect}
                    >
                      {isMultiSelect ? "Disabilita Selezione Multipla" : "Abilita Selezione Multipla"}
                    </Button>
                  </div>
                  <Button
                    color="primary"
                    radius="full"
                    onPress={() => setModalAddData((prev) => ({ ...prev, open: true }))}
                    startContent={<Icon icon="mynaui:plus-solid" fontSize={22} />}
                    className="hidden sm:flex w-44"
                  >
                    Aggiungi Task
                  </Button>
                  <Button
                    color="primary"
                    radius="full"
                    onPress={() => setModalAddData((prev) => ({ ...prev, open: true }))}
                    startContent={<Icon icon="mynaui:plus-solid" fontSize={22} />}
                    isIconOnly
                    className="sm:hidden"
                  />
                </div>
              )}
            </div>

            {/* Area "Attive" */}
            {activeTab === "Attive" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 justify-between py-5 gap-5 mb-14">
                {columns.map((column) => {
                  // Task della colonna
                  const colTasks = columnTasks[column.ProjectTaskStatusId] || []
                  // Costruisco la lista (singoli o gruppi)
                  const renderList = renderListForColumn(colTasks)

                  return (
                    <div
                      key={column.ProjectTaskStatusId}
                      className={`flex flex-col gap-5 w-full border border-solid border-gray rounded-lg items-center h-fit transition-height duration-300 ${
                        colTasks.length === 0 ? "min-h-[100px]" : "min-h-[200px]"
                      }`}
                    >
                      <h2 className="text-xl font-semibold p-3 border-b w-full flex flex-row gap-2 justify-center items-center">
                        {column.ProjectTaskStatusName}
                        <Chip radius="full" color="primary" variant="faded" size="sm">
                          {colTasks.length}
                        </Chip>
                      </h2>
                      <Droppable droppableId={column.ProjectTaskStatusId.toString()} direction="vertical" type="TASK">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "w-full p-2 flex flex-col gap-5 h-auto",
                              snapshot.isDraggingOver
                                ? "bg-gray-200 opacity-35 rounded-b-lg border-2 border-dashed border-gray-500"
                                : "bg-lightgrey",
                            )}
                          >
                            {renderList.map((item, index) => (
                              <SelectedTaskCard key={item.task.ProjectTaskId} task={item.task} index={index} />
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Area "Archiviate"
              <div className="grid grid-cols-1 justify-between py-5 gap-5 mb-14">
                <div
                  key={"Archiviate"}
                  className={`flex flex-col gap-5 w-full border border-solid border-gray rounded-lg items-center h-fit transition-height duration-300 ${
                    archivedTasks.length === 0 ? "min-h-[100px]" : "min-h-[200px]"
                  }`}
                >
                  <h2 className="text-xl font-semibold p-3 border-b w-full flex flex-row gap-2 justify-center items-center">
                    Archiviate
                    <Chip radius="full" color="primary" variant="faded" size="sm">
                      {archivedTasks.length}
                    </Chip>
                  </h2>
                  <div
                    className={cn(
                      "w-full p-2 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-5 h-auto bg-lightgrey",
                    )}
                  >
                    {archivedTasks.map((task) => (
                      <ArchivedTaskCard
                        key={task.ProjectTaskId}
                        task={task}
                        setUpdate={setUpdate}
                        update={update}
                        socket={socket}
                        projectId={projectId}
                        columnCount={columns.length}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </DragDropContext>
    </>
  )
}

