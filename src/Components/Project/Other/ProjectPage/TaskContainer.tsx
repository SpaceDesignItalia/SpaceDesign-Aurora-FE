import { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Avatar,
  AvatarGroup,
  Button,
  DateValue,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  cn,
} from "@nextui-org/react";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { API_URL_IMG } from "../../../../API/API";
import EditTaskModal from "../ProjectTask/EditTaskModal";
import ConfirmDeleteTaskModal from "../ProjectTask/ConfirmDeleteTaskModal";
import ViewTaskModal from "../ProjectTask/ViewTaskModal";
import { parseDate } from "@internationalized/date";
import dayjs from "dayjs";
import { useDateFormatter } from "@react-aria/i18n";
import AddTaskModal from "../ProjectTask/AddTaskModal";

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

interface ModalData {
  Task: Task;
  open: boolean;
}

interface ModalDeleteData {
  Task: Task;
  open: boolean;
}

interface ModalEditData {
  Task: Task;
  open: boolean;
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
  const [modalData, setModalData] = useState<ModalData>({
    Task: {
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskExpiration: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectId: 0,
    },
    open: false,
  });
  const [modalDeleteData, setModalDeleteData] = useState<ModalDeleteData>({
    Task: {
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskExpiration: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectId: 0,
    },
    open: false,
  });
  const [modalEditData, setModalEditData] = useState<ModalEditData>({
    Task: {
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskExpiration: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectId: 0,
    },
    open: false,
  });
  const [modalAddData, setModalAddData] = useState<ModalAddData>({
    ProjectId: projectId,
    open: false,
  });

  let formatter = useDateFormatter({ dateStyle: "full" });

  function formatDate(date: DateValue) {
    return dayjs(formatter.format(new Date(date.toString()))).format(
      "YYYY-MM-DD"
    );
  }

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

  // Function to update task status
  function updateTaskStatus(taskId: number, statusId: number) {
    axios
      .post("/Project/POST/UpdateTaskStatus", {
        ProjectTaskId: taskId,
        ProjectTaskStatusId: statusId,
      })
      .then(() => {
        setUpdate(!update);
      })
      .catch((error) => {
        console.error("Error updating task status:", error);
      });
  }

  async function DeleteTask(taskId: number) {
    await axios.delete("/Project/DELETE/DeleteTask", {
      params: { ProjectTaskId: taskId },
    });
    setUpdate(!update);
  }

  return (
    <>
      <ViewTaskModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        TaskData={modalData.Task}
      />
      <EditTaskModal
        isOpen={modalEditData.open}
        isClosed={() => setModalEditData({ ...modalEditData, open: false })}
        TaskData={modalEditData.Task}
      />
      <AddTaskModal
        isOpen={modalAddData.open}
        isClosed={() => setModalAddData({ ...modalAddData, open: false })}
        ProjectId={modalAddData.ProjectId}
      />
      <ConfirmDeleteTaskModal
        isOpen={modalDeleteData.open}
        isClosed={() => setModalDeleteData({ ...modalDeleteData, open: false })}
        TaskData={modalDeleteData.Task}
        DeleteTask={DeleteTask}
      />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-row">
          {columns.map((column) => (
            <Droppable
              key={column.ProjectTaskStatusId}
              droppableId={column.ProjectTaskStatusId.toString()}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn({
                    "bg-lightblue": snapshot.isDraggingOver,
                    "bg-lightgrey": !snapshot.isDraggingOver,
                    YOUR_CLASS_NAME_HERE: true, // Add your class name here
                  })}
                >
                  <h2>{column.ProjectTaskStatusName}</h2>
                  {tasks
                    .filter(
                      (task) =>
                        task.ProjectTaskStatusId === column.ProjectTaskStatusId
                    )
                    .map((task, index) => (
                      <Draggable
                        key={task.ProjectTaskId}
                        draggableId={task.ProjectTaskId.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              {
                                "bg-blue-400": snapshot.isDragging,
                                "bg-blue-300": !snapshot.isDragging,
                              },
                              "flex flex-row p-3 text-black rounded-md m-2"
                            )}
                          >
                            <div className="flex flex-row">
                              <div className="flex flex-col">
                                <h2 className="text-md font-bold">
                                  {task.ProjectTaskName}
                                </h2>
                                <div className="flex flex-row">
                                  {task.ProjectTaskTags.map((tag) => (
                                    <p
                                      key={tag.ProjectTaskTagId}
                                      className={
                                        "p-1 m-1 rounded-md bg-gray-400"
                                      }
                                    >
                                      {tag.ProjectTaskTagName}
                                    </p>
                                  ))}
                                  <AvatarGroup isBordered>
                                    {task.ProjectTaskMembers.map((member) => (
                                      <Avatar
                                        key={member.StafferId}
                                        src={
                                          API_URL_IMG +
                                          "/profileIcons/" +
                                          member.StafferImageUrl
                                        }
                                        alt={member.StafferFullName}
                                      />
                                    ))}
                                  </AvatarGroup>
                                </div>
                                <p>{formatDate(task.ProjectTaskExpiration)}</p>
                              </div>
                              <div>
                                <Dropdown radius="sm">
                                  <DropdownTrigger>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                    >
                                      <MoreVertRoundedIcon />
                                    </Button>
                                  </DropdownTrigger>
                                  <DropdownMenu>
                                    <DropdownItem
                                      color="primary"
                                      startContent={
                                        <RemoveRedEyeOutlinedIcon />
                                      }
                                      aria-label="View"
                                      aria-labelledby="View"
                                      onClick={() =>
                                        setModalData({
                                          ...modalData,
                                          open: true,
                                          Task: task,
                                        })
                                      }
                                    >
                                      Visualizza
                                    </DropdownItem>

                                    <DropdownItem
                                      color="warning"
                                      startContent={<ModeOutlinedIcon />}
                                      aria-label="Edit"
                                      aria-labelledby="Edit"
                                      onClick={() =>
                                        setModalEditData({
                                          ...modalEditData,
                                          open: true,
                                          Task: task,
                                        })
                                      }
                                    >
                                      Modifica
                                    </DropdownItem>

                                    <DropdownItem
                                      color="danger"
                                      startContent={<DeleteOutlinedIcon />}
                                      aria-label="Remove"
                                      aria-labelledby="Remove"
                                      onClick={() =>
                                        setModalDeleteData({
                                          ...modalDeleteData,
                                          open: true,
                                          Task: task,
                                        })
                                      }
                                    >
                                      Rimuovi
                                    </DropdownItem>
                                  </DropdownMenu>
                                </Dropdown>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      <Button>
        <Button
          onClick={() => setModalAddData({ ...modalAddData, open: true })}
        >
          Aggiungi Task
        </Button>
      </Button>
    </>
  );
}
