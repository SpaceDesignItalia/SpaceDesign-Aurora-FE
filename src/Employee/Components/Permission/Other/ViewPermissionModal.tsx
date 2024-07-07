import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import axios from "axios";

interface Permission {
  PermissionId: number;
  PermissionName: string;
  PermissionDescription: string;
  PermissionAction: string;
  GroupId: number;
  GroupName: string;
}

interface ViewPermission {
  PermissionId: number;
  PermissionName: string;
  PermissionDescription: string;
}

interface ViewPermissionModalProps {
  isOpen: boolean;
  isClosed: () => void;
  PermData: ViewPermission;
}

export default function ViewPermissionModal({
  isOpen,
  isClosed,
  PermData,
}: ViewPermissionModalProps) {
  const [permission, setPermission] = useState<Permission | null>(null);

  useEffect(() => {
    if (isOpen && PermData.PermissionId) {
      axios
        .get("/Permission/GET/GetPermissionById", {
          params: { PermissionId: PermData.PermissionId },
        })
        .then((res) => {
          setPermission(res.data[0]);
        })
        .catch((error) => {
          console.error(
            "Errore durante il recupero dei dettagli del permesso:",
            error
          );
        });
    }
  }, [isOpen, PermData.PermissionId]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={isClosed}
      size="4xl"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {(isClosed) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {permission
                ? `Anteprima di ${permission.PermissionName}`
                : "Caricamento..."}
            </ModalHeader>
            <ModalBody>
              {permission ? (
                <div className="mt-6 border-t border-gray-100">
                  <dl className="divide-y divide-gray-100">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">
                        Nome Permesso
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {permission.PermissionName}
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">
                        Descrizione Permesso
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {permission.PermissionDescription}
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">
                        Azione
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {permission.PermissionAction}
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">
                        Gruppo di appartenenza
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {permission.GroupName}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <Spinner label="Caricamento..." color="danger" />
              )}
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
