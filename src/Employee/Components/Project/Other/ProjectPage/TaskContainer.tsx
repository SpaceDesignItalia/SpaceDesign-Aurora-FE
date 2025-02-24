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

// Inizializzo socket
const socket = io(API_WEBSOCKET_URL)

// ----- INTERFACCE -----
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

  // ---------- Stato dei dati ----------
  const [columns, setColumns] = useState<Status[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [update, setUpdate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const projectId = projectData.ProjectId

  // Modale "Aggiungi Task"
  const [modalAddData, setModalAddData] = useState<ModalAddData>({
    ProjectId: projectId,
    open: false,
  })

  useEffect(() => {
    // Se la route è "/add-task", apro la modale
    if (Action === "add-task") {
      setModalAddData((prev) => ({ ...prev, open: true }))
    }
  }, [Action])

  // Permessi
  const { hasPermission } = usePermissions()
  const [permissions, setPermissions] = useState({ assignActivity: false })

  useEffect(() => {
    async function fetchPermission() {
      const permission = await hasPermission("ASSIGN_ACTIVITY")
      setPermissions((prev) => ({ ...prev, assignActivity: permission }))
    }
    fetchPermission()
  }, [hasPermission])

  // ---------- Fetch Colonne & Task ----------
  useEffect(() => {
    fetchData()
  }, [update, projectId])

  async function fetchData() {
    console.log(">>> fetchData")
    try {
      setIsLoading(true)
      // 1) Colonne
      const statusResponse = await axios.get<Status[]>("/Project/GET/GetTaskStatuses")
      setColumns(statusResponse.data)

      // 2) Task
      const res = await axios.get<Task[]>("/Project/GET/GetTasksByProjectId", {
        params: { ProjectId: projectId },
      })
      if (res.status === 200) {
        const fetchedTasks = res.data
        socket.emit("join", projectId)

        // arricchisco i task con Tag, Members, Comments
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

  // ---------- Multi Selezione ----------
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<number[]>([])

  // Se disattivo CTRL e non ho task selezionati, disabilito la multiselezione
  useEffect(() => {
    if (!isMultiSelect && selectedTasks.length === 0) {
      setIsMultiSelect(false)
    }
  }, [selectedTasks, isMultiSelect])

  // Add keyboard shortcut for multi-select
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control" && !isMultiSelect) {
        toggleMultiSelect(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        if (selectedTasks.length === 0) {
          toggleMultiSelect(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [selectedTasks, isMultiSelect])

  // Seleziono/deseleziono un task
  function handleTaskSelect(taskId: number, isDragging = false) {
    if (isDragging) return // Avoid selection changes during drag

    const task = tasks.find((t) => t.ProjectTaskId === taskId)
    const firstSelectedTask = tasks.find((t) => selectedTasks.includes(t.ProjectTaskId))

    if (isMultiSelect) {
      // Handle multi-select mode
      setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
    } else {
      // Single selection
      setSelectedTasks([taskId])
    }

    // Se vuoi che cambi anche lo stato (come nel tuo codice originale)
    if (firstSelectedTask && task && task.ProjectTaskStatusId !== firstSelectedTask.ProjectTaskStatusId) {
      updateTaskStatus(taskId, firstSelectedTask.ProjectTaskStatusId)
    }

    setUpdate((prev) => !prev)
  }

  // Cambia lo stato di tutti i selezionati
  function changeSelectedTasksStatus(newStatusId: number) {
    selectedTasks.forEach((taskId) => {
      updateTaskStatus(taskId, newStatusId)
    })
    setSelectedTasks([])
    setIsMultiSelect(false)
  }

  // Toggle multiSelect
  function toggleMultiSelect(force?: boolean) {
    const newState = force !== undefined ? force : !isMultiSelect
    if (!newState) setSelectedTasks([])
    setIsMultiSelect(newState)
  }

  // Cancella più task
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

  // Aggiorna stato singolo
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

  // Use useMemo to calculate the tasks for each column
  const columnTasks = useMemo(() => {
    const tasksByColumn: { [key: number]: Task[] } = {};
    columns.forEach((column) => {
      tasksByColumn[column.ProjectTaskStatusId] = tasks.filter(
        (task) => task.ProjectTaskStatusId === column.ProjectTaskStatusId
      );
    });
    return tasksByColumn;
  }, [tasks, columns]);

  // Function to count tasks by column
  const countTasksByColumn = () => {
    const taskCounts: { [key: number]: number } = {};
    columns.forEach((column) => {
      taskCounts[column.ProjectTaskStatusId] =
        columnTasks[column.ProjectTaskStatusId]?.length || 0;
    });
    return taskCounts;
  };

  // Get the task counts
  const taskCounts = countTasksByColumn();

  const [activeTab, setActiveTab] = useState("Attive");

  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);

  // ---------- Archiviate ----------
  const [activeTab, setActiveTab] = useState("Attive")
  const tabs = [
    {
      title: "Attive",
      icon: <Icon icon="solar:check-read-linear" fontSize={22} />,
      number: columns
        .map((column) => taskCounts[column.ProjectTaskStatusId])
        .reduce((a, b) => a + b, 0),
    },
    {
      title: "Archiviate",
      icon: <Icon icon="solar:archive-linear" fontSize={22} />,
      number: archivedTasks.length,
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
  }, [projectId])

  // ---------- Multi-Drag Cross Colonna ----------
  const [dragSourceColumnId, setDragSourceColumnId] = useState<number | null>(null)
  const [isDraggingMultiColumn, setIsDraggingMultiColumn] = useState(false)

  // Funzione di utilità: in che colonna sta un certo task?
  function getColumnIdOfTask(taskId: number): number | null {
    const found = tasks.find((t) => t.ProjectTaskId === taskId)
    return found ? found.ProjectTaskStatusId : null
  }

  function onDragStart(start: DragStart) {
    console.log(">>> onDragStart => source =", start.source)
    const startColId = Number.parseInt(start.source.droppableId, 10)
    setDragSourceColumnId(startColId)

    // Verifica se ho più di un task selezionato da diverse colonne
    if (selectedTasks.length > 1) {
      const selectedCols = new Set(selectedTasks.map((taskId) => getColumnIdOfTask(taskId)))
      if (selectedCols.size > 1) {
        setIsDraggingMultiColumn(true)
      } else {
        setIsDraggingMultiColumn(false)
      }
    } else {
      setIsDraggingMultiColumn(false)
    }
  }

  async function onDragEnd(result: DropResult) {
    console.log(">>> onDragEnd => result =", result)
    setIsLoading(true)
    setIsDraggingMultiColumn(false)

    const { destination, draggableId } = result
    if (!destination) {
      // se droppo fuori dalla droppable area
      setDragSourceColumnId(null)
      setIsLoading(false)
      return
    }

    // nuova colonna di destinazione
    const newStatusId = Number.parseInt(destination.droppableId, 10)

    // Stabilisco quali task devo spostare
    let tasksToMove: number[] = []
    if (draggableId.startsWith("group-")) {
      // Sto trascinando un "group"
      tasksToMove = [...selectedTasks]
    } else {
      // Single
      const draggedId = Number.parseInt(draggableId, 10)
      if (selectedTasks.includes(draggedId)) {
        tasksToMove = [...selectedTasks]
      } else {
        tasksToMove = [draggedId]
      }
    }

    // Aggiorno backend
    await Promise.all(
      tasksToMove.map((id) =>
        axios.post("/Project/POST/UpdateTaskStatus", {
          ProjectTaskId: id,
          ProjectTaskStatusId: newStatusId,
        }),
      ),
    )

    // Emissione socket e refresh
    socket.emit("task-news", projectId)
    setUpdate((prev) => !prev)

    // Pulizia
    setSelectedTasks([])
    setIsMultiSelect(false)
    setDragSourceColumnId(null)
    setIsLoading(false)
  }

  // ------ NUOVA VERSIONE: raggruppa tutti i selezionati in un'unica pila ------
  function renderListForColumn(tasksInColumn: Task[], columnId: number): RenderItem[] {
    // Se sto facendo multi-drag cross-colonna
    if (isDraggingMultiColumn) {
      if (columnId === dragSourceColumnId) {
        // Qui mostriamo un unico "group" con tutti i task selezionati nella colonna sorgente
        const groupTasks = tasks.filter((t) => selectedTasks.includes(t.ProjectTaskId))
        if (groupTasks.length === 0) {
          // fallback
          return tasksInColumn.map((task) => ({ type: "single", task }))
        }
        return [{ type: "group", tasks: groupTasks }]
      } else {
        // Nelle altre colonne, nascondiamo i task selezionati
        const unselected = tasksInColumn.filter((t) => !selectedTasks.includes(t.ProjectTaskId))
        return unselected.map((task) => ({ type: "single", task }))
      }
    }

    // Se NON sto facendo cross-colonna
    if (!isMultiSelect) {
      // Se non è multiSelect, rimani tutto single
      return tasksInColumn.map((task) => ({ type: "single", task }))
    }

    // Altrimenti, raggruppa TUTTI i selezionati in questa colonna in un'unica "group"
    const selectedInThisColumn = tasksInColumn.filter((t) => selectedTasks.includes(t.ProjectTaskId))

    // Se in questa colonna ho più di un task selezionato, faccio un solo "group"
    if (selectedInThisColumn.length > 1) {
      // Prendo i non selezionati
      const unselectedInThisColumn = tasksInColumn.filter((t) => !selectedTasks.includes(t.ProjectTaskId))
      // Ritorno prima i non selezionati come single
      const singleItems: RenderItem[] = unselectedInThisColumn.map((task) => ({ type: "single", task }))
      // E poi un solo group con tutti i selezionati
      return [
        ...singleItems,
        {
          type: "group",
          tasks: selectedInThisColumn,
        },
      ]
    } else {
      // Se ho 0 o 1 task selezionato, rimane single
      return tasksInColumn.map((task) => ({ type: "single", task }))
    }
  }

  // Componente di supporto per un "group" drag‐and‐drop
  const GroupDraggable = ({
    groupTasks,
    index,
  }: {
    groupTasks: Task[]
    index: number
  }) => (
    <Draggable draggableId={`group-${groupTasks[0].ProjectTaskId}`} index={index}>
      {(provided, snapshot) => {
        const groupStyle = {
          ...provided.draggableProps.style,
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          boxShadow: snapshot.isDragging ? "0 10px 20px rgba(0,0,0,0.4)" : "none",
          zIndex: snapshot.isDragging ? 999 : "auto",
        }

        return (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={groupStyle}>
            <div className="relative">
              {groupTasks.map((task, i) => (
                <div
                  key={task.ProjectTaskId}
                  className="absolute w-full transition-all duration-200"
                  style={{
                    transform: `translateY(${i * (snapshot.isDragging ? 8 : 16)}px)`,
                    zIndex: 10 - i, // Usiamo uno stile inline per gestire la sovrapposizione
                  }}
                >
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
                    isSelected={true}
                    isDragging={snapshot.isDragging}
                    isPartOfGroup={true}
                  />
                </div>
              ))}
              {/* "spessore" invisibile per non sovrapporre */}
              <div
                className="invisible"
                style={{
                  height: `${groupTasks.length * 40 + 80}px`,
                }}
              />
            </div>
          </div>
        )
      }}
    </Draggable>
  )

  // Mappa i task per colonna (solo Attive)
  const columnTasks = useMemo(() => {
    const tasksByColumn: { [key: number]: Task[] } = {}
    columns.forEach((col) => {
      tasksByColumn[col.ProjectTaskStatusId] = tasks.filter(
        (t) => t.ProjectTaskStatusId === col.ProjectTaskStatusId,
      )
    })
    return tasksByColumn
  }, [tasks, columns])

  // ---------- RENDER PRINCIPALE ----------
  return (
    <>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        {/* Modale Aggiungi Task */}
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
            {/* Barra in alto con Tabs + Pulsanti */}
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
                        {tab.number && (
                          <Chip
                            radius="full"
                            color="primary"
                            variant="faded"
                            size="sm"
                          >
                            {tab.number}
                          </Chip>
                        )}
                      </div>
                    }
                  />
                ))}
              </Tabs>

              {permissions.assignActivity && (
                <div className="flex justify-end flex-row gap-2 w-full">
                  <div className="flex justify-end items-center w-full gap-2">
                    {isMultiSelect && selectedTasks.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                        <Select
                          onChange={(e) => changeSelectedTasksStatus(Number(e.target.value))}
                          placeholder="Seleziona Stato"
                          className="w-full sm:w-48"
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
                            .filter((t): t is Task => t !== undefined)}
                          DeleteTasks={deleteSelectedTasks}
                        />
                      </div>
                    )}
                    {activeTab === "Attive" && (
                      <Button
                        variant={isMultiSelect ? "solid" : "bordered"}
                        color="primary"
                        radius="full"
                        className="w-fit"
                        onPress={toggleMultiSelect}
                      >
                        {isMultiSelect
                          ? "Disabilita Selezione Multipla"
                          : "Abilita Selezione Multipla"}
                      </Button>
                    )}
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

            {/* Contenuto: "Attive" o "Archiviate" */}
            {activeTab === "Attive" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 justify-between py-5 gap-5 mb-14">
                {columns.map((column) => {
                  const tasksInThisColumn = columnTasks[column.ProjectTaskStatusId] || []
                  const renderList = renderListForColumn(tasksInThisColumn, column.ProjectTaskStatusId)

                  return (
                    <div
                      key={column.ProjectTaskStatusId}
                      className={`flex flex-col gap-5 w-full border border-solid border-gray rounded-lg items-center h-fit transition-height duration-300 ${
                        tasksInThisColumn.length === 0 ? "min-h-[100px]" : "min-h-[200px]"
                      }`}
                    >
                      <h2 className="text-xl font-semibold p-3 border-b w-full flex flex-row gap-2 justify-center items-center">
                        {column.ProjectTaskStatusName}
                        <Chip radius="full" color="primary" variant="faded" size="sm">
                          {tasksInThisColumn.length}
                        </Chip>
                      </h2>
                      <Droppable
                        droppableId={String(column.ProjectTaskStatusId)}
                        direction="vertical"
                        type="TASK"
                      >
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
                              if (item.type === "single") {
                                return (
                                  <Draggable
                                    key={item.task.ProjectTaskId}
                                    draggableId={item.task.ProjectTaskId.toString()}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        id={`task-${item.task.ProjectTaskId}`}
                                      >
                                        <TaskCard
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
                                          isDragging={snapshot.isDragging}
                                          isPartOfGroup={false}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                )
                              } else {
                                // item.type === "group"
                                return (
                                  <GroupDraggable
                                    key={`group-${item.tasks[0].ProjectTaskId}`}
                                    groupTasks={item.tasks}
                                    index={index}
                                  />
                                )
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
              // "Archiviate"
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
