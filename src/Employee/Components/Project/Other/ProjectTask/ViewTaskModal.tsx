import {
  Avatar,
  AvatarGroup,
  Button,
  Chip,
  DateValue,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
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
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

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
  const [newTask, setNewTask] = useState<Task>();
  const [loggedStafferId, setloggedStafferId] = useState<number>(0);
  const [loggedStafferImageUrl, setloggedStafferImageUrl] =
    useState<string>("");
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

  const [comment, setComment] = useState("");
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const commentResponse = await axios.get<Comment[]>(
        "/Project/GET/GetCommentsByTaskId",
        {
          params: { ProjectTaskId: TaskData.ProjectTaskId },
        }
      );
      setNewTask({
        ...newTask,
        ProjectTaskComments: commentResponse.data,
        ProjectTaskId: newTask?.ProjectTaskId!,
        ProjectTaskName: newTask?.ProjectTaskName!,
        ProjectTaskDescription: newTask?.ProjectTaskDescription,
        ProjectTaskExpiration: newTask?.ProjectTaskExpiration!,
        ProjectTaskCreation: newTask?.ProjectTaskCreation!,
        ProjectTaskStatusId: newTask?.ProjectTaskStatusId!,
        ProjectTaskMembers: newTask?.ProjectTaskMembers!,
        ProjectTaskTags: newTask?.ProjectTaskTags!,
        ProjectId: newTask?.ProjectId!,
      });
    };
    fetchComments();
  }, [update]);

  function handleAddTaskComment() {
    axios
      .post(
        "/Project/POST/AddTaskComment",
        { Comment: comment, TaskId: TaskData.ProjectTaskId },
        { withCredentials: true }
      )
      .then(() => {
        setComment("");
        socket.emit("task-news", TaskData.ProjectId);
        setUpdate((prev) => !prev);
      });
  }

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
        setloggedStafferImageUrl(res.data.StafferImageUrl);
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
        setUpdate((prev) => !prev);
      });
  }

  return (
    <>
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
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <Avatar
                              src={
                                loggedStafferImageUrl &&
                                API_URL_IMG +
                                  "/profileIcons/" +
                                  loggedStafferImageUrl
                              }
                              alt="Logged Staffer"
                            />
                          </div>
                          <div className="w-full items-center">
                            <div className="flex flex-row items-center gap-3">
                              <label htmlFor="comment" className="sr-only">
                                Scrivi il tuo commento
                              </label>
                              <Input
                                id="comment"
                                name="comment"
                                placeholder="Scrivi il tuo commento..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddTaskComment();
                                  }
                                }}
                              />
                              <Button
                                color="primary"
                                isIconOnly
                                onClick={handleAddTaskComment}
                              >
                                <SendRoundedIcon />
                              </Button>
                            </div>
                          </div>
                        </div>
                        {newTask && newTask.ProjectTaskComments.length === 0 ? (
                          <p>Nessun commento trovato</p>
                        ) : (
                          <ScrollShadow className="h-40 mt-6">
                            <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg shadow-md">
                              {newTask &&
                                newTask.ProjectTaskComments.map(
                                  (comment, index) => (
                                    <div
                                      key={index}
                                      className="flex gap-4 items-center p-3 bg-white rounded-lg shadow-sm border border-gray-200"
                                    >
                                      <Avatar
                                        src={
                                          comment.StafferImageUrl &&
                                          API_URL_IMG +
                                            "/profileIcons/" +
                                            comment.StafferImageUrl
                                        }
                                        alt={comment.StafferFullName}
                                        className="w-10 h-10 rounded-full"
                                      />
                                      <div className="flex flex-col flex-1">
                                        <div className="flex items-center justify-between">
                                          <p className="text-gray-800 text-base">
                                            {comment.Text}
                                          </p>
                                          {comment.StafferId ===
                                            loggedStafferId && (
                                            <Button
                                              size="sm"
                                              variant="light"
                                              className="hover:text-red-600 ml-2"
                                              isIconOnly
                                              onClick={() =>
                                                handleDeleteComment(
                                                  comment.ProjectTaskCommentId
                                                )
                                              }
                                            >
                                              <CloseRoundedIcon />
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
                          </ScrollShadow>
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
