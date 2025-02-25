import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  Chip,
  DatePicker,
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
} from "@heroui/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import { API_URL_IMG } from "../../../../../API/API";
import { useState, useEffect } from "react";
import { parseDate } from "@internationalized/date";
import dayjs from "dayjs";
import axios from "axios";
import { I18nProvider } from "@react-aria/i18n";
import { Icon } from "@iconify/react";
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

interface Task {
  ProjectTaskId: number;
  ProjectTaskName: string;
  ProjectTaskDescription?: string;
  ProjectTaskExpiration: any;
  ProjectTaskCreation: any;
  ProjectTaskStatusId: number;
  ProjectTaskTags: Tag[];
  ProjectTaskMembers: Member[];
  ProjectId: number;
}

interface Ticket {
  ProjectTicketId: number;
  ProjectTicketTitle: string;
  ProjectTicketDescription: string;
  ProjectId: number;
}

interface OpenTaskModalProps {
  isOpen: boolean;
  isClosed: () => void;
  Ticket: Ticket;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const INITIAL_TASK_DATA: Task = {
  ProjectTaskId: 0,
  ProjectTaskName: "",
  ProjectTaskDescription: "",
  ProjectTaskExpiration: parseDate(dayjs().format("YYYY-MM-DD")),
  ProjectTaskCreation: parseDate(dayjs().format("YYYY-MM-DD")),
  ProjectTaskStatusId: 0,
  ProjectTaskTags: [],
  ProjectTaskMembers: [],
  ProjectId: 0,
};

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function OpenTaskModal({
  isOpen,
  isClosed,
  Ticket,
}: OpenTaskModalProps) {
  const [newTask, setNewTask] = useState<Task>(INITIAL_TASK_DATA);
  const [members, setMembers] = useState<Member[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [update, setUpdate] = useState(false);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const ProjectId = Ticket.ProjectId;

  useEffect(() => {
    setNewTask((prev) => ({
      ...prev,
      ProjectId: Ticket.ProjectId,
      ProjectTaskName: Ticket.ProjectTicketTitle,
      ProjectTaskDescription: Ticket.ProjectTicketDescription,
    }));
  }, [Ticket.ProjectTicketId]);

  useEffect(() => {
    axios
      .get("Project/GET/GetProjetTeamMembers", {
        params: { ProjectId: ProjectId },
      })
      .then((res) => {
        const filteredMembers = res.data.filter((member: Member) => {
          return !newTask.ProjectTaskMembers.some(
            (taskMember) => taskMember.StafferId === member.StafferId
          );
        });
        setMembers(filteredMembers);
      });

    // Ottiene i tag disponibili
    axios.get("/Project/GET/GetAllTags").then((res) => {
      setTags(
        res.data.filter((tag: Tag) => {
          return !newTask.ProjectTaskTags.some(
            (taskTag) => taskTag.ProjectTaskTagId === tag.ProjectTaskTagId
          );
        })
      );
    });
  }, [newTask, update, ProjectId]);

  const memberPopoverContent = (
    <PopoverContent className="w-[350px]">
      {(titleProps) => (
        <div className="px-1 py-2 w-full">
          <h2
            className="text-small font-semibold text-foreground"
            {...titleProps}
          >
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

  const tagPopoverContent = (
    <PopoverContent className="w-[350px]">
      {(titleProps) => (
        <div className="px-1 py-2 w-full">
          <h2
            className="text-small font-semibold text-foreground"
            {...titleProps}
          >
            Tag
          </h2>
          <div className="mt-2 flex flex-col gap-2 w-full">
            <Autocomplete
              defaultItems={tags}
              placeholder="Cerca per nome..."
              className="max-w-xs"
              variant="bordered"
              radius="full"
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

  async function handleAddTask() {
    try {
      setIsAddingData(true);
      const formattedDate = new Date(newTask.ProjectTaskExpiration.toString());
      const formattedCreationDate = new Date(
        newTask.ProjectTaskCreation.toString()
      );
      const res = await axios.post("/Project/POST/AddTask", {
        FormattedDate: formattedDate,
        FormattedCreationDate: formattedCreationDate,
        TaskData: newTask,
        ProjectId: ProjectId,
        TicketId: Ticket.ProjectTicketId,
      });
      if (res.status == 200) {
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "La task è stata aggiunta con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // General error handling
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Errore durante l'operazione",
          alertDescription:
            "Si è verificato un errore durante l'aggiunta della task. Per favore, riprova più tardi.",
          alertColor: "red",
        });
      }
    } finally {
      setIsAddingData(false);
      setUpdate(!update);
      handleCloseModal();
    }
  }

  function addTaskMember(member: Member) {
    setNewTask({
      ...newTask,
      ProjectTaskMembers: [...newTask.ProjectTaskMembers, member],
    });
  }

  function addTaskTag(tag: Tag) {
    setNewTask({
      ...newTask,
      ProjectTaskTags: [...newTask.ProjectTaskTags, tag],
    });
  }

  function deleteTaskMember(stafferId: number) {
    setNewTask({
      ...newTask,
      ProjectTaskMembers: newTask.ProjectTaskMembers.filter(
        (member) => member.StafferId !== stafferId
      ),
    });
  }

  function deleteTaskTag(tagId: number) {
    setNewTask({
      ...newTask,
      ProjectTaskTags: newTask.ProjectTaskTags.filter(
        (tag) => tag.ProjectTaskTagId !== tagId
      ),
    });
  }

  const [dateError, setDateError] = useState(false);
  useEffect(() => {
    // Validation: check if the start date is after the expiration date
    if (newTask?.ProjectTaskCreation && newTask?.ProjectTaskExpiration) {
      const start = new Date(newTask.ProjectTaskCreation.toString());
      const end = new Date(newTask.ProjectTaskExpiration.toString());

      setDateError(start > end); // If start is after end, show error
    }
  }, [newTask]);

  const [isValidTask, setIsValidTask] = useState(false);
  useEffect(() => {
    setIsValidTask(
      newTask.ProjectTaskName.length > 0 &&
        newTask.ProjectTaskCreation.toString().length > 0 &&
        newTask.ProjectTaskExpiration.toString().length > 0 &&
        dateError === false
    );
  }, [newTask]);

  const calculateProgress = (startDate: any, endDate: any): number => {
    const totalDuration = dayjs(endDate.toString()).diff(
      dayjs(startDate.toString()),
      "day"
    );
    const daysPassed = dayjs().diff(dayjs(startDate.toString()), "day");
    const progress = (daysPassed / totalDuration) * 100;
    return Math.min(Math.max(progress, 0), 100); // Restituisci una percentuale tra 0 e 100
  };

  function handleCloseModal() {
    setNewTask({
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskDescription: "",
      ProjectTaskExpiration: parseDate(dayjs().format("YYYY-MM-DD")),
      ProjectTaskCreation: parseDate(dayjs().format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectId: ProjectId,
    });
    isClosed();
  }

  const [loading, setLoading] = useState<boolean>(false);
  const handleRefine = async () => {
    if (!newTask.ProjectTaskDescription) return;
    setLoading(true);
    try {
      const refinedText = await axios.post("/Project/POST/RefineText", {
        text: `Riscrivi in modo più formale e completo il seguente testo: ${newTask.ProjectTaskDescription}`,
      });
      setNewTask({
        ...newTask,
        ProjectTaskDescription: refinedText.data,
      });
    } catch (error) {
      console.error("Errore:", error);
      alert("Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <Modal
        isOpen={isOpen}
        onOpenChange={handleCloseModal}
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
                    value={newTask!.ProjectTaskName}
                    maxLength={50}
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
                  <Button
                    color="primary"
                    variant="light"
                    onClick={handleCloseModal}
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
                        {newTask!.ProjectTaskTags.length === 0 ? (
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
                        {newTask!.ProjectTaskMembers.length === 0 ? (
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
                        )}
                      </dd>
                    </div>

                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0 w-full">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <Icon icon="solar:calendar-linear" fontSize={22} />
                        Durata task
                      </dt>
                      <dd className="flex flex-col gap-2 mt-1 text-sm leading-6 text-gray-700 sm:mt-0 w-full">
                        <div className="flex flex-row justify-between w-full">
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
                                      ProjectTaskCreation: date,
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
                                La data di inizio non può essere successiva alla
                                data di scadenza.
                              </span>
                            )}
                          </div>
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
                        <Icon
                          icon="fluent:text-description-16-filled"
                          fontSize={22}
                        />
                        Descrizione
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
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
                      </dd>
                      <button
                        onClick={handleRefine}
                        disabled={loading || !newTask.ProjectTaskDescription}
                      >
                        {loading
                          ? "Riscrittura in corso..."
                          : "Riscrivi in modo formale"}
                      </button>
                    </div>
                  </dl>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  variant="light"
                  onClick={handleCloseModal}
                  radius="full"
                >
                  Chiudi
                </Button>
                <Button
                  color="primary"
                  onClick={handleAddTask}
                  radius="full"
                  startContent={
                    !isAddingData && (
                      <Icon icon="basil:save-outline" fontSize={22} />
                    )
                  }
                  isLoading={isAddingData}
                  isDisabled={!isValidTask && !isAddingData}
                  variant={dateError ? "flat" : "solid"}
                >
                  Salva
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
