"use client";

import {
  Button,
  Chip,
  cn,
  type DateValue,
  Input,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
  type DragStart,
} from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import { usePermissions } from "../../../Layout/PermissionProvider";
import AddTaskModal from "../ProjectTask/AddTaskModal";
import ArchivedTaskCard from "../ProjectTask/ArchivedTaskCard";
import TaskCard from "../ProjectTask/TaskCard";
import ConfirmDeleteTaskModal from "../ProjectTask/ConfirmDeleteTaskModal";
import ConfirmDeleteTaskStatusModal from "../ProjectTask/ConfirmDelteTaskStatusModal";

// Componente per lo stato vuoto
const EmptyState = ({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
}: {
  icon: string;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center p-10 w-full h-full">
    <Icon icon={icon} fontSize={50} />
    <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
    {buttonText && onButtonClick && (
      <div className="mt-6">
        <Button
          color="primary"
          radius="full"
          startContent={<Icon icon="mynaui:plus-solid" fontSize={24} />}
          onPress={onButtonClick}
        >
          {buttonText}
        </Button>
      </div>
    )}
  </div>
);

// Inizializzo il socket una sola volta
const socket = io(API_WEBSOCKET_URL);

// ----- INTERFACCE -----
interface Status {
  ProjectTaskStatusId: number;
  ProjectTaskStatusName: string;
}

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

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: Date;
  ProjectEndDate: Date;
  CompanyId: number;
  ProjectBannerId: number;
  ProjectBannerPath: string;
  StatusName: string;
  ProjectManagerId: number;
  ProjectManagerFullName: string;
  ProjectManagerEmail: string;
  RoleName: string;
}

interface ModalAddData {
  ProjectId: number;
  open: boolean;
}

// Può essere un singolo task o un gruppo di task
type RenderItem =
  | { type: "single"; task: Task }
  | { type: "group"; tasks: Task[] };

