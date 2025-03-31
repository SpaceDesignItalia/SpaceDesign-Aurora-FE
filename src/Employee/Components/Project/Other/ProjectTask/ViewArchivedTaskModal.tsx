import {
  Accordion,
  AccordionItem,
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  ScrollShadow,
  Tooltip,
} from "@heroui/react";
import { API_URL_IMG } from "../../../../../API/API";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import FileCard from "./FileCard";

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
  ProjectId: number;
  ProjectTaskChecklists: Checklist[];
  PriorityId: number;
}

interface File {
  TaskFileId: number;
  FileName: string;
  FilePath: string;
  TaskId: number;
}

export default function ViewArchivedTaskModal({
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
  const [newTask, setNewTask] = useState<Task>();
  const [files, setFiles] = useState<File[]>([]);

  const formatDate = (isoString: string) => {
    return dayjs(isoString).format("YYYY-MM-DD");
  };

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

  function fetchTaskData() {
    if (TaskData) {
      setNewTask({
        ...newTask,
        ProjectTaskCreation: TaskData.ProjectTaskCreation,
        ProjectTaskExpiration: TaskData.ProjectTaskExpiration,
        ProjectTaskDescription: TaskData.ProjectTaskDescription,
        ProjectTaskId: TaskData.ProjectTaskId,
        ProjectId: TaskData.ProjectId,
        ProjectTaskName: TaskData.ProjectTaskName,
        ProjectTaskStatusId: TaskData.ProjectTaskStatusId,
        ProjectTaskMembers: TaskData.ProjectTaskMembers,
        ProjectTaskTags: TaskData.ProjectTaskTags,
        ProjectTaskChecklists: TaskData.ProjectTaskChecklists || [],
        PriorityId: TaskData.PriorityId,
      });
    }
  }

  useEffect(() => {
    fetchTaskData();
  }, [TaskData]);

  const memoizedCheckboxes = useMemo(() => {
    return (
      newTask?.ProjectTaskChecklists.flatMap((checklist) =>
        checklist.Checkboxes.map((checkbox) => ({
          ...checkbox,
        }))
      ) || []
    );
  }, [newTask]);

  const calculateProgress = (startDate: any, endDate: any): number => {
    if (!startDate || !endDate) return 0;
    const totalDuration = dayjs(endDate).diff(dayjs(startDate), "day");
    const daysPassed = dayjs().diff(dayjs(startDate), "day");
    const progress = (daysPassed / totalDuration) * 100;
    return Math.min(Math.max(progress, 0), 100);
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
          </div>
        )}
      </>
    );
  };

  const calculateChecklistPercentage = (checklist: Checklist) => {
    const checked = checklist.Checkboxes.filter(
      (checkbox) => checkbox.IsSelected
    );
    return (checked.length / checklist.Checkboxes.length) * 100;
  };

  function handleNotArchiveTask() {
    try {
      axios.put("/Project/UPDATE/NotArchiveTask", {
        ProjectTaskId: TaskData.ProjectTaskId,
      });
      setUpdate(!update);
      socket.emit("task-news", TaskData.ProjectId);
      isClosed();
    } catch (error) {
      console.error("Errore nella dearchiviazione della task:", error);
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={isClosed}
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
                <div className="w-full">
                  <div className="w-full flex flex-row items-center justify-end gap-2 border-b pb-2">
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
                      onClick={handleNotArchiveTask}
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
                    <Button
                      color="primary"
                      variant="light"
                      onClick={isClosed}
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
                        {newTask!.ProjectTaskMembers.length === 0 ? (
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
                          <p>{formatDate(newTask!.ProjectTaskCreation)}</p>
                          {newTask?.ProjectTaskExpiration && (
                            <p>{formatDate(newTask.ProjectTaskExpiration)}</p>
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

                    {newTask!.ProjectTaskDescription &&
                      hasValidDescription(newTask!.ProjectTaskDescription) && (
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
                              readOnly
                              className="sm:col-span-2 sm:mt-0 h-fit"
                              theme="bubble"
                              value={newTask!.ProjectTaskDescription}
                            />
                          </dd>
                        </div>
                      )}

                    <div className="px-4 py-6 flex flex-col sm:gap-4 sm:px-0">
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
                                      key={index}
                                      DeleteFile={() => {}}
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
                                          {checklist.Checkboxes.length > 0 && (
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
                                        )
                                        .map((checkbox) => (
                                          <div className="flex flex-row justify-between gap-2 items-center w-full">
                                            <Checkbox
                                              lineThrough={checkbox.IsSelected}
                                              radius="full"
                                              value={String(
                                                checkbox.CheckboxId
                                              )}
                                              isSelected={checkbox.IsSelected}
                                              isReadOnly
                                            >
                                              {checkbox.Text}
                                            </Checkbox>
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
                    </div>
                  </dl>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  variant="light"
                  onClick={isClosed}
                  radius="full"
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
