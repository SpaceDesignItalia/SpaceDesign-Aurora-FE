import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";
import { useParams } from "react-router-dom";

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

const initialPermissionState = {
  PermissionId: null,
  PermissionName: "",
  PermissionDescription: "",
  PermissionAction: "",
  PermissionGroupId: 0,
};

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function EditPermissionModel() {
  const { PermissionId } = useParams();
  const [permissionGroup, setPermissionGroup] = useState<PermissionGroup[]>([]);
  const [initialPermission, setInitialPermission] = useState(
    initialPermissionState
  );
  const [currentPermission, setCurrentPermission] = useState({
    ...initialPermissionState,
    PermissionId,
  });
  const [isUpdatingData, setIsUpdatingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, permissionRes] = await Promise.all([
          axios.get("/Permission/GET/GetPermissionGroups"),
          axios.get("/Permission/GET/GetPermissionById", {
            params: { PermissionId },
          }),
        ]);
        setPermissionGroup(groupsRes.data);
        const permissionData = permissionRes.data[0];
        setCurrentPermission(permissionData);
        setInitialPermission(permissionData);
      } catch (error) {
        console.error("Errore nel recupero dei dati:", error);
      }
    };

    fetchData();
  }, [PermissionId]);

  const handleInputChange =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let value = e.target.value;
      if (key === "PermissionAction") {
        value = value.replace(/\s+/g, "_").toUpperCase();
      }
      setCurrentPermission({
        ...currentPermission,
        [key]: value,
      });
    };

  const handleGroupChange = (selected: React.Key | null) => {
    setCurrentPermission({
      ...currentPermission,
      PermissionGroupId: selected as number,
    });
  };

  const checkAllDataCompiled = () => {
    const {
      PermissionName,
      PermissionDescription,
      PermissionAction,
      PermissionGroupId,
    } = currentPermission;
    return !(
      PermissionName &&
      PermissionDescription &&
      PermissionAction &&
      PermissionGroupId
    );
  };

  const hasChanges = () => {
    return (
      JSON.stringify(currentPermission) !== JSON.stringify(initialPermission)
    );
  };

  const handleUpdatePermission = async () => {
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
          "Si è verificato un errore durante l'aggiornamento del permesso. Per favore, riprova più tardi.",
        onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
        alertColor: "red",
      });
    } finally {
      setIsUpdatingData(false);
    }
  };

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <div className="space-y-6 bg-white py-6">
          <div>
            <h3 className="text-base font-medium leading-6 text-gray-900">
              Modifica permesso
            </h3>
            <p className="mt-1 text-sm text-gray-500 w-1/3">
              In questo pannello potrai modificare un permesso esistente nel
              database. I campi contrassegnati con un asterisco (
              <span className="text-danger font-semibold">*</span>) sono
              obbligatori. Assicurati di aggiornare tutte le informazioni
              necessarie prima di procedere.
            </p>
          </div>

          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6">
              <label
                htmlFor="permission-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Nome permesso{" "}
                <span className="text-red-600 font-semibold">*</span>
              </label>
              <Input
                id="permission-name"
                variant="bordered"
                type="text"
                radius="full"
                value={currentPermission.PermissionName}
                onChange={handleInputChange("PermissionName")}
                fullWidth
              />
            </div>

            <div className="col-span-6">
              <label
                htmlFor="permission-description"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Descrizione permesso{" "}
                <span className="text-red-600 font-semibold">*</span>
              </label>
              <Textarea
                id="permission-description"
                variant="bordered"
                radius="full"
                value={currentPermission.PermissionDescription}
                onChange={handleInputChange("PermissionDescription")}
                fullWidth
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="permission-action"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Azione permesso{" "}
                <span className="text-red-600 font-semibold">*</span>
              </label>
              <Input
                id="permission-action"
                variant="bordered"
                type="text"
                radius="full"
                value={currentPermission.PermissionAction}
                onChange={handleInputChange("PermissionAction")}
                fullWidth
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="permission-group"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Gruppo permesso{" "}
                <span className="text-red-600 font-semibold">*</span>
              </label>
              <Autocomplete
                items={permissionGroup.map((group) => ({
                  key: group.PermissionGroupId,
                  label: group.GroupName,
                }))}
                placeholder="Seleziona gruppo"
                onSelectionChange={handleGroupChange}
                variant="bordered"
                radius="full"
                aria-label="permission-group"
                fullWidth
                selectedKey={String(currentPermission.PermissionGroupId)}
              >
                {(item) => (
                  <AutocompleteItem key={item.key} textValue={item.label}>
                    <div className="flex justify-between items-center">
                      <span className="text-small">{item.label}</span>
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
            startContent={!isUpdatingData && <SaveIcon />}
            isDisabled={checkAllDataCompiled() || !hasChanges()}
            isLoading={isUpdatingData}
            onClick={handleUpdatePermission}
          >
            {isUpdatingData ? "Salvando il permesso..." : "Salva permesso"}
          </Button>
        </div>
      </div>
    </>
  );
}
