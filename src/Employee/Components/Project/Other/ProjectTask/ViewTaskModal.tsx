import {
  Accordion,
  AccordionItem,
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  DateValue,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  ScrollShadow,
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import { API_URL_IMG } from "../../../../../API/API";
import { useDateFormatter } from "@react-aria/i18n";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { parseDate } from "@internationalized/date";
import { Comment } from "@mui/icons-material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ModeEditRoundedIcon from "@mui/icons-material/ModeEditRounded";

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
  IsSelected: boolean;
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

interface PopoverStates {
  [key: number]: boolean; // chiavi di tipo number, valori di tipo boolean
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
  // Variabili di stato
  const [newTask, setNewTask] = useState<Task>();
  const [loggedStafferId, setLoggedStafferId] = useState<number>(0);
  const [loggedStafferImageUrl, setLoggedStafferImageUrl] =
    useState<string>("");
  const [popoverStates, setPopoverStates] = useState<PopoverStates>({});
  const [comment, setComment] = useState("");
  const [newChecklistName, setNewChecklistName] = useState(""); // Nome della nuova checklist
  const [checklistText, setChecklistText] = useState(""); // Testo della nuova checklist

  //Formatter data
  const formatter = useDateFormatter({ dateStyle: "full" });
  function formatDate(date: DateValue) {
    return dayjs(formatter.format(new Date(date.toString()))).format(
      "DD MMM YYYY"
    );
  }

  socket.on("task-update", () => {
    setUpdate(!update);
  });

  useEffect(() => {
    // Imposta il nuovo task basato su TaskData
    const formatDate = (isoString: string) => {
      return dayjs(isoString).format("YYYY-MM-DD");
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

  useEffect(() => {
    const fetchCommentsAndChecklists = async () => {
      try {
        // Fetch dei commenti
        const commentResponse = await axios.get<Comment[]>(
          "/Project/GET/GetCommentsByTaskId",
          {
            params: { ProjectTaskId: TaskData.ProjectTaskId },
          }
        );

        // Fetch delle checklist
        const checklistsResponse = await axios.get(
          "/Project/GET/GetChecklistsByTaskId",
          {
            params: { TaskId: TaskData.ProjectTaskId },
          }
        );

        // Fetch dei checkbox per ogni checklist
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

        // Aggiorna lo stato di newTask
        setNewTask((prevTask) => ({
          ...prevTask!,
          ProjectTaskComments: commentResponse.data,
          ProjectTaskChecklists: updatedChecklists,
        }));
      } catch (error) {
        console.error("Errore nel fetch di commenti o checklist", error);
      }
    };

    // Effettua il fetch quando cambia TaskData
    if (TaskData.ProjectTaskId) {
      fetchCommentsAndChecklists();
    }
  }, [update, TaskData]);

  useEffect(() => {
    // Fetch dei dati di sessione dello staffer
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        setLoggedStafferId(res.data.StafferId);
        setLoggedStafferImageUrl(res.data.StafferImageUrl);
      });
  }, []);

  // Valori memorizzati
  const memoizedCheckboxes = useMemo(() => {
    return (
      newTask?.ProjectTaskChecklists.flatMap((checklist) =>
        checklist.Checkboxes.map((checkbox) => ({
          ...checkbox,
        }))
      ) || []
    );
  }, [newTask]);

  // Funzioni
  const handleAddTaskComment = () => {
    axios
      .post(
        "/Project/POST/AddTaskComment",
        { Comment: comment, TaskId: TaskData.ProjectTaskId },
        { withCredentials: true }
      )
      .then(() => {
        setComment(""); // Resetta il commento dopo l'aggiunta
        socket.emit("task-news", TaskData.ProjectId); // Notifica il socket del cambiamento
        setUpdate(!update); // Aggiorna lo stato
      });
  };

  const handleDeleteComment = (commentId: number) => {
    axios
      .delete("/Project/DELETE/DeleteTaskComment", {
        data: { CommentId: commentId },
        withCredentials: true,
      })
      .then(() => {
        socket.emit("task-news", TaskData.ProjectId); // Notifica il socket del cambiamento
        setUpdate(!update); // Aggiorna lo stato
      });
  };

  const handleAddChecklist = () => {
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
          setNewChecklistName(""); // Resetta il nome della checklist dopo l'aggiunta
          socket.emit("task-news", TaskData.ProjectId); // Notifica il socket del cambiamento
          setUpdate(!update); // Aggiorna lo stato
        });
    }
  };

  const handleAddCheckboxToChecklist = (checklistId: number) => {
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
          togglePopover(checklistId); // Chiudi il popover
          setChecklistText(""); // Resetta il testo della checkbox dopo l'aggiunta
          socket.emit("task-news", TaskData.ProjectId); // Notifica il socket del cambiamento
          setUpdate(!update); // Aggiorna lo stato
        });
    }
  };

  const handleCheckboxChange = (id: number, isSelected: boolean) => {
    const updatedCheckboxes = memoizedCheckboxes.map((checkbox) =>
      checkbox.CheckboxId === id
        ? { ...checkbox, IsSelected: isSelected }
        : checkbox
    );

    // Aggiorna lo stato immediatamente
    setNewTask((prevTask) => ({
      ...prevTask!,
      ProjectTaskChecklists:
        prevTask?.ProjectTaskChecklists.map((checklist) => ({
          ...checklist,
          Checkboxes: updatedCheckboxes.filter(
            (checkbox) => checkbox.ChecklistId === checklist.ChecklistId
          ),
        })) || [],
    }));

    // Aggiorna sul server
    axios
      .put(
        "/Project/UPDATE/UpdateCheckboxStatus",
        { CheckboxId: id, isSelected },
        { withCredentials: true }
      )
      .then(() => {
        socket.emit("task-news", TaskData.ProjectId); // Notifica il socket del cambiamento
        setUpdate(!update); // Aggiorna lo stato
      })
      .catch((error) => {
        console.error("Errore nell'aggiornare lo stato della checkbox:", error);
      });
  };

  const calculateProgress = (
    startDate: DateValue,
    endDate: DateValue
  ): number => {
    const totalDuration = dayjs(endDate.toString()).diff(
      dayjs(startDate.toString()),
      "day"
    );
    const daysPassed = dayjs().diff(dayjs(startDate.toString()), "day");
    const progress = (daysPassed / totalDuration) * 100;
    return Math.min(Math.max(progress, 0), 100); // Restituisci una percentuale tra 0 e 100
  };

  const calculateChecklistChecked = (checklist: Checklist) => {
    const checked = checklist.Checkboxes.filter(
      (checkbox) => checkbox.IsSelected
    );
    return (
      <>
        {checklist.Checkboxes.length !== 0 && (
          <div>
            {checked.length}/{checklist.Checkboxes.length}
          </div> // Mostra la proporzione di checkbox selezionate
        )}
      </>
    );
  };

  const calculateChecklistPercentage = (checklist: Checklist) => {
    const checked = checklist.Checkboxes.filter(
      (checkbox) => checkbox.IsSelected
    );
    return (checked.length / checklist.Checkboxes.length) * 100; // Calcola la percentuale di completamento della checklist
  };

  const togglePopover = (checklistId: number) => {
    setPopoverStates((prevStates) => ({
      ...prevStates,
      [checklistId]: !prevStates[checklistId], // Questo ora è valido
    }));
  };

  console.log(newTask?.ProjectTaskChecklists);

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

                    <div className="px-4 py-6 flex flex-row justify-between items-start sm:gap-4 sm:px-0">
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 w-full mr-5">
                        <div className="flex flex-row items-center justify-end w-full">
                          <Popover
                            radius="lg"
                            placement="bottom"
                            showArrow
                            shouldBlockScroll
                          >
                            <PopoverTrigger>
                              <Button
                                color="primary"
                                radius="full"
                                variant="ghost"
                                startContent={<AddRoundedIcon />}
                              >
                                Crea checklist
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-5 w-80">
                              {(titleProps) => (
                                <div className="px-1 py-2 w-full">
                                  <p
                                    className="text-small font-bold text-foreground"
                                    {...titleProps}
                                  >
                                    Crea checklist
                                  </p>
                                  <div className="mt-2 flex flex-col gap-2 w-full">
                                    <Input
                                      variant="underlined"
                                      color="primary"
                                      placeholder="Titolo della checklist"
                                      value={newChecklistName}
                                      onChange={(e) =>
                                        setNewChecklistName(e.target.value)
                                      }
                                    />
                                    <Button
                                      color="primary"
                                      size="sm"
                                      radius="full"
                                      onClick={handleAddChecklist}
                                      startContent={<AddRoundedIcon />}
                                      isDisabled={newChecklistName === ""}
                                    >
                                      Aggiungi Checklist
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex flex-col gap-16 w-full mt-5">
                          {newTask?.ProjectTaskChecklists?.map((checklist) => (
                            <div key={checklist.ChecklistId} className="w-full">
                              <div className="flex items-center justify-between border-b">
                                <h4 className="flex flex-row gap-2 items-center font-medium py-5">
                                  <CheckBoxOutlinedIcon /> {checklist.Text}
                                </h4>
                                <div className="flex flex-row gap-2 items-center">
                                  <CircularProgress
                                    size="lg"
                                    value={calculateChecklistPercentage(
                                      checklist
                                    )}
                                    color="primary"
                                    showValueLabel={true}
                                    valueLabel={calculateChecklistChecked(
                                      checklist
                                    )}
                                  />

                                  <Button
                                    color="danger"
                                    variant="light"
                                    size="sm"
                                    radius="full"
                                    isIconOnly
                                    startContent={<DeleteRoundedIcon />}
                                  />
                                </div>
                              </div>
                              {/* Display the checkboxes */}
                              <div className="flex flex-col gap-2 w-full mt-3">
                                {memoizedCheckboxes
                                  .filter(
                                    (checkbox) =>
                                      checkbox.ChecklistId ===
                                      checklist.ChecklistId
                                  ) // Filter checkboxes for the current checklist
                                  .map((checkbox) => (
                                    <div className="flex flex-row justify-between items-center w-full">
                                      <Checkbox
                                        lineThrough={checkbox.IsSelected} // Aggiungi il line-through se selezionato
                                        key={checkbox.CheckboxId}
                                        radius="full"
                                        value={String(checkbox.CheckboxId)}
                                        isSelected={checkbox.IsSelected} // Utilizza lo stato aggiornato
                                        onChange={() =>
                                          handleCheckboxChange(
                                            checkbox.CheckboxId,
                                            !checkbox.IsSelected
                                          )
                                        }
                                      >
                                        {checkbox.Text}
                                      </Checkbox>
                                      {!checkbox.IsSelected && (
                                        <div className="flex flex-row items-center gap-2">
                                          <Button
                                            color="warning"
                                            variant="light"
                                            size="sm"
                                            radius="full"
                                            isIconOnly
                                            startContent={
                                              <ModeEditRoundedIcon />
                                            }
                                          />
                                          <Button
                                            color="danger"
                                            variant="light"
                                            size="sm"
                                            radius="full"
                                            isIconOnly
                                            startContent={<DeleteRoundedIcon />}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}

                                <div className="flex items-center gap-2">
                                  <Popover
                                    radius="lg"
                                    placement="bottom"
                                    showArrow
                                    shouldBlockScroll
                                    isOpen={
                                      popoverStates[checklist.ChecklistId]
                                    }
                                    onClose={() =>
                                      togglePopover(checklist.ChecklistId)
                                    }
                                  >
                                    <PopoverTrigger>
                                      <Button
                                        color="primary"
                                        size="sm"
                                        radius="full"
                                        startContent={<AddRoundedIcon />}
                                        className="ml-7"
                                        onClick={() =>
                                          togglePopover(checklist.ChecklistId)
                                        }
                                      >
                                        Aggiungi elemento
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-5 w-80">
                                      {(titleProps) => (
                                        <div className="px-1 py-2 w-full">
                                          <p
                                            className="text-small font-bold text-foreground"
                                            {...titleProps}
                                          >
                                            Aggiungi elemento
                                          </p>
                                          <div className="mt-2 flex flex-col gap-2 w-full">
                                            <Input
                                              variant="underlined"
                                              placeholder="Aggiungi un nuovo elemento"
                                              value={checklistText}
                                              onChange={(e) =>
                                                setChecklistText(e.target.value)
                                              }
                                            />
                                            <Button
                                              color="primary"
                                              size="sm"
                                              radius="full"
                                              onClick={() =>
                                                handleAddCheckboxToChecklist(
                                                  checklist.ChecklistId
                                                )
                                              }
                                              isDisabled={checklistText === ""}
                                              startContent={<AddRoundedIcon />}
                                            >
                                              Aggiungi elemento
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </div>
                          ))}
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

                                    <div className="mt-3 flex flex-row justify-end w-full">
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
