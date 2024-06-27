import {
  Avatar,
  AvatarGroup,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownItem,
  DropdownMenu,
  cn,
  DateValue,
} from "@nextui-org/react";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { API_URL_IMG } from "../../../../API/API";
import dayjs from "dayjs";
import { useDateFormatter } from "@react-aria/i18n";
import { useState } from "react";
import { parseDate } from "@internationalized/date";
import EditTaskModal from "../ProjectTask/EditTaskModal";
import ConfirmDeleteTaskModal from "../ProjectTask/ConfirmDeleteTaskModal";
import ViewTaskModal from "../ProjectTask/ViewTaskModal";
import axios from "axios";

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

export default function TaskCard({
  provided,
  snapshot,
  task,
  setUpdate,
  update,
}) {
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

  function formatDate(date: DateValue) {
    let formatter = useDateFormatter({ dateStyle: "full" });
    return dayjs(formatter.format(new Date(date.toString()))).format(
      "YYYY-MM-DD"
    );
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
      <ConfirmDeleteTaskModal
        isOpen={modalDeleteData.open}
        isClosed={() => setModalDeleteData({ ...modalDeleteData, open: false })}
        TaskData={modalDeleteData.Task}
        DeleteTask={DeleteTask}
      />
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={cn(
          "flex flex-row p-3 text-black rounded-md m-2 transition-transform duration-300",
          {
            "bg-blue-400": snapshot.isDragging,
            "bg-blue-300": !snapshot.isDragging,
            "shadow-lg z-10": snapshot.isDragging,
          }
        )}
      >
        <div className="flex flex-row">
          <div className="flex flex-col">
            <h2 className="text-md font-bold">{task.ProjectTaskName}</h2>
            <div className="flex flex-row">
              {task.ProjectTaskTags.map((tag) => (
                <p
                  key={tag.ProjectTaskTagId}
                  className="p-1 m-1 rounded-md bg-gray-400"
                >
                  {tag.ProjectTaskTagName}
                </p>
              ))}
              <AvatarGroup isBordered>
                {task.ProjectTaskMembers.map((member) => (
                  <Avatar
                    key={member.StafferId}
                    src={
                      API_URL_IMG + "/profileIcons/" + member.StafferImageUrl
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
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertRoundedIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  color="primary"
                  startContent={<RemoveRedEyeOutlinedIcon />}
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
    </>
  );
}
