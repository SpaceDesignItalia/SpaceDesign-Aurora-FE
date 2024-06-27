import {
  Button,
  DateValue,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface Tag {
  ProjectTaskTagId: number;
  ProjectTaskTagName: string;
  ProjectTaskTagColor: string;
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

interface ConfirmDeleteTaskModalProps {
  isOpen: boolean;
  isClosed: () => void;
  TaskData: Task;
  DeleteTask: (ProjectTaskId: number) => void;
}
export default function ConfirmDeleteTaskModal({
  isOpen,
  isClosed,
  TaskData,
  DeleteTask,
}: ConfirmDeleteTaskModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={isClosed}
      size="2xl"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {(isClosed) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold">
                Conferma eliminazione della task {TaskData.ProjectTaskName}
              </h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600">
                Sei sicuro di voler eliminare la task {TaskData.ProjectTaskName}
                ? <br />
                Questa azione non potrà essere annullata.
              </p>
            </ModalBody>
            <ModalFooter className="flex sm:flex-row flex-col">
              <Button
                color="success"
                variant="light"
                onClick={() => {
                  DeleteTask(TaskData.ProjectTaskId);
                  isClosed();
                }}
                radius="sm"
                className="mr-2"
              >
                Conferma eliminazione
              </Button>
              <Button variant="light" onClick={isClosed} radius="sm">
                Annulla
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
