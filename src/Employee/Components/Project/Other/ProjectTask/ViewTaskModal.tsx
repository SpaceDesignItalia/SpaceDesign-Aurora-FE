import {
  Accordion,
  AccordionItem,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  DatePicker,
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
import { I18nProvider, useDateFormatter } from "@react-aria/i18n";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { parseDate } from "@internationalized/date";
import { Close, Comment, EditRounded } from "@mui/icons-material";
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
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

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
  const [updateComment, setUpdateComment] = useState("");
  const [newChecklistName, setNewChecklistName] = useState(""); // Nome della nuova checklist
  const [checklistText, setChecklistText] = useState(""); // Testo della nuova checklist
  const [deleteUpdate, setDeleteUpdate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [commentEditingId, setCommentEditingId] = useState(0);

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
    console.log("update");
  }, [TaskData, deleteUpdate, editing]);

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

  function handleDeleteChecklist(checklistId: number) {
    axios
      .delete("/Project/DELETE/DeleteTaskChecklist", {
        data: { ChecklistId: checklistId },
        withCredentials: true,
      })
      .then(() => {
        socket.emit("task-news", TaskData.ProjectId); // Notifica il socket del cambiamento
        setUpdate(!update); // Aggiorna lo stato
      });
  }

  function handleDeleteCheckbox(checkboxId: number) {
    axios
      .delete("/Project/DELETE/DeleteTaskCheckbox", {
        data: { CheckboxId: checkboxId },
        withCredentials: true,
      })
      .then(() => {
        socket.emit("task-news", TaskData.ProjectId); // Notifica il socket del cambiamento
        setUpdate(!update); // Aggiorna lo stato
      });
  }

  const [editingCheckbox, setEditingCheckbox] = useState(0);
  const [checkboxText, setCheckboxText] = useState("");

  const handleEditClick = (checkbox: Checkbox) => {
    setEditingCheckbox(checkbox.CheckboxId);
    setCheckboxText(checkbox.Text);
  };

  const handleSaveEdit = (checkboxId: number) => {
    // Qui invia la richiesta per aggiornare il testo della checkbox
    axios
      .put("/Project/UPDATE/UpdateCheckboxText", {
        CheckboxId: checkboxId,
        CheckboxText: checkboxText,
      })
      .then(() => {
        setEditingCheckbox(0); // Esci dalla modalità di modifica
        socket.emit("task-news", TaskData.ProjectId); // Notifica il socket del cambiamento
        setUpdate(!update); // Aggiorna lo stato
      });
  };

  const handleKeyDown = (e: any, checkboxId: number) => {
    if (e.key === "Enter") {
      handleSaveEdit(checkboxId);
    }
  };

  function handleColsesModal() {
    setCheckboxText("");
    setNewChecklistName("");
    setChecklistText("");
    setComment("");
    setEditingCheckbox(0);
    isClosed();
    setEditing(false);
    setDeleteUpdate(!deleteUpdate);
    deleteUpdateComment();
  }

  const [members, setMembers] = useState<Member[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [dateError, setDateError] = useState(false);

  useEffect(() => {
    // Validation: check if the start date is after the expiration date
    if (newTask?.ProjectTaskCreation && newTask?.ProjectTaskExpiration) {
      const start = new Date(newTask.ProjectTaskCreation.toString());
      const end = new Date(newTask.ProjectTaskExpiration.toString());

      setDateError(start > end); // If start is after end, show error
    }
  }, [newTask]);

  useEffect(() => {
    axios
      .get("Project/GET/GetProjetTeamMembers", {
        params: { ProjectId: TaskData.ProjectId },
      })
      .then((res) => {
        const filteredMembers = res.data.filter((member: Member) => {
          return !newTask!.ProjectTaskMembers.some(
            (taskMember) => taskMember.StafferId === member.StafferId
          );
        });
        setMembers(filteredMembers);
      });

    axios.get("/Project/GET/GetAllTags").then((res) => {
      if (newTask?.ProjectTaskTags) {
        setTags(
          res.data.filter((tag: Tag) => {
            return !newTask!.ProjectTaskTags.some(
              (taskTag) => taskTag.ProjectTaskTagId === tag.ProjectTaskTagId
            );
          })
        );
      }
    });
  }, [newTask, update]);

  function handleUpdate() {
    const formattedDate = new Date(newTask!.ProjectTaskExpiration.toString());
    const formattedCreationDate = new Date(
      newTask!.ProjectTaskCreation.toString()
    );
    axios
      .put("/Project/UPDATE/UpdateTask", {
        FormattedDate: formattedDate,
        FormattedCreationDate: formattedCreationDate,
        TaskData: newTask,
      })
      .then(() => {
        socket.emit("task-news", TaskData.ProjectId);
        setUpdate(!update);
        setEditing(false);
      });
  }

  function addTaskMember(member: Member) {
    setNewTask({
      ...newTask!,
      ProjectTaskMembers: [...newTask!.ProjectTaskMembers, member],
    });
    setUpdate(!update);
  }

  function addTaskTag(tag: Tag) {
    setNewTask({
      ...newTask!,
      ProjectTaskTags: [...newTask!.ProjectTaskTags, tag],
    });
    setUpdate(!update);
  }

  function deleteTaskMember(stafferId: number) {
    setNewTask({
      ...newTask!,
      ProjectTaskMembers: newTask!.ProjectTaskMembers.filter(
        (member) => member.StafferId !== stafferId
      ),
    });
    setUpdate(!update);
  }

  function deleteTaskTag(tagId: number) {
    setNewTask({
      ...newTask!,
      ProjectTaskTags: newTask!.ProjectTaskTags.filter(
        (tag) => tag.ProjectTaskTagId !== tagId
      ),
    });
    setUpdate(!update);
  }

  function closeEditing() {
    setEditing(false);
    setDeleteUpdate(!deleteUpdate);
  }

  function handleUpdateComment() {
    axios
      .put("/Project/UPDATE/UpdateComment", {
        CommentId: commentEditingId,
        CommentText: updateComment,
      })
      .then(() => {
        socket.emit("task-news", TaskData.ProjectId);
        setUpdate(!update);
        setComment("");
        setCommentEditingId(0);
      });
  }

  function deleteUpdateComment() {
    setComment("");
    setCommentEditingId(0);
  }

  const tagPopoverContent = (
    <PopoverContent className="w-[350px]">
      {(titleProps) => (
        <div className="px-1 py-2 w-full">
          <h2 className="text-small font-bold text-foreground" {...titleProps}>
            Tag
          </h2>
          <div className="mt-2 flex flex-col gap-2 w-full">
            <Autocomplete
              defaultItems={tags}
              placeholder="Cerca per nome..."
              className="max-w-xs"
              variant="bordered"
              radius="sm"
            >
              {(tag) => (
                <AutocompleteItem
                  key={tag.ProjectTaskTagId}
                  onClick={() => {
                    addTaskTag(tag);
                  }}
                >
                  {tag.ProjectTaskTagName}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
        </div>
      )}
    </PopoverContent>
  );

  const memberPopoverContent = (
    <PopoverContent className="w-[350px]">
      {(titleProps) => (
        <div className="px-1 py-2 w-full">
          <h2 className="text-small font-bold text-foreground" {...titleProps}>
            Dipendente
          </h2>
          <div className="mt-2 flex flex-col gap-2 w-full">
            <Autocomplete
              defaultItems={members}
              placeholder="Cerca per nome..."
              className="max-w-xs"
              variant="bordered"
              radius="sm"
            >
              {(member) => (
                <AutocompleteItem
                  startContent={
                    <Avatar
                      src={
                        member.StafferImageUrl &&
                        API_URL_IMG + "/profileIcons/" + member.StafferImageUrl
                      }
                      alt={member.StafferFullName}
                    />
                  }
                  key={member.StafferId}
                  onClick={() => {
                    addTaskMember(member);
                  }}
                >
                  {member.StafferFullName}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
        </div>
      )}
    </PopoverContent>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={handleColsesModal}
        size="3xl"
        scrollBehavior="outside"
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-row justify-between items-center gap-2">
                {editing ? (
                  <div className="flex flex-row justify-between items-center gap-2 w-full">
                    <CreditCardRoundedIcon />
                    <Input
                      className="w-full"
                      variant="underlined"
                      color="primary"
                      placeholder="Titolo della checklist"
                      value={newTask!.ProjectTaskName}
                      onChange={(e) => {
                        setNewTask({
                          ...newTask!,
                          ProjectTaskName: e.target.value,
                        });
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <CreditCardRoundedIcon /> {newTask!.ProjectTaskName}
                    </div>
                    <Button
                      isIconOnly
                      color="warning"
                      startContent={<EditRounded />}
                      onClick={() => setEditing(true)}
                      size="sm"
                    />
                  </>
                )}
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
                        {editing ? (
                          newTask!.ProjectTaskTags.length === 0 ? (
                            <div className="flex flex-row">
                              <p>Nessun tag trovato</p>
                              <Popover
                                key="blur"
                                offset={10}
                                placement="bottom"
                                backdrop="blur"
                              >
                                <PopoverTrigger>
                                  <Button color="primary" isIconOnly>
                                    <AddRoundedIcon />
                                  </Button>
                                </PopoverTrigger>
                                {tagPopoverContent}
                              </Popover>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {newTask!.ProjectTaskTags.map((tag) => (
                                <Badge
                                  shape="rectangle"
                                  className="p-1 cursor-pointer"
                                  content={<DeleteOutlineRoundedIcon />}
                                  color="danger"
                                  size="sm"
                                  onClick={() => {
                                    deleteTaskTag(tag.ProjectTaskTagId);
                                  }}
                                >
                                  <Chip
                                    key={tag.ProjectTaskTagId}
                                    color="primary"
                                    variant="faded"
                                    radius="sm"
                                  >
                                    {tag.ProjectTaskTagName}
                                  </Chip>
                                </Badge>
                              ))}
                              <Popover
                                key="blur"
                                offset={10}
                                placement="bottom"
                                backdrop="blur"
                              >
                                <PopoverTrigger>
                                  <Button color="primary" isIconOnly>
                                    <AddRoundedIcon />
                                  </Button>
                                </PopoverTrigger>
                                {tagPopoverContent}
                              </Popover>
                            </div>
                          )
                        ) : newTask!.ProjectTaskTags.length === 0 ? (
                          <p>Nessun tag trovato</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {newTask!.ProjectTaskTags.map((tag) => (
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
                        {editing ? (
                          newTask!.ProjectTaskMembers.length === 0 ? (
                            <div className="flex flex-row">
                              <p>Nessun membro trovato</p>
                              <Popover
                                key="blur"
                                offset={10}
                                placement="bottom"
                                backdrop="blur"
                              >
                                <PopoverTrigger>
                                  <Button color="primary" isIconOnly>
                                    <AddRoundedIcon />
                                  </Button>
                                </PopoverTrigger>
                                {memberPopoverContent}
                              </Popover>
                            </div>
                          ) : (
                            <>
                              <AvatarGroup isBordered isGrid max={7}>
                                {newTask!.ProjectTaskMembers.map((member) => (
                                  <Badge
                                    shape="rectangle"
                                    className="p-1 cursor-pointer"
                                    content={<DeleteOutlineRoundedIcon />}
                                    color="danger"
                                    size="sm"
                                    onClick={() => {
                                      deleteTaskMember(member.StafferId);
                                    }}
                                  >
                                    <Tooltip
                                      key={member.StafferId}
                                      content={member.StafferFullName}
                                    >
                                      <Avatar
                                        src={
                                          member.StafferImageUrl &&
                                          `${API_URL_IMG}/profileIcons/${member.StafferImageUrl}`
                                        }
                                        alt={member.StafferFullName}
                                      />
                                    </Tooltip>
                                  </Badge>
                                ))}
                              </AvatarGroup>
                              <Popover
                                key="blur"
                                offset={10}
                                placement="bottom"
                                backdrop="blur"
                              >
                                <PopoverTrigger>
                                  <Button color="primary" isIconOnly>
                                    <AddRoundedIcon />
                                  </Button>
                                </PopoverTrigger>
                                {memberPopoverContent}
                              </Popover>
                            </>
                          )
                        ) : newTask!.ProjectTaskMembers.length === 0 ? (
                          <p>Nessun membro trovato</p>
                        ) : (
                          <AvatarGroup isBordered isGrid max={7}>
                            {newTask!.ProjectTaskMembers.map((member) => (
                              <Tooltip
                                key={member.StafferId}
                                content={member.StafferFullName}
                              >
                                <Avatar
                                  src={
                                    member.StafferImageUrl &&
                                    `${API_URL_IMG}/profileIcons/${member.StafferImageUrl}`
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
                          {editing ? (
                            <div className="flex flex-col w-full">
                              <div className="flex flex-row justify-between w-full">
                                <I18nProvider locale="it">
                                  <DatePicker
                                    className={`w-1/3 ${
                                      dateError ? "border-red-500" : ""
                                    }`}
                                    variant="bordered"
                                    value={newTask!.ProjectTaskCreation}
                                    onChange={(date) =>
                                      setNewTask((prevTask) => ({
                                        ...prevTask!,
                                        ProjectTaskCreation: date,
                                      }))
                                    }
                                  />
                                </I18nProvider>
                                <I18nProvider locale="it">
                                  <DatePicker
                                    className="w-1/3"
                                    variant="bordered"
                                    value={newTask!.ProjectTaskExpiration}
                                    onChange={(date) =>
                                      setNewTask((prevTask) => ({
                                        ...prevTask!,
                                        ProjectTaskExpiration: date,
                                      }))
                                    }
                                  />
                                </I18nProvider>
                              </div>
                              {dateError && (
                                <span className="text-red-500 text-sm col-span-3 col-start-2 mt-2">
                                  La data di inizio non può essere successiva
                                  alla data di scadenza.
                                </span>
                              )}
                            </div>
                          ) : (
                            <>
                              <p>{formatDate(newTask!.ProjectTaskCreation)}</p>
                              <p>
                                {formatDate(newTask!.ProjectTaskExpiration)}
                              </p>
                            </>
                          )}
                        </div>
                        <Progress
                          value={calculateProgress(
                            newTask!.ProjectTaskCreation,
                            newTask!.ProjectTaskExpiration
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
                        {editing ? (
                          <>
                            <></>
                            <ReactQuill
                              className="sm:col-span-2 sm:mt-0 h-fit"
                              theme="snow"
                              value={newTask!.ProjectTaskDescription}
                              onChange={(e) =>
                                setNewTask({
                                  ...newTask!,
                                  ProjectTaskDescription: e,
                                })
                              }
                            />
                          </>
                        ) : (
                          <ReactQuill
                            readOnly
                            className="sm:col-span-2 sm:mt-0 h-fit"
                            theme="bubble"
                            value={newTask!.ProjectTaskDescription}
                          />
                        )}
                      </dd>
                    </div>

                    {!editing ? (
                      <>
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
                              {newTask?.ProjectTaskChecklists?.map(
                                (checklist) => (
                                  <div
                                    key={checklist.ChecklistId}
                                    className="w-full"
                                  >
                                    <div className="flex items-center justify-between border-b">
                                      <h4 className="flex flex-row gap-2 items-center font-medium py-5">
                                        <CheckBoxOutlinedIcon />{" "}
                                        {checklist.Text}
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
                                          onClick={() =>
                                            handleDeleteChecklist(
                                              checklist.ChecklistId
                                            )
                                          }
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
                                          <div className="flex flex-row justify-between gap-2 items-center w-full">
                                            {editingCheckbox ===
                                            checkbox.CheckboxId ? (
                                              <Input
                                                variant="underlined"
                                                radius="full"
                                                value={checkboxText}
                                                onChange={(e) =>
                                                  setCheckboxText(
                                                    e.target.value
                                                  )
                                                }
                                                onKeyDown={(e) =>
                                                  handleKeyDown(
                                                    e,
                                                    checkbox.CheckboxId
                                                  )
                                                }
                                                autoFocus
                                              />
                                            ) : (
                                              <Checkbox
                                                lineThrough={
                                                  checkbox.IsSelected
                                                }
                                                radius="full"
                                                value={String(
                                                  checkbox.CheckboxId
                                                )}
                                                isSelected={checkbox.IsSelected}
                                                onChange={() =>
                                                  handleCheckboxChange(
                                                    checkbox.CheckboxId,
                                                    !checkbox.IsSelected
                                                  )
                                                }
                                              >
                                                {checkbox.Text}
                                              </Checkbox>
                                            )}
                                            {editingCheckbox ===
                                            checkbox.CheckboxId ? (
                                              <Button
                                                size="sm"
                                                radius="full"
                                                onClick={() =>
                                                  handleSaveEdit(
                                                    checkbox.CheckboxId
                                                  )
                                                }
                                                disabled={checkboxText === ""}
                                                color="primary"
                                              >
                                                Salva
                                              </Button>
                                            ) : (
                                              !checkbox.IsSelected && (
                                                <div className="flex flex-row justify-end">
                                                  <Button
                                                    color="warning"
                                                    variant="light"
                                                    size="sm"
                                                    radius="full"
                                                    isIconOnly
                                                    startContent={
                                                      <ModeEditRoundedIcon />
                                                    }
                                                    onClick={() =>
                                                      handleEditClick(checkbox)
                                                    }
                                                  />
                                                  <Button
                                                    color="danger"
                                                    variant="light"
                                                    size="sm"
                                                    radius="full"
                                                    isIconOnly
                                                    onClick={() =>
                                                      handleDeleteCheckbox(
                                                        checkbox.CheckboxId
                                                      )
                                                    }
                                                    startContent={
                                                      <DeleteRoundedIcon />
                                                    }
                                                  />
                                                </div>
                                              )
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
                                                togglePopover(
                                                  checklist.ChecklistId
                                                )
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
                                                      setChecklistText(
                                                        e.target.value
                                                      )
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
                                                    isDisabled={
                                                      checklistText === ""
                                                    }
                                                    startContent={
                                                      <AddRoundedIcon />
                                                    }
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
                                )
                              )}
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
                                            if (
                                              e.key === "Enter" &&
                                              !e.shiftKey
                                            ) {
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

                            {newTask &&
                            newTask.ProjectTaskComments.length === 0 ? (
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
                                                    alt={
                                                      comment.StafferFullName
                                                    }
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
                                                {commentEditingId ===
                                                comment.ProjectTaskCommentId ? (
                                                  <Textarea
                                                    variant="underlined"
                                                    color="primary"
                                                    value={updateComment}
                                                    onChange={(e) =>
                                                      setUpdateComment(
                                                        e.target.value
                                                      )
                                                    }
                                                    minRows={1}
                                                  />
                                                ) : (
                                                  <Textarea
                                                    variant="underlined"
                                                    color="primary"
                                                    readOnly
                                                    value={comment.Text}
                                                    minRows={1}
                                                  />
                                                )}
                                              </div>

                                              {comment.StafferId ===
                                                loggedStafferId && (
                                                <div className="flex flex-row gap-2">
                                                  {commentEditingId ===
                                                  comment.ProjectTaskCommentId ? (
                                                    <>
                                                      <Button
                                                        size="sm"
                                                        variant="light"
                                                        onClick={
                                                          deleteUpdateComment
                                                        }
                                                      >
                                                        Annulla
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="faded"
                                                        onClick={
                                                          handleUpdateComment
                                                        }
                                                        isDisabled={
                                                          updateComment ===
                                                            "" ||
                                                          updateComment ===
                                                            comment.Text
                                                        }
                                                      >
                                                        Conferma
                                                      </Button>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Button
                                                        size="sm"
                                                        variant="light"
                                                        onClick={() => {
                                                          setCommentEditingId(
                                                            comment.ProjectTaskCommentId
                                                          );
                                                          setUpdateComment(
                                                            comment.Text
                                                          );
                                                        }}
                                                      >
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
                                                    </>
                                                  )}
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
                      </>
                    ) : (
                      <div className="flex flex-row justify-end gap-2">
                        <Button
                          color="primary"
                          variant="light"
                          onClick={closeEditing}
                          radius="sm"
                          startContent={<Close />}
                        >
                          Annulla
                        </Button>
                        <Button
                          color="primary"
                          onClick={handleUpdate}
                          radius="sm"
                          startContent={<SaveRoundedIcon />}
                          isDisabled={dateError}
                          variant={dateError ? "flat" : "solid"}
                        >
                          Salva
                        </Button>
                      </div>
                    )}
                  </dl>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  variant="light"
                  onClick={handleColsesModal}
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
