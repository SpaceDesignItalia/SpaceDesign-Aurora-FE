import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

interface Permission {
  PermissionId: number;
  PermissionName: string;
}

interface Role {
  RoleId: number;
  RoleName: string;
  RoleDescription: string;
  RolePriority: number;
}

interface RoleModal {
  RoleId: number;
  RoleName: string;
  RoleDescription: string;
  RolePriority: number;
  permissions: Permission[];
}

interface ViewRoleModalProps {
  isOpen: boolean;
  isClosed: () => void;
  RoleData: Role;
}

const initialRoleData: RoleModal = {
  RoleId: 0,
  RoleName: "",
  RoleDescription: "",
  RolePriority: 0,
  permissions: [],
};

export default function ViewRoleModal({
  isOpen,
  isClosed,
  RoleData,
}: ViewRoleModalProps) {
  const [Role, setRole] = useState<RoleModal>(initialRoleData);

  useEffect(() => {
    if (isOpen && RoleData.RoleId) {
      axios
        .get("/Permission/GET/GetRoleById", {
          params: { RoleId: RoleData.RoleId },
        })
        .then((res) => {
          setRole(res.data);
        })
        .catch((error) => {
          console.error("Errore durante il recupero del ruolo:", error);
        });
    }
  }, [isOpen, RoleData.RoleId]);

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
              Anteprima di {Role.RoleName}
            </ModalHeader>
            <ModalBody>
              <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Nome Ruolo
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {Role.RoleName}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Descrizione Ruolo
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {Role.RoleDescription}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Grado priorità Ruolo
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {Role.RolePriority}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Permessi Associati
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {Role.permissions.length === 0 ? (
                        <p className="text-sm font-small leading-6 text-gray-900">
                          Nessun permesso associato
                        </p>
                      ) : (
                        <ul className="grid md:grid-cols-2 mt-5 items-center gap-3">
                          {Role.permissions.map((permission) => (
                            <li
                              className="flex flex-row items-center"
                              key={permission.PermissionId}
                            >
                              <CheckCircleIcon
                                className="h-5 w-5 text-success-600 mr-2"
                                aria-hidden="true"
                              />{" "}
                              {permission.PermissionName}
                            </li>
                          ))}
                        </ul>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
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
