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

interface EditPermissionModelProps {
  PermissionId: number;
}

export default function EditPermissionModel({
  PermissionId,
}: EditPermissionModelProps) {
  const [permissionGroup, setPermissionGroup] = useState<PermissionGroup[]>([]);
  const [initialPermission, setInitialPermission] = useState({
    PermissionId: PermissionId,
    PermissionName: "",
    PermissionDescription: "",
    PermissionAction: "",
    PermissionGroupId: null,
  });
  const [currentPermission, setCurrentPermission] = useState({
    PermissionId: PermissionId,
    PermissionName: "",
    PermissionDescription: "",
    PermissionAction: "",
    PermissionGroupId: null,
  });
  const [isUpdatingData, setIsUpdatingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

  useEffect(() => {
    // Fetch permission groups
    axios.get("/Permission/GET/GetPermissionGroups").then((res) => {
      setPermissionGroup(res.data);
    });

    // Fetch current permission data by ID
    axios
      .get("/Permission/GET/GetPermissionById", {
        params: { PermissionId: PermissionId },
      })
      .then((res) => {
        const permissionData = res.data[0];
        setCurrentPermission(permissionData);
        setInitialPermission(permissionData);
      });
  }, [PermissionId]);

  function handlePermissionNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCurrentPermission({
      ...currentPermission,
      PermissionName: e.target.value,
    });
  }

  function handlePermissionDescriptionChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setCurrentPermission({
      ...currentPermission,
      PermissionDescription: e.target.value,
    });
  }

  function handlePermissionGroupChange(selected: React.Key) {
    setCurrentPermission({
      ...currentPermission,
      PermissionGroupId: selected as number,
    });
  }

  function handlePermissionActionChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const transformedValue = e.target.value.replace(/\s+/g, "_").toUpperCase();
    setCurrentPermission({
      ...currentPermission,
      PermissionAction: transformedValue,
    });
  }

  function checkAllDataCompiled() {
    return (
      currentPermission.PermissionName === "" ||
      currentPermission.PermissionDescription === "" ||
      currentPermission.PermissionGroupId === null ||
      currentPermission.PermissionAction === ""
    );
  }

  function hasChanges() {
    return (
      currentPermission.PermissionName !== initialPermission.PermissionName ||
      currentPermission.PermissionDescription !==
        initialPermission.PermissionDescription ||
      currentPermission.PermissionAction !==
        initialPermission.PermissionAction ||
      currentPermission.PermissionGroupId !==
        initialPermission.PermissionGroupId
    );
  }

  async function handleUpdatePermission() {
    try {
      setIsUpdatingData(true);
      const res = await axios.put("/Permission/UPDATE/UpdatePermission", {
        PermissionData: currentPermission,
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il permesso è stato aggiornato con successo.",
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
          "Si è verificato un errore durante l'aggiornamento del permesso. Per favore, riprova più tardi.",
        alertColor: "red",
      });

      setTimeout(() => {
        setAlertData({ ...alertData, isOpen: false });
      }, 2000);
    } finally {
      setIsUpdatingData(false);
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
                Modifica permesso
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                In questo pannello potrai modificare un permesso esistente nel
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
                  value={currentPermission.PermissionName}
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
                  value={currentPermission.PermissionDescription}
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
                  value={currentPermission.PermissionAction}
                  onChange={handlePermissionActionChange}
                  fullWidth
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
                  selectedKey={currentPermission.PermissionGroupId}
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
              startContent={!isUpdatingData && <SaveIcon />}
              isDisabled={checkAllDataCompiled() || !hasChanges()}
              isLoading={isUpdatingData}
              onClick={handleUpdatePermission}
            >
              {isUpdatingData ? "Salvando il permesso..." : "Salva permesso"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
