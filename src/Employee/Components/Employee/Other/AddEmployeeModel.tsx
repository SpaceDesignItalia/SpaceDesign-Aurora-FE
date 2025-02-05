import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { Input, Autocomplete, AutocompleteItem, Button } from "@heroui/react";
import StatusAlert from "../../Layout/StatusAlert";
import { Icon } from "@iconify/react";

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
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}
const initialEmployeeData: Employee = {
  EmployeeName: "",
  EmployeeSurname: "",
  EmployeeEmail: "",
  EmployeePhone: "",
  EmployeePassword: "",
};

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function AddEmployeeModel() {
  const [employeeData, setEmployeeData] =
    useState<Employee>(initialEmployeeData);
  const [selectedRole, setSelectedRole] = useState<number>(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);

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
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "Il dipendente è stato aggiunto con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/administration/employee";
        }, 2000);
      }
    } catch (error) {
      console.error("Errore durante l'aggiunta del dipendente:", error);
      // Check if error is an Axios error
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Conflitto durante l'operazione",
            alertDescription: "Un dipendente con la stessa email esiste già.",
            alertColor: "yellow",
          });
        } else {
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Errore durante l'operazione",
            alertDescription:
              "Si è verificato un errore durante l'aggiunta del dipendente. Per favore, riprova più tardi.",
            alertColor: "red",
          });
        }
      } else {
        // Handle non-Axios errors
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Errore durante l'operazione",
          alertDescription:
            "Si è verificato un errore imprevisto. Riprova più tardi.",
          alertColor: "red",
        });
      }
    } finally {
      setIsAddingData(false);
    }
  };

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 lg:col-span-9">
        <form>
          <div className="space-y-6 bg-white py-6">
            <div>
              <h3 className="text-base font-medium leading-6 text-gray-900">
                Dipendente
              </h3>
              <p className="mt-1 text-sm text-gray-500 w-1/3">
                In questo pannello potrai aggiungere un nuovo dipendente al
                database. I campi contrassegnati con un asterisco (
                <span className="text-danger font-semibold">*</span>) sono
                obbligatori.
              </p>
            </div>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="EmployeeName"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nome <span className="text-danger font-semibold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="full"
                  name="EmployeeName"
                  placeholder="Es. Mario"
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
                  Cognome <span className="text-danger font-semibold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="full"
                  name="EmployeeSurname"
                  placeholder="Es. Rossi"
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
                  Email <span className="text-danger font-semibold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="email"
                  radius="full"
                  name="EmployeeEmail"
                  placeholder="Es. mario.rossi@mail.com"
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
                  radius="full"
                  name="EmployeePhone"
                  value={employeeData.EmployeePhone}
                  placeholder="Es. 0123456789"
                  onChange={handleChange}
                  aria-label="Numero di telefono"
                  fullWidth
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Ruolo <span className="text-danger font-semibold">*</span>
                </label>
                <Autocomplete
                  placeholder="Seleziona ruolo"
                  onSelectionChange={handleRoleChange}
                  selectedKey={String(selectedRole)}
                  variant="bordered"
                  radius="full"
                  aria-label="Ruolo"
                  listboxProps={{
                    emptyContent: "Nessun ruolo trovato",
                  }}
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
          <div className="py-3 text-right">
            <Button
              color="primary"
              className="text-white"
              radius="full"
              startContent={<Icon icon="basil:save-outline" fontSize={24} />}
              isDisabled={checkAllDataCompiled()}
              isLoading={isAddingData}
              onClick={handleCreateNewEmployee}
            >
              {isAddingData
                ? "Salvando il dipendente..."
                : "Aggiungi dipendente"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
