import SaveIcon from "@mui/icons-material/Save";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  select,
} from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import StatusAlert from "../../Layout/StatusAlert";
import { useParams } from "react-router-dom";

interface Employee {
  EmployeeId: number;
  EmployeeName: string;
  EmployeeSurname: string;
  EmployeeEmail: string;
  EmployeePhone: string;
}

interface Role {
  RoleId: number;
  RoleName: string;
  RoleDescription: string;
}

interface SelectedRole {
  RoleId: number;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

export default function EditEmployeeModel() {
  const { EmployeeId } = useParams();
  const [newEmployeeData, setNewEmployeeData] = useState<Employee>({
    EmployeeId: 0,
    EmployeeName: "",
    EmployeeSurname: "",
    EmployeeEmail: "",
    EmployeePhone: "",
  });
  const [initialEmployeeData, setInitialEmployeeData] = useState<Employee>({
    EmployeeId: 0,
    EmployeeName: "",
    EmployeeSurname: "",
    EmployeeEmail: "",
    EmployeePhone: "",
  });
  const [selectedRole, setSelectedRole] = useState<SelectedRole>({
    RoleId: 0,
  });
  const [initialSelectedRole, setInitialSelectedRole] = useState<SelectedRole>({
    RoleId: 0,
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

  useEffect(() => {
    axios
      .get("/Staffer/GET/GetStafferById", { params: { EmployeeId } })
      .then((res) => {
        setInitialEmployeeData(res.data[0]);
        setNewEmployeeData(res.data[0]);
      });
    axios
      .get("/Staffer/GET/GetStafferRoleById", { params: { EmployeeId } })
      .then((res) => {
        setInitialSelectedRole({
          ...initialSelectedRole,
          RoleId: res.data[0].RoleId,
        });
        setSelectedRole({ ...selectedRole, RoleId: res.data[0].RoleId });
      });
    axios.get("/Permission/GET/GetAllRoles").then((res) => {
      setRoles(res.data);
    });
  }, []);

  function handleEmployeeNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setNewEmployeeData({ ...newEmployeeData, EmployeeName: e.target.value });
    }
  }

  function handleEmployeeSurnameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setNewEmployeeData({
        ...newEmployeeData,
        EmployeeSurname: e.target.value,
      });
    }
  }

  function handleEmployeeEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 100) {
      setNewEmployeeData({ ...newEmployeeData, EmployeeEmail: e.target.value });
    }
  }

  function handleEmployeePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value.replace(/\D/g, ""); // Rimuove tutti i caratteri non numerici
    if (input.length <= 15) {
      setNewEmployeeData({ ...newEmployeeData, EmployeePhone: input });
    }
  }

  function handleEmployeeRoleId(e: React.Key) {
    setSelectedRole({ ...selectedRole, RoleId: parseInt(String(e)) });
  }

  function checkAllDataCompiled() {
    if (
      newEmployeeData.EmployeeName !== initialEmployeeData.EmployeeName ||
      newEmployeeData.EmployeeSurname !== initialEmployeeData.EmployeeSurname ||
      newEmployeeData.EmployeeEmail !== initialEmployeeData.EmployeeEmail ||
      newEmployeeData.EmployeePhone !== initialEmployeeData.EmployeePhone ||
      selectedRole.RoleId !== initialSelectedRole.RoleId
    ) {
      return false;
    }
    return true;
  }

  async function handleEditEmployee() {
    try {
      setIsAddingData(true);

      const res = await axios.put("/Staffer/UPDATE/UpdateStaffer", {
        newEmployeeData,
        selectedRole,
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il dipendente è stato modificato con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/administration/employee";
        }, 2000);
        console.log("Successo:", res.data);
      }
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante la modifica del dipendente. Per favore, riprova più tardi.",
        alertColor: "red",
      });

      setTimeout(() => {
        window.location.href = "/administration/employee";
      }, 2000);
      console.error("Errore durante la modifica del dipendente:", error);
    } finally {
      setIsAddingData(false);
    }
  }

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <form>
          <div className="border border-gray-200 sm:overflow-hidden rounded-xl">
            <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
              <div>
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Dipendente
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  In questo pannello potrai modificare un dipendente dal
                  database.
                </p>
              </div>

              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="Name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Nome
                  </label>
                  <Input
                    variant="bordered"
                    type="text"
                    radius="sm"
                    value={newEmployeeData.EmployeeName}
                    onChange={handleEmployeeNameChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Cognome
                  </label>
                  <Input
                    variant="bordered"
                    type="text"
                    radius="sm"
                    value={newEmployeeData.EmployeeSurname}
                    onChange={handleEmployeeSurnameChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-6">
                  <label
                    htmlFor="email-address"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Email
                  </label>
                  <Input
                    variant="bordered"
                    type="email"
                    radius="sm"
                    value={newEmployeeData.EmployeeEmail}
                    onChange={handleEmployeeEmailChange}
                    aria-label="Email"
                    fullWidth
                  />
                </div>

                <div className="col-span-6 sm:col-span-6">
                  <label
                    htmlFor="email-address"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Numero di telefono
                  </label>
                  <Input
                    variant="bordered"
                    type="text"
                    radius="sm"
                    value={newEmployeeData.EmployeePhone}
                    onChange={handleEmployeePhoneChange}
                    fullWidth
                  />
                </div>

                <div className="col-span-6 sm:col-span-6">
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Ruolo
                  </label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <Autocomplete
                      placeholder="Seleziona ruolo"
                      onSelectionChange={handleEmployeeRoleId}
                      selectedKey={String(selectedRole.RoleId)}
                      variant="bordered"
                      radius="sm"
                      aria-label="company"
                      fullWidth
                    >
                      {roles.map((role) => (
                        <AutocompleteItem
                          key={role.RoleId}
                          textValue={role.RoleName}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2 items-center">
                              <div className="flex flex-col">
                                <span className="text-small">
                                  {role.RoleName}
                                </span>
                                <span className="text-tiny text-default-400">
                                  {role.RoleDescription}
                                </span>
                              </div>
                            </div>
                          </div>
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <Button
                color="success"
                className="text-white"
                radius="sm"
                startContent={<SaveIcon />}
                isDisabled={checkAllDataCompiled()}
                isLoading={isAddingData}
                onClick={handleEditEmployee}
              >
                {isAddingData
                  ? "Salvando il dipendente..."
                  : "Salva dipendente"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
