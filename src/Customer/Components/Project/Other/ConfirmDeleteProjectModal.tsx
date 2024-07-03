// ConfirmDeleteModal.tsx

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: string;
  ProjectEndDate: string;
  ProjectManagerId: number;
  ProjectBannerId: number;
  CompanyId: number;
  StatusId: number;
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  isClosed: () => void;
  ProjectData: Project;
  DeleteProject: (project: Project) => void;
}

export default function ConfirmDeleteProjectModal({
  isOpen,
  isClosed,
  ProjectData,
  DeleteProject,
}: ConfirmDeleteModalProps) {
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
                Conferma eliminazione del progetto {ProjectData.ProjectName}
              </h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600">
                Sei sicuro di voler eliminare il progetto{" "}
                {ProjectData.ProjectName}? <br />
                Questa azione non potrà essere annullata.
              </p>
            </ModalBody>
            <ModalFooter className="flex sm:flex-row flex-col">
              <Button
                color="success"
                variant="light"
                onClick={() => {
                  DeleteProject(ProjectData);
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
