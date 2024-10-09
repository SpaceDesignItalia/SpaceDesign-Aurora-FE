import {
  Avatar,
  AvatarGroup,
  Button,
  Chip,
  DateValue,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from "@nextui-org/react";
import { API_URL_IMG } from "../../../../../API/API";
import { useDateFormatter } from "@react-aria/i18n";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import { useEffect, useState } from "react";
import axios from "axios";
import { parseDate } from "@internationalized/date";
import { Comment } from "@mui/icons-material";
import AddCommentModal from "./AddCommentModal";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";

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

interface ModalCommentData {
  Task: Task;
  open: boolean;
}

export default function ViewTaskModal({
  isOpen,
  isClosed,
  TaskData,
  socket,
}: {
  isOpen: boolean;
  isClosed: () => void;
  TaskData: Task;
  socket: any;
}) {
  const [modalCommentData, setModalCommentData] = useState<ModalCommentData>({
    Task: {
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskExpiration: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskCreation: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectTaskComments: [],
      ProjectId: 0,
    },
    open: false,
  });
  const [newTask, setNewTask] = useState<Task>();
  const [loggedStafferId, setloggedStafferId] = useState<number>(0);
  let formatter = useDateFormatter({ dateStyle: "full" });

  useEffect(() => {
    const formatDate = (isoString: string) => {
      return dayjs(isoString).format("YYYY-MM-DD"); // Format to YYYY-MM-DD
    };

    setNewTask({
      ...newTask,
      ProjectTaskCreation: parseDate(
        formatDate(TaskData.ProjectTaskCreation.toString())
      ),
      ProjectTaskExpiration: parseDate(
        formatDate(TaskData.ProjectTaskExpiration.toString())
      ),
      ProjectTaskDescription: TaskData.ProjectTaskDescription,
      ProjectTaskId: TaskData.ProjectTaskId,
      ProjectId: TaskData.ProjectId,
      ProjectTaskName: TaskData.ProjectTaskName,
      ProjectTaskStatusId: TaskData.ProjectTaskStatusId,
      ProjectTaskMembers: TaskData.ProjectTaskMembers,
      ProjectTaskTags: TaskData.ProjectTaskTags,
      ProjectTaskComments: TaskData.ProjectTaskComments || [],
    });
  }, [TaskData]);

  function formatDate(date: DateValue) {
    return dayjs(formatter.format(new Date(date.toString()))).format(
      "DD/MM/YYYY"
    );
  }

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then(async (res) => {
        setloggedStafferId(res.data.StafferId);
      });
  }, []);

  function handleDeleteComment(commentId: number) {
    console.log(commentId);
    axios
      .delete("/Project/DELETE/DeleteTaskComment", {
        data: { CommentId: commentId },
        withCredentials: true,
      })
      .then(() => {
        socket.emit("task-news", TaskData.ProjectId);
        setNewTask({
          ...newTask,
          ProjectTaskComments: newTask?.ProjectTaskComments.filter(
            (comment) => comment.ProjectTaskCommentId !== commentId
          ),
        });
      });
  }

  return (
    <>
      <AddCommentModal
        isOpen={modalCommentData.open}
        isClosed={() =>
          setModalCommentData({ ...modalCommentData, open: false })
        }
        TaskData={modalCommentData.Task}
        socket={socket}
      />
      <Modal
        isOpen={isOpen}
        onOpenChange={isClosed}
        size="5xl"
        scrollBehavior="inside"
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {(isClosed) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Anteprima della task: {TaskData.ProjectTaskName}
              </ModalHeader>
              <ModalBody>
                <div className="mt-6 border-t border-gray-100">
                  <dl className="divide-y divide-gray-100">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">
                        Titolo
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {TaskData.ProjectTaskName}
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">
                        Descrizione
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        <ReactQuill
                          className="sm:col-span-2 sm:mt-0 h-fit"
                          theme="bubble"
                          value={TaskData.ProjectTaskDescription}
                        />
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">
                        Scadenza
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {formatDate(TaskData.ProjectTaskExpiration)}
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">
                        Inizio
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {formatDate(TaskData.ProjectTaskCreation)}
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">
                        Dipendenti associati
                      </dt>
                      <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 items-center">
                        {TaskData.ProjectTaskMembers.length === 0 ? (
                          <p>Nessun membro trovato</p>
                        ) : (
                          <AvatarGroup isBordered>
                            {TaskData.ProjectTaskMembers.map((member) => (
                              <Tooltip
                                key={member.StafferId}
                                content={member.StafferFullName}
                              >
                                <Avatar
                                  src={
                                    member.StafferImageUrl &&
                                    API_URL_IMG +
                                      "/profileIcons/" +
                                      member.StafferImageUrl
                                  }
                                  alt={member.StafferFullName}
                                />
                              </Tooltip>
                            ))}
                          </AvatarGroup>
                        )}
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">
                        Tag associati
                      </dt>
                      <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 items-center">
                        {TaskData.ProjectTaskTags.length === 0 ? (
                          <p>Nessun tag trovato</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {TaskData.ProjectTaskTags.map((tag) => (
                              <Chip
                                key={tag.ProjectTaskTagId}
                                color="primary"
                                variant="faded"
                                radius="sm"
                              >
                                {tag.ProjectTaskTagName}
                              </Chip>
                            ))}
                          </div>
                        )}
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">
                        Commenti
                      </dt>
                      <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 items-center">
                        <div className="relative flex-flex-col">
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() =>
                              setModalCommentData({
                                ...modalCommentData,
                                open: true,
                                Task: newTask || TaskData,
                              })
                            }
                          >
                            <SmsRoundedIcon />
                            Aggiungi Commento
                          </Button>
                        </div>
                        {newTask && newTask.ProjectTaskComments.length === 0 ? (
                          <p>Nessun commento trovato</p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {newTask &&
                              newTask.ProjectTaskComments.map(
                                (comment, index) => (
                                  <div
                                    key={index}
                                    className="flex gap-2 items-start"
                                  >
                                    <Avatar
                                      src={
                                        comment.StafferImageUrl &&
                                        API_URL_IMG +
                                          "/profileIcons/" +
                                          comment.StafferImageUrl
                                      }
                                      alt={comment.StafferFullName}
                                    />
                                    <div className="flex flex-col">
                                      <div className="flex items-center">
                                        <p className="flex-1">{comment.Text}</p>
                                        {comment.StafferId ===
                                          loggedStafferId && (
                                          <Button
                                            className="text-red-500 ml-2"
                                            onClick={() =>
                                              handleDeleteComment(
                                                comment.ProjectTaskCommentId
                                              )
                                            }
                                          >
                                            X
                                          </Button>
                                        )}
                                      </div>
                                      <p className="text-gray-500 text-sm">
                                        {dayjs(comment.CommentDate).format(
                                          "DD/MM/YYYY"
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                          </div>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onClick={isClosed}
                  radius="sm"
                >
                  Chiudi
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
