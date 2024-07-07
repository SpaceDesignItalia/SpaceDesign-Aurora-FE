// ConfirmDeleteModal.tsx
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface Company {
  CompanyName: string;
  CompanyAddress: string;
  CompanyEmail: string;
  CompanyPhone: string;
}

interface ConfirmDeleteCompanyModalProps {
  isOpen: boolean;
  isClosed: () => void;
  CompanyData: Company;
  DeleteCompany: (CompanyData: Company) => void;
}

export default function ConfirmDeleteCompanyModal({
  isOpen,
  isClosed,
  CompanyData,
  DeleteCompany,
}: ConfirmDeleteCompanyModalProps) {
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
                onClick={() => {
                  DeleteCompany(CompanyData);
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
