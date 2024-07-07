import React, { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Input,
  Button,
  Textarea,
  CheckboxGroup,
  Checkbox,
} from "@nextui-org/react";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";

interface Role {
  RoleName: string;
  RoleDescription: string;
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

const initialRoleDataStruct: Role = { RoleName: "", RoleDescription: "" };

const initialAlertData: AlertData = {
  isOpen: false,
  alertTitle: "",
  alertDescription: "",
  alertColor: "",
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
  const [alertData, setAlertData] = useState<AlertData>(initialAlertData);

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
          });
          setInitialRoleData({
            RoleName: role.RoleName,
            RoleDescription: role.RoleDescription,
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
          alertTitle: "Operazione completata",
          alertDescription: "Il ruolo è stato aggiornato con successo.",
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
          "Si è verificato un errore durante l'aggiornamento del ruolo. Per favore, riprova più tardi.",
        alertColor: "red",
      });
      console.error("Errore durante l'aggiornamento del ruolo:", error);
    } finally {
      setIsAddingData(false);
    }
  };

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <div className="border border-gray-200 sm:overflow-hidden rounded-xl">
          <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Modifica ruolo
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                In questo pannello potrai modificare il ruolo esistente nel
                database.
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
                  radius="sm"
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
                  radius="sm"
                  value={roleData.RoleDescription}
                  onChange={handleRoleChange("RoleDescription")}
                  fullWidth
                />
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
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button
              color="success"
              className="text-white"
              radius="sm"
              startContent={!isAddingData && <SaveIcon />}
              isDisabled={checkAllDataCompiled()}
              isLoading={isAddingData}
              onClick={handleUpdateRole}
            >
              {isAddingData ? "Aggiornando il ruolo..." : "Aggiorna ruolo"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditRoleModel;
