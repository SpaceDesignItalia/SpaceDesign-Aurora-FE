import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import StatusAlert from "../../Layout/StatusAlert";
import { Icon } from "@iconify/react";

interface PermissionGroup {
  GroupName: string;
  PermissionGroupId: number;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const initialPermissionData = {
  PermissionName: "",
  PermissionDescription: "",
  PermissionAction: "",
  PermissionGroupId: null as number | null,
};

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function AddPermissionModel() {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
    []
  );
  const [newPermission, setNewPermission] = useState(initialPermissionData);
  const [isAddingData, setIsAddingData] = useState(false);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);

  useEffect(() => {
    axios
      .get("/Permission/GET/GetPermissionGroups")
      .then((res) => {
        setPermissionGroups(res.data);
      })
      .catch((error) => {
        console.error("Error fetching permission groups:", error);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "PermissionAction") {
      const transformedValue = value.replace(/\s+/g, "_").toUpperCase();
      setNewPermission((prev) => ({
        ...prev,
        [name]: transformedValue,
      }));
    } else {
      setNewPermission((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePermissionGroupChange = (key: string | number | null) => {
    if (key !== null) {
      setNewPermission((prev) => ({
        ...prev,
        PermissionGroupId: Number(key),
      }));
    }
  };

  const isDataIncomplete = () => {
    const {
      PermissionName,
      PermissionDescription,
      PermissionAction,
      PermissionGroupId,
    } = newPermission;
    return (
      !PermissionName ||
      !PermissionDescription ||
      !PermissionAction ||
      PermissionGroupId === null
    );
  };

  const handleCreateNewPermission = async () => {
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
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
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
        onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
        alertColor: "red",
      });

      setTimeout(() => {
        setAlertData((prev) => ({ ...prev, isOpen: false }));
      }, 2000);
    } finally {
      setIsAddingData(false);
    }
  };

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
          <div>
            <h3 className="text-base font-medium leading-6 text-gray-900">
              Aggiungi permesso
            </h3>
            <p className="mt-1 text-sm text-gray-500 w-1/3">
              In questo pannello potrai aggiungere un nuovo permesso al
              database. I campi contrassegnati con un asterisco (
              <span className="text-danger font-semibold">*</span>) sono
              obbligatori. Assicurati di compilare tutte le informazioni
              necessarie prima di procedere.
            </p>
          </div>

          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6">
              <label
                htmlFor="PermissionName"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Nome permesso{" "}
                <span className="text-red-600 font-semibold">*</span>
              </label>
              <Input
                id="PermissionName"
                name="PermissionName"
                variant="bordered"
                radius="full"
                value={newPermission.PermissionName}
                onChange={handleChange}
                fullWidth
              />
            </div>

            <div className="col-span-6">
              <label
                htmlFor="PermissionDescription"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Descrizione permesso{" "}
                <span className="text-red-600 font-semibold">*</span>
              </label>
              <Textarea
                id="PermissionDescription"
                name="PermissionDescription"
                variant="bordered"
                radius="full"
                value={newPermission.PermissionDescription}
                onChange={handleChange}
                fullWidth
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="PermissionAction"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Azione permesso{" "}
                <span className="text-red-600 font-semibold">*</span>
              </label>
              <Input
                id="PermissionAction"
                name="PermissionAction"
                variant="bordered"
                radius="full"
                value={newPermission.PermissionAction}
                onChange={handleChange}
                fullWidth
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="PermissionGroup"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Gruppo permesso{" "}
                <span className="text-red-600 font-semibold">*</span>
              </label>
              <Autocomplete
                items={permissionGroups.map((group) => ({
                  key: group.PermissionGroupId,
                  label: group.GroupName,
                }))}
                placeholder="Seleziona gruppo"
                onSelectionChange={handlePermissionGroupChange}
                variant="bordered"
                radius="full"
                aria-label="PermissionGroup"
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
        <div className="py-3 text-right">
          <Button
            color="primary"
            className="text-white"
            radius="full"
            startContent={
              !isAddingData && <Icon icon="basil:save-outline" fontSize={24} />
            }
            isDisabled={isDataIncomplete()}
            isLoading={isAddingData}
            onClick={handleCreateNewPermission}
          >
            {isAddingData ? "Salvando il permesso..." : "Salva permesso"}
          </Button>
        </div>
      </div>
    </>
  );
}
