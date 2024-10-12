import {
  Accordion,
  AccordionItem,
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  Chip,
  DateValue,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  ScrollShadow,
  Textarea,
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
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

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

interface Checkbox {
  CheckboxId: number;
  Text: string;
  isSelected: boolean;
  ChecklistId: number;
}

interface Checklist {
  ChecklistId: number;
  Text: string;
  Checkboxes: Checkbox[];
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
  ProjectTaskChecklists: Checklist[];
}

export default function ViewTaskModal({
  isOpen,
  isClosed,
  TaskData,
  socket,
  update,
  setUpdate,
}: {
  isOpen: boolean;
  isClosed: () => void;
  TaskData: Task;
  socket: any;
  update: boolean;
  setUpdate: (update: boolean) => void;
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
      ProjectTaskChecklists: TaskData.ProjectTaskChecklists || [],
    });
  }, [TaskData]);

  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      const commentResponse = await axios.get<Comment[]>(
        "/Project/GET/GetCommentsByTaskId",
        {
          params: { ProjectTaskId: TaskData.ProjectTaskId },
        }
      );
      const checklistsResponse = await axios.get(
        "/Project/GET/GetChecklistsByTaskId",
        {
          params: { TaskId: TaskData.ProjectTaskId },
        }
      );
      const updatedChecklists = await Promise.all(
        checklistsResponse.data.map(async (checklist: Checklist) => {
          const checkboxesResponse = await axios.get(
            "/Project/GET/GetCheckboxesByChecklistId",
            {
              params: { ChecklistId: checklist.ChecklistId },
            }
          );
          return {
            ...checklist,
            Checkboxes: checkboxesResponse.data,
          };
        })
      );

      setNewTask({
        ...newTask,
        ProjectTaskComments: commentResponse.data,
        ProjectTaskChecklists: updatedChecklists,
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
  }, [update, newTask?.ProjectTaskChecklists]);

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
        setUpdate(!update);
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
        setUpdate(!update);
      });
  }

  // Funzione per calcolare la percentuale di completamento
  function calculateProgress(startDate: DateValue, endDate: DateValue): number {
    const totalDuration = dayjs(endDate.toString()).diff(
      dayjs(startDate.toString()),
      "day"
    ); // Differenza totale in giorni
    const daysPassed = dayjs().diff(dayjs(startDate.toString()), "day"); // Giorni passati dalla data di inizio
    const progress = (daysPassed / totalDuration) * 100; // Percentuale
    return Math.min(Math.max(progress, 0), 100); // Assicuriamoci che sia tra 0 e 100
  }

  // Add these states to manage new checklists and checkboxes
  const [newChecklistName, setNewChecklistName] = useState(""); // New checklist name
  const [checklistText, setChecklistText] = useState(""); // New checklist text

  // Function to add a new checklist
  function handleAddChecklist() {
    if (newChecklistName.trim() !== "") {
      axios
        .post(
          "/Project/POST/AddTaskChecklist",
          {
            TaskId: TaskData.ProjectTaskId,
            ChecklistText: newChecklistName,
          },
          { withCredentials: true }
        )
        .then(() => {
          setNewChecklistName("");
          socket.emit("task-news", TaskData.ProjectId);
          setUpdate(!update);
        });
    }
  }

  // Function to handle adding checkboxes to a specific checklist
  function handleAddCheckboxToChecklist(checklistId: number) {
    if (checklistText.trim() !== "") {
      axios
        .post(
          "/Project/POST/AddTaskCheckbox",
          {
            ChecklistId: checklistId,
            CheckboxText: checklistText,
          },
          { withCredentials: true }
        )
        .then(() => {
          setChecklistText("");
          socket.emit("task-news", TaskData.ProjectId);
          setUpdate(!update);
        });
    }
  }

  function handleCheckboxChange(id: number, isSelected: boolean) {
    axios
      .put(
        "/Project/UPDATE/UpdateCheckboxStatus",
        { CheckboxId: id, isSelected: isSelected },
        { withCredentials: true }
      )
      .then(() => {
        socket.emit("task-news", TaskData.ProjectId);
        setUpdate(!update);
      });
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={isClosed}
        size="3xl"
        scrollBehavior="outside"
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {(isClosed) => (
            <>
              <ModalHeader className="flex flex-row items-center gap-2">
                <CreditCardRoundedIcon /> {TaskData.ProjectTaskName}
              </ModalHeader>
              <ModalBody>
                <div className="mt-4">
                  <dl>
                    <div className="px-4 flex flex-col sm:gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <LocalOfferRoundedIcon />
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
                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <Groups2RoundedIcon />
                        Membri
                      </dt>
                      <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 items-center">
                        {TaskData.ProjectTaskMembers.length === 0 ? (
                          <p>Nessun membro trovato</p>
                        ) : (
                          <AvatarGroup isBordered isGrid max={7}>
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

                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-full">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <CalendarMonthRoundedIcon />
                        Durata task
                      </dt>
                      <dd className="flex flex-col gap-2 mt-1 text-sm leading-6 text-gray-700 sm:mt-0 w-full">
                        <div className="flex flex-row justify-between w-full">
                          <p>{formatDate(TaskData.ProjectTaskCreation)}</p>
                          <p>{formatDate(TaskData.ProjectTaskExpiration)}</p>
                        </div>
                        <Progress
                          value={calculateProgress(
                            TaskData.ProjectTaskCreation,
                            TaskData.ProjectTaskExpiration
                          )}
                        />
                      </dd>
                    </div>

                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <NotesRoundedIcon />
                        Descrizione
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        <ReactQuill
                          readOnly
                          className="sm:col-span-2 sm:mt-0 h-fit"
                          theme="bubble"
                          value={TaskData.ProjectTaskDescription}
                        />
                      </dd>
                    </div>

                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <CheckCircleOutlineRoundedIcon />
                        Checklist
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        <div className="flex flex-col gap-4">
                          {newTask?.ProjectTaskChecklists?.map((checklist) => (
                            <div key={checklist.ChecklistId}>
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">
                                  {checklist.Text}
                                </h4>
                                {/* Add new checkbox to this checklist */}
                                <div className="flex items-center gap-2">
                                  <Textarea
                                    variant="underlined"
                                    color="primary"
                                    minRows={1}
                                    placeholder="Aggiungi una nuova checkbox..."
                                    value={checklistText}
                                    onChange={(e) =>
                                      setChecklistText(e.target.value)
                                    }
                                  />
                                  <Button
                                    color="primary"
                                    size="sm"
                                    onClick={() =>
                                      handleAddCheckboxToChecklist(
                                        checklist.ChecklistId
                                      )
                                    }
                                  >
                                    Aggiungi
                                  </Button>
                                </div>
                              </div>
                              {/* Display the checkboxes */}
                              <div className="flex flex-col gap-2">
                                {checklist.Checkboxes.map((checkbox) => (
                                  <Checkbox
                                    key={checkbox.CheckboxId}
                                    size="sm"
                                    isSelected={checkbox.isSelected}
                                    onChange={() =>
                                      handleCheckboxChange(
                                        checkbox.CheckboxId,
                                        !checkbox.isSelected
                                      )
                                    }
                                  >
                                    {checkbox.Text}
                                  </Checkbox>
                                ))}
                              </div>
                            </div>
                          ))}

                          {/* Add new checklist */}
                          <div className="flex items-center gap-2 mt-4">
                            <Textarea
                              variant="underlined"
                              color="primary"
                              minRows={1}
                              placeholder="Nome della nuova checklist..."
                              value={newChecklistName}
                              onChange={(e) =>
                                setNewChecklistName(e.target.value)
                              }
                            />
                            <Button
                              color="primary"
                              size="sm"
                              onClick={handleAddChecklist}
                            >
                              Aggiungi Checklist
                            </Button>
                          </div>
                        </div>
                      </dd>
                    </div>

                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <ChatRoundedIcon />
                        Commenti
                      </dt>
                      <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 items-center">
                        <div className="flex items-start space-x-4">
                          <div className="flex flex-row items-center gap-3 w-full ">
                            <label htmlFor="comment" className="sr-only">
                              Scrivi il tuo commento
                            </label>
                            <div className="flex items-start space-x-4 w-full">
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
                              <div className="min-w-0 flex-1">
                                <form action="#" className="relative">
                                  <div className="overflow-hidden rounded-lg">
                                    <label
                                      htmlFor="comment"
                                      className="sr-only"
                                    >
                                      Add your comment
                                    </label>
                                    <Textarea
                                      variant="underlined"
                                      color="primary"
                                      minRows={1}
                                      id="comment"
                                      name="comment"
                                      placeholder="Scrivi il tuo commento..."
                                      value={comment}
                                      onChange={(e) =>
                                        setComment(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          handleAddTaskComment();
                                        }
                                      }}
                                    />

                                    {/* Spacer element to match the height of the toolbar */}
                                    <div aria-hidden="true" className="py-2">
                                      {/* Matches height of button in toolbar (1px border + 36px content height) */}
                                      <div className="py-px">
                                        <Button
                                          color="primary"
                                          variant="light"
                                          isIconOnly
                                        >
                                          <AttachFileRoundedIcon />
                                        </Button>
                                        <div className="h-9" />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                                    <div className="flex items-center space-x-5">
                                      <div className="flex items-center">
                                        <button
                                          type="button"
                                          className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                                        >
                                          <span className="sr-only">
                                            Attach a file
                                          </span>
                                        </button>
                                      </div>
                                      <div className="flex items-center"></div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <Button
                                        isDisabled={comment == ""}
                                        color="primary"
                                        size="sm"
                                        onClick={handleAddTaskComment}
                                        endContent={
                                          <SendRoundedIcon
                                            sx={{ fontSize: 15 }}
                                          />
                                        }
                                      >
                                        Invia
                                      </Button>
                                    </div>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>

                        {newTask && newTask.ProjectTaskComments.length === 0 ? (
                          <p>Nessun commento trovato</p>
                        ) : (
                          <Accordion variant="light">
                            <AccordionItem
                              key="1"
                              aria-label="Accordion 1"
                              title={
                                <div>
                                  Commenti{" "}
                                  <Chip
                                    color="primary"
                                    variant="faded"
                                    size="sm"
                                    radius="full"
                                  >
                                    {newTask &&
                                      newTask.ProjectTaskComments.length}
                                  </Chip>
                                </div>
                              }
                            >
                              <ScrollShadow className="flex flex-col gap-3">
                                <div className="flex flex-col gap-4 p-4 mt-5">
                                  {newTask &&
                                    newTask.ProjectTaskComments.map(
                                      (comment, index) => (
                                        <>
                                          <div
                                            className="flex flex-col gap-3 border-b"
                                            key={index}
                                          >
                                            <div className="flex flex-row gap-2 items-center">
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
                                              <p className="font-semibold text-base">
                                                {comment.StafferFullName}
                                              </p>
                                              -
                                              <p className="text-gray-500 text-xs font-normal">
                                                {dayjs(
                                                  comment.CommentDate
                                                ).format("DD/MM/YYYY")}
                                              </p>
                                            </div>

                                            <Textarea
                                              variant="underlined"
                                              color="primary"
                                              readOnly
                                              value={comment.Text}
                                              minRows={1}
                                            />
                                          </div>
                                          {comment.StafferId ===
                                            loggedStafferId && (
                                            <div className="flex flex-row gap-2">
                                              <Button size="sm" variant="light">
                                                Modifica
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="faded"
                                                onClick={() =>
                                                  handleDeleteComment(
                                                    comment.ProjectTaskCommentId
                                                  )
                                                }
                                              >
                                                Elimina
                                              </Button>
                                            </div>
                                          )}
                                        </>
                                      )
                                    )}
                                </div>
                              </ScrollShadow>
                            </AccordionItem>
                          </Accordion>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
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
