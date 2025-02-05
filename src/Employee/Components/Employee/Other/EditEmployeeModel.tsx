import { Autocomplete, AutocompleteItem, Button, Input } from "@heroui/react";
import axios from "axios";
import { useEffect, useState, ChangeEvent } from "react";
import StatusAlert from "../../Layout/StatusAlert";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";

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

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const initialEmployeeDataStruct: Employee = {
  EmployeeId: 0,
  EmployeeName: "",
  EmployeeSurname: "",
  EmployeeEmail: "",
  EmployeePhone: "",
};

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function EditEmployeeModel() {
  const { EmployeeId } = useParams();
  const [newEmployeeData, setNewEmployeeData] = useState<Employee>(
    initialEmployeeDataStruct
  );
  const [initialEmployeeData, setInitialEmployeeData] = useState<Employee>(
    initialEmployeeDataStruct
  );
  const [selectedRole, setSelectedRole] = useState<number>(0);
  const [initialRole, setInitialRole] = useState<number>(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);

  useEffect(() => {
    axios
      .get("/Staffer/GET/GetStafferById", { params: { EmployeeId } })
      .then((res) => {
        const employee = res.data;
        setInitialEmployeeData(employee);
        setNewEmployeeData(employee);
      });

    axios
      .get("/Staffer/GET/GetStafferRoleById", { params: { EmployeeId } })
      .then((res) => {
        const roleId = res.data[0].RoleId;
        setSelectedRole(roleId);
        setInitialRole(roleId);
      });

    axios.get("/Permission/GET/GetAllRoles").then((res) => setRoles(res.data));
  }, [EmployeeId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployeeData((prevData) => ({
      ...prevData,
      [name]:
        name === "EmployeePhone"
          ? value.replace(/\D/g, "").slice(0, 15)
          : value.slice(0, 150),
    }));
  };

  const handleRoleChange = (key: string | number | null) => {
    if (key !== null) {
      setSelectedRole(Number(key));
    }
  };

  const checkAllDataCompiled = () => {
    return (
      newEmployeeData.EmployeeName === initialEmployeeData.EmployeeName &&
      newEmployeeData.EmployeeSurname === initialEmployeeData.EmployeeSurname &&
      newEmployeeData.EmployeeEmail === initialEmployeeData.EmployeeEmail &&
      newEmployeeData.EmployeePhone === initialEmployeeData.EmployeePhone &&
      selectedRole === initialRole
    );
  };

  const handleEditEmployee = async () => {
    try {
      setIsAddingData(true);
      const res = await axios.put("/Staffer/UPDATE/UpdateStaffer", {
        newEmployeeData,
        selectedRole,
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "Il dipendente è stato modificato con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/administration/employee";
        }, 2000);
      }
    } catch (error) {
      console.error("Errore durante la modifica del dipendente:", error);

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
              "Si è verificato un errore durante la modifica del dipendente. Per favore, riprova più tardi.",
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
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Dipendente
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                In questo pannello potrai modificare un dipendente dal database.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="EmployeeName"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nome <span className="text-danger font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="full"
                  name="EmployeeName"
                  value={newEmployeeData.EmployeeName}
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="EmployeeSurname"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Cognome <span className="text-danger font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="full"
                  name="EmployeeSurname"
                  value={newEmployeeData.EmployeeSurname}
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="EmployeeEmail"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email <span className="text-danger font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="email"
                  radius="full"
                  name="EmployeeEmail"
                  value={newEmployeeData.EmployeeEmail}
                  onChange={handleChange}
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
                  value={newEmployeeData.EmployeePhone}
                  onChange={handleChange}
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Ruolo <span className="text-danger font-bold">*</span>
                </label>
                <Autocomplete
                  placeholder="Seleziona ruolo"
                  onSelectionChange={handleRoleChange}
                  selectedKey={String(selectedRole)}
                  variant="bordered"
                  radius="full"
                  fullWidth
                >
                  {roles.map((role) => (
                    <AutocompleteItem
                      key={role.RoleId}
                      textValue={role.RoleName}
                    >
                      <div className="flex flex-col">
                        <span className="text-small">{role.RoleName}</span>
                        <span className="text-tiny text-default-400">
                          {role.RoleDescription}
                        </span>
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
              onClick={handleEditEmployee}
            >
              {isAddingData
                ? "Salvando il dipendente..."
                : "Modifica dipendente"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
