import {
  Accordion,
  AccordionItem,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  AvatarGroup,
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
  Spinner,
} from "@heroui/react";
import { API_URL_IMG } from "../../../../../API/API";
import { I18nProvider, useDateFormatter } from "@react-aria/i18n";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { parseDate } from "@internationalized/date";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";

import {
  Comment,
  EditRounded,
  SendRounded as SendRoundedIcon,
  CreditCardRounded as CreditCardRoundedIcon,
  NotesRounded as NotesRoundedIcon,
  LocalOfferRounded as LocalOfferRoundedIcon,
  Groups2Rounded as Groups2RoundedIcon,
  CalendarMonthRounded as CalendarMonthRoundedIcon,
  ChatRounded as ChatRoundedIcon,
  CheckBoxOutlined as CheckBoxOutlinedIcon,
  AddRounded as AddRoundedIcon,
  DeleteRounded as DeleteRoundedIcon,
  ModeEditRounded as ModeEditRoundedIcon,
  CloseRounded as CloseRoundedIcon,
  SaveRounded as SaveRoundedIcon,
  AttachFileRounded as AttachFileRoundedIcon,
  Inventory2Rounded as Inventory2RoundedIcon,
} from "@mui/icons-material";
import ConfirmDeleteTaskModal from "./ConfirmDeleteTaskModal";
import FileUploaderModal from "./FileUploaderModal";
import FileCard from "./FileCard";
import StatusAlert from "../../../Layout/StatusAlert";
import ConfirmDeleteChecklistModal from "./ConfirmDeleteChecklistModal";
import ConfirmDeleteCheckboxModal from "./ConfirmDeleteCheckboxModal";

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
  ProjectTaskExpiration?: any;
  ProjectTaskCreation: any;
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

interface ModalData {
  TaskId: number;
  open: boolean;
}

