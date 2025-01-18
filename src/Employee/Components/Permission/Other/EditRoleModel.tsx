import React, { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Input,
  Button,
  Textarea,
  CheckboxGroup,
  Checkbox,
  Select,
  SelectItem,
} from "@heroui/react";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";

interface Role {
  RoleName: string;
  RoleDescription: string;
  RolePriority: number;
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
  alertColor: "green" | "red" | "yellow";
}

const initialRoleDataStruct: Role = {
  RoleName: "",
  RoleDescription: "",
  RolePriority: 0,
};

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};
const EditRoleModel: React.FC = () => {
  const { RoleId } = useParams<{ RoleId: string }>();
  const [permissionGroup, setPermissionGroup] = useState<PermissionGroup[]>([]);
  const [permissions, setPermissions] = useState<Permissions[]>([]);
  const [roleData, setRoleData] = useState<Role>(initialRoleDataStruct);
  const [initialRoleData, setInitialRoleData] = useState<Role>(
    initialRoleDataStruct
  );
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [initialRolePermissions, setInitialRolePermissions] = useState<
    number[]
  >([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, permsRes, roleRes] = await Promise.all([
          axios.get("/Permission/GET/GetPermissionGroups"),
          axios.get("/Permission/GET/GetAllPermissions"),
          axios.get(`/Permission/GET/GetRoleById`, { params: { RoleId } }),
        ]);

        setPermissionGroup(groupsRes.data);
        setPermissions(permsRes.data);

        const role = roleRes.data;
        if (role) {
          setRoleData({
            RoleName: role.RoleName,
            RoleDescription: role.RoleDescription,
            RolePriority: role.RolePriority,
          });
          setInitialRoleData({
            RoleName: role.RoleName,
            RoleDescription: role.RoleDescription,
            RolePriority: role.RolePriority,
          });

          const permissionIds = role.permissions.map(
            (perm: { PermissionId: number }) => perm.PermissionId
          );
          setRolePermissions(permissionIds);
          setInitialRolePermissions(permissionIds);
        }
      } catch (error) {
        console.error("Errore durante il fetch dei dati:", error);
      }
    };

    fetchData();
  }, [RoleId]);

  const handleRoleChange =
    (key: keyof Role) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setRoleData({ ...roleData, [key]: e.target.value });
    };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const permissionId = parseInt(value);
    setRolePermissions((prev) =>
      checked
        ? [...prev, permissionId]
        : prev.filter((id) => id !== permissionId)
    );
  };

  const checkAllDataCompiled = () => {
    return (
      rolePermissions.length === 0 ||
      (roleData.RoleName === initialRoleData.RoleName &&
        roleData.RoleDescription === initialRoleData.RoleDescription &&
        roleData.RolePriority === initialRoleData.RolePriority &&
        rolePermissions.length === initialRolePermissions.length &&
        rolePermissions.every((id) => initialRolePermissions.includes(id)))
    );
  };

  const handleUpdateRole = async () => {
    try {
      setIsAddingData(true);
      const res = await axios.put("/Permission/UPDATE/UpdateRole", {
        RoleId,
        RoleData: roleData,
        RolePermissionData: rolePermissions.map((id) => ({ PermissionId: id })),
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "Il ruolo è stato aggiornato con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/administration/permission";
        }, 2000);
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento del ruolo:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          // Handle conflict error (409)
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Conflitto durante l'operazione",
            alertDescription:
              "Un altro ruolo ha già lo stesso nome. Scegli un nome diverso.",
            alertColor: "yellow",
          });
        } else {
          // General error handling
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Errore durante l'operazione",
            alertDescription:
              "Si è verificato un errore durante l'aggiornamento del ruolo. Per favore, riprova più tardi.",
            alertColor: "red",
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
              Modifica ruolo
            </h3>
            <p className="mt-1 text-sm text-gray-500 w-1/3">
              In questo pannello potrai modificare il ruolo esistente nel
              database. I campi contrassegnati con un asterisco (
              <span className="text-danger font-bold">*</span>) sono
              obbligatori. Assicurati di aggiornare tutte le informazioni
              necessarie prima di procedere.
            </p>
          </div>

          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-6">
              <label
                htmlFor="role-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Nome ruolo
              </label>
              <Input
                id="role-name"
                variant="bordered"
                type="text"
                radius="full"
                value={roleData.RoleName}
                onChange={handleRoleChange("RoleName")}
                fullWidth
              />
            </div>

            <div className="col-span-6 sm:col-span-6">
              <label
                htmlFor="role-description"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Descrizione
              </label>
              <Textarea
                id="role-description"
                variant="bordered"
                radius="full"
                value={roleData.RoleDescription}
                onChange={handleRoleChange("RoleDescription")}
                fullWidth
              />
            </div>

            <div className="col-span-6 sm:col-span-2">
              <label
                htmlFor="role-priority"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Grado priorità ruolo{" "}
              </label>
              <Select
                disallowEmptySelection
                selectedKeys={[String(roleData.RolePriority)]}
                label="Selezionare grado"
                id="role-priority"
                variant="bordered"
                radius="lg"
                aria-label="Selezionare grado"
                onChange={(e) =>
                  setRoleData({
                    ...roleData,
                    RolePriority: Number(e.target.value),
                  })
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
                Permessi associati
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-0 justify-between mt-3">
                {permissionGroup.map((group) => {
                  const groupPermissions = permissions.filter(
                    (permission) => permission.GroupName === group.GroupName
                  );

                  if (groupPermissions.length === 0) return null;

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
                          isSelected={rolePermissions.includes(
                            permission.PermissionId
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
            onClick={handleUpdateRole}
          >
            {isAddingData ? "Aggiornando il ruolo..." : "Aggiorna ruolo"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default EditRoleModel;
