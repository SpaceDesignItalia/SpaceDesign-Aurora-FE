// ConfirmDeleteModal.tsx
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

export default function ConfirmDeleteCompanyModal({
  isOpen,
  isClosed,
  CompanyData,
  DeleteCompany,
}) {
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
                Conferma eliminazione dell'azienda {CompanyData.CompanyName}
              </h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600">
                Sei sicuro di voler eliminare l'azienda{" "}
                {CompanyData.CompanyName}? <br />
                Questa azione non potrà essere annullata.
              </p>
            </ModalBody>
            <ModalFooter className="flex sm:flex-row flex-col">
              <Button
                color="success"
                variant="light"
                onClick={() => {
                  DeleteCompany(CompanyData);
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
