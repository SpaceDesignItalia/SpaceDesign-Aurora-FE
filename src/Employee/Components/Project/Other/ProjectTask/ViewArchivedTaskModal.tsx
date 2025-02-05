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
} from "@heroui/react";
import { API_URL_IMG } from "../../../../../API/API";
import { I18nProvider, useDateFormatter } from "@react-aria/i18n";
import dayjs from "dayjs";
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

  const [updateComment, setUpdateComment] = useState("");
  const [deleteUpdate, setDeleteUpdate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [commentEditingId, setCommentEditingId] = useState(0);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);
  const [modalUploadFile, setModalUploadFile] = useState<ModalData>({
    TaskId: 0,
    open: false,
  });
  const [files, setFiles] = useState<File[]>([]);

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

  const [editingCheckbox, setEditingCheckbox] = useState(0);
  const [checkboxText, setCheckboxText] = useState("");

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
        setCommentEditingId(0);
      });
  }

  function deleteUpdateComment() {
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
      axios.put("/Project/UPDATE/NotArchiveTask", {
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
                    <Icon
                      icon="solar:checklist-minimalistic-linear"
                      fontSize={22}
                    />
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
                        <Icon
                          icon="solar:checklist-minimalistic-linear"
                          fontSize={22}
                        />{" "}
                        {newTask!.ProjectTaskName}
                      </div>
                      <Button
                        color="primary"
                        variant="light"
                        onClick={handleArchiveTask}
                        radius="full"
                        size="sm"
                        isIconOnly
                        startContent={
                          <Icon
                            icon="solar:inbox-linear"
                            fontSize={22}
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
                          <Icon
                            icon="material-symbols:close-rounded"
                            fontSize={22}
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
                        <Icon icon="solar:tag-linear" fontSize={22} />
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
                                    <Icon
                                      icon="mynaui:plus-solid"
                                      fontSize={22}
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
                                    <Icon
                                      icon="mynaui:plus-solid"
                                      fontSize={22}
                                    />
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
                        <Icon
                          icon="solar:users-group-rounded-linear"
                          fontSize={22}
                        />
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
                                    <Icon
                                      icon="mynaui:plus-solid"
                                      fontSize={22}
                                    />
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
                                    <Icon
                                      icon="mynaui:plus-solid"
                                      fontSize={22}
                                    />
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
                        <Icon icon="solar:calendar-linear" fontSize={22} />
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
                          <Icon
                            icon="fluent:text-description-16-filled"
                            fontSize={22}
                          />
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
                        {files.length > 0 && (
                          <Accordion variant="light" className="px-[-2px]">
                            <AccordionItem
                              key="1"
                              aria-label="Accordion 1"
                              title={
                                <div className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                                  <Icon
                                    icon="solar:paperclip-linear"
                                    fontSize={22}
                                  />
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
                              </ScrollShadow>
                            </AccordionItem>
                          </Accordion>
                        )}

                        <div className="px-4 py-6 flex flex-row justify-between items-start sm:gap-4 sm:px-0">
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 w-full mr-5">
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
                                            <Icon
                                              icon="solar:checklist-linear"
                                              fontSize={22}
                                            />{" "}
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
                                              )}{" "}
                                            </div>
                                          ))}
                                      </div>
                                    </AccordionItem>
                                  </Accordion>
                                )
                              )}
                            </div>
                          </dd>
                        </div>

                        {newTask && newTask.ProjectTaskComments.length > 0 && (
                          <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                            <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                              <Icon
                                icon="solar:chat-round-line-linear"
                                fontSize={22}
                              />
                              Commenti
                            </dt>
                            <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 items-center">
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
                                                          <Icon
                                                            icon="basil:save-outline"
                                                            fontSize={22}
                                                          />
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
                                                          <Icon
                                                            icon="solar:pen-2-linear"
                                                            fontSize={22}
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
                                                          <Icon
                                                            icon="solar:trash-bin-trash-linear"
                                                            fontSize={22}
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
                            </dd>
                          </div>
                        )}
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
                          startContent={
                            <Icon icon="basil:save-outline" fontSize={22} />
                          }
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
