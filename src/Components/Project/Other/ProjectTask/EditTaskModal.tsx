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
import { API_URL_IMG } from "../../../../API/API";
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
  ProjectTaskStatusId: number;
  ProjectTaskTags: Tag[];
  ProjectTaskMembers: Member[];
  ProjectId: number;
}

export default function EditTaskModal({
  isOpen,
  isClosed,
  TaskData,
}: {
  isOpen: boolean;
  isClosed: () => void;
  TaskData: Task;
}) {
  const [newTask, setNewTask] = useState<Task>(TaskData);
  const [members, setMembers] = useState<Member[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    setNewTask({
      ProjectTaskId: TaskData.ProjectTaskId,
      ProjectTaskName: TaskData.ProjectTaskName,
      ProjectTaskDescription: TaskData.ProjectTaskDescription,
      ProjectTaskExpiration: parseDate(
        dayjs(new Date(TaskData.ProjectTaskExpiration.toString())).format(
          "YYYY-MM-DD"
        )
      ),
      ProjectTaskStatusId: TaskData.ProjectTaskStatusId,
      ProjectTaskTags:
        TaskData.ProjectTaskTags.length === 0 ? [] : TaskData.ProjectTaskTags,
      ProjectTaskMembers:
        TaskData.ProjectTaskMembers.length === 0
          ? []
          : TaskData.ProjectTaskMembers,
      ProjectId: TaskData.ProjectId,
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
            >
              {(member) => (
                <AutocompleteItem
                  startContent={
                    <Avatar
                      src={`${API_URL_IMG}/profileIcons/${member.StafferImageUrl}`}
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
    console.log(newTask.ProjectTaskMembers);
    axios
      .post("/Project/POST/UpdateTask", {
        FormattedDate: formattedDate,
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
              Modifica della task: {TaskData.ProjectTaskName}
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
                      className="sm:col-span-2 sm:mt-0"
                      theme="snow"
                      value={newTask.ProjectTaskDescription}
                      onChange={(value) =>
                        setNewTask({
                          ...newTask,
                          ProjectTaskDescription: value,
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
                        className="sm:col-span-2 sm:mt-0"
                        value={newTask.ProjectTaskExpiration}
                        variant="bordered"
                        radius="sm"
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
                color="success"
                variant="light"
                onClick={handleUpdate}
                radius="sm"
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
