import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Textarea,
  CheckboxGroup,
  Checkbox,
} from "@nextui-org/react";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "./StatusAlert";

interface Role {
  RoleName: string;
  RoleDescription: string;
}

interface RolePermission {
  PermissionId: number;
}

interface PermissionGroup {
  GroupName: string;
}

interface Permissions {
  PermissionId: number;
  PermissionName: string;
  GroupName: string;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

export default function AddRoleModel() {
  const [permissionGroup, setPermissionGroup] = useState<PermissionGroup[]>([]);
  const [permissions, setPermissions] = useState<Permissions[]>([]);
  const [newRole, setNewRole] = useState<Role>({
    RoleName: "",
    RoleDescription: "",
  });
  const [newRolePermissions, setNewRolePermissions] = useState<
    RolePermission[]
  >([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

  useEffect(() => {
    axios.get("/Permission/GET/GetPermissionGroups").then((res) => {
      setPermissionGroup(res.data);
    });

    axios.get("/Permission/GET/GetAllPermissions").then((res) => {
      setPermissions(res.data);
    });
  }, []);

  function handleRoleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setNewRole({ ...newRole, RoleName: e.target.value });
    }
  }

  function handleRoleDescriptionChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setNewRole({ ...newRole, RoleDescription: e.target.value });
    }
  }

  function handleCheckboxChange(value: string, checked: boolean) {
    if (checked) {
      // Aggiungi il valore del checkbox selezionato all'array
      setNewRolePermissions([
        ...newRolePermissions,
        { PermissionId: parseInt(value) },
      ]);
    } else {
      // Rimuovi il valore del checkbox deselezionato dall'array
      setNewRolePermissions(
        newRolePermissions.filter(
          (permission) => permission.PermissionId !== parseInt(value)
        )
      );
    }
  }

  function checkAllDataCompiled() {
    if (
      newRole.RoleName !== "" &&
      newRole.RoleDescription !== "" &&
      newRolePermissions.length !== 0
    ) {
      return false;
    }
    return true;
  }

  async function handleCreateNewRole() {
    try {
      const res = await axios
        .post("/Permission/POST/AddRole", {
          params: { RoleData: newRole, RolePermissionData: newRolePermissions },
        })
        .then(setIsAddingData(true));

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il ruolo è stata aggiunto con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/administration/permission";
        }, 2000);
        console.log("Successo:", res.data);
      }
      // Esegui altre azioni dopo la creazione dell'azienda, se necessario
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante l'aggiunta del ruolo Per favore, riprova più tardi.",
        alertColor: "red",
      });

      setTimeout(() => {
        window.location.href = "/administration/permission";
      }, 2000);
      console.error("Errore durante la creazione dell'azienda:", error);
      // Gestisci l'errore in modo appropriato, ad esempio mostrando un messaggio all'utente
    }
  }

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <div className="border border-gray-200 sm:overflow-hidden rounded-xl">
          <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Aggiungi ruolo
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                In questo pannello potrai aggiungere un nuovo ruolo al database.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nome ruolo
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="sm"
                  value={newRole.RoleName}
                  onChange={handleRoleNameChange}
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Descrizione
                </label>
                <Textarea
                  variant="bordered"
                  type="text"
                  radius="sm"
                  value={newRole.RoleDescription}
                  onChange={handleRoleDescriptionChange}
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Permessi associati
                </label>
                <div className="flex flex-col xl:flex-row flex-wrap gap-5 sm:gap-0 justify-between mt-3 md:w-1/2">
                  {permissionGroup.map((group) => {
                    const groupPermissions = permissions.filter(
                      (permission) => permission.GroupName === group.GroupName
                    );

                    if (groupPermissions.length === 0) {
                      return null;
                    }

                    return (
                      <CheckboxGroup
                        className="mt-5"
                        label={group.GroupName}
                        key={group.GroupName}
                      >
                        {groupPermissions.map((permission) => (
                          <Checkbox
                            value={String(permission.PermissionId)}
                            key={permission.PermissionId}
                            onChange={(e) =>
                              handleCheckboxChange(
                                e.target.value,
                                e.target.checked
                              )
                            }
                          >
                            {permission.PermissionName}
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button
              color="success"
              className="text-white"
              radius="sm"
              startContent={!isAddingData && <SaveIcon />}
              isDisabled={checkAllDataCompiled()}
              isLoading={isAddingData}
              onClick={handleCreateNewRole}
            >
              {isAddingData ? "Salvando l'azienda..." : "Salva azienda"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
