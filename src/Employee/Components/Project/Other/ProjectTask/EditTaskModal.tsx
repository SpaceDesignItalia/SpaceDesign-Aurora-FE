import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  AvatarGroup,
  Button,
  Chip,
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
  Tooltip,
} from "@nextui-org/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import { API_URL_IMG } from "../../../../../API/API";
import { useState, useEffect } from "react";
import { parseDate } from "@internationalized/date";
import dayjs from "dayjs";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import axios from "axios";
import { I18nProvider } from "@react-aria/i18n";

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
  ProjectTaskExpiration: DateValue;
  ProjectTaskCreation: DateValue;
  ProjectTaskStatusId: number;
  ProjectTaskTags: Tag[];
  ProjectTaskMembers: Member[];
  ProjectId: number;
}

export default function EditTaskModal({
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
  const [newTask, setNewTask] = useState<Task>(TaskData);
  const [members, setMembers] = useState<Member[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [update, setUpdate] = useState(false);
  const [dateError, setDateError] = useState(false); // Nuovo stato per l'errore

  useEffect(() => {
    // Validation: check if the start date is after the expiration date
    if (newTask.ProjectTaskCreation && newTask.ProjectTaskExpiration) {
      const start = new Date(newTask.ProjectTaskCreation.toString());
      const end = new Date(newTask.ProjectTaskExpiration.toString());

      setDateError(start > end); // If start is after end, show error
    }
  }, [newTask.ProjectTaskCreation, newTask.ProjectTaskExpiration]);

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
    });
  }, [TaskData]);

  useEffect(() => {
    axios
      .get("Project/GET/GetProjetTeamMembers", {
        params: { ProjectId: TaskData.ProjectId },
      })
      .then((res) => {
        const filteredMembers = res.data.filter((member: Member) => {
          return !newTask.ProjectTaskMembers.some(
            (taskMember) => taskMember.StafferId === member.StafferId
          );
        });
        setMembers(filteredMembers);
      });

    axios.get("/Project/GET/GetAllTags").then((res) => {
      setTags(
        res.data.filter((tag: Tag) => {
          return !newTask.ProjectTaskTags.some(
            (taskTag) => taskTag.ProjectTaskTagId === tag.ProjectTaskTagId
          );
        })
      );
    });
  }, [newTask, update]);

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

  function handleUpdate() {
    const formattedDate = new Date(newTask.ProjectTaskExpiration.toString());
    const formattedCreationDate = new Date(
      newTask.ProjectTaskCreation.toString()
    );
    axios
      .put("/Project/UPDATE/UpdateTask", {
        FormattedDate: formattedDate,
        FormattedCreationDate: formattedCreationDate,
        TaskData: newTask,
      })
      .then(() => {
        socket.emit("task-news", TaskData.ProjectId);
        isClosed();
      });
  }

  function addTaskMember(member: Member) {
    setNewTask({
      ...newTask,
      ProjectTaskMembers: [...newTask.ProjectTaskMembers, member],
    });
    setUpdate(!update);
  }

  function addTaskTag(tag: Tag) {
    setNewTask({
      ...newTask,
      ProjectTaskTags: [...newTask.ProjectTaskTags, tag],
    });
    setUpdate(!update);
  }

  function deleteTaskMember(stafferId: number) {
    setNewTask({
      ...newTask,
      ProjectTaskMembers: newTask.ProjectTaskMembers.filter(
        (member) => member.StafferId !== stafferId
      ),
    });
    setUpdate(!update);
  }

  function deleteTaskTag(tagId: number) {
    setNewTask({
      ...newTask,
      ProjectTaskTags: newTask.ProjectTaskTags.filter(
        (tag) => tag.ProjectTaskTagId !== tagId
      ),
    });
    setUpdate(!update);
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={isClosed}
      size="5xl"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Modifica della task: {newTask.ProjectTaskName}
            </ModalHeader>
            <ModalBody>
              <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Titolo
                    </dt>
                    <Input
                      className=" sm:col-span-2 sm:mt-0"
                      variant="bordered"
                      radius="sm"
                      value={newTask.ProjectTaskName}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          ProjectTaskName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Descrizione
                    </dt>
                    <ReactQuill
                      className="sm:col-span-2 sm:mt-0 h-fit"
                      theme="snow"
                      value={newTask.ProjectTaskDescription}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          ProjectTaskDescription: e,
                        })
                      }
                    />
                  </div>

                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Scadenza
                    </dt>
                    <I18nProvider locale="it">
                      <DatePicker
                        className={`sm:col-span-2 sm:mt-0 ${
                          dateError ? "border-red-500" : ""
                        }`}
                        variant="bordered"
                        value={newTask.ProjectTaskExpiration}
                        onChange={(date) =>
                          setNewTask({
                            ...newTask,
                            ProjectTaskExpiration: date,
                          })
                        }
                      />
                    </I18nProvider>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Inizio
                    </dt>
                    <I18nProvider locale="it">
                      <DatePicker
                        className={`sm:col-span-2 sm:mt-0 ${
                          dateError ? "border-red-500" : ""
                        }`}
                        variant="bordered"
                        value={newTask.ProjectTaskCreation}
                        onChange={(date) =>
                          setNewTask({
                            ...newTask,
                            ProjectTaskCreation: date,
                          })
                        }
                      />
                      {dateError && (
                        <span className="text-red-500 text-sm col-span-3 col-start-2 mt-2">
                          La data di inizio non può essere successiva alla data
                          di scadenza.
                        </span>
                      )}
                    </I18nProvider>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Dipendenti associati
                    </dt>
                    <dd className="flex flex-row mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 gap-5 items-center">
                      {newTask.ProjectTaskMembers.length === 0 ? (
                        <p>Nessun membro trovato</p>
                      ) : (
                        <AvatarGroup isBordered>
                          {newTask.ProjectTaskMembers.map((member) => (
                            <Tooltip
                              key={member.StafferId}
                              content={
                                <div className="flex flex-row items-center gap-2">
                                  <Button
                                    color="danger"
                                    size="sm"
                                    radius="sm"
                                    isIconOnly
                                    onClick={() =>
                                      deleteTaskMember(member.StafferId)
                                    }
                                  >
                                    <DeleteOutlineRoundedIcon />
                                  </Button>
                                  <p>{member.StafferFullName}</p>
                                </div>
                              }
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
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Tag associati
                    </dt>
                    <dd className="flex flex-row mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 gap-5 items-center">
                      {newTask.ProjectTaskTags.length === 0 ? (
                        <p>Nessun tag trovato</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {newTask.ProjectTaskTags.map((tag) => (
                            <Tooltip
                              key={tag.ProjectTaskTagId}
                              radius="sm"
                              content={
                                <div className="flex flex-row items-center gap-2">
                                  <Button
                                    color="danger"
                                    radius="sm"
                                    size="sm"
                                    isIconOnly
                                    onClick={() =>
                                      deleteTaskTag(tag.ProjectTaskTagId)
                                    }
                                  >
                                    <DeleteOutlineRoundedIcon />
                                  </Button>
                                  Rimuovi tag
                                </div>
                              }
                            >
                              <Chip
                                key={tag.ProjectTaskTagId}
                                color="primary"
                                variant="faded"
                                radius="sm"
                              >
                                {tag.ProjectTaskTagName}
                              </Chip>
                            </Tooltip>
                          ))}
                        </div>
                      )}
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
                    </dd>
                  </div>
                </dl>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color={dateError ? "default" : "success"}
                variant={dateError ? "flat" : "light"}
                onClick={handleUpdate}
                radius="sm"
                isDisabled={dateError} // Disabilita il pulsante se c'è un errore
              >
                Aggiorna
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
