// ConfirmDeleteModal.tsx
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface Permission {
  PermissionId: number;
  PermissionName: string;
  PermissionDescription: string;
}

interface ConfirmDeletePermissionModalProps {
  isOpen: boolean;
  isClosed: () => void;
  PermissionData: Permission;
  DeletePermission: (PermissionId: Permission) => void;
}

export default function ConfirmDeletePermissionModal({
  isOpen,
  isClosed,
  PermissionData,
  DeletePermission,
}: ConfirmDeletePermissionModalProps) {
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
                Conferma eliminazione del permesso{" "}
                {PermissionData.PermissionName}
              </h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600">
                Sei sicuro di voler eliminare il permesso{" "}
                {PermissionData.PermissionName}? <br />
                Questa azione non potrà essere annullata.
              </p>
            </ModalBody>
            <ModalFooter className="flex sm:flex-row flex-col">
              <Button
                color="success"
                onClick={() => {
                  DeletePermission(PermissionData);
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
