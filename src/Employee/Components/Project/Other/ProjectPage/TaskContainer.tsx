import { Button, Chip, cn, type DateValue, Select, SelectItem, Spinner, Tab, Tabs } from "@heroui/react"
import { Icon } from "@iconify/react"
import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { DragDropContext, Draggable, Droppable, DropResult, DragStart } from "react-beautiful-dnd"
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

interface Checkbox {
  CheckboxId: number
  Text: string
  IsSelected: boolean
  ChecklistId: number
}

interface Checklist {
  ChecklistId: number
  Text: string
  Checkboxes: Checkbox[]
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

// Oggetto per il rendering: può essere un singolo task o un gruppo
type RenderItem =
  | { type: "single"; task: Task }
  | { type: "group"; tasks: Task[] }

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

  useEffect(() => {
    if (Action === "add-task") {
      setModalAddData({ ...modalAddData, open: true })
    }
  }, [Action, modalAddData])

  const [permissions, setPermissions] = useState({ assignActivity: false })
  const { hasPermission } = usePermissions()

  useEffect(() => {
    async function fetchPermission() {
      const permission = await hasPermission("ASSIGN_ACTIVITY")
      setPermissions({ ...permissions, assignActivity: permission })
    }
    fetchPermission()
  }, [hasPermission])

  useEffect(() => {
    fetchData()
  }, [update, projectData.ProjectId])

  async function fetchData() {
    try {
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
        setIsLoading(false)
      }
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  }

