// ConfirmDeleteModal.tsx
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface Customer {
  CustomerId: number;
  CustomerFullName: string;
  CustomerEmail: string;
  CustomerPhone: string;
}

interface ConfirmDeleteCustomerModalProps {
  isOpen: boolean;
  isClosed: () => void;
  CustomerData: Customer;
  DeleteCustomer: (CustomerData: Customer) => void;
}

export default function ConfirmDeleteCustomerModal({
  isOpen,
  isClosed,
  CustomerData,
  DeleteCustomer,
}: ConfirmDeleteCustomerModalProps) {
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
                Conferma eliminazione di {CustomerData.CustomerFullName}
              </h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600">
                Sei sicuro di voler eliminare il cliente{" "}
                {CustomerData.CustomerFullName}? <br />
                Questa azione non potrà essere annullata.
              </p>
            </ModalBody>
            <ModalFooter className="flex sm:flex-row flex-col">
              <Button
                color="success"
                onClick={() => {
                  DeleteCustomer(CustomerData);
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
