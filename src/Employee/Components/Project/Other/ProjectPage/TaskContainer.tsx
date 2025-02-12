import {
  Button,
  Chip,
  cn,
  DateValue,
  Select,
  SelectItem,
  Spinner,
  Tab,
  Tabs,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import { usePermissions } from "../../../Layout/PermissionProvider";
import AddTaskModal from "../ProjectTask/AddTaskModal";
import ArchivedTaskCard from "../ProjectTask/ArchivedTaskCard";
import TaskCard from "../ProjectTask/TaskCard";
import ConfirmDeleteTaskModal from "../ProjectTask/ConfirmDeleteTaskModal";

const socket = io(API_WEBSOCKET_URL);

// Define interfaces
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
  ProjectTaskChecklists: Checklist[];
}

interface Checkbox {
  CheckboxId: number;
  Text: string;
  IsSelected: boolean;
  ChecklistId: number;
}

interface Checklist {
  ChecklistId: number;
  Text: string;
  Checkboxes: Checkbox[];
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

export default function TaskContainer({
  projectData,
}: {
  projectData: Project;
}) {
  const { Action } = useParams<{ Action: string }>();
  const [columns, setColumns] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [update, setUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const projectId = projectData.ProjectId;

  const [modalAddData, setModalAddData] = useState<ModalAddData>({
    ProjectId: projectId,
    open: false,
  });

  useEffect(() => {
    if (Action === "add-task") {
      setModalAddData({ ...modalAddData, open: true });
    }
  }, [Action]);

  const [permissions, setPermissions] = useState({
    assignActivity: false,
  });

  const { hasPermission } = usePermissions();

  useEffect(() => {
    socket.on("task-update", () => {
      setUpdate((prev) => !prev);
    });
  }, []);

  useEffect(() => {
    async function fetchPermission() {
      const permission = await hasPermission("ASSIGN_ACTIVITY");

      setPermissions({ ...permissions, assignActivity: permission });
    }
    fetchPermission();
  }, [hasPermission]);

  useEffect(() => {
    fetchData();
  }, [update, projectData.ProjectId]);

  async function fetchData() {
    try {
      const statusResponse = await axios.get<Status[]>(
        "/Project/GET/GetTaskStatuses"
      );
      setColumns(statusResponse.data);

      const res = await axios.get<Task[]>("/Project/GET/GetTasksByProjectId", {
        params: { ProjectId: projectId },
      });

      if (res.status == 200) {
        const fetchedTasks = res.data;
        socket.emit("join", projectId);

        const updatedTasks = await Promise.all(
          fetchedTasks.map(async (task: Task) => {
            const tagsResponse = await axios.get<Tag[]>(
              "/Project/GET/GetTagsByTaskId",
              {
                params: { ProjectTaskId: task.ProjectTaskId },
              }
            );

            const membersResponse = await axios.get<Member[]>(
              "/Project/GET/GetMembersByTaskId",
              {
                params: { ProjectTaskId: task.ProjectTaskId },
              }
            );

            const commentResponse = await axios.get<Comment[]>(
              "/Project/GET/GetCommentsByTaskId",
              {
                params: { ProjectTaskId: task.ProjectTaskId },
              }
            );

            return {
              ...task,
              ProjectTaskTags: tagsResponse.data,
              ProjectTaskMembers: membersResponse.data,
              ProjectTaskComments: commentResponse.data,
            };
          })
        );
        setTasks(updatedTasks);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  // Handler for drag end
  const onDragEnd = (result: {
    source: any;
    destination: any;
    draggableId: any;
  }) => {
    setIsLoading(true);
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId !== destination.droppableId ||
      source.index !== destination.index
    ) {
      const newTasks = Array.from(tasks);
      const [reorderedItem] = newTasks.splice(source.index, 1);
      reorderedItem.ProjectTaskStatusId = parseInt(destination.droppableId, 10);
      reorderedItem.ProjectTaskId = parseInt(result.draggableId, 10);
      newTasks.splice(destination.index, 0, reorderedItem);

      setTasks(newTasks); // Update the UI immediately
      updateTaskStatus(
        reorderedItem.ProjectTaskId,
        reorderedItem.ProjectTaskStatusId
      );
    }
  };

  function updateTaskStatus(taskId: number, statusId: number) {
    axios
      .post("/Project/POST/UpdateTaskStatus", {
        ProjectTaskId: taskId,
        ProjectTaskStatusId: statusId,
      })
      .then(() => {
        socket.emit("task-news", projectId);
        setUpdate((prev) => !prev); // Optionally update to refresh tasks
      })
      .catch((error) => {
        console.error("Error updating task status:", error);
      });
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

  const tabs = [
    {
      title: "Attive",
      icon: <Icon icon="solar:check-read-linear" fontSize={22} />,
    },
    {
      title: "Archiviate",
      icon: <Icon icon="solar:archive-linear" fontSize={22} />,
    },
  ];

  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function fetchArchivedTasks() {
      const res = await axios.get("/Project/GET/GetArchivedTasksByProjectId", {
        params: { ProjectId: projectId },
      });

      if (res.status == 200) {
        const fetchedTasks = res.data;
        socket.emit("join", projectId);

        const updatedTasks = await Promise.all(
          fetchedTasks.map(async (task: Task) => {
            const tagsResponse = await axios.get<Tag[]>(
              "/Project/GET/GetTagsByTaskId",
              {
                params: { ProjectTaskId: task.ProjectTaskId },
              }
            );

            const membersResponse = await axios.get<Member[]>(
              "/Project/GET/GetMembersByTaskId",
              {
                params: { ProjectTaskId: task.ProjectTaskId },
              }
            );

            const commentResponse = await axios.get<Comment[]>(
              "/Project/GET/GetCommentsByTaskId",
              {
                params: { ProjectTaskId: task.ProjectTaskId },
              }
            );

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
    }
    fetchArchivedTasks();
  }, [projectId, update]);

  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  const handleTaskSelect = (taskId: number) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const changeSelectedTasksStatus = (newStatusId: number) => {
    selectedTasks.forEach((taskId) => {
      updateTaskStatus(taskId, newStatusId);
    });
    setSelectedTasks([]);
    setIsMultiSelect(false);
  };

  const toggleMultiSelect = () => {
    if (isMultiSelect) {
      setSelectedTasks([]);
    }
    setIsMultiSelect(!isMultiSelect);
  };

  console.log(selectedTasks);

  const deleteSelectedTasks = (tasks: Task[]) => {
    tasks.forEach((task) => {
      axios
        .delete("/Project/DELETE/DeleteTask", {
          params: { ProjectTaskId: task.ProjectTaskId },
        })
        .then(() => {
          socket.emit("task-news", projectId);
          setUpdate((prev) => !prev);
          setSelectedTasks([]);
          setIsMultiSelect(false);
        })
        .catch((error) => {
          console.error("Error deleting task:", error);
        });
    });
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
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
                          onChange={(e) =>
                            changeSelectedTasksStatus(Number(e.target.value))
                          }
                          placeholder="Seleziona Stato"
                          className="w-48"
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
                      {isMultiSelect
                        ? "Disabilita Selezione Multipla"
                        : "Abilita Selezione Multipla"}
                    </Button>
                  </div>
                  <Button
                    color="primary"
                    radius="full"
                    onPress={() =>
                      setModalAddData({ ...modalAddData, open: true })
                    }
                    startContent={
                      <Icon icon="mynaui:plus-solid" fontSize={22} />
                    }
                    className="hidden sm:flex w-44"
                  >
                    Aggiungi Task
                  </Button>

                  <Button
                    color="primary"
                    radius="full"
                    onPress={() =>
                      setModalAddData({ ...modalAddData, open: true })
                    }
                    startContent={
                      <Icon icon="mynaui:plus-solid" fontSize={22} />
                    }
                    isIconOnly
                    className="sm:hidden"
                  />
                </div>
              )}
            </div>

            {activeTab === "Attive" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 justify-between py-5 gap-5 mb-14">
                {columns.map((column) => {
                  const columnTaskList =
                    columnTasks[column.ProjectTaskStatusId] || [];
                  return (
                    <div
                      key={column.ProjectTaskStatusId}
                      className={`flex flex-col gap-5 w-full border border-solid border-gray rounded-lg items-center h-fit transition-height duration-300 ${
                        columnTaskList.length === 0
                          ? "min-h-[100px]"
                          : "min-h-[200px]"
                      }`}
                    >
                      <h2 className="text-xl font-semibold p-3 border-b w-full flex flex-row gap-2 justify-center items-center">
                        {column.ProjectTaskStatusName}
                        <Chip
                          radius="full"
                          color="primary"
                          variant="faded"
                          size="sm"
                        >
                          {taskCounts[column.ProjectTaskStatusId]}
                        </Chip>
                      </h2>
                      <Droppable
                        droppableId={column.ProjectTaskStatusId.toString()}
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
                            {columnTaskList.map((task, index) => (
                              <Draggable
                                key={task.ProjectTaskId}
                                draggableId={task.ProjectTaskId.toString()}
                                index={index}
                              >
                                {(provided) => (
                                  <TaskCard
                                    provided={provided}
                                    task={task}
                                    setUpdate={setUpdate}
                                    update={update}
                                    socket={socket}
                                    projectId={projectId}
                                    updateTaskStatus={updateTaskStatus}
                                    columnCount={columns.length}
                                    isMultiSelect={isMultiSelect}
                                    handleTaskSelect={handleTaskSelect}
                                    isSelected={selectedTasks.includes(
                                      task.ProjectTaskId
                                    )}
                                  />
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 justify-between py-5 gap-5 mb-14">
                <div
                  key={"Archiviate"}
                  className={`flex flex-col gap-5 w-full border border-solid border-gray rounded-lg items-center h-fit transition-height duration-300 ${
                    archivedTasks.length === 0
                      ? "min-h-[100px]"
                      : "min-h-[200px]"
                  }`}
                >
                  <h2 className="text-xl font-semibold p-3 border-b w-full flex flex-row gap-2 justify-center items-center">
                    Archiviate
                    <Chip
                      radius="full"
                      color="primary"
                      variant="faded"
                      size="sm"
                    >
                      {archivedTasks.length}
                    </Chip>
                  </h2>
                  <div
                    className={cn(
                      "w-full p-2 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-5 h-auto bg-lightgrey"
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
  );
}
