// ConfirmDeleteModal.tsx
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface Employee {
  EmployeeId: number;
  EmployeeFullName: string;
  EmployeeEmail: string;
  EmployeePhone: string;
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  isClosed: () => void;
  EmployeeData: Employee;
  DeleteEmployee: (EmployeeData: Employee) => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  isClosed,
  EmployeeData,
  DeleteEmployee,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={isClosed}
      size="xl"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {(isClosed) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold">
                Conferma eliminazione di {EmployeeData.EmployeeFullName}
              </h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600">
                Sei sicuro di voler eliminare il dipendente{" "}
                {EmployeeData.EmployeeFullName}? <br />
                Questa azione non potrà essere annullata.
              </p>
            </ModalBody>
            <ModalFooter className="flex sm:flex-row flex-col">
              <Button
                color="success"
                onClick={() => {
                  DeleteEmployee(EmployeeData);
                  isClosed();
                }}
                radius="sm"
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