interface File {
  TaskFileId: number;
  FileName: string;
  FilePath: string;
  TaskId: number;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function ViewTaskModal({
  isOpen,
  isClosed,
  TaskData,
  socket,
  update,
  setUpdate,
  hasValidDescription,
}: {
  isOpen: boolean;
  isClosed: () => void;
  TaskData: Task;
  socket: any;
  update: boolean;
  setUpdate: (update: boolean) => void;
  hasValidDescription: (content: string) => boolean;
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
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);
  const [modalUploadFile, setModalUploadFile] = useState<ModalData>({
    TaskId: 0,
    open: false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFiles = async () => {
    try {
      const response = await axios.get("/Project/GET/GetFilesByTaskId", {
        params: { TaskId: TaskData.ProjectTaskId },
      });
      setFiles(response.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [TaskData.ProjectTaskId, update]);

  //Formatter data
  const formatter = useDateFormatter({ dateStyle: "full" });
  function formatDate(date: DateValue) {
    if (!date) return "Nessuna scadenza";
    return dayjs(formatter.format(new Date(date.toString()))).format(
      "DD MMM YYYY"
    );
  }

  useEffect(() => {
    socket.on("task-update", () => {
      fetchTaskData();
      setUpdate(!update);
    });
  }, []);

  function fetchTaskData() {
    const formatDate = (isoString: string) => {
      return dayjs(isoString).format("YYYY-MM-DD");
    };

    if (TaskData) {
      setNewTask({
        ...newTask,
        ProjectTaskCreation: parseDate(
          formatDate(TaskData.ProjectTaskCreation.toString())
        ),
        ProjectTaskExpiration: TaskData.ProjectTaskExpiration
          ? parseDate(formatDate(TaskData.ProjectTaskExpiration.toString()))
          : null,
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
    }
  }

  const handleRefine = async () => {
    if (!TaskData.ProjectTaskDescription) return;
    setLoading(true);
    try {
      const refinedText = await axios.post("/Project/POST/RefineText", {
        text: `Riscrivi in modo più formale e completo il seguente testo: ${TaskData.ProjectTaskDescription}`,
      });

      // Assicuriamoci di mantenere tutte le proprietà esistenti quando aggiorniamo newTask
      setNewTask((prevTask) => ({
        ...prevTask!,
        ProjectTaskDescription: refinedText.data,
      }));
    } catch (error) {
      console.error("Errore:", error);
      alert("Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [TaskData, deleteUpdate]);

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

        fetchFiles();
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
    if (!startDate || !endDate) return 0;
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
          <div className="text-sm">
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
    } else {
      setDateError(false);
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
    let formattedDate;
    if (newTask?.ProjectTaskExpiration) {
      formattedDate = new Date(newTask?.ProjectTaskExpiration.toString());
    } else {
      formattedDate = new Date();
    }
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
        handleColsesModal();
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
        setUpdate(!update);
        setComment("");
        setCommentEditingId(0);
      });
  }

  function deleteUpdateComment() {
    setComment("");
    setCommentEditingId(0);
  }

  async function DeleteTask(Task: Task) {
    try {
      await axios.delete("/Project/DELETE/DeleteTask", {
        params: { ProjectTaskId: Task.ProjectTaskId },
      });
      socket.emit("task-news", Task.ProjectId);

      setUpdate(!update);
      setAlertData({
        isOpen: true,
        onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
        alertTitle: "Operazione completata",
        alertDescription: "La task è stata eliminata con successo.",
        alertColor: "green",
      });
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        // General error handling
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Errore durante l'operazione",
          alertDescription:
            "Si è verificato un errore durante l'eliminazione della task. Per favore, riprova più tardi.",
          alertColor: "red",
        });
      }
    } finally {
      isClosed();
    }
  }

  async function DeleteFile(FileData: File) {
    try {
      const res = await axios.delete("/Project/DELETE/DeleteTaskFile", {
        params: { TaskId: FileData.TaskId, FilePath: FileData.FilePath },
      });

      if (res.status === 200) {
        setUpdate(!update);
        socket.emit("file-update", TaskData.ProjectTaskId);
      }
    } catch (error) {
      console.error("Errore nella cancellazione del file:", error);
    }
  }

  function handleArchiveTask() {
    try {
      axios.put("/Project/UPDATE/ArchiveTask", {
        ProjectTaskId: TaskData.ProjectTaskId,
      });
      setUpdate(!update);
      socket.emit("task-news", TaskData.ProjectId);
      handleColsesModal();
    } catch (error) {
      console.error("Errore nell'archiviazione della task:", error);
    }
  }

  const tagPopoverContent = (
    <PopoverContent className="w-[350px] p-5">
      {(titleProps) => (
        <div className="px-1 py-2 w-full flex flex-col gap-3">
          <h2 className="text-small font-bold text-foreground" {...titleProps}>
            Tag
          </h2>
          <div className="mt-2 flex flex-col gap-2 w-full">
            <Autocomplete
              defaultItems={tags}
              placeholder="Cerca tag"
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
    <PopoverContent className="w-[350px] p-5">
      <div className="px-1 py-2 w-full flex flex-col gap-3">
        <h2 className="text-small font-bold text-foreground">Membri</h2>
        <div className="mt-2 flex flex-col gap-2 w-full">
          <Autocomplete
            defaultItems={members}
            placeholder="Cerca membri per nome"
            className="max-w-xs"
            variant="bordered"
            radius="full"
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
    </PopoverContent>
  );

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <Modal
        isOpen={isOpen}
        onOpenChange={handleColsesModal}
        size="3xl"
        scrollBehavior="outside"
        placement="center"
        backdrop="blur"
        hideCloseButton
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
                      placeholder="Titolo della Task"
                      maxLength={50}
                      value={newTask!.ProjectTaskName}
                      onChange={(e) => {
                        setNewTask({
                          ...newTask!,
                          ProjectTaskName: e.target.value,
                        });
                      }}
                      endContent={
                        <div className="text-sm">
                          {newTask?.ProjectTaskName.length}/50
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="w-full flex flex-row items-center justify-end gap-2 border-b-2 pb-2">
                      <div className="w-full py-3 flex flex-row items-center gap-2">
                        <CreditCardRoundedIcon /> {newTask!.ProjectTaskName}
                      </div>
                      <Button
                        isIconOnly
                        color="warning"
                        variant="light"
                        radius="full"
                        startContent={<EditRounded sx={{ fontSize: 17 }} />}
                        onClick={() => setEditing(true)}
                        size="sm"
                      />
                      <Button
                        color="primary"
                        variant="light"
                        onClick={handleArchiveTask}
                        radius="full"
                        size="sm"
                        isIconOnly
                        startContent={
                          <Inventory2RoundedIcon
                            sx={{ fontSize: 17 }}
                            className="text-primary"
                          />
                        }
                      />
                      <ConfirmDeleteTaskModal
                        TaskData={TaskData}
                        DeleteTask={DeleteTask}
                      />
                      <Button
                        color="primary"
                        variant="light"
                        onClick={handleColsesModal}
                        radius="full"
                        size="sm"
                        isIconOnly
                        startContent={
                          <CloseRoundedIcon
                            sx={{ fontSize: 17 }}
                            className="text-gray-700"
                          />
                        }
                      />
                    </div>
                  </div>
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
                            <div className="flex flex-row items-center gap-3">
                              <p>Nessun tag trovato</p>
                              <Popover offset={10} placement="bottom">
                                <PopoverTrigger>
                                  <Button
                                    color="primary"
                                    variant="faded"
                                    radius="full"
                                    isIconOnly
                                  >
                                    <AddRoundedIcon />
                                  </Button>
                                </PopoverTrigger>
                                {tagPopoverContent}
                              </Popover>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2 items-center">
                              {newTask!.ProjectTaskTags.map((tag) => (
                                <Chip
                                  key={tag.ProjectTaskTagId}
                                  onClose={() =>
                                    deleteTaskTag(tag.ProjectTaskTagId)
                                  }
                                  color="primary"
                                  variant="faded"
                                  radius="sm"
                                >
                                  {tag.ProjectTaskTagName}
                                </Chip>
                              ))}
                              <Popover offset={10} placement="bottom">
                                <PopoverTrigger>
                                  <Button
                                    color="primary"
                                    variant="faded"
                                    radius="full"
                                    isIconOnly
                                  >
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
                            <div className="flex flex-row items-center gap-2">
                              <p>Nessun membro trovato</p>
                              <Popover offset={10} placement="bottom">
                                <PopoverTrigger>
                                  <Button
                                    color="primary"
                                    variant="faded"
                                    radius="full"
                                    isIconOnly
                                  >
                                    <AddRoundedIcon />
                                  </Button>
                                </PopoverTrigger>
                                {memberPopoverContent}
                              </Popover>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-3 items-center">
                              {newTask!.ProjectTaskMembers.map((member) => (
                                <Chip
                                  size="lg"
                                  onClose={() =>
                                    deleteTaskMember(member.StafferId)
                                  }
                                  variant="flat"
                                  avatar={
                                    <Avatar
                                      src={
                                        member.StafferImageUrl &&
                                        `${API_URL_IMG}/profileIcons/${member.StafferImageUrl}`
                                      }
                                      alt={member.StafferFullName}
                                    />
                                  }
                                >
                                  {member.StafferFullName}
                                </Chip>
                              ))}

                              <Popover offset={10} placement="bottom">
                                <PopoverTrigger>
                                  <Button
                                    color="primary"
                                    variant="faded"
                                    radius="full"
                                    isIconOnly
                                  >
                                    <AddRoundedIcon />
                                  </Button>
                                </PopoverTrigger>
                                {memberPopoverContent}
                              </Popover>
                            </div>
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
                        {newTask?.ProjectTaskExpiration
                          ? "Durata task"
                          : "Data inizio"}
                      </dt>
                      <dd className="flex flex-col gap-2 mt-1 text-sm leading-6 text-gray-700 sm:mt-0 w-full">
                        <div className="flex flex-row justify-between w-full">
                          {editing ? (
                            <div className="flex flex-col w-full">
                              <div className="flex flex-row justify-between w-full">
                                <I18nProvider locale="it">
                                  <DatePicker
                                    labelPlacement="outside"
                                    label="Data inizio"
                                    className="w-1/3"
                                    radius="full"
                                    color={dateError ? "danger" : "default"}
                                    variant="bordered"
                                    value={newTask!.ProjectTaskCreation}
                                    onChange={(date) =>
                                      setNewTask((prevTask) => ({
                                        ...prevTask!,
                                        ProjectTaskCreation: date!,
                                      }))
                                    }
                                  />
                                </I18nProvider>
                                <I18nProvider locale="it">
                                  <DatePicker
                                    labelPlacement="outside"
                                    label="Data fine"
                                    className="w-1/3"
                                    radius="full"
                                    color={dateError ? "danger" : "default"}
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
                              {newTask?.ProjectTaskExpiration && (
                                <p>
                                  {formatDate(newTask.ProjectTaskExpiration)}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        {newTask?.ProjectTaskExpiration && (
                          <Progress
                            value={calculateProgress(
                              newTask!.ProjectTaskCreation,
                              newTask!.ProjectTaskExpiration
                            )}
                          />
                        )}
                      </dd>
                    </div>

                    {((newTask!.ProjectTaskDescription &&
                      hasValidDescription(newTask!.ProjectTaskDescription)) ||
                      editing) && (
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
                              {TaskData.ProjectTaskDescription ? (
                                <Button
                                  variant="bordered"
                                  className="w-max-1/2 mx-auto gap-3 my-5 mt-2 py-2"
                                  radius="full"
                                  onClick={handleRefine}
                                  isDisabled={
                                    loading || !TaskData.ProjectTaskDescription
                                  }
                                >
                                  {loading ? (
                                    <>
                                      {" "}
                                      <Spinner
                                        size="sm"
                                        className="text-black"
                                      />{" "}
                                      Riscrittura in corso...{" "}
                                    </>
                                  ) : (
                                    <>
                                      {" "}
                                      <AutoFixHighRoundedIcon className="w-5 h-5" />{" "}
                                      Riscrivi con AI{" "}
                                    </>
                                  )}
                                </Button>
                              ) : null}
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
                    )}

                    {!editing ? (
                      <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                        <FileUploaderModal
                          TaskId={newTask!.ProjectTaskId}
                          isOpen={modalUploadFile.open}
                          isClosed={() =>
                            setModalUploadFile({
                              ...modalUploadFile,
                              open: false,
                            })
                          }
                          setFileUpdate={setUpdate}
                        />
                        <Accordion variant="light" className="px-[-2px]">
                          <AccordionItem
                            key="1"
                            aria-label="Accordion 1"
                            title={
                              <div className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                                <AttachFileRoundedIcon />
                                Allegati
                                <Chip
                                  color="primary"
                                  variant="faded"
                                  size="sm"
                                  radius="full"
                                >
                                  {files && files.length}
                                </Chip>
                              </div>
                            }
                          >
                            <ScrollShadow className="flex flex-col gap-3 max-h-96">
                              <div className="flex flex-col gap-4 w-full">
                                {files.length > 0 &&
                                  files.map((file, index) => (
                                    <FileCard
                                      file={file}
                                      DeleteFile={DeleteFile}
                                      key={index}
                                    />
                                  ))}
                              </div>
                              <Button
                                radius="full"
                                color="primary"
                                startContent={<NoteAddRoundedIcon />}
                                className="w-1/3 sm:w-1/4"
                                variant="solid"
                                onClick={() =>
                                  setModalUploadFile({
                                    ...modalUploadFile,
                                    open: true,
                                  })
                                }
                                fullWidth
                              >
                                Carica file
                              </Button>
                            </ScrollShadow>
                          </AccordionItem>
                        </Accordion>

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
                                          autoFocus
                                          variant="underlined"
                                          color="primary"
                                          placeholder="Titolo della checklist"
                                          value={newChecklistName}
                                          onChange={(e) =>
                                            setNewChecklistName(e.target.value)
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              handleAddChecklist(); // Chiama la funzione quando premi "Enter"
                                            }
                                          }}
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

                            <div className="flex flex-col gap-5 w-full mt-5">
                              {newTask?.ProjectTaskChecklists?.map(
                                (checklist) => (
                                  <Accordion
                                    variant="light"
                                    className="px-[-2px]"
                                  >
                                    <AccordionItem
                                      key="1"
                                      aria-label="Accordion 1"
                                      title={
                                        <div className="flex items-center justify-between border-b">
                                          <h4 className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                                            <CheckBoxOutlinedIcon />{" "}
                                            {checklist.Text}
                                          </h4>
                                          <div className="flex flex-row gap-2 items-center">
                                            {checklist.Checkboxes.length >
                                              0 && (
                                              <>
                                                {calculateChecklistChecked(
                                                  checklist
                                                )}
                                                <CircularProgress
                                                  size="lg"
                                                  value={calculateChecklistPercentage(
                                                    checklist
                                                  )}
                                                  color="primary"
                                                />
                                              </>
                                            )}
                                            <ConfirmDeleteChecklistModal
                                              checklist={checklist}
                                              DeleteChecklist={
                                                handleDeleteChecklist
                                              }
                                            />
                                          </div>
                                        </div>
                                      }
                                    >
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
                                                  isSelected={
                                                    checkbox.IsSelected
                                                  }
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
                                                      size="sm"
                                                      radius="full"
                                                      variant="light"
                                                      onClick={() => {
                                                        setCommentEditingId(
                                                          checkbox.CheckboxId
                                                        );
                                                        setUpdateComment(
                                                          checkbox.Text
                                                        );
                                                      }}
                                                      startContent={
                                                        <ModeEditRoundedIcon
                                                          sx={{
                                                            fontSize: 17,
                                                          }}
                                                        />
                                                      }
                                                      isIconOnly
                                                    />
                                                    <ConfirmDeleteCheckboxModal
                                                      checkbox={checkbox}
                                                      DeleteCheckbox={
                                                        handleDeleteCheckbox
                                                      }
                                                    />
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          ))}

                                        <div className="flex items-center gap-2 mt-5">
                                          <Popover
                                            radius="lg"
                                            placement="bottom"
                                            showArrow
                                            shouldBlockScroll
                                            isOpen={
                                              popoverStates[
                                                checklist.ChecklistId
                                              ]
                                            }
                                            onClose={() =>
                                              togglePopover(
                                                checklist.ChecklistId
                                              )
                                            }
                                          >
                                            <PopoverTrigger>
                                              <Button
                                                color="primary"
                                                size="sm"
                                                radius="full"
                                                startContent={
                                                  <AddRoundedIcon />
                                                }
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
                                                      autoFocus
                                                      placeholder="Aggiungi un nuovo elemento"
                                                      value={checklistText}
                                                      onChange={(e) =>
                                                        setChecklistText(
                                                          e.target.value
                                                        )
                                                      }
                                                      onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                          handleAddCheckboxToChecklist(
                                                            checklist.ChecklistId
                                                          ); // Chiama la funzione quando premi "Enter"
                                                        }
                                                      }}
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
                                    </AccordionItem>
                                  </Accordion>
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
                                            radius="full"
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
                              <Accordion variant="light" className="px-[-2px]">
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
                                                <div className="flex flex-row justify-end gap-2">
                                                  {commentEditingId ===
                                                  comment.ProjectTaskCommentId ? (
                                                    <>
                                                      <Button
                                                        radius="full"
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
                                                        color="primary"
                                                        onClick={
                                                          handleUpdateComment
                                                        }
                                                        radius="full"
                                                        startContent={
                                                          <SaveRoundedIcon />
                                                        }
                                                        isDisabled={
                                                          updateComment ===
                                                            "" ||
                                                          updateComment ===
                                                            comment.Text
                                                        }
                                                        variant={
                                                          dateError
                                                            ? "flat"
                                                            : "solid"
                                                        }
                                                      >
                                                        Salva
                                                      </Button>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Button
                                                        color="warning"
                                                        size="sm"
                                                        radius="full"
                                                        variant="light"
                                                        onClick={() => {
                                                          setCommentEditingId(
                                                            comment.ProjectTaskCommentId
                                                          );
                                                          setUpdateComment(
                                                            comment.Text
                                                          );
                                                        }}
                                                        startContent={
                                                          <EditRounded
                                                            sx={{
                                                              fontSize: 17,
                                                            }}
                                                          />
                                                        }
                                                        isIconOnly
                                                      />

                                                      <Button
                                                        color="danger"
                                                        size="sm"
                                                        radius="full"
                                                        variant="light"
                                                        onClick={() =>
                                                          handleDeleteComment(
                                                            comment.ProjectTaskCommentId
                                                          )
                                                        }
                                                        startContent={
                                                          <DeleteRoundedIcon
                                                            sx={{
                                                              fontSize: 17,
                                                            }}
                                                          />
                                                        }
                                                        isIconOnly
                                                      />
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
                      </div>
                    ) : (
                      <div className="flex flex-row justify-end gap-2">
                        <Button
                          color="primary"
                          variant="light"
                          onClick={closeEditing}
                          radius="full"
                        >
                          Annulla
                        </Button>
                        <Button
                          color="primary"
                          onClick={handleUpdate}
                          radius="full"
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
                {!editing && (
                  <Button
                    color="primary"
                    variant="light"
                    onClick={handleColsesModal}
                    radius="full"
                  >
                    Chiudi
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
