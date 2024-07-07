import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import {
  Input,
  Autocomplete,
  AutocompleteItem,
  Button,
} from "@nextui-org/react";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";

interface Employee {
  EmployeeName: string;
  EmployeeSurname: string;
  EmployeeEmail: string;
  EmployeePhone: string;
  EmployeePassword: string;
}

interface Role {
  RoleId: number;
  RoleName: string;
  RoleDescription: string;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

const initialEmployeeData: Employee = {
  EmployeeName: "",
  EmployeeSurname: "",
  EmployeeEmail: "",
  EmployeePhone: "",
  EmployeePassword: "",
};

const initialAlertData: AlertData = {
  isOpen: false,
  alertTitle: "",
  alertDescription: "",
  alertColor: "",
};

export default function AddEmployeeModel() {
  const [employeeData, setEmployeeData] =
    useState<Employee>(initialEmployeeData);
  const [selectedRole, setSelectedRole] = useState<number>(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(initialAlertData);

  useEffect(() => {
    axios
      .get("/Permission/GET/GetAllRoles")
      .then((res) => setRoles(res.data))
      .catch((error) => console.error("Errore nel recupero dei ruoli:", error));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue =
      name === "EmployeePhone"
        ? value.replace(/\D/g, "").slice(0, 10)
        : value.slice(0, 150);
    setEmployeeData((prevData) => ({ ...prevData, [name]: newValue }));
  };

  const handleRoleChange = (key: string | number | null) => {
    if (key !== null) {
      setSelectedRole(Number(key));
    }
  };

  const checkAllDataCompiled = () => {
    return !(
      employeeData.EmployeeName &&
      employeeData.EmployeeSurname &&
      employeeData.EmployeeEmail &&
      employeeData.EmployeePhone &&
      selectedRole !== 0
    );
  };

  const generateRandomPassword = (length: number) => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]|;:,.<>?";
    return Array.from(
      { length },
      () => charset[Math.floor(Math.random() * charset.length)]
    ).join("");
  };

  const handleCreateNewEmployee = async () => {
    try {
      setIsAddingData(true);
      const password = generateRandomPassword(14);

      const res = await axios.post("/Staffer/POST/AddStaffer", {
        EmployeeData: { ...employeeData, EmployeePassword: password },
        SelectedRole: { RoleId: selectedRole },
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il dipendente è stato aggiunto con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/administration/employee";
        }, 2000);
      }
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante l'aggiunta del dipendente. Per favore, riprova più tardi.",
        alertColor: "red",
      });
      setTimeout(() => {
        window.location.href = "/administration/employee";
      }, 2000);
    } finally {
      setIsAddingData(false);
    }
  };

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
                  In questo pannello potrai aggiungere un nuovo dipendente al
                  database.
                </p>
              </div>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="EmployeeName"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Nome
                  </label>
                  <Input
                    variant="bordered"
                    type="text"
                    radius="sm"
                    name="EmployeeName"
                    value={employeeData.EmployeeName}
                    onChange={handleChange}
                    aria-label="Nome"
                    fullWidth
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="EmployeeSurname"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Cognome
                  </label>
                  <Input
                    variant="bordered"
                    type="text"
                    radius="sm"
                    name="EmployeeSurname"
                    value={employeeData.EmployeeSurname}
                    onChange={handleChange}
                    aria-label="Cognome"
                    fullWidth
                  />
                </div>
                <div className="col-span-6 sm:col-span-6">
                  <label
                    htmlFor="EmployeeEmail"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Email
                  </label>
                  <Input
                    variant="bordered"
                    type="email"
                    radius="sm"
                    name="EmployeeEmail"
                    value={employeeData.EmployeeEmail}
                    onChange={handleChange}
                    aria-label="Email"
                    fullWidth
                  />
                </div>
                <div className="col-span-6 sm:col-span-6">
                  <label
                    htmlFor="EmployeePhone"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Numero di telefono
                  </label>
                  <Input
                    variant="bordered"
                    type="text"
                    radius="sm"
                    name="EmployeePhone"
                    value={employeeData.EmployeePhone}
                    onChange={handleChange}
                    aria-label="Numero di telefono"
                    fullWidth
                  />
                </div>
                <div className="col-span-6 sm:col-span-6">
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Ruolo
                  </label>
                  <Autocomplete
                    placeholder="Seleziona ruolo"
                    onSelectionChange={handleRoleChange}
                    selectedKey={selectedRole}
                    variant="bordered"
                    radius="sm"
                    aria-label="Ruolo"
                    fullWidth
                  >
                    {roles.map((role) => (
                      <AutocompleteItem
                        key={role.RoleId}
                        textValue={role.RoleName}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-small">{role.RoleName}</span>
                            <span className="text-tiny text-default-400">
                              {role.RoleDescription}
                            </span>
                          </div>
                        </div>
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
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
                onClick={handleCreateNewEmployee}
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
