import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  AvatarGroup,
  Button,
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
import { API_URL_IMG } from "../../../../API/API";
import { useState, useEffect } from "react";
import { parseDate } from "@internationalized/date";
import dayjs from "dayjs";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import axios from "axios";

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
    <PopoverContent className="w-[240px]">
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
    <PopoverContent className="w-[240px]">
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
                  className={"bg-gray-400"}
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
    axios
      .post("/Project/POST/AddTask", {
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
                      className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0"
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
                    <Input
                      className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0"
                      value={newTask.ProjectTaskDescription}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          ProjectTaskDescription: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Scadenza
                    </dt>
                    <DatePicker
                      className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0"
                      value={newTask.ProjectTaskExpiration}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          ProjectTaskExpiration: e,
                        })
                      }
                    />
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Dipendenti associati
                    </dt>
                    <dd className="flex flex-row mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 gap-5">
                      {newTask.ProjectTaskMembers.length === 0 ? (
                        <p>Nessun membro trovato</p>
                      ) : (
                        <AvatarGroup isBordered>
                          {newTask.ProjectTaskMembers.map((member) => (
                            <Tooltip
                              key={member.StafferId}
                              content={
                                <div className="flex flex-row">
                                  <p>{member.StafferFullName}</p>
                                  <Button
                                    color="danger"
                                    isIconOnly
                                    onClick={() =>
                                      deleteTaskMember(member.StafferId)
                                    }
                                  >
                                    <DeleteOutlineRoundedIcon />
                                  </Button>
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
                    <dd className="flex flex-row mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 gap-5">
                      {newTask.ProjectTaskTags.length === 0 ? (
                        <p>Nessun tag trovato</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {newTask.ProjectTaskTags.map((tag) => (
                            <Tooltip
                              key={tag.ProjectTaskTagId}
                              content={
                                <div className="flex flex-row">
                                  <Button
                                    color="danger"
                                    isIconOnly
                                    onClick={() =>
                                      deleteTaskTag(tag.ProjectTaskTagId)
                                    }
                                  >
                                    <DeleteOutlineRoundedIcon />
                                  </Button>
                                </div>
                              }
                            >
                              <div
                                key={tag.ProjectTaskTagId}
                                className={"p-1 m-1 rounded-md bg-gray-400"}
                              >
                                {tag.ProjectTaskTagName}
                              </div>
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
                onClick={handleAddTask}
                radius="sm"
              >
                Inserisci
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
