// ConfirmDeleteModal.tsx

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
import axios from "axios";
import { useEffect, useState } from "react";

interface Folder {
  FolderId: number;
  FolderName: string;
  ProjectId: number;
}

interface FolderSettingsModalProps {
  isOpen: boolean;
  isClosed: () => void;
  FolderData: Folder;
}

export default function FolderSettingsModal({
  isOpen,
  isClosed,
  FolderData,
}: FolderSettingsModalProps) {
  const [newFolderData, setNewFolderData] = useState<Folder>({
    FolderId: FolderData.FolderId,
    FolderName: FolderData.FolderName,
    ProjectId: FolderData.ProjectId,
  });
  const [customerVisible, setCustomerVisible] = useState<boolean>(false);
  const [teamVisible, setTeamVisible] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get("/Project/GET/GetFolderInfoByFolderId", {
        params: {
          FolderId: FolderData.FolderId,
        },
      })
      .then((response) => {
        setNewFolderData({
          ...newFolderData,
          FolderName: response.data.FolderName,
        });
        setCustomerVisible(response.data.CustomerVisible);
        setTeamVisible(response.data.TeamVisible);
      });
  }, [FolderData.FolderId]);

  async function handleUpdateFolder() {
    try {
      axios
        .put("/Project/UPDATE/UpdateFolder", {
          FolderId: FolderData.FolderId,
          FolderName: newFolderData.FolderName,
          ForClient: customerVisible,
          ForTeam: teamVisible,
        })
        .then((response) => {
          if (response.status === 200) {
            window.location.reload();
          }
        });
    } catch (error) {
      console.error(error);
    }
  }

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
                Modifica della cartella {FolderData.FolderName}
              </h3>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-3">
                <Input
                  radius="sm"
                  variant="bordered"
                  label="Nome cartella"
                  value={newFolderData.FolderName}
                  onChange={(e) =>
                    setNewFolderData({
                      ...newFolderData,
                      FolderName: e.target.value,
                    })
                  }
                />
              </div>
              <Switch
                isSelected={customerVisible}
                onValueChange={setCustomerVisible}
              >
                Visibile al cliente
              </Switch>
              <Switch isSelected={teamVisible} onValueChange={setTeamVisible}>
                Visibile al team
              </Switch>
            </ModalBody>
            <ModalFooter className="flex sm:flex-row flex-col">
              <Button
                color="success"
                variant="light"
                onClick={handleUpdateFolder}
                radius="sm"
                className="mr-2"
              >
                Aggiorna
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
