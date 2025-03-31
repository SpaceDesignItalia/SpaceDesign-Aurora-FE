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
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import { API_URL_IMG } from "../../../../../API/API";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { I18nProvider } from "@react-aria/i18n";
import StatusAlert from "../../../Layout/StatusAlert";
import { DateValue } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

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
  ProjectTaskExpiration?: any;
  ProjectTaskCreation: any;
  ProjectTaskStatusId: number;
  ProjectTaskTags: Tag[];
  ProjectTaskMembers: Member[];
  ProjectId: number;
  PriorityId: number;
}

interface AddTaskModalProps {
  isOpen: boolean;
  isClosed: () => void;
  fetchData: () => void;
  ProjectId: number;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

interface Priority {
  ProjectTaskPriorityId: number;
  ProjectTaskPriorityName: string;
  color?: string;
  icon?: string;
  bgColor?: string;
  textColor?: string;
}

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
};

const INITIAL_TASK_DATA: Task = {
  ProjectTaskId: 0,
  ProjectTaskName: "",
  ProjectTaskDescription: "",
  ProjectTaskExpiration: null,
  ProjectTaskCreation: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
  ProjectTaskStatusId: 0,
  ProjectTaskTags: [],
  ProjectTaskMembers: [],
  ProjectId: 0,
  PriorityId: 0,
};

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function AddTaskModal({
  isOpen,
  isClosed,
  fetchData,
  ProjectId,
}: AddTaskModalProps) {
  const { UniqueCode, Action } = useParams<{
    UniqueCode: string;
    Action: string;
  }>();
  const navigate = useNavigate();
  const [newTask, setNewTask] = useState<Task>(INITIAL_TASK_DATA);
  const [members, setMembers] = useState<Member[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [update, setUpdate] = useState(false);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [isValidTask, setIsValidTask] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [dateError, setDateError] = useState(false);

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

    axios.get("/Project/GET/GetAllPriorities").then((res) => {
      setPriorities(res.data);
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
    // Verifica che tutti i campi obbligatori siano compilati
    const isValid =
      // Titolo della task
      newTask.ProjectTaskName.length > 0 &&
      // Data di inizio
      newTask.ProjectTaskCreation !== null &&
      // Data di fine (se presente, deve essere valida)
      (!newTask.ProjectTaskExpiration || !dateError) &&
      // Descrizione obbligatoria
      (newTask.ProjectTaskDescription?.length ?? 0) > 0 &&
      // Priorità obbligatoria
      newTask.PriorityId > 0;

    setIsValidTask(isValid);
  }, [newTask, dateError]);

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

  function handleCloseModal() {
    setNewTask({
      ProjectTaskId: 0,
      ProjectTaskName: "",
      ProjectTaskDescription: "",
      ProjectTaskExpiration: null,
      ProjectTaskCreation: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
      ProjectTaskStatusId: 0,
      ProjectTaskTags: [],
      ProjectTaskMembers: [],
      ProjectId: ProjectId,
      PriorityId: 0,
    });
    setShowValidationErrors(false);
    isClosed();
    // Remove action from URL
    if (Action) {
      navigate(`/projects/${ProjectId}`);
    }
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

  console.log(newTask.PriorityId);

  async function handleAddTask() {
    if (!isValidTask) {
      setShowValidationErrors(true);
      return;
    }

    try {
      setIsAddingData(true);
      const formattedDate = newTask.ProjectTaskExpiration
        ? new Date(newTask.ProjectTaskExpiration.toString())
        : null;
      const formattedCreationDate = new Date(
        newTask.ProjectTaskCreation
          ? newTask.ProjectTaskCreation.toString()
          : ""
      );
      const res = await axios.post("/Project/POST/AddTask", {
        FormattedDate: formattedDate,
        FormattedCreationDate: formattedCreationDate,
        TaskData: newTask,
        ProjectId: ProjectId,
      });
      if (res.status == 200) {
        fetchData();
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "La task è stata aggiunta con successo.",
          alertColor: "green",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
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
      // Remove action from URL
      if (Action) {
        navigate(`/projects/${UniqueCode}`);
      }
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
                  {newTask?.PriorityId > 0 && (
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
                          ]?.icon || "solar:checklist-minimalistic-linear"
                        }
                        fontSize={22}
                        className={
                          priorityStyles[
                            newTask?.PriorityId as keyof typeof priorityStyles
                          ]?.textColor || "text-gray-700"
                        }
                      />
                    </div>
                  )}
                  <Input
                    className="w-full"
                    variant="underlined"
                    color={
                      showValidationErrors &&
                      newTask.ProjectTaskName.length === 0
                        ? "danger"
                        : "primary"
                    }
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
                    errorMessage={
                      showValidationErrors &&
                      newTask.ProjectTaskName.length === 0
                        ? "Il titolo è obbligatorio"
                        : undefined
                    }
                  />
                  <Select
                    items={priorities}
                    label="Priorità"
                    className="w-52 mb-4"
                    variant="underlined"
                    radius="full"
                    color={
                      showValidationErrors && !newTask.PriorityId
                        ? "danger"
                        : "primary"
                    }
                    errorMessage={
                      showValidationErrors && !newTask.PriorityId
                        ? "La priorità è obbligatoria"
                        : undefined
                    }
                    onSelectionChange={(e) => {
                      setNewTask({
                        ...newTask,
                        PriorityId: e?.currentKey ? parseInt(e.currentKey) : 0,
                      });
                    }}
                  >
                    {(priority) => (
                      <SelectItem
                        key={priority.ProjectTaskPriorityId}
                        value={priority.ProjectTaskPriorityId}
                        textValue={priority.ProjectTaskPriorityName}
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            icon={
                              priorityStyles[
                                priority.ProjectTaskPriorityId as keyof typeof priorityStyles
                              ]?.icon || "solar:minimalistic-dots-bold"
                            }
                            className={
                              priorityStyles[
                                priority.ProjectTaskPriorityId as keyof typeof priorityStyles
                              ]?.textColor || "text-gray-700"
                            }
                          />
                          <span>{priority.ProjectTaskPriorityName}</span>
                        </div>
                      </SelectItem>
                    )}
                  </Select>
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
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center gap-3">
                              <p className="text-gray-500">
                                Nessun tag trovato
                              </p>
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
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center gap-2">
                              <p className="text-gray-500">
                                Nessun membro trovato
                              </p>
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
                                  defaultValue={null}
                                  value={newTask?.ProjectTaskExpiration}
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
                        {newTask.ProjectTaskExpiration &&
                          newTask.ProjectTaskCreation && (
                            <Progress
                              value={calculateProgress(
                                newTask!.ProjectTaskCreation,
                                newTask!.ProjectTaskExpiration
                              )}
                            />
                          )}
                      </dd>
                    </div>

                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
                      <dt className="flex flex-row gap-2 items-center text-sm font-semibold leading-6 text-gray-900">
                        <Icon
                          icon="fluent:text-description-16-filled"
                          fontSize={22}
                        />
                        Descrizione <span className="text-danger">*</span>
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        <div className="flex flex-col gap-2">
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
                          {showValidationErrors &&
                            (!newTask.ProjectTaskDescription ||
                              newTask.ProjectTaskDescription.length === 0) && (
                              <p className="text-danger text-sm">
                                La descrizione è obbligatoria
                              </p>
                            )}
                        </div>
                      </dd>
                      {newTask.ProjectTaskDescription ? (
                        <Button
                          variant="bordered"
                          className="w-max-1/2 mx-auto gap-3 my-5 sm:my-0 py-2"
                          radius="full"
                          onClick={handleRefine}
                          isDisabled={
                            loading || !newTask.ProjectTaskDescription
                          }
                        >
                          {loading ? (
                            <>
                              {" "}
                              <Spinner size="sm" className="text-black" />{" "}
                              Riscrittura in corso...{" "}
                            </>
                          ) : (
                            <>
                              {" "}
                              <Icon
                                icon="solar:magic-stick-3-linear"
                                fontSize={24}
                              />{" "}
                              Riscrivi con AI{" "}
                            </>
                          )}
                        </Button>
                      ) : null}
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
                  isDisabled={!isValidTask || dateError}
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
