import { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button, DateValue, cn } from "@nextui-org/react";
import AddTaskModal from "../ProjectTask/AddTaskModal";
import TaskCard from "../ProjectTask/TaskCard";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../API/API";

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

interface Task {
  ProjectTaskId: number;
  ProjectTaskName: string;
  ProjectTaskDescription?: string;
  ProjectTaskExpiration: DateValue;
  ProjectTaskStatusId: number;
  ProjectTaskTags: Tag[];
  ProjectTaskMembers: Member[];
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

export default function TaskBoard({ projectData }: { projectData: Project }) {
  const [columns, setColumns] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [update, setUpdate] = useState(false);
  const projectId = projectData.ProjectId;

  const [modalAddData, setModalAddData] = useState<ModalAddData>({
    ProjectId: projectId,
    open: false,
  });

  useEffect(() => {
    socket.on("task-update", () => {
      setUpdate(!update);
    });
  }, []);

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

              return {
                ...task,
                ProjectTaskTags: tagsResponse.data,
                ProjectTaskMembers: membersResponse.data,
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
  const onDragEnd = (result: { source: any; destination: any }) => {
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
      newTasks.splice(destination.index, 0, reorderedItem);

      setTasks(newTasks);
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
        setUpdate(!update);
      })
      .catch((error) => {
        console.error("Error updating task status:", error);
      });
  }

  return (
    <>
      <AddTaskModal
        isOpen={modalAddData.open}
        isClosed={() => setModalAddData({ ...modalAddData, open: false })}
        ProjectId={modalAddData.ProjectId}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-row justify-between h-screen border border-gray p-5">
          {columns.map((column) => (
            <div className="flex flex-col gap-5 w-full">
              <h2 className="text-xl font-bold mb-4">
                {column.ProjectTaskStatusName}
              </h2>
              <Droppable
                key={column.ProjectTaskStatusId}
                droppableId={column.ProjectTaskStatusId.toString()}
                direction="vertical"
                type="TASK"
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "w-full p-2 flex flex-col gap-5",
                      snapshot.isDraggingOver ? "bg-primary" : "bg-lightgrey"
                    )}
                  >
                    {tasks
                      .filter(
                        (task) =>
                          task.ProjectTaskStatusId ===
                          column.ProjectTaskStatusId
                      )
                      .map((task, index) => (
                        <Draggable
                          key={task.ProjectTaskId}
                          draggableId={task.ProjectTaskId.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <TaskCard
                            provided={provided}
                            snapshot={snapshot}
                            task={task}
                            setUpdate={setUpdate}
                            update={update}
                            socket={socket}
                            projectId={projectId}
                            />
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
                          
          ))}
        </div>
      </DragDropContext>
      <Button onClick={() => setModalAddData({ ...modalAddData, open: true })}>
        Aggiungi Task
      </Button>
    </>
  );
}