export default function TaskContainer({
  projectData,
}: {
  projectData: Project;
}) {
  const { Action } = useParams<{ Action: string }>();
  const projectId = projectData.ProjectId;

  const [columns, setColumns] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [update, setUpdate] = useState(false);
  const [modalAddData, setModalAddData] = useState<ModalAddData>({
    ProjectId: projectId,
    open: false,
  });
  const { hasPermission } = usePermissions();
  const [permissions, setPermissions] = useState({ assignActivity: false });
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("Attive");
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [dragSourceColumnId, setDragSourceColumnId] = useState<number | null>(
    null
  );
  const [isDraggingMultiColumn, setIsDraggingMultiColumn] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);

  // ----- Gestione URL e permessi -----
  useEffect(() => {
    if (Action === "add-task") {
      setModalAddData((prev) => ({ ...prev, open: true }));
    }
  }, [Action]);

  useEffect(() => {
    async function fetchPermission() {
      const permission = await hasPermission("ASSIGN_ACTIVITY");
      setPermissions({ assignActivity: permission });
    }
    fetchPermission();
  }, [hasPermission]);

  // ----- Fetch Data (con cancellazione) -----
  const fetchData = useCallback(async () => {
    try {
      // 1) Colonne
      const statusResponse = await axios.get<Status[]>(
        "/Project/GET/GetTaskStatusesByProjectId",
        {
          params: { ProjectId: projectId },
        }
      );
      setColumns(statusResponse.data);

      // 2) Task
      const res = await axios.get<Task[]>("/Project/GET/GetTasksByProjectId", {
        params: { ProjectId: projectId },
      });
      if (res.status === 200) {
        const fetchedTasks = res.data;
        socket.emit("join", projectId);
        const updatedTasks = await Promise.all(
          fetchedTasks.map(async (task: Task) => {
            const [tagsResponse, membersResponse, commentResponse] =
              await Promise.all([
                axios.get<Tag[]>("/Project/GET/GetTagsByTaskId", {
                  params: { ProjectTaskId: task.ProjectTaskId },
                }),
                axios.get<Member[]>("/Project/GET/GetMembersByTaskId", {
                  params: { ProjectTaskId: task.ProjectTaskId },
                }),
                axios.get<Comment[]>("/Project/GET/GetCommentsByTaskId", {
                  params: { ProjectTaskId: task.ProjectTaskId },
                }),
              ]);
            return {
              ...task,
              ProjectTaskTags: tagsResponse.data,
              ProjectTaskMembers: membersResponse.data,
              ProjectTaskComments: commentResponse.data,
            };
          })
        );
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error(error);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, update, projectId]);

  async function updateTaskStatusName(statusId: number, statusName: string) {
    try {
      await axios.post("/Project/POST/UpdateTaskStatusName", {
        ProjectTaskStatusId: statusId,
        ProjectTaskStatusName: statusName,
      });
      socket.emit("task-news", projectId);
      setUpdate((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  }

  // ----- Fetch Task Archiviate -----
  useEffect(() => {
    async function fetchArchivedTasks() {
      try {
        const res = await axios.get<Task[]>(
          "/Project/GET/GetArchivedTasksByProjectId",
          {
            params: { ProjectId: projectId },
          }
        );
        if (res.status === 200) {
          socket.emit("join", projectId);
          const updatedTasks = await Promise.all(
            res.data.map(async (task: Task) => {
              const [tagsResponse, membersResponse, commentResponse] =
                await Promise.all([
                  axios.get<Tag[]>("/Project/GET/GetTagsByTaskId", {
                    params: { ProjectTaskId: task.ProjectTaskId },
                  }),
                  axios.get<Member[]>("/Project/GET/GetMembersByTaskId", {
                    params: { ProjectTaskId: task.ProjectTaskId },
                  }),
                  axios.get<Comment[]>("/Project/GET/GetCommentsByTaskId", {
                    params: { ProjectTaskId: task.ProjectTaskId },
                  }),
                ]);
              return {
                ...task,
                ProjectTaskTags: tagsResponse.data,
                ProjectTaskMembers: membersResponse.data,
                ProjectTaskComments: commentResponse.data,
              };
            })
          );
          setArchivedTasks(updatedTasks);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchArchivedTasks();
  }, [projectId]);

  // ----- Multi Selezione -----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control" && !isMultiSelect) {
        toggleMultiSelect(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control" && selectedTasks.length === 0) {
        toggleMultiSelect(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isMultiSelect, selectedTasks]);

  const handleTaskSelect = useCallback(
    (taskId: number, isDragging = false) => {
      if (isDragging) return;
      const task = tasks.find((t) => t.ProjectTaskId === taskId);
      const firstSelectedTask = tasks.find((t) =>
        selectedTasks.includes(t.ProjectTaskId)
      );
      if (isMultiSelect) {
        setSelectedTasks((prev) =>
          prev.includes(taskId)
            ? prev.filter((id) => id !== taskId)
            : [...prev, taskId]
        );
      } else {
        setSelectedTasks([taskId]);
      }
      if (
        firstSelectedTask &&
        task &&
        task.ProjectTaskStatusId !== firstSelectedTask.ProjectTaskStatusId
      ) {
        updateTaskStatus(taskId, firstSelectedTask.ProjectTaskStatusId);
      }
      setUpdate((prev) => !prev);
    },
    [tasks, selectedTasks, isMultiSelect]
  );

  const updateTaskStatus = useCallback(
    (taskId: number, statusId: number) => {
      axios
        .post("/Project/POST/UpdateTaskStatus", {
          ProjectTaskId: taskId,
          ProjectTaskStatusId: statusId,
        })
        .then(() => {
          socket.emit("task-news", projectId);
          setUpdate((prev) => !prev);
        })
        .catch((error) => {
          console.error("Error updating task status:", error);
        });
    },
    [projectId]
  );

  async function deleteTaskStatus(statusId: number) {
    try {
      await axios.delete("/Project/DELETE/DeleteTaskStatus", {
        params: { ProjectTaskStatusId: statusId },
      });
      socket.emit("task-news", projectId);
      setUpdate((prev) => !prev);
    } catch (error) {
      console.error("Error deleting task status:", error);
    }
  }

  async function handleAddTaskStatus() {
    try {
      await axios.post("/Project/POST/AddTaskStatus", {
        ProjectId: projectId,
        ProjectTaskStatusName: "Nuovo Status",
      });
      socket.emit("task-news", projectId);
      setUpdate((prev) => !prev);
    } catch (error) {
      console.error("Error adding task status:", error);
    }
  }

  const changeSelectedTasksStatus = useCallback(
    (newStatusId: number) => {
      Promise.all(
        selectedTasks.map((taskId) =>
          axios.post("/Project/POST/UpdateTaskStatus", {
            ProjectTaskId: taskId,
            ProjectTaskStatusId: newStatusId,
          })
        )
      )
        .then(() => {
          socket.emit("task-news", projectId);
          setUpdate((prev) => !prev);
          setSelectedTasks([]);
          setIsMultiSelect(false);
        })
        .catch((error) => {
          console.error("Error updating tasks status:", error);
        });
    },
    [selectedTasks, projectId]
  );

  const toggleMultiSelect = useCallback(
    (force?: boolean) => {
      const newState = force !== undefined ? force : !isMultiSelect;
      if (!newState) setSelectedTasks([]);
      setIsMultiSelect(newState);
    },
    [isMultiSelect]
  );

  const deleteSelectedTasks = useCallback(
    (taskList: Task[]) => {
      Promise.all(
        taskList.map((task) =>
          axios.delete("/Project/DELETE/DeleteTask", {
            params: { ProjectTaskId: task.ProjectTaskId },
          })
        )
      )
        .then(() => {
          socket.emit("task-news", projectId);
          setUpdate((prev) => !prev);
          setSelectedTasks([]);
          setIsMultiSelect(false);
        })
        .catch((error) => {
          console.error("Error deleting task:", error);
        });
    },
    [projectId]
  );

  // ----- Drag & Drop -----
  const onDragStart = useCallback(
    (start: DragStart) => {
      const startColId = Number.parseInt(start.source.droppableId, 10);
      setDragSourceColumnId(startColId);

      if (selectedTasks.length > 1) {
        const selectedCols = new Set(
          selectedTasks.map((taskId) => {
            const task = tasks.find((t) => t.ProjectTaskId === taskId);
            return task ? task.ProjectTaskStatusId : null;
          })
        );
        setIsDraggingMultiColumn(selectedCols.size > 1);
      } else {
        setIsDraggingMultiColumn(false);
      }
    },
    [selectedTasks, tasks]
  );

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      setIsDraggingMultiColumn(false);
      const { destination, draggableId } = result;
      if (!destination) {
        setDragSourceColumnId(null);
        return;
      }
      const newStatusId = Number.parseInt(destination.droppableId, 10);
      let tasksToMove: number[] = [];
      if (draggableId.startsWith("group-")) {
        tasksToMove = [...selectedTasks];
      } else {
        const draggedId = Number.parseInt(draggableId, 10);
        tasksToMove = selectedTasks.includes(draggedId)
          ? [...selectedTasks]
          : [draggedId];
      }
      // Aggiornamento ottimistico
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          tasksToMove.includes(task.ProjectTaskId)
            ? { ...task, ProjectTaskStatusId: newStatusId }
            : task
        )
      );
      await Promise.all(
        tasksToMove.map((id) =>
          axios.post("/Project/POST/UpdateTaskStatus", {
            ProjectTaskId: id,
            ProjectTaskStatusId: newStatusId,
          })
        )
      );
      socket.emit("task-news", projectId);
      setUpdate((prev) => !prev);
      setSelectedTasks([]);
      setIsMultiSelect(false);
      setDragSourceColumnId(null);
    },
    [selectedTasks, projectId]
  );

  // Raggruppa i task per la visualizzazione (drag & drop)
  const renderListForColumn = useCallback(
    (tasksInColumn: Task[], columnId: number): RenderItem[] => {
      if (isDraggingMultiColumn) {
        if (columnId === dragSourceColumnId) {
          const groupTasks = tasks.filter((t) =>
            selectedTasks.includes(t.ProjectTaskId)
          );
          return groupTasks.length
            ? [{ type: "group", tasks: groupTasks }]
            : tasksInColumn.map((task) => ({ type: "single" as const, task }));
        } else {
          return tasksInColumn
            .filter((t) => !selectedTasks.includes(t.ProjectTaskId))
            .map((task) => ({ type: "single" as const, task }));
        }
      }
      if (!isMultiSelect)
        return tasksInColumn.map((task) => ({ type: "single" as const, task }));
      const selectedInThisColumn = tasksInColumn.filter((t) =>
        selectedTasks.includes(t.ProjectTaskId)
      );
      if (selectedInThisColumn.length > 1) {
        const singleItems = tasksInColumn
          .filter((t) => !selectedTasks.includes(t.ProjectTaskId))
          .map((task) => ({ type: "single" as const, task }));
        return [...singleItems, { type: "group", tasks: selectedInThisColumn }];
      }
      return tasksInColumn.map((task) => ({ type: "single" as const, task }));
    },
    [
      tasks,
      selectedTasks,
      isDraggingMultiColumn,
      isMultiSelect,
      dragSourceColumnId,
    ]
  );

  const columnTasks = useMemo(() => {
    const tasksByColumn: { [key: number]: Task[] } = {};
    columns.forEach((col) => {
      tasksByColumn[col.ProjectTaskStatusId] = tasks.filter(
        (t) => t.ProjectTaskStatusId === col.ProjectTaskStatusId
      );
    });
    return tasksByColumn;
  }, [tasks, columns]);

  const tabs = useMemo(
    () => [
      {
        title: "Attive",
        icon: <Icon icon="solar:check-read-linear" fontSize={22} />,
      },
      {
        title: "Archiviate",
        icon: <Icon icon="solar:archive-linear" fontSize={22} />,
      },
    ],
    []
  );

  // Componente per il drag di un gruppo di task
  const GroupDraggable = useCallback(
    ({ groupTasks, index }: { groupTasks: Task[]; index: number }) => (
      <Draggable
        draggableId={`group-${groupTasks[0].ProjectTaskId}`}
        index={index}
      >
        {(provided, snapshot) => {
          const groupStyle = {
            ...provided.draggableProps.style,
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
            boxShadow: snapshot.isDragging
              ? "0 10px 20px rgba(0,0,0,0.4)"
              : "none",
            zIndex: snapshot.isDragging ? 999 : "auto",
          };

          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={groupStyle}
            >
              <div className="relative">
                {groupTasks.map((task, i) => (
                  <div
                    key={task.ProjectTaskId}
                    className="absolute w-full transition-all duration-200"
                    style={{
                      transform: `translateY(${
                        i * (snapshot.isDragging ? 8 : 16)
                      }px)`,
                      zIndex: 10 - i,
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
                <div
                  className="invisible"
                  style={{
                    height: `${groupTasks.length * 40 + 80}px`,
                  }}
                />
              </div>
            </div>
          );
        }}
      </Draggable>
    ),
    [
      columns.length,
      projectId,
      setUpdate,
      update,
      updateTaskStatus,
      handleTaskSelect,
    ]
  );

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <AddTaskModal
        isOpen={modalAddData.open}
        isClosed={() => setModalAddData((prev) => ({ ...prev, open: false }))}
        fetchData={fetchData}
        ProjectId={projectId}
      />

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
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                  <Select
                    onChange={(e) =>
                      changeSelectedTasksStatus(Number(e.target.value))
                    }
                    placeholder="Seleziona Stato"
                    className="w-full sm:w-48"
                    color="primary"
                    variant="bordered"
                    radius="full"
                  >
                    {columns.map((column) => (
                      <SelectItem
                        key={column.ProjectTaskStatusId}
                        value={column.ProjectTaskStatusId}
                      >
                        {column.ProjectTaskStatusName}
                      </SelectItem>
                    ))}
                  </Select>
                  <ConfirmDeleteTaskModal
                    TaskData={selectedTasks
                      .map((id) =>
                        tasks.find((task) => task.ProjectTaskId === id)
                      )
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
                  onPress={() => toggleMultiSelect()}
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
              onPress={() =>
                setModalAddData((prev) => ({ ...prev, open: true }))
              }
              startContent={<Icon icon="mynaui:plus-solid" fontSize={22} />}
              className="hidden sm:flex w-52"
            >
              Aggiungi Task
            </Button>
            <Button
              color="primary"
              radius="full"
              onPress={() => handleAddTaskStatus()}
              startContent={<Icon icon="mynaui:plus-solid" fontSize={22} />}
              className="hidden sm:flex w-56"
            >
              Aggiungi Status
            </Button>
            <Button
              color="primary"
              radius="full"
              onPress={() =>
                setModalAddData((prev) => ({ ...prev, open: true }))
              }
              startContent={<Icon icon="mynaui:plus-solid" fontSize={22} />}
              isIconOnly
              className="sm:hidden"
            />
          </div>
        )}
      </div>

      {activeTab === "Attive" ? (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-${columns.length} justify-between py-5 gap-5 mb-14`}
        >
          {columns.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon="solar:clipboard-check-linear"
                title="Nessuno stato trovato!"
                description="Inizia aggiungendo un nuovo stato per organizzare le tue task."
                buttonText="Aggiungi Stato"
                onButtonClick={handleAddTaskStatus}
              />
            </div>
          ) : (
            columns.map((column) => {
              const tasksInThisColumn =
                columnTasks[column.ProjectTaskStatusId] || [];
              const renderList = renderListForColumn(
                tasksInThisColumn,
                column.ProjectTaskStatusId
              );

              return (
                <div
                  key={column.ProjectTaskStatusId}
                  className={`flex flex-col gap-5 w-full border border-solid border-gray rounded-lg items-center h-fit transition-height duration-300 ${
                    tasksInThisColumn.length === 0
                      ? "min-h-[100px]"
                      : "min-h-[200px]"
                  }`}
                >
                  {editingStatus?.ProjectTaskStatusId ===
                  column.ProjectTaskStatusId ? (
                    <div className="flex flex-row gap-2 w-full p-3 border-b">
                      <Input
                        variant="underlined"
                        color="primary"
                        placeholder="Nuovo nome"
                        value={editingStatus.ProjectTaskStatusName}
                        onChange={(e) =>
                          setEditingStatus({
                            ...editingStatus,
                            ProjectTaskStatusName: e.target.value,
                          })
                        }
                      />
                      <Button
                        isIconOnly
                        color="primary"
                        radius="full"
                        startContent={
                          <Icon icon="basil:save-outline" fontSize={22} />
                        }
                        isDisabled={!editingStatus?.ProjectTaskStatusName}
                        onPress={() => {
                          setEditingStatus(null);
                          updateTaskStatusName(
                            editingStatus.ProjectTaskStatusId,
                            editingStatus.ProjectTaskStatusName
                          );
                        }}
                      />
                      <Button
                        isIconOnly
                        color="default"
                        radius="full"
                        startContent={
                          <Icon
                            icon="material-symbols:close-rounded"
                            className="text-xl"
                          />
                        }
                        onPress={() => setEditingStatus(null)}
                      />
                    </div>
                  ) : (
                    <h2 className="text-xl font-semibold p-3 border-b w-full flex flex-row gap-2 justify-between items-center">
                      <div className="flex flex-row gap-2 items-center">
                        {" "}
                        {column.ProjectTaskStatusName}
                        <Chip
                          radius="full"
                          color="primary"
                          variant="faded"
                          size="sm"
                        >
                          {tasksInThisColumn.length}
                        </Chip>
                      </div>

                      <div className="flex flex-row gap-2 items-center">
                        <Button
                          isIconOnly
                          color="warning"
                          variant="light"
                          radius="full"
                          startContent={
                            <Icon icon="solar:pen-linear" fontSize={22} />
                          }
                          size="sm"
                          onPress={() => setEditingStatus(column)}
                        />
                        <ConfirmDeleteTaskStatusModal
                          column={column}
                          DeleteTaskStatus={deleteTaskStatus}
                        />
                      </div>
                    </h2>
                  )}
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
                            : "bg-lightgrey"
                        )}
                      >
                        {tasksInThisColumn.length === 0 ? (
                          <EmptyState
                            icon="solar:clipboard-check-linear"
                            title="Nessuna task trovata!"
                            description="Inizia aggiungendo una nuova task in questa colonna."
                            buttonText="Aggiungi Task"
                            onButtonClick={() =>
                              setModalAddData((prev) => ({
                                ...prev,
                                open: true,
                              }))
                            }
                          />
                        ) : (
                          renderList.map((item, index) => {
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
                                        isSelected={selectedTasks.includes(
                                          item.task.ProjectTaskId
                                        )}
                                        isDragging={snapshot.isDragging}
                                        isPartOfGroup={false}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              );
                            } else {
                              return (
                                <GroupDraggable
                                  key={`group-${item.tasks[0].ProjectTaskId}`}
                                  groupTasks={item.tasks}
                                  index={index}
                                />
                              );
                            }
                          })
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })
          )}
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
            <div
              className={cn(
                "w-full p-2 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-5 h-auto bg-lightgrey"
              )}
            >
              {archivedTasks.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon="solar:clipboard-check-linear"
                    title="Nessuna task archiviata!"
                    description="Le task archiviate appariranno qui."
                  />
                </div>
              ) : (
                archivedTasks.map((task) => (
                  <ArchivedTaskCard
                    key={task.ProjectTaskId}
                    task={task}
                    setUpdate={setUpdate}
                    update={update}
                    socket={socket}
                    projectId={projectId}
                    columnCount={columns.length}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </DragDropContext>
  );
}
