import {
  Avatar,
  AvatarGroup,
  Button,
  Chip,
  DateValue,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from "@nextui-org/react";
import { API_URL_IMG } from "../../../../API/API";
import { useDateFormatter } from "@react-aria/i18n";
import dayjs from "dayjs";

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
}

export default function ViewTaskModal({
  isOpen,
  isClosed,
  TaskData,
}: {
  isOpen: boolean;
  isClosed: () => void;
  TaskData: Task;
}) {
  let formatter = useDateFormatter({ dateStyle: "full" });

  function formatDate(date: DateValue) {
    return dayjs(formatter.format(new Date(date.toString()))).format(
      "DD/MM/YYYY"
    );
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
        {(isClosed) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Anteprima della task: {TaskData.ProjectTaskName}
            </ModalHeader>
            <ModalBody>
              <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Titolo
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {TaskData.ProjectTaskName}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Descrizione
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {TaskData.ProjectTaskDescription}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Scadenza
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {formatDate(TaskData.ProjectTaskExpiration)}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Dipendenti associati
                    </dt>
                    <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 items-center">
                      {TaskData.ProjectTaskMembers.length === 0 ? (
                        <p>Nessun membro trovato</p>
                      ) : (
                        <AvatarGroup isBordered>
                          {TaskData.ProjectTaskMembers.map((member) => (
                            <Tooltip
                              key={member.StafferId}
                              content={member.StafferFullName}
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
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Tag associati
                    </dt>
                    <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 items-center">
                      {TaskData.ProjectTaskTags.length === 0 ? (
                        <p>Nessun tag trovato</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {TaskData.ProjectTaskTags.map((tag) => (
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
                </dl>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onClick={isClosed}
                radius="sm"
              >
                Chiudi
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
