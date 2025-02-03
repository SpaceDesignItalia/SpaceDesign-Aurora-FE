import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Textarea,
  CheckboxGroup,
  Checkbox,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";

interface Role {
  RoleName: string;
  RoleDescription: string;
  RolePriority: number;
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
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "success" | "danger" | "warning";
}

const initialRoleData: Role = {
  RoleName: "",
  RoleDescription: "",
  RolePriority: 0,
};

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "danger",
};

const AddRoleModel: React.FC = () => {
  const [permissionGroup, setPermissionGroup] = useState<PermissionGroup[]>([]);
  const [permissions, setPermissions] = useState<Permissions[]>([]);
  const [newRole, setNewRole] = useState<Role>(initialRoleData);
  const [newRolePermissions, setNewRolePermissions] = useState<
    RolePermission[]
  >([]);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [generateLoading, setGenerateLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const [groupsRes, permsRes] = await Promise.all([
          axios.get("/Permission/GET/GetPermissionGroups"),
          axios.get("/Permission/GET/GetAllPermissions"),
        ]);
        setPermissionGroup(groupsRes.data);
        setPermissions(permsRes.data);
      } catch (error) {
        console.error("Errore nel recupero dei permessi:", error);
      }
    };

    fetchPermissions();
  }, []);

  useEffect(() => {
    const permissionIds = newRolePermissions.map(
      (perm: RolePermission) => perm.PermissionId
    );
    setRolePermissions(permissionIds);
  }, [newRolePermissions]);

  const handleRoleChange =
    (key: keyof Role) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewRole((prevRole) => ({ ...prevRole, [key]: e.target.value }));
    };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    setNewRolePermissions((prevPermissions) =>
      checked
        ? [...prevPermissions, { PermissionId: parseInt(value) }]
        : prevPermissions.filter(
            (permission) => permission.PermissionId !== parseInt(value)
          )
    );
  };

  const handleCheckboxAllChange = () => {
    if (newRolePermissions.length === permissions.length) {
      // Deseleziona tutti se attualmente tutti sono selezionati
      setNewRolePermissions([]);
    } else {
      // Seleziona tutti
      setNewRolePermissions(
        permissions.map((permission) => ({
          PermissionId: Number(permission.PermissionId),
        }))
      );
    }
  };

  const handleRefine = async () => {
    if (!newRole.RoleDescription) return;
    setLoading(true);
    try {
      const refinedText = await axios.post(
        "/Project/POST/RefineRoleDescription",
        {
          text: `Riscrivi in modo più formale e completo il seguente testo: ${newRole.RoleDescription}`,
        }
      );
      console.log("Testo raffinato:", refinedText.data);
      setNewRole({
        ...newRole,
        RoleDescription: refinedText.data,
      });
    } catch (error) {
      console.error("Errore:", error);
      alert("Si è verificato un errore.");
    } finally {
      setLoading(false);
    }
  };
  const handleGenerate = async () => {
    if (!newRole.RoleName) return;
    setGenerateLoading(true);
    try {
      const response = await axios.post(
        "/Project/POST/GenerateRoleDescriptionFromName",
        { roleName: newRole.RoleName } // Passa direttamente il nome del ruolo
      );
      console.log("Testo generato:", response.data);
      setNewRole({
        ...newRole,
        RoleDescription: response.data,
      });
    } catch (error) {
      console.error("Errore:", error);
      alert("Si è verificato un errore.");
    } finally {
      setGenerateLoading(false);
    }
  };

  const checkAllDataCompiled = () => {
    return !(
      newRole.RoleName &&
      newRole.RoleDescription &&
      newRole.RolePriority &&
      newRolePermissions.length
    );
  };

  const handleCreateNewRole = async () => {
    try {
      setIsAddingData(true);
      const res = await axios.post("/Permission/POST/AddRole", {
        RoleData: newRole,
        RolePermissionData: newRolePermissions,
      });

      if (res.status === 201) {
        // Check for successful addition
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "Il ruolo è stato aggiunto con successo.",
          alertColor: "success",
        });
        setTimeout(() => {
          window.location.href = "/administration/permission";
        }, 2000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          // Handle duplicate role error
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Conflitto durante l'operazione",
            alertDescription:
              "Esiste già un ruolo con questo nome. Usa un nome diverso.",
            alertColor: "warning",
          });
        } else {
          // General error handling
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Errore durante l'operazione",
            alertDescription:
              "Si è verificato un errore durante l'aggiunta del ruolo. Per favore, riprova più tardi.",
            alertColor: "danger",
          });
        }
      }
    } finally {
      setIsAddingData(false);
    }
  };

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <div className="space-y-6 bg-white px-4 py-6">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Aggiungi ruolo
            </h3>
            <p className="mt-1 text-sm text-gray-500 sm:w-1/3 w-full">
              In questo pannello potrai aggiungere un nuovo ruolo al database. I
              campi contrassegnati con un asterisco (
              <span className="text-danger font-bold">*</span>) sono
              obbligatori. Assicurati di inserire tutte le informazioni
              richieste prima di procedere.
            </p>
          </div>

          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-6">
              <label
                htmlFor="role-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Nome ruolo <span className="text-red-600 font-bold">*</span>
              </label>
              <Input
                id="role-name"
                variant="bordered"
                type="text"
                radius="full"
                value={newRole.RoleName}
                onChange={handleRoleChange("RoleName")}
                fullWidth
              />
            </div>

            <div className="col-span-6 sm:col-span-6">
              <label
                htmlFor="role-description"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Descrizione <span className="text-red-600 font-bold">*</span>
              </label>
              <Textarea
                id="role-description"
                variant="bordered"
                radius="full"
                value={newRole.RoleDescription}
                onChange={handleRoleChange("RoleDescription")}
                fullWidth
                className="mb-2"
              />

              {newRole.RoleName && !newRole.RoleDescription ? (
                <Button
                  variant="bordered"
                  className="w-max-1/2 mx-auto gap-3 my-5 sm:my-0 py-2 mr-2"
                  radius="full"
                  onClick={handleGenerate}
                  isDisabled={generateLoading}
                >
                  {generateLoading ? (
                    <>
                      <Spinner size="sm" className="text-black" /> Generazione
                      in corso...
                    </>
                  ) : (
                    <>
                      <AutoFixHighRoundedIcon className="w-5 h-5" /> Genera
                      descrizione per: {newRole.RoleName}
                    </>
                  )}
                </Button>
              ) : null}

              {newRole.RoleDescription ? (
                <Button
                  variant="bordered"
                  className="w-max-1/2 gap-3 my-5 sm:my-0 py-2"
                  radius="full"
                  onClick={handleRefine}
                  isDisabled={loading || !newRole.RoleDescription}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="text-black" /> Riscrittura
                      in corso...
                    </>
                  ) : (
                    <>
                      <AutoFixHighRoundedIcon className="w-5 h-5" /> Riscrivi
                      con AI
                    </>
                  )}
                </Button>
              ) : null}
            </div>

            <div className="col-span-6 sm:col-span-2">
              <label
                htmlFor="role-priority"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Grado priorità ruolo{" "}
                <span className="text-red-600 font-bold">*</span>
              </label>
              <Select
                disallowEmptySelection
                label="Selezionare grado"
                id="role-priority"
                variant="bordered"
                radius="lg"
                aria-label="Selezionare grado"
                value={newRole.RolePriority}
                onChange={(e) =>
                  setNewRole((prevRole) => ({
                    ...prevRole,
                    RolePriority: parseInt(e.target.value, 10),
                  }))
                }
              >
                <SelectItem key={1} value={1}>
                  1
                </SelectItem>
                <SelectItem key={2} value={2}>
                  2
                </SelectItem>
                <SelectItem key={3} value={3}>
                  3
                </SelectItem>
                <SelectItem key={4} value={4}>
                  4
                </SelectItem>
                <SelectItem key={5} value={5}>
                  5
                </SelectItem>
                <SelectItem key={6} value={6}>
                  6
                </SelectItem>
                <SelectItem key={7} value={7}>
                  7
                </SelectItem>
                <SelectItem key={8} value={8}>
                  8
                </SelectItem>
                <SelectItem key={9} value={9}>
                  9
                </SelectItem>
                <SelectItem key={10} value={10}>
                  10
                </SelectItem>
                <SelectItem key={11} value={11}>
                  11
                </SelectItem>
                <SelectItem key={12} value={12}>
                  12
                </SelectItem>
              </Select>
            </div>

            <div className="col-span-6 sm:col-span-6">
              <label
                htmlFor="role-permissions"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Permessi associati{" "}
                <span className="text-red-600 font-bold">*</span>
              </label>
              <Checkbox
                isSelected={newRolePermissions.length === permissions.length}
                onChange={() => handleCheckboxAllChange()}
                radius="full"
              >
                Seleziona tutti i permessi
              </Checkbox>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-0 justify-between mt-3">
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
                      radius="full"
                      label={group.GroupName}
                      key={group.GroupName}
                      value={rolePermissions.map(String)}
                    >
                      {groupPermissions.map((permission) => (
                        <Checkbox
                          key={permission.PermissionId}
                          value={String(permission.PermissionId)}
                          isSelected={newRolePermissions.some(
                            (p) => p.PermissionId === permission.PermissionId
                          )}
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
        <div className="py-3 text-right">
          <Button
            color="primary"
            className="text-white"
            radius="full"
            startContent={!isAddingData && <SaveIcon />}
            isDisabled={checkAllDataCompiled()}
            isLoading={isAddingData}
            onClick={handleCreateNewRole}
          >
            {isAddingData ? "Salvando il ruolo..." : "Salva ruolo"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddRoleModel;
