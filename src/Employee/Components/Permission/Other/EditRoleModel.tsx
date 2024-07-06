import React, { useEffect, useState } from "react";
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

export default function EditRoleModel() {
  const { RoleId } = useParams<{ RoleId: string }>();
  const [permissionGroup, setPermissionGroup] = useState<PermissionGroup[]>([]);
  const [permissions, setPermissions] = useState<Permissions[]>([]);
  const [roleData, setRoleData] = useState<Role>({
    RoleName: "",
    RoleDescription: "",
  });
  const [initialRoleData, setInitialRoleData] = useState<Role>({
    RoleName: "",
    RoleDescription: "",
  });
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [initialRolePermissions, setInitialRolePermissions] = useState<
    number[]
  >([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

  useEffect(() => {
    axios
      .get("/Permission/GET/GetPermissionGroups")
      .then((res) => {
        setPermissionGroup(res.data);
      })
      .catch((error) => {
        console.error("Errore durante il fetch dei gruppi di permessi:", error);
      });

    axios
      .get("/Permission/GET/GetAllPermissions")
      .then((res) => {
        setPermissions(res.data);
      })
      .catch((error) => {
        console.error("Errore durante il fetch di tutti i permessi:", error);
      });

    axios
      .get(`/Permission/GET/GetRoleById`, {
        params: { RoleId: RoleId },
      })
      .then((res) => {
        const role = res.data;
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
            (perm: any) => perm.PermissionId
          );
          setRolePermissions(permissionIds);
          setInitialRolePermissions(permissionIds);
        }
      })
      .catch((error) => {
        console.error("Errore durante il fetch dei dati del ruolo:", error);
      });
  }, [RoleId]);

  function handleRoleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setRoleData({ ...roleData, RoleName: e.target.value });
    }
  }

  function handleRoleDescriptionChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    if (e.target.value.length <= 150) {
      setRoleData({ ...roleData, RoleDescription: e.target.value });
    }
  }

  function handleCheckboxChange(value: string, checked: boolean) {
    const permissionId = parseInt(value);
    if (checked) {
      setRolePermissions((prev) => [...prev, permissionId]);
    } else {
      setRolePermissions((prev) => prev.filter((id) => id !== permissionId));
    }
  }

  function checkAllDataCompiled() {
    return (
      rolePermissions.length === 0 ||
      (roleData.RoleName === initialRoleData.RoleName &&
        roleData.RoleDescription === initialRoleData.RoleDescription &&
        rolePermissions.length === initialRolePermissions.length &&
        rolePermissions.every((id) => initialRolePermissions.includes(id)))
    );
  }

  async function handleUpdateRole() {
    try {
      setIsAddingData(true);
      const res = await axios.put("/Permission/UPDATE/UpdateRole", {
        RoleId: RoleId,
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

      setTimeout(() => {
        window.location.href = "/administration/permission";
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
                  variant="bordered"
                  type="text"
                  radius="sm"
                  value={roleData.RoleName}
                  onChange={handleRoleNameChange}
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
                  variant="bordered"
                  type="text"
                  radius="sm"
                  value={roleData.RoleDescription}
                  onChange={handleRoleDescriptionChange}
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

                    if (groupPermissions.length === 0) {
                      return null;
                    }

                    return (
                      <CheckboxGroup
                        className="mt-5"
                        label={group.GroupName}
                        key={group.GroupName}
                        value={rolePermissions.map(String)}
                      >
                        {groupPermissions.map((permission) => (
                          <Checkbox
                            isSelected={rolePermissions.includes(
                              permission.PermissionId
                            )}
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
              onClick={handleUpdateRole}
            >
              {isAddingData ? "Aggiornando il ruolo..." : "Aggiorna ruolo"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
