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
  Select,
  SelectItem,
} from "@heroui/react";
import { API_URL_IMG } from "../../../../../API/API";
import { I18nProvider, useDateFormatter } from "@react-aria/i18n";
import dayjs from "dayjs";
import "dayjs/locale/it";
import calendar from "dayjs/plugin/calendar";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { parseDate } from "@internationalized/date";
import { Icon } from "@iconify/react";

import ConfirmDeleteTaskModal from "./ConfirmDeleteTaskModal";
import FileUploaderModal from "./FileUploaderModal";
import FileCard from "./FileCard";
import StatusAlert from "../../../Layout/StatusAlert";
import ConfirmDeleteChecklistModal from "./ConfirmDeleteChecklistModal";
import ConfirmDeleteCheckboxModal from "./ConfirmDeleteCheckboxModal";
import ConfirmDeletePopover from "./ConfirmDeletePopover";

dayjs.extend(calendar);
dayjs.locale("it");

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
  PriorityId: number;
}

interface PopoverStates {
  [key: number]: boolean; // chiavi di tipo number, valori di tipo boolean
}

interface ModalData {
  TaskId: number;
  open: boolean;
}

interface Priority {
  ProjectTaskPriorityId: number;
  ProjectTaskPriorityName: string;
  color?: string;
  icon?: string;
  bgColor?: string;
  textColor?: string;
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

interface ConfirmDeleteMemberModalProps {
  member: Member;
  DeleteMember: (stafferId: number) => void;
}

function ConfirmDeleteMemberModal({
  member,
  DeleteMember,
}: ConfirmDeleteMemberModalProps) {
  return (
    <ConfirmDeletePopover
      onConfirm={() => DeleteMember(member.StafferId)}
      triggerButton={
        <Button
          size="sm"
          color="danger"
          variant="light"
          radius="full"
          startContent={
            <Icon icon="solar:trash-bin-trash-linear" fontSize={22} />
          }
          aria-label="Remove"
          aria-labelledby="Remove"
          isIconOnly
        />
      }
    />
  );
}

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

const priorityStyles = {
  1: {
    icon: "ri:alarm-warning-fill",
    textColor: "text-red-700",
    bgColor: "bg-red-100",
  },
  2: {
    icon: "solar:double-alt-arrow-up-linear",
    textColor: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  3: {
    icon: "solar:alt-arrow-up-linear",
    textColor: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  4: {
    icon: "solar:alt-arrow-down-linear",
    textColor: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  5: {
    icon: "solar:alt-arrow-down-linear",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  6: {
    icon: "solar:double-alt-arrow-down-linear",
    textColor: "text-green-700",
    bgColor: "bg-green-100",
  },
};

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
  const [checklistText, setChecklistText] = useState("");
  const [editing, setEditing] = useState(false);
  const [commentEditingId, setCommentEditingId] = useState(0);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);
  const [modalUploadFile, setModalUploadFile] = useState<ModalData>({
    TaskId: 0,
    open: false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [dateError, setDateError] = useState(false);
  const [editingCheckbox, setEditingCheckbox] = useState(0);
  const [checkboxText, setCheckboxText] = useState("");

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

  const fetchPriorities = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/Project/GET/GetAllPriorities");
      const prioritiesWithStyles = response.data.map((priority: Priority) => ({
        ...priority,
        ...priorityStyles[
          priority.ProjectTaskPriorityId as keyof typeof priorityStyles
        ],
      }));
      setPriorities(prioritiesWithStyles);
    } catch (error) {
      console.error("Errore nel caricamento delle priorità:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (editing) {
      fetchPriorities();
    }
  }, [editing]);

  // Aggiungo un effetto per gestire il caricamento iniziale
  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchFiles(), fetchPriorities()]).finally(() => {
      setIsLoading(false);
    });
  }, [TaskData.ProjectTaskId]);

  //Formatter data
  const formatter = useDateFormatter({ dateStyle: "full" });
  function formatDate(date: DateValue) {
    if (!date) return "Nessuna scadenza";
    try {
      const formattedDate = dayjs(new Date(date.toString())).format(
        "DD MMM YYYY"
      );
      return formattedDate === "Invalid Date"
        ? "Nessuna scadenza"
        : formattedDate;
    } catch (error) {
      console.error("Errore nella formattazione della data:", error);
      return "Nessuna scadenza";
    }
  }

  useEffect(() => {
    socket.on("task-update", () => {
      fetchTaskData();
      fetchCommentsAndChecklists();
      setUpdate(!update);
    });

    return () => {
      socket.off("task-update");
    };
  }, [socket]);

  function fetchTaskData() {
    const formatDate = (isoString: string) => {
      try {
        return dayjs(isoString).format("YYYY-MM-DD");
      } catch (error) {
        console.error("Errore nella formattazione della data:", error);
        return dayjs().format("YYYY-MM-DD");
      }
    };

    if (TaskData) {
      try {
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
          PriorityId: TaskData.PriorityId,
        });
      } catch (error) {
        console.error("Errore nell'impostazione dei dati della task:", error);
      }
    }
  }

  const handleRefine = async () => {
    if (!newTask!.ProjectTaskDescription) return;
    setLoading(true);
    try {
      const refinedText = await axios.post("/Project/POST/RefineText", {
        text: `Riscrivi in modo più formale e completo il seguente testo: ${
          newTask!.ProjectTaskDescription
        }`,
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
    if (TaskData) {
      fetchTaskData();
    }
  }, [TaskData]);

  useEffect(() => {
    const fetchData = async () => {
      if (TaskData.ProjectId) {
        try {
          const [membersRes, tagsRes] = await Promise.all([
            axios.get("Project/GET/GetProjetTeamMembers", {
              params: { ProjectId: TaskData.ProjectId },
            }),
            axios.get("/Project/GET/GetAllTags"),
          ]);

          const currentTaskMembers = newTask?.ProjectTaskMembers || [];
          const filteredMembers = membersRes.data.filter((member: Member) => {
            return !currentTaskMembers.some(
              (taskMember) => taskMember.StafferId === member.StafferId
            );
          });
          setMembers(filteredMembers);

          if (newTask?.ProjectTaskTags) {
            setTags(
              tagsRes.data.filter((tag: Tag) => {
                return !newTask.ProjectTaskTags.some(
                  (taskTag) => taskTag.ProjectTaskTagId === tag.ProjectTaskTagId
                );
              })
            );
          }
        } catch (error) {
          console.error("Errore nel caricamento dei dati:", error);
        }
      }
    };

    fetchData();
  }, [
    TaskData.ProjectId,
    newTask?.ProjectTaskMembers,
    newTask?.ProjectTaskTags,
  ]);

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
    if (!comment.trim()) return;

    axios
      .post(
        "/Project/POST/AddTaskComment",
        {
          Comment: comment,
          TaskId: TaskData.ProjectTaskId,
          CommentDate: new Date().toISOString(),
        },
        { withCredentials: true }
      )
      .then(() => {
        setComment("");
        socket.emit("task-news", TaskData.ProjectId);
        fetchCommentsAndChecklists();
        setUpdate(!update);
      })
      .catch((error) => {
        console.error("Errore nell'aggiunta del commento:", error);
      });
  };

  const handleDeleteComment = (commentId: number) => {
    axios
      .delete("/Project/DELETE/DeleteTaskComment", {
        data: { CommentId: commentId },
        withCredentials: true,
      })
      .then(() => {
        socket.emit("task-news", TaskData.ProjectId);
        fetchCommentsAndChecklists();
        setUpdate(!update);
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
    setEditing(false);
    isClosed();
  }

  function closeEditing() {
    setEditing(false);
    fetchTaskData();
  }

  function handleUpdate() {
    let formattedDate = null;
    try {
      if (newTask?.ProjectTaskExpiration) {
        const date = new Date(newTask.ProjectTaskExpiration.toString());
        formattedDate = !isNaN(date.getTime()) ? date : null;
      }
      const formattedCreationDate = new Date(
        newTask!.ProjectTaskCreation.toString()
      );

      if (isNaN(formattedCreationDate.getTime())) {
        console.error("Data di inizio non valida");
        return;
      }

      axios
        .put("/Project/UPDATE/UpdateTask", {
          FormattedDate: formattedDate,
          FormattedCreationDate: formattedCreationDate,
          TaskData: newTask,
        })
        .then(() => {
          socket.emit("task-news", TaskData.ProjectId);
          setEditing(false);
          handleColsesModal();
        })
        .catch((err) => {
          console.error("Errore nell'aggiornamento della task:", err);
        });
    } catch (err) {
      console.error("Errore nella formattazione delle date:", err);
    }
  }

  function addTaskMember(member: Member) {
    if (
      !newTask?.ProjectTaskMembers.some((m) => m.StafferId === member.StafferId)
    ) {
      setNewTask((prevTask) => ({
        ...prevTask!,
        ProjectTaskMembers: [...prevTask!.ProjectTaskMembers, member],
      }));
      setMembers((prevMembers) =>
        prevMembers.filter((m) => m.StafferId !== member.StafferId)
      );
      setUpdate(!update);
    }
  }

  function deleteTaskMember(stafferId: number) {
    // Trova il membro che stiamo rimuovendo
    const memberToRemove = newTask?.ProjectTaskMembers.find(
      (m) => m.StafferId === stafferId
    );
    if (memberToRemove) {
      setNewTask((prevTask) => ({
        ...prevTask!,
        ProjectTaskMembers: prevTask!.ProjectTaskMembers.filter(
          (member) => member.StafferId !== stafferId
        ),
      }));
      // Aggiungi il membro rimosso alla lista dei membri disponibili
      setMembers((prevMembers) => [...prevMembers, memberToRemove]);
    }
  }

  function addTaskTag(tag: Tag) {
    if (
      !newTask?.ProjectTaskTags.some(
        (t) => t.ProjectTaskTagId === tag.ProjectTaskTagId
      )
    ) {
      setNewTask((prevTask) => ({
        ...prevTask!,
        ProjectTaskTags: [...prevTask!.ProjectTaskTags, tag],
      }));
      // Rimuovi il tag aggiunto dalla lista dei tag disponibili
      setTags((prevTags) =>
        prevTags.filter((t) => t.ProjectTaskTagId !== tag.ProjectTaskTagId)
      );
    }
  }

  function deleteTaskTag(tagId: number) {
    // Trova il tag che stiamo rimuovendo
    const tagToRemove = newTask?.ProjectTaskTags.find(
      (t) => t.ProjectTaskTagId === tagId
    );
    if (tagToRemove) {
      setNewTask((prevTask) => ({
        ...prevTask!,
        ProjectTaskTags: prevTask!.ProjectTaskTags.filter(
          (tag) => tag.ProjectTaskTagId !== tagId
        ),
      }));
      // Aggiungi il tag rimosso alla lista dei tag disponibili
      setTags((prevTags) => [...prevTags, tagToRemove]);
    }
  }

  function handleUpdateComment() {
    if (!updateComment.trim()) return;

    axios
      .put("/Project/UPDATE/UpdateComment", {
        CommentId: commentEditingId,
        CommentText: updateComment,
      })
      .then(() => {
        socket.emit("task-news", TaskData.ProjectId);
        fetchCommentsAndChecklists();
        setUpdate(!update);
        setUpdateComment("");
        setCommentEditingId(0);
      })
      .catch((error) => {
        console.error("Errore nell'aggiornamento del commento:", error);
      });
  }

  function deleteUpdateComment() {
    setUpdateComment("");
    setCommentEditingId(0);
  }

  async function DeleteTask(Task: Task[]) {
    try {
      await axios.delete("/Project/DELETE/DeleteTask", {
        params: { ProjectTaskId: Task[0].ProjectTaskId },
      });
      socket.emit("task-news", Task[0].ProjectId);

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

  async function handleArchiveTask() {
    try {
      const currentDate = new Date().toISOString();
      await axios.put("/Project/UPDATE/ArchiveTask", {
        ProjectTaskId: TaskData.ProjectTaskId,
        ProjectTaskExpiration: currentDate,
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
          <h2
            className="text-small font-semibold text-foreground"
            {...titleProps}
          >
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
        <h2 className="text-small font-semibold text-foreground">Membri</h2>
        <div className="mt-2 flex flex-col gap-2 w-full">
          {members.length > 0 ? (
            <Autocomplete
              defaultItems={members}
              placeholder="Cerca membri per nome"
              className="min-w-[300px]"
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
                      className="min-w-[40px]"
                    />
                  }
                  key={member.StafferId}
                  onClick={() => {
                    addTaskMember(member);
                  }}
                  className="flex items-center gap-3"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{member.StafferFullName}</span>
                    <span className="text-sm text-gray-400 truncate">
                      {member.StafferEmail}
                    </span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
          ) : (
            <p className="text-gray-500 text-sm">
              Non ci sono altri membri disponibili
            </p>
          )}
        </div>
      </div>
    </PopoverContent>
  );

  const renderCommentActions = (comment: Comment) => {
    if (commentEditingId === comment.ProjectTaskCommentId) {
      return (
        <div className="flex gap-2">
          <Button
            radius="full"
            size="sm"
            variant="light"
            color="danger"
            onClick={deleteUpdateComment}
            startContent={
              <Icon icon="solar:close-circle-bold" className="text-xl" />
            }
            isIconOnly
          />
          <Button
            size="sm"
            color="success"
            radius="full"
            variant="light"
            startContent={
              <Icon icon="solar:check-circle-bold" className="text-xl" />
            }
            onClick={handleUpdateComment}
            isDisabled={updateComment === "" || updateComment === comment.Text}
            isIconOnly
          />
        </div>
      );
    }

    return (
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          color="warning"
          size="sm"
          radius="full"
          variant="light"
          onClick={() => {
            setCommentEditingId(comment.ProjectTaskCommentId);
            setUpdateComment(comment.Text);
          }}
          startContent={<Icon icon="solar:pen-2-linear" className="text-xl" />}
          isIconOnly
          className="hover:bg-warning-100"
        />
        <ConfirmDeletePopover
          onConfirm={() => handleDeleteComment(comment.ProjectTaskCommentId)}
          triggerButton={
            <Button
              size="sm"
              color="danger"
              variant="light"
              radius="full"
              startContent={
                <Icon icon="solar:trash-bin-trash-linear" fontSize={22} />
              }
              aria-label="Remove"
              aria-labelledby="Remove"
              isIconOnly
            />
          }
        />
      </div>
    );
  };

  useEffect(() => {
    // Validation: check if the start date is after the expiration date
    if (newTask?.ProjectTaskCreation && newTask?.ProjectTaskExpiration) {
      const start = new Date(newTask.ProjectTaskCreation.toString());
      const end = new Date(newTask.ProjectTaskExpiration.toString());

      setDateError(start > end); // If start is after end, show error
    } else {
      setDateError(false); // Se non c'è data di scadenza, non c'è errore
    }
  }, [newTask]);

  useEffect(() => {
    // Fetch dei dati di sessione dello staffer
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        setLoggedStafferId(res.data.StafferId);
        setLoggedStafferImageUrl(res.data.StafferImageUrl);
      });
  }, []); // Esegui solo al mount

  const fetchCommentsAndChecklists = async () => {
    if (!TaskData.ProjectTaskId) return;

    try {
      const [commentResponse, checklistsResponse] = await Promise.all([
        axios.get<Comment[]>("/Project/GET/GetCommentsByTaskId", {
          params: { ProjectTaskId: TaskData.ProjectTaskId },
        }),
        axios.get("/Project/GET/GetChecklistsByTaskId", {
          params: { TaskId: TaskData.ProjectTaskId },
        }),
      ]);

      // Fetch dei checkbox per ogni checklist in parallelo
      const checklistPromises = checklistsResponse.data.map(
        async (checklist: Checklist) => {
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
        }
      );

      const updatedChecklists = await Promise.all(checklistPromises);

      setNewTask((prevTask) => ({
        ...prevTask!,
        ProjectTaskComments: commentResponse.data,
        ProjectTaskChecklists: updatedChecklists,
      }));

      await fetchFiles();
    } catch (error) {
      console.error("Errore nel fetch di commenti o checklist", error);
    }
  };

  useEffect(() => {
    fetchCommentsAndChecklists();
  }, [TaskData.ProjectTaskId, update]); // Aggiunto update come dipendenza

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
        <ModalContent className="sm:max-w-4xl">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {editing ? (
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-row justify-between items-center gap-4">
                      <div className="flex-1">
                        <Input
                          className="w-full text-xl"
                          variant="bordered"
                          color="default"
                          placeholder="Titolo della Task"
                          maxLength={50}
                          value={newTask!.ProjectTaskName}
                          onChange={(e) => {
                            setNewTask({
                              ...newTask!,
                              ProjectTaskName: e.target.value,
                            });
                          }}
                          startContent={
                            <Icon
                              icon="solar:clipboard-check-bold"
                              className="text-2xl text-gray-600"
                            />
                          }
                          endContent={
                            <div className="text-sm text-gray-500">
                              {newTask?.ProjectTaskName.length}/50
                            </div>
                          }
                        />
                      </div>
                      <div className="w-52">
                        {isLoading ? (
                          <Spinner size="sm" />
                        ) : (
                          <Select
                            items={priorities}
                            label="Priorità"
                            variant="bordered"
                            radius="lg"
                            className="w-full"
                            defaultSelectedKeys={[String(newTask?.PriorityId)]}
                            onSelectionChange={(e) => {
                              setNewTask({
                                ...newTask!,
                                PriorityId: parseInt(
                                  (e.currentKey as string) ?? "4"
                                ),
                              });
                            }}
                          >
                            {(priority: Priority) => (
                              <SelectItem
                                key={priority.ProjectTaskPriorityId}
                                value={priority.ProjectTaskPriorityId}
                                textValue={priority.ProjectTaskPriorityName}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon
                                    icon={
                                      priority.icon ||
                                      "solar:minimalistic-dots-bold"
                                    }
                                    className={
                                      priority.textColor || "text-gray-700"
                                    }
                                  />
                                  <span>
                                    {priority.ProjectTaskPriorityName}
                                  </span>
                                </div>
                              </SelectItem>
                            )}
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="w-full flex flex-row items-center justify-between gap-4 border-b pb-4">
                      <div className="flex flex-row items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            priorityStyles[
                              newTask?.PriorityId as keyof typeof priorityStyles
                            ]?.bgColor || "bg-gray-50"
                          }`}
                        >
                          <Icon
                            icon={
                              priorityStyles[
                                newTask?.PriorityId as keyof typeof priorityStyles
                              ]?.icon || "solar:minimalistic-dots-bold"
                            }
                            className={`text-2xl ${
                              priorityStyles[
                                newTask?.PriorityId as keyof typeof priorityStyles
                              ]?.textColor || "text-gray-700"
                            }`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <h2 className="text-xl font-semibold">
                            {newTask!.ProjectTaskName}
                          </h2>
                          <p
                            className={`text-sm ${
                              priorityStyles[
                                newTask?.PriorityId as keyof typeof priorityStyles
                              ]?.textColor || "text-gray-700"
                            }`}
                          >
                            Priorità:{" "}
                            {
                              priorities.find(
                                (priority) =>
                                  priority.ProjectTaskPriorityId ===
                                  newTask!.PriorityId
                              )?.ProjectTaskPriorityName
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row gap-2">
                        <Button
                          isIconOnly
                          color="warning"
                          variant="light"
                          radius="full"
                          startContent={
                            <Icon icon="solar:pen-linear" fontSize={22} />
                          }
                          onClick={() => setEditing(true)}
                          size="sm"
                        />
                        <Button
                          color="default"
                          variant="light"
                          onClick={handleArchiveTask}
                          radius="full"
                          size="sm"
                          isIconOnly
                          startContent={
                            <Icon
                              icon="solar:archive-up-linear"
                              fontSize={22}
                              className="text-gray-700"
                            />
                          }
                        />
                        <ConfirmDeleteTaskModal
                          TaskData={[TaskData]}
                          DeleteTasks={DeleteTask}
                        />
                        <Button
                          color="default"
                          variant="light"
                          onClick={handleColsesModal}
                          radius="full"
                          size="sm"
                          isIconOnly
                          startContent={
                            <Icon
                              icon="material-symbols:close-rounded"
                              fontSize={22}
                              className="text-gray-700"
                            />
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </ModalHeader>
              <ModalBody>
                <div className="mt-4">
                  <dl className="space-y-6">
                    <div className="px-4 flex flex-col gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <div className="p-2 rounded-lg bg-gray-50">
                          <Icon
                            icon="solar:tag-bold"
                            className="text-xl text-gray-600"
                          />
                        </div>
                        Tag associati
                      </dt>
                      <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 items-center">
                        {editing ? (
                          newTask!.ProjectTaskTags.length === 0 ? (
                            <div className="flex flex-row items-center gap-3">
                              <p className="text-gray-500">
                                Nessun tag trovato
                              </p>
                              <Popover offset={10} placement="bottom">
                                <PopoverTrigger>
                                  <Button
                                    color="default"
                                    variant="flat"
                                    radius="full"
                                    isIconOnly
                                    className="bg-gray-50"
                                  >
                                    <Icon
                                      icon="solar:add-circle-bold"
                                      className="text-xl text-gray-600"
                                    />
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
                                  color="default"
                                  variant="flat"
                                  radius="lg"
                                  classNames={{
                                    base: "bg-gray-50",
                                    content: "text-gray-600",
                                  }}
                                >
                                  {tag.ProjectTaskTagName}
                                </Chip>
                              ))}
                              <Popover offset={10} placement="bottom">
                                <PopoverTrigger>
                                  <Button
                                    color="default"
                                    variant="flat"
                                    radius="full"
                                    isIconOnly
                                    className="bg-gray-50"
                                  >
                                    <Icon
                                      icon="solar:add-circle-bold"
                                      className="text-xl text-gray-600"
                                    />
                                  </Button>
                                </PopoverTrigger>
                                {tagPopoverContent}
                              </Popover>
                            </div>
                          )
                        ) : newTask!.ProjectTaskTags.length === 0 ? (
                          <p className="text-gray-500">Nessun tag trovato</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {newTask!.ProjectTaskTags.map((tag) => (
                              <Chip
                                key={tag.ProjectTaskTagId}
                                color="default"
                                variant="flat"
                                radius="lg"
                                classNames={{
                                  base: "bg-gray-50",
                                  content: "text-gray-600",
                                }}
                              >
                                {tag.ProjectTaskTagName}
                              </Chip>
                            ))}
                          </div>
                        )}
                      </dd>
                    </div>

                    <div className="px-4 py-6 flex flex-col gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <div className="p-2 rounded-lg bg-gray-50">
                          <Icon
                            icon="solar:users-group-rounded-bold"
                            className="text-xl text-gray-600"
                          />
                        </div>
                        Membri
                      </dt>
                      <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 items-center">
                        {editing ? (
                          newTask!.ProjectTaskMembers.length === 0 ? (
                            <div className="flex flex-row items-center gap-2">
                              <p className="text-gray-500">
                                Nessun membro trovato
                              </p>
                              <Popover offset={10} placement="bottom">
                                <PopoverTrigger>
                                  <Button
                                    color="default"
                                    variant="light"
                                    radius="lg"
                                    className="w-full h-full min-h-[64px] border border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/50"
                                    startContent={
                                      <Icon
                                        icon="solar:add-circle-bold"
                                        className="text-xl text-gray-600"
                                      />
                                    }
                                  >
                                    Aggiungi membro
                                  </Button>
                                </PopoverTrigger>
                                {memberPopoverContent}
                              </Popover>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 w-full">
                              {newTask!.ProjectTaskMembers.map((member) => (
                                <div
                                  key={member.StafferId}
                                  className="group flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50/50"
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar
                                      src={
                                        member.StafferImageUrl &&
                                        `${API_URL_IMG}/profileIcons/${member.StafferImageUrl}`
                                      }
                                      alt={member.StafferFullName}
                                      className="w-8 h-8"
                                      isBordered
                                      color="default"
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium text-sm">
                                        {member.StafferFullName}
                                      </span>
                                      <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                        {member.StafferEmail}
                                      </span>
                                    </div>
                                  </div>
                                  {editing && (
                                    <ConfirmDeleteMemberModal
                                      member={member}
                                      DeleteMember={deleteTaskMember}
                                    />
                                  )}
                                </div>
                              ))}
                              {editing && (
                                <Popover offset={10} placement="bottom">
                                  <PopoverTrigger>
                                    <Button
                                      color="default"
                                      variant="light"
                                      radius="lg"
                                      className="w-full h-full min-h-[64px] border border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/50"
                                      startContent={
                                        <Icon
                                          icon="solar:add-circle-bold"
                                          className="text-xl text-gray-600"
                                        />
                                      }
                                    >
                                      Aggiungi membro
                                    </Button>
                                  </PopoverTrigger>
                                  {memberPopoverContent}
                                </Popover>
                              )}
                            </div>
                          )
                        ) : newTask!.ProjectTaskMembers.length === 0 ? (
                          <p className="text-gray-500">Nessun membro trovato</p>
                        ) : (
                          <div className="flex items-center gap-4 px-5">
                            <AvatarGroup
                              isBordered
                              max={7}
                              total={
                                newTask!.ProjectTaskMembers.length > 7
                                  ? newTask!.ProjectTaskMembers.length - 7
                                  : 0
                              }
                              className="gap-5"
                            >
                              {newTask!.ProjectTaskMembers.map((member) => (
                                <Tooltip
                                  key={member.StafferId}
                                  content={
                                    <div className="px-2 py-1">
                                      <p className="font-medium">
                                        {member.StafferFullName}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {member.StafferEmail}
                                      </p>
                                    </div>
                                  }
                                  placement="bottom"
                                >
                                  <Avatar
                                    src={
                                      member.StafferImageUrl &&
                                      `${API_URL_IMG}/profileIcons/${member.StafferImageUrl}`
                                    }
                                    alt={member.StafferFullName}
                                    className="!translate-x-0 !transition-none"
                                  />
                                </Tooltip>
                              ))}
                            </AvatarGroup>
                          </div>
                        )}
                      </dd>
                    </div>

                    <div className="px-4 py-6 flex flex-col gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <div className="p-2 rounded-lg bg-gray-50">
                          <Icon
                            icon="solar:calendar-bold"
                            className="text-xl text-gray-600"
                          />
                        </div>
                        {newTask?.ProjectTaskExpiration
                          ? "Durata task"
                          : "Data inizio"}
                      </dt>
                      <dd className="flex flex-col gap-4 mt-1 text-sm leading-6 text-gray-700 sm:mt-0 w-full">
                        <div className="flex flex-row justify-between items-center w-full">
                          {editing ? (
                            <div className="flex flex-col w-full gap-4">
                              <div className="flex flex-row justify-between w-full gap-4">
                                <I18nProvider locale="it">
                                  <DatePicker
                                    labelPlacement="outside"
                                    label="Data inizio"
                                    className="w-1/3"
                                    radius="lg"
                                    color={dateError ? "danger" : "default"}
                                    variant="bordered"
                                    value={newTask!.ProjectTaskCreation}
                                    onChange={(date) => {
                                      setNewTask((prevTask) => ({
                                        ...prevTask!,
                                        ProjectTaskCreation: date!,
                                      }));
                                    }}
                                  />
                                </I18nProvider>
                                <I18nProvider locale="it">
                                  <DatePicker
                                    labelPlacement="outside"
                                    label="Data fine"
                                    className="w-1/3"
                                    radius="lg"
                                    color={dateError ? "danger" : "default"}
                                    variant="bordered"
                                    value={newTask!.ProjectTaskExpiration}
                                    onChange={(date) => {
                                      setNewTask((prevTask) => ({
                                        ...prevTask!,
                                        ProjectTaskExpiration: date,
                                      }));
                                    }}
                                    endContent={
                                      newTask!.ProjectTaskExpiration && (
                                        <Button
                                          isIconOnly
                                          variant="light"
                                          radius="full"
                                          size="sm"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setNewTask((prevTask) => ({
                                              ...prevTask!,
                                              ProjectTaskExpiration: null,
                                            }));
                                            setDateError(false);
                                          }}
                                        >
                                          <Icon
                                            icon="solar:close-circle-bold"
                                            className="text-xl"
                                          />
                                        </Button>
                                      )
                                    }
                                  />
                                </I18nProvider>
                              </div>
                              {dateError && (
                                <span className="text-danger text-sm">
                                  La data di inizio non può essere successiva
                                  alla data di scadenza.
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-row justify-between w-full">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm text-gray-500">
                                  Data inizio
                                </span>
                                <p className="text-base">
                                  {formatDate(newTask!.ProjectTaskCreation)}
                                </p>
                              </div>
                              {newTask?.ProjectTaskExpiration && (
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm text-gray-500">
                                    Data fine
                                  </span>
                                  <p className="text-base">
                                    {formatDate(newTask.ProjectTaskExpiration)}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {newTask?.ProjectTaskExpiration && (
                          <div className="w-full">
                            <Progress
                              size="md"
                              radius="lg"
                              classNames={{
                                base: "",
                                track: "drop-shadow-md border border-default",
                                indicator: `${
                                  calculateProgress(
                                    newTask!.ProjectTaskCreation,
                                    newTask!.ProjectTaskExpiration
                                  ) >= 100
                                    ? "bg-gradient-to-r from-red-600 to-red-500"
                                    : calculateProgress(
                                        newTask!.ProjectTaskCreation,
                                        newTask!.ProjectTaskExpiration
                                      ) >= 85
                                    ? "bg-gradient-to-r from-red-500 to-red-400"
                                    : calculateProgress(
                                        newTask!.ProjectTaskCreation,
                                        newTask!.ProjectTaskExpiration
                                      ) >= 70
                                    ? "bg-gradient-to-r from-orange-500 to-orange-400"
                                    : "bg-gradient-to-r from-blue-500 to-blue-400"
                                }`,
                                label:
                                  "tracking-wider font-medium text-default-600",
                                value: "text-gray-600",
                              }}
                              value={calculateProgress(
                                newTask!.ProjectTaskCreation,
                                newTask!.ProjectTaskExpiration
                              )}
                              showValueLabel={false}
                            />
                            <div className="flex justify-end mt-2">
                              <div
                                className={`flex items-center justify-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full transition-all border shadow-sm ${
                                  calculateProgress(
                                    newTask!.ProjectTaskCreation,
                                    newTask!.ProjectTaskExpiration
                                  ) >= 100
                                    ? "bg-red-200 border-red-400 text-red-800"
                                    : calculateProgress(
                                        newTask!.ProjectTaskCreation,
                                        newTask!.ProjectTaskExpiration
                                      ) >= 85
                                    ? "bg-red-100 border-red-300 text-red-700"
                                    : calculateProgress(
                                        newTask!.ProjectTaskCreation,
                                        newTask!.ProjectTaskExpiration
                                      ) >= 70
                                    ? "bg-orange-100 border-orange-300 text-orange-700"
                                    : "bg-blue-100 border-blue-300 text-blue-700"
                                }`}
                              >
                                <Icon
                                  icon="solar:timer-linear"
                                  className="text-base"
                                />
                                <span className="font-medium tracking-wide">
                                  {calculateProgress(
                                    newTask!.ProjectTaskCreation,
                                    newTask!.ProjectTaskExpiration
                                  ) >= 100
                                    ? "Scaduto"
                                    : calculateProgress(
                                        newTask!.ProjectTaskCreation,
                                        newTask!.ProjectTaskExpiration
                                      ) >= 85
                                    ? "Scadenza imminente"
                                    : calculateProgress(
                                        newTask!.ProjectTaskCreation,
                                        newTask!.ProjectTaskExpiration
                                      ) >= 70
                                    ? "In scadenza"
                                    : "In tempo"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </dd>
                    </div>

                    {(editing || newTask?.ProjectTaskDescription) && (
                      <div className="px-4 py-6 flex flex-col gap-4 sm:px-0">
                        <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                          <div className="p-2 rounded-lg bg-gray-50">
                            <Icon
                              icon="solar:document-text-bold"
                              className="text-xl text-gray-600"
                            />
                          </div>
                          Descrizione
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                          {editing ? (
                            <>
                              <ReactQuill
                                className="sm:mt-0 h-fit"
                                theme="snow"
                                value={newTask?.ProjectTaskDescription || ""}
                                onChange={(e) =>
                                  setNewTask((prevTask) => ({
                                    ...prevTask!,
                                    ProjectTaskDescription: e,
                                  }))
                                }
                              />
                              <div className="flex justify-center items-center mt-4">
                                <Button
                                  variant="bordered"
                                  className="w-max-1/2 gap-3 my-2 py-2"
                                  radius="full"
                                  onClick={handleRefine}
                                  isDisabled={
                                    loading || !newTask?.ProjectTaskDescription
                                  }
                                >
                                  {loading ? (
                                    <>
                                      <Spinner
                                        size="sm"
                                        className="text-black"
                                      />
                                      Riscrittura in corso...
                                    </>
                                  ) : (
                                    <>
                                      <Icon
                                        icon="solar:magic-stick-3-linear"
                                        className="text-xl"
                                      />
                                      Riscrivi con AI
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="prose max-w-none">
                              <ReactQuill
                                readOnly
                                className="sm:mt-0 h-fit"
                                theme="bubble"
                                value={newTask?.ProjectTaskDescription || ""}
                              />
                            </div>
                          )}
                        </dd>
                      </div>
                    )}

                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <Icon icon="solar:paperclip-linear" fontSize={22} />
                        Allegati
                        <Chip
                          color="default"
                          variant="flat"
                          size="sm"
                          radius="full"
                          classNames={{
                            base: "bg-gray-50",
                            content: "text-gray-600",
                          }}
                        >
                          {files && files.length}
                        </Chip>
                      </dt>
                      <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <ScrollShadow className="flex flex-col gap-3 max-h-96">
                          {files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-8">
                              <div className="p-3 rounded-full bg-gray-50">
                                <Icon
                                  icon="solar:file-text-linear"
                                  className="text-4xl text-gray-600"
                                />
                              </div>
                              <p className="text-sm text-gray-500">
                                Nessun file caricato
                              </p>
                              <Button
                                radius="full"
                                color="default"
                                startContent={
                                  <Icon
                                    icon="solar:upload-outline"
                                    fontSize={24}
                                  />
                                }
                                className="w-auto"
                                variant="flat"
                                onClick={() =>
                                  setModalUploadFile({
                                    ...modalUploadFile,
                                    open: true,
                                  })
                                }
                              >
                                Carica file
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex flex-col gap-4 w-full">
                                {files.map((file, index) => (
                                  <FileCard
                                    file={file}
                                    DeleteFile={DeleteFile}
                                    key={index}
                                  />
                                ))}
                              </div>
                              <div className="flex justify-center mt-4">
                                <Button
                                  radius="full"
                                  color="default"
                                  startContent={
                                    <Icon
                                      icon="solar:upload-outline"
                                      fontSize={24}
                                    />
                                  }
                                  className="w-auto"
                                  variant="flat"
                                  onClick={() =>
                                    setModalUploadFile({
                                      ...modalUploadFile,
                                      open: true,
                                    })
                                  }
                                >
                                  Carica file
                                </Button>
                              </div>
                            </>
                          )}
                        </ScrollShadow>
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
                                color="default"
                                radius="full"
                                variant="ghost"
                                startContent={
                                  <Icon
                                    icon="mynaui:plus-solid"
                                    fontSize={22}
                                  />
                                }
                              >
                                Crea checklist
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-5 w-80">
                              {(titleProps) => (
                                <div className="px-1 py-2 w-full">
                                  <p
                                    className="text-small font-semibold text-foreground"
                                    {...titleProps}
                                  >
                                    Crea checklist
                                  </p>
                                  <div className="mt-2 flex flex-col gap-2 w-full">
                                    <Input
                                      autoFocus
                                      variant="underlined"
                                      color="default"
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
                                      color="default"
                                      size="sm"
                                      radius="full"
                                      onClick={handleAddChecklist}
                                      startContent={
                                        <Icon
                                          icon="mynaui:plus-solid"
                                          fontSize={22}
                                        />
                                      }
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
                          {newTask?.ProjectTaskChecklists?.map((checklist) => (
                            <Accordion variant="light" className="px-[-2px]">
                              <AccordionItem
                                key="1"
                                aria-label="Accordion 1"
                                title={
                                  <div className="flex items-center justify-between border-b">
                                    <h4 className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                                      <Icon
                                        icon="solar:checklist-linear"
                                        fontSize={22}
                                      />{" "}
                                      {checklist.Text}
                                    </h4>
                                    <div className="flex flex-row gap-2 items-center">
                                      {checklist.Checkboxes.length > 0 && (
                                        <>
                                          {calculateChecklistChecked(checklist)}
                                          <CircularProgress
                                            size="lg"
                                            value={calculateChecklistPercentage(
                                              checklist
                                            )}
                                            color="default"
                                          />
                                        </>
                                      )}
                                      <ConfirmDeleteChecklistModal
                                        checklist={checklist}
                                        DeleteChecklist={handleDeleteChecklist}
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
                                              setCheckboxText(e.target.value)
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
                                            radius="full"
                                            value={String(checkbox.CheckboxId)}
                                            isSelected={checkbox.IsSelected}
                                            onChange={() =>
                                              handleCheckboxChange(
                                                checkbox.CheckboxId,
                                                !checkbox.IsSelected
                                              )
                                            }
                                            classNames={{
                                              label:
                                                "max-w-[calc(100%-40px)] text-left items-center whitespace-normal",
                                              wrapper: "flex items-center",
                                            }}
                                          >
                                            <span
                                              className={`${
                                                checkbox.IsSelected
                                                  ? "line-through"
                                                  : ""
                                              } whitespace-pre-wrap`}
                                              style={{
                                                wordBreak: "break-word",
                                                overflowWrap: "anywhere",
                                              }}
                                            >
                                              {checkbox.Text}
                                            </span>
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
                                            color="default"
                                          >
                                            Salva
                                          </Button>
                                        ) : (
                                          !checkbox.IsSelected && (
                                            <div className="flex flex-row justify-end">
                                              <Button
                                                color="default"
                                                size="sm"
                                                radius="full"
                                                variant="light"
                                                onClick={() => {
                                                  setEditingCheckbox(
                                                    checkbox.CheckboxId
                                                  );
                                                  setCheckboxText(
                                                    checkbox.Text
                                                  );
                                                }}
                                                startContent={
                                                  <Icon
                                                    icon="solar:pen-2-linear"
                                                    fontSize={22}
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
                                        popoverStates[checklist.ChecklistId]
                                      }
                                      onClose={() =>
                                        togglePopover(checklist.ChecklistId)
                                      }
                                    >
                                      <PopoverTrigger>
                                        <Button
                                          color="default"
                                          size="sm"
                                          radius="full"
                                          startContent={
                                            <Icon
                                              icon="mynaui:plus-solid"
                                              fontSize={22}
                                            />
                                          }
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
                                              className="text-small font-semibold text-foreground"
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
                                                color="default"
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
                                                  <Icon
                                                    icon="mynaui:plus-solid"
                                                    fontSize={22}
                                                  />
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
                          ))}
                        </div>
                      </dd>
                    </div>

                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <Icon
                          icon="solar:chat-round-line-linear"
                          fontSize={22}
                        />
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
                          <div className="min-w-0 flex-1">
                            <form action="#" className="relative">
                              <div className="overflow-hidden rounded-lg">
                                <label htmlFor="comment" className="sr-only">
                                  Add your comment
                                </label>
                                <Textarea
                                  variant="underlined"
                                  color="default"
                                  minRows={1}
                                  id="comment"
                                  name="comment"
                                  placeholder="Scrivi il tuo commento..."
                                  className="focus:border-gray-400"
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
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
                                    radius="full"
                                    isDisabled={comment == ""}
                                    color="default"
                                    size="sm"
                                    onClick={handleAddTaskComment}
                                    endContent={
                                      <Icon icon="prime:send" fontSize={22} />
                                    }
                                  >
                                    Invia
                                  </Button>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                        {newTask && newTask.ProjectTaskComments.length === 0 ? (
                          <p className="text-gray-500">
                            Nessun commento trovato
                          </p>
                        ) : (
                          <Accordion variant="light" className="px-[-2px]">
                            <AccordionItem
                              key="1"
                              aria-label="Accordion 1"
                              title={
                                <div>
                                  Commenti{" "}
                                  <Chip
                                    color="default"
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
                                            className={`flex flex-col gap-3 p-4 ${
                                              comment.StafferId ===
                                              loggedStafferId
                                                ? "bg-gray-50/30 rounded-lg border border-gray-100 group hover:border-gray-200"
                                                : ""
                                            }`}
                                            key={index}
                                          >
                                            <div className="flex flex-row justify-between items-center">
                                              <div className="flex flex-row gap-2 items-center">
                                                <Avatar
                                                  src={
                                                    comment.StafferImageUrl &&
                                                    API_URL_IMG +
                                                      "/profileIcons/" +
                                                      comment.StafferImageUrl
                                                  }
                                                  alt={comment.StafferFullName}
                                                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                                                />
                                                <div className="flex flex-col">
                                                  <p className="font-medium text-base">
                                                    {comment.StafferFullName}
                                                  </p>
                                                  <p className="text-gray-600/70 text-xs font-normal">
                                                    {dayjs(
                                                      new Date(
                                                        comment.CommentDate
                                                      )
                                                    ).calendar(null, {
                                                      sameDay: "[Oggi]",
                                                      lastDay: "[Ieri]",
                                                      lastWeek: "DD MMM",
                                                      sameElse: "DD/MM/YYYY",
                                                    })}
                                                  </p>
                                                </div>
                                              </div>
                                              {comment.StafferId ===
                                                loggedStafferId &&
                                                renderCommentActions(comment)}
                                            </div>
                                            {commentEditingId ===
                                            comment.ProjectTaskCommentId ? (
                                              <div className="mt-2">
                                                <Textarea
                                                  variant="bordered"
                                                  color="default"
                                                  value={updateComment}
                                                  onChange={(e) =>
                                                    setUpdateComment(
                                                      e.target.value
                                                    )
                                                  }
                                                  onKeyDown={(e) => {
                                                    if (
                                                      e.key === "Enter" &&
                                                      !e.shiftKey
                                                    ) {
                                                      e.preventDefault();
                                                      handleUpdateComment();
                                                    } else if (
                                                      e.key === "Escape"
                                                    ) {
                                                      setCommentEditingId(0);
                                                      setUpdateComment("");
                                                    }
                                                  }}
                                                  minRows={2}
                                                  className="w-full focus:border-gray-400"
                                                  placeholder="Modifica il tuo commento..."
                                                  autoFocus
                                                />
                                                <div className="flex justify-end mt-2">
                                                  <span className="text-xs text-gray-400">
                                                    Premi Invio per salvare, Esc
                                                    per annullare
                                                  </span>
                                                </div>
                                              </div>
                                            ) : (
                                              <p className="text-gray-800 whitespace-pre-wrap px-1">
                                                {comment.Text}
                                              </p>
                                            )}
                                          </div>
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
                {editing ? (
                  <div className="flex flex-row gap-2">
                    <Button
                      color="default"
                      variant="light"
                      onClick={closeEditing}
                      radius="full"
                      startContent={
                        <Icon
                          icon="material-symbols:close-rounded"
                          className="text-xl"
                        />
                      }
                    >
                      Annulla
                    </Button>
                    <Button
                      color="default"
                      onClick={handleUpdate}
                      radius="full"
                      startContent={
                        <Icon icon="basil:save-outline" fontSize={22} />
                      }
                      isDisabled={dateError || !newTask?.ProjectTaskName}
                    >
                      Salva
                    </Button>
                  </div>
                ) : (
                  <Button
                    color="default"
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
      <FileUploaderModal
        isOpen={modalUploadFile.open}
        isClosed={() => setModalUploadFile({ ...modalUploadFile, open: false })}
        TaskId={TaskData.ProjectTaskId}
        setFileUpdate={setUpdate}
      />
    </>
  );
}