  // Stati per la gestione della multi-selezione
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<number[]>([])
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        setIsCtrlPressed(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        setIsCtrlPressed(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Se non si preme Ctrl e non ci sono task selezionati, disabilita automaticamente la modalità multi-select
  useEffect(() => {
    if (!isCtrlPressed && selectedTasks.length === 0) {
      setIsMultiSelect(false)
    }
  }, [isCtrlPressed, selectedTasks])

  const handleTaskSelect = (taskId: number, isDragging = false) => {
    if (isDragging) return
    if (isCtrlPressed) {
      setIsMultiSelect(true)
      setSelectedTasks((prev) =>
        prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
      )
    } else if (isMultiSelect) {
      setSelectedTasks((prev) =>
        prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
      )
    }
  }

  const changeSelectedTasksStatus = (newStatusId: number) => {
    selectedTasks.forEach((taskId) => {
      updateTaskStatus(taskId, newStatusId)
    })
    setSelectedTasks([])
    setIsMultiSelect(false)
  }

  const toggleMultiSelect = () => {
    if (isMultiSelect) {
      setSelectedTasks([])
    }
    setIsMultiSelect(!isMultiSelect)
  }

  const deleteSelectedTasks = (tasks: Task[]) => {
    tasks.forEach((task) => {
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

  const updateTaskStatus = (taskId: number, statusId: number) => {
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

  // Costruzione dell'array di rendering per una colonna.
  // Se in una sequenza consecutiva appaiono task selezionati, li raggruppa in un oggetto "group".
  const renderListForColumn = (tasksInColumn: Task[]): RenderItem[] => {
    if (!isMultiSelect) return tasksInColumn.map((task) => ({ type: "single", task }))
    const list: RenderItem[] = []
    let i = 0
    while (i < tasksInColumn.length) {
      if (selectedTasks.includes(tasksInColumn[i].ProjectTaskId)) {
        const group: Task[] = []
        while (i < tasksInColumn.length && selectedTasks.includes(tasksInColumn[i].ProjectTaskId)) {
          group.push(tasksInColumn[i])
          i++
        }
        list.push({ type: "group", tasks: group })
      } else {
        list.push({ type: "single", task: tasksInColumn[i] })
        i++
      }
    }
    return list
  }

  // Componente che rende un unico draggable per un gruppo di task
  const GroupDraggable = ({ groupTasks, index }: { groupTasks: Task[]; index: number }) => (
    <Draggable draggableId={`group-${groupTasks[0].ProjectTaskId}`} index={index}>
      {(provided, snapshot) => {
        // Se si sta trascinando, applichiamo uno stile per simulare uno stack
        const groupStyle = snapshot.isDragging
          ? {
              ...provided.draggableProps.style,
              boxShadow: "0 5px 10px rgba(0,0,0,0.2)",
              transform: provided.draggableProps.style.transform,
            }
          : provided.draggableProps.style
        return (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={groupStyle}>
            <div style={{ border: "1px solid blue", padding: "8px", background: "lightblue" }}>
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                Gruppo di {groupTasks.length} task
              </div>
              {groupTasks.map((task, i) => (
                <div key={task.ProjectTaskId} style={{ marginTop: i > 0 ? "-8px" : "0" }}>
                  <TaskCard
                    provided={{ innerRef: null, draggableProps: { style: {} } } as any}
                    task={task}
                    setUpdate={setUpdate}
                    update={update}
                    socket={socket}
                    projectId={projectId}
                    updateTaskStatus={updateTaskStatus}
                    columnCount={columns.length}
                    isMultiSelect={isMultiSelect}
                    handleTaskSelect={handleTaskSelect}
                    isSelected={true}
                    isCtrlPressed={isCtrlPressed}
                    isDragging={false}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      }}
    </Draggable>
  )

  // Calcolo dei task per colonna
  const columnTasks = useMemo(() => {
    const tasksByColumn: { [key: number]: Task[] } = {}
    columns.forEach((column) => {
      tasksByColumn[column.ProjectTaskStatusId] = tasks.filter(
        (task) => task.ProjectTaskStatusId === column.ProjectTaskStatusId,
      )
    })
    return tasksByColumn
  }, [tasks, columns])

  const countTasksByColumn = () => {
    const taskCounts: { [key: number]: number } = {}
    columns.forEach((column) => {
      taskCounts[column.ProjectTaskStatusId] = columnTasks[column.ProjectTaskStatusId]?.length || 0
    })
    return taskCounts
  }

  const taskCounts = countTasksByColumn()
  const [activeTab, setActiveTab] = useState("Attive")

  const tabs = [
    {
      title: "Attive",
      icon: <Icon icon="solar:check-read-linear" fontSize={22} />,
    },
    {
      title: "Archiviate",
      icon: <Icon icon="solar:archive-linear" fontSize={22} />,
    },
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

  // Stati per la gestione del draggable (singolo o gruppo)
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null)

  // Gestione degli eventi drag per task singoli o gruppi
  const onDragStart = (start: DragStart) => {
    const idStr = start.draggableId
    if (!idStr.startsWith("group-")) {
      const id = Number.parseInt(idStr, 10)
      if (isMultiSelect && !selectedTasks.includes(id)) {
        setSelectedTasks((prev) => [...prev, id])
      }
      setDraggingTaskId(id)
    } else {
      setDraggingTaskId(null)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    setIsLoading(true)
    setDraggingTaskId(null)
    const { source, destination, draggableId } = result
    if (!destination) {
      setIsLoading(false)
      return
    }
    if (draggableId.startsWith("group-")) {
      // Aggiorna lo status per tutti i task selezionati nel gruppo
      const newStatusId = Number.parseInt(destination.droppableId, 10)
      const updatePromises = selectedTasks.map((taskId) =>
        axios.post("/Project/POST/UpdateTaskStatus", {
          ProjectTaskId: taskId,
          ProjectTaskStatusId: newStatusId,
        }),
      )
      await Promise.all(updatePromises)
      socket.emit("task-news", projectId)
      setUpdate((prev) => !prev)
    } else {
      // Logica per un draggable singolo
      const newTasks = Array.from(tasks)
      const [reorderedItem] = newTasks.splice(source.index, 1)
      reorderedItem.ProjectTaskStatusId = Number.parseInt(destination.droppableId, 10)
      newTasks.splice(destination.index, 0, reorderedItem)
      await axios.post("/Project/POST/UpdateTaskStatus", {
        ProjectTaskId: reorderedItem.ProjectTaskId,
        ProjectTaskStatusId: reorderedItem.ProjectTaskStatusId,
      })
      socket.emit("task-news", projectId)
      setUpdate((prev) => !prev)
    }
    setSelectedTasks([])
    setIsMultiSelect(false)
    setIsLoading(false)
  }

  return (
    <>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <AddTaskModal
          isOpen={modalAddData.open}
          isClosed={() => setModalAddData({ ...modalAddData, open: false })}
          fetchData={fetchData}
          ProjectId={projectId}
        />
        {isLoading ? (
          <div className="w-full flex justify-center items-center h-screen">
            <Spinner />
          </div>
        ) : (
          <>
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
                    onPress={() => setModalAddData({ ...modalAddData, open: true })}
                    startContent={<Icon icon="mynaui:plus-solid" fontSize={22} />}
                    className="hidden sm:flex w-44"
                  >
                    Aggiungi Task
                  </Button>
                  <Button
                    color="primary"
                    radius="full"
                    onPress={() => setModalAddData({ ...modalAddData, open: true })}
                    startContent={<Icon icon="mynaui:plus-solid" fontSize={22} />}
                    isIconOnly
                    className="sm:hidden"
                  />
                </div>
              )}
            </div>
            {activeTab === "Attive" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 justify-between py-5 gap-5 mb-14">
                {columns.map((column) => {
                  const colTasks = tasks.filter((task) => task.ProjectTaskStatusId === column.ProjectTaskStatusId)
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
                            {renderList.map((item, index) => {
                              if (item.type === "group" && item.tasks) {
                                return <GroupDraggable key={`group-${item.tasks[0].ProjectTaskId}`} groupTasks={item.tasks} index={index} />
                              } else if (item.type === "single" && item.task) {
                                return (
                                  <Draggable key={item.task.ProjectTaskId} draggableId={item.task.ProjectTaskId.toString()} index={index}>
                                    {(provided, snapshot) => (
                                      <TaskCard
                                        provided={provided}
                                        task={item.task}
                                        setUpdate={setUpdate}
                                        update={update}
                                        socket={socket}
                                        projectId={projectId}
                                        updateTaskStatus={updateTaskStatus}
                                        columnCount={columns.length}
                                        isMultiSelect={isMultiSelect}
                                        handleTaskSelect={handleTaskSelect}
                                        isSelected={selectedTasks.includes(item.task.ProjectTaskId)}
                                        isCtrlPressed={isCtrlPressed}
                                        isDragging={snapshot.isDragging}
                                        draggingTaskId={draggingTaskId}
                                      />
                                    )}
                                  </Draggable>
                                )
                              } else {
                                return null
                              }
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )
                })}
              </div>
            ) : (
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
                  <div className={cn("w-full p-2 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-5 h-auto bg-lightgrey")}>
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
