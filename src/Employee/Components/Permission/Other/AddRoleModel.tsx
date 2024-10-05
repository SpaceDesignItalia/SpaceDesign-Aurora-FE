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
  alertColor: "green" | "red" | "yellow";
}

const initialRoleData: Role = {
  RoleName: "",
  RoleDescription: "",
};

const initialAlertData: AlertData = {
  isOpen: false,
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

const AddRoleModel: React.FC = () => {
  const [permissionGroup, setPermissionGroup] = useState<PermissionGroup[]>([]);
  const [permissions, setPermissions] = useState<Permissions[]>([]);
  const [newRole, setNewRole] = useState<Role>(initialRoleData);
  const [newRolePermissions, setNewRolePermissions] = useState<
    RolePermission[]
  >([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(initialAlertData);

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

  const checkAllDataCompiled = () => {
    return !(
      newRole.RoleName &&
      newRole.RoleDescription &&
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

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il ruolo è stato aggiunto con successo.",
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
          "Si è verificato un errore durante l'aggiunta del ruolo. Per favore, riprova più tardi.",
        alertColor: "red",
      });
      console.error("Errore durante la creazione del ruolo:", error);
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
            <p className="mt-1 text-sm text-gray-500 w-1/3">
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
              />
            </div>

            <div className="col-span-6 sm:col-span-6">
              <label
                htmlFor="role-permissions"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Permessi associati{" "}
                <span className="text-red-600 font-bold">*</span>
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
                      radius="full"
                      label={group.GroupName}
                      key={group.GroupName}
                    >
                      {groupPermissions.map((permission) => (
                        <Checkbox
                          key={permission.PermissionId}
                          value={String(permission.PermissionId)}
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
