import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";

interface PermissionGroup {
  GroupName: string;
  PermissionGroupId: number;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

export default function AddPermissionModel() {
  const [permissionGroup, setPermissionGroup] = useState<PermissionGroup[]>([]);
  const [permissions, setPermissions] = useState<Permissions[]>([]);
  const [newPermission, setNewPermission] = useState({
    PermissionName: "",
    PermissionDescription: "",
    PermissionAction: "",
    PermissionGroupId: null,
  });
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

  function handlePermissionNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNewPermission({ ...newPermission, PermissionName: e.target.value });
  }

  function handlePermissionDescriptionChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setNewPermission({
      ...newPermission,
      PermissionDescription: e.target.value,
    });
  }

  function handlePermissionGroupChange(selected: Set<React.Key>) {
    const groupId = Array.from(selected)[0] as number;
    setNewPermission({ ...newPermission, PermissionGroupId: groupId });
  }

  function handlePermissionActionChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const transformedValue = e.target.value.replace(/\s+/g, "_").toUpperCase();
    setNewPermission({
      ...newPermission,
      PermissionAction: transformedValue,
    });
  }

  function checkAllDataCompiled() {
    return (
      newPermission.PermissionName === "" ||
      newPermission.PermissionDescription === "" ||
      newPermission.PermissionGroupId === null ||
      newPermission.PermissionAction === ""
    );
  }

  async function handleCreateNewPermission() {
    try {
      setIsAddingData(true);
      const res = await axios.post("/Permission/POST/AddPermission", {
        PermissionData: newPermission,
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il permesso è stato aggiunto con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/administration/permission";
        }, 2000);
      }
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante l'aggiunta del permesso. Per favore, riprova più tardi.",
        alertColor: "red",
      });

      setTimeout(() => {
        setAlertData({ ...alertData, isOpen: false });
      }, 2000);
    } finally {
      setIsAddingData(false);
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
                Aggiungi permesso
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                In questo pannello potrai aggiungere un nuovo permesso al
                database.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="permission-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nome permesso
                </label>
                <Input
                  id="permission-name"
                  variant="bordered"
                  type="text"
                  radius="sm"
                  value={newPermission.PermissionName}
                  onChange={handlePermissionNameChange}
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="permission-description"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Descrizione permesso
                </label>
                <Textarea
                  id="permission-description"
                  variant="bordered"
                  radius="sm"
                  value={newPermission.PermissionDescription}
                  onChange={handlePermissionDescriptionChange}
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="permission-action"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Azione permesso
                </label>
                <Input
                  id="permission-action"
                  variant="bordered"
                  type="text"
                  radius="sm"
                  value={newPermission.PermissionAction}
                  onChange={handlePermissionActionChange}
                  fullWidth
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value
                      .replace(/\s+/g, "_")
                      .toUpperCase();
                  }}
                />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="permission-group"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Gruppo permesso
                </label>
                <Autocomplete
                  items={permissionGroup.map((group) => ({
                    key: group.PermissionGroupId,
                    label: group.GroupName,
                  }))}
                  placeholder="Seleziona gruppo"
                  onSelectionChange={handlePermissionGroupChange}
                  variant="bordered"
                  radius="sm"
                  aria-label="permission-group"
                  fullWidth
                >
                  {(item) => (
                    <AutocompleteItem key={item.key} textValue={item.label}>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <div className="flex flex-col">
                            <span className="text-small">{item.label}</span>
                          </div>
                        </div>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
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
              onClick={handleCreateNewPermission}
            >
              {isAddingData ? "Salvando il permesso..." : "Salva permesso"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
