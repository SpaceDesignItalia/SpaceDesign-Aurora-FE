import SaveIcon from "@mui/icons-material/Save";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
} from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState, ChangeEvent } from "react";
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

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

const initialEmployeeDataStruct: Employee = {
  EmployeeId: 0,
  EmployeeName: "",
  EmployeeSurname: "",
  EmployeeEmail: "",
  EmployeePhone: "",
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
        const employee = res.data[0];
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
          alertTitle: "Operazione completata",
          alertDescription: "Il dipendente è stato modificato con successo.",
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
          "Si è verificato un errore durante la modifica del dipendente. Per favore, riprova più tardi.",
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
                  In questo pannello potrai modificare un dipendente dal
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
                    value={newEmployeeData.EmployeeName}
                    onChange={handleChange}
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
                    value={newEmployeeData.EmployeeSurname}
                    onChange={handleChange}
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
                    radius="sm"
                    name="EmployeePhone"
                    value={newEmployeeData.EmployeePhone}
                    onChange={handleChange}
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
                    selectedKey={String(selectedRole)}
                    variant="bordered"
                    radius="sm"
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
