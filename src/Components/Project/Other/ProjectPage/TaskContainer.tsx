import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Define interfaces
interface Status {
  ProjectTaskStatusId: number;
  ProjectTaskStatusName: string;
}

interface Tag {
  ProjectTaskTagId: number;
  ProjectTaskTagName: string;
  ProjectTaskTagColor: string;
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
  ProjectTaskExpiration: Date;
  ProjectTaskStatusId: number;
  ProjectTaskTags: Tag[];
  ProjectTaskMembers: Member[];
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

export default function TaskBoard({ projectData }: { projectData: Project }) {
  const [columns, setColumns] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [update, setUpdate] = useState(false);
  const projectId = projectData.ProjectId;

  // Fetch columns and tasks data
  useEffect(() => {
    axios.get<Status[]>("/Project/GET/GetTaskStatuses").then((res) => {
      setColumns(res.data);
    });

    axios
      .get<Task[]>("/Project/GET/GetTasksByProjectId", {
        params: { ProjectId: projectId },
      })
      .then((res) => {
        setTasks(res.data);
      });
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
      .then((response) => {
        console.log("Task status updated:", response.data);
        setUpdate(!update);
      })
      .catch((error) => {
        console.error("Error updating task status:", error);
      });
  }

  return (
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
                style={{
                  backgroundColor: snapshot.isDraggingOver
                    ? "lightblue"
                    : "lightgrey",
                }}
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
                          style={{
                            userSelect: "none",
                            padding: 16,
                            margin: "0 0 8px 0",
                            minHeight: "50px",
                            backgroundColor: snapshot.isDragging
                              ? "#263B4A"
                              : "#456C86",
                            color: "white",
                            ...provided.draggableProps.style,
                          }}
                        >
                          {task.ProjectTaskName}
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
  );
}
