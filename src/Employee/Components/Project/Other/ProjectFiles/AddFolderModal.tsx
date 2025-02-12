// ConfirmDeleteModal.tsx
import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface FolderSettingsModalProps {
  isOpen: boolean;
  isClosed: () => void;
  handleAddFolder: (folderName: string) => void;
}

export default function AddFolderModal({
  isOpen,
  isClosed,
  handleAddFolder,
}: FolderSettingsModalProps) {
  const [folderName, setFolderName] = useState<string>("");
  const [customerVisible, setCustomerVisible] = useState<boolean>(false);
  const [teamVisible, setTeamVisible] = useState<boolean>(false);

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
              <h3 className="text-xl font-medium">Crea una nuova cartella</h3>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-3">
                <h2 className="text-small font-semibold text-foreground">
                  Nome cartella
                </h2>
                <Input
                  radius="sm"
                  variant="bordered"
                  placeholder="Es. Nuova Cartella"
                  onChange={(e) => setFolderName(e.target.value)}
                />
              </div>
              <Switch
                size="sm"
                isSelected={customerVisible}
                onValueChange={setCustomerVisible}
              >
                Visibile al cliente
              </Switch>
              <Switch
                size="sm"
                isSelected={teamVisible}
                onValueChange={setTeamVisible}
              >
                Visibile al team
              </Switch>
            </ModalBody>
            <ModalFooter className="flex sm:flex-row flex-col">
              <Button variant="light" onClick={isClosed} radius="full">
                Annulla
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  handleAddFolder(folderName);
                  isClosed();
                }}
                radius="full"
                className="mr-2"
                startContent={
                  <Icon icon="solar:add-folder-linear" fontSize={20} />
                }
              >
                Crea cartella
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
