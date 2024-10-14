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

export default function AddTaskModal({
  isOpen,
  isClosed,
  ProjectId,
}: {
  isOpen: boolean;
  isClosed: () => void;
  ProjectId: number;
}) {
  const [newTask, setNewTask] = useState<Task>({
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
  const [members, setMembers] = useState<Member[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [update, setUpdate] = useState(false);

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

  function handleAddTask() {
    const formattedDate = new Date(newTask.ProjectTaskExpiration.toString());
    const formattedCreationDate = new Date(
      newTask.ProjectTaskCreation.toString()
    );
    axios
      .post("/Project/POST/AddTask", {
        FormattedDate: formattedDate,
        FormattedCreationDate: formattedCreationDate,
        TaskData: newTask,
      })
      .then(() => {
        setUpdate(!update);
        window.location.reload();
      });
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
              Inserimento della task: {newTask.ProjectTaskName}
            </ModalHeader>
            <ModalBody>
              <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Titolo
                    </dt>
                    <Input
                      placeholder="Es. Task 1"
                      className=" sm:col-span-2 sm:mt-0"
                      variant="bordered"
                      radius="full"
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
                      className="sm:col-span-2 sm:mt-0 h-fit rounded-full"
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
                    <I18nProvider locale="it-GB">
                      <DatePicker
                        className=" sm:col-span-2 sm:mt-0"
                        variant="bordered"
                        radius="full"
                        value={newTask.ProjectTaskExpiration}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            ProjectTaskExpiration: e,
                          })
                        }
                      />
                    </I18nProvider>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Scadenza
                    </dt>
                    <I18nProvider locale="it-GB">
                      <DatePicker
                        className=" sm:col-span-2 sm:mt-0"
                        variant="bordered"
                        radius="sm"
                        value={newTask.ProjectTaskCreation}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            ProjectTaskCreation: e,
                          })
                        }
                      />
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
                                    radius="full"
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
                          <Button
                            color="primary"
                            variant="faded"
                            isIconOnly
                            radius="full"
                            size="sm"
                          >
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
                              content={
                                <div className="flex flex-row items-center gap-2">
                                  <Button
                                    color="danger"
                                    size="sm"
                                    radius="sm"
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
                          <Button
                            color="primary"
                            variant="faded"
                            isIconOnly
                            radius="full"
                            size="sm"
                          >
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
              <div className="flex flex-col sm:flex-row w-full justify-end gap-3">
                <Button
                  color="primary"
                  variant="light"
                  onClick={isClosed}
                  radius="full"
                >
                  Annulla
                </Button>
                <Button
                  color="primary"
                  onClick={handleAddTask}
                  radius="full"
                  className="w-full sm:w-1/4 md:w-1/6"
                >
                  Aggiungi task
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
