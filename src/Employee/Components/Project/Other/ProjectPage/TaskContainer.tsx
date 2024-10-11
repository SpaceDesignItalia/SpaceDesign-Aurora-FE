import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import LibraryAddRoundedIcon from "@mui/icons-material/LibraryAddRounded";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button, Chip, DateValue, cn } from "@nextui-org/react";
import AddTaskModal from "../ProjectTask/AddTaskModal";
import TaskCard from "../ProjectTask/TaskCard";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import { usePermissions } from "../../../Layout/PermissionProvider";

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
  ProjectTaskExpiration: DateValue;
  ProjectTaskCreation: DateValue;
  ProjectTaskStatusId: number;
  ProjectTaskTags: Tag[];
  ProjectTaskMembers: Member[];
  ProjectTaskComments: Comment[];
  ProjectId: number;
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
  const [columns, setColumns] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [update, setUpdate] = useState(false);
  const projectId = projectData.ProjectId;

  const [modalAddData, setModalAddData] = useState<ModalAddData>({
    ProjectId: projectId,
    open: false,
  });
  const [permissions, setPermissions] = useState({
    assignActivity: false,
  });

  const { hasPermission } = usePermissions();

  useEffect(() => {
    socket.on("task-update", () => {
      setUpdate((prev) => !prev);
      console.log("Task update");
    });
  }, []);

  useEffect(() => {
    async function fetchData() {
      const permission = await hasPermission("ASSIGN_ACTIVITY");

      setPermissions({ ...permissions, assignActivity: permission });
    }
    fetchData();
  }, [hasPermission]);

  useEffect(() => {
    const fetchData = async () => {
      const statusResponse = await axios.get<Status[]>(
        "/Project/GET/GetTaskStatuses"
      );
      setColumns(statusResponse.data);

      axios
        .get<Task[]>("/Project/GET/GetTasksByProjectId", {
          params: { ProjectId: projectId },
        })
        .then(async (res) => {
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
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
        });
    };

    fetchData();
  }, [update]);

  // Handler for drag end
  const onDragEnd = (result: {
    source: any;
    destination: any;
    draggableId: any;
  }) => {
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

  return (
    <>
      <AddTaskModal
        isOpen={modalAddData.open}
        isClosed={() => setModalAddData({ ...modalAddData, open: false })}
        ProjectId={modalAddData.ProjectId}
      />

      <div className="w-full flex justify-end">
        {permissions.assignActivity && (
          <>
            <Button
              color="primary"
              radius="full"
              onClick={() => setModalAddData({ ...modalAddData, open: true })}
              startContent={<LibraryAddRoundedIcon />}
              className="hidden sm:flex"
            >
              Aggiungi Task
            </Button>

            <Button
              color="primary"
              radius="full"
              onClick={() => setModalAddData({ ...modalAddData, open: true })}
              startContent={<LibraryAddRoundedIcon />}
              isIconOnly
              className="sm:hidden"
            />
          </>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-between py-5 gap-5 mb-14">
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
                <h2 className="text-xl font-bold p-3 border-b w-full flex flex-row gap-2 justify-center items-center">
                  {column.ProjectTaskStatusName}
                  <Chip radius="full" color="primary" variant="faded" size="sm">
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
      </DragDropContext>
    </>
  );
}
