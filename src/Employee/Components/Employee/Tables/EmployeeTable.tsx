import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Pagination,
  SortDescriptor,
  Link,
} from "@heroui/react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import axios from "axios";
import ViewEmployeeModal from "../Other/ViewEmployeeModal";
import ConfirmDeleteModal from "../Other/ConfirmDeleteModal";
import { usePermissions } from "../../Layout/PermissionProvider";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import StatusAlert from "../../Layout/StatusAlert";

interface Employee {
  EmployeeId: number;
  EmployeeFullName: string;
  EmployeeEmail: string;
  EmployeePhone: string;
  RoleName: string;
  EmployeeImageUrl?: string;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

interface ModalData {
  Employee: Employee;
  open: boolean;
}

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

const columns = [
  { name: "Nome Dipendente", uid: "EmployeeFullName" },
  { name: "Email Dipendente", uid: "EmployeeEmail" },
  { name: "Telefono Dipendente", uid: "EmployeePhone" },
  { name: "Ruolo", uid: "RoleName" },
  { name: "Azioni", uid: "actions" },
];

export default function EmployeeTable() {
  const employeeId = !isNaN(Number(useParams().EmployeeId))
    ? useParams().EmployeeId
    : null;
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const [adminEmployeePermission, setAdminEmployeePermission] = useState({
    addEmployeePermission: false,
    editEmployeePermission: false,
    deleteEmployeePermission: false,
  });
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function checkPermissions() {
      setAdminEmployeePermission({
        addEmployeePermission: await hasPermission("CREATE_EMPLOYEE"),
        editEmployeePermission: await hasPermission("EDIT_EMPLOYEE"),
        deleteEmployeePermission: await hasPermission("DELETE_EMPLOYEE"),
      });
    }
    checkPermissions();
    fetchData();
  }, []);

  const [page, setPage] = useState(1);
  const [modalData, setModalData] = useState<ModalData>({
    Employee: {
      EmployeeId: 0,
      EmployeeFullName: "",
      EmployeeEmail: "",
      EmployeePhone: "",
      RoleName: "",
    },
    open: false,
  });

  function fetchData() {
    axios.get("/Staffer/GET/GetAllStaffers").then((res) => {
      setEmployees(res.data);
      if (employeeId) {
        setModalData({
          ...modalData,
          open: true,
          Employee: res.data.find(
            (employee: Employee) => employee.EmployeeId == parseInt(employeeId)
          ),
        });
      }
    });
  }

  async function SearchEmployee() {
    try {
      const response = await axios.get("/Staffer/GET/SearchStafferByEmail", {
        params: { EmployeeEmail: searchTerm.trim() },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Errore durante la ricerca del dipendente:", error);
    }
  }

  async function DeleteEmployee(EmployeeData: Employee) {
    try {
      const res = await axios.delete("/Staffer/DELETE/DeleteStaffer", {
        params: { EmployeeData: EmployeeData },
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Successo",
          alertDescription: "Dipendente eliminato con successo!",
          alertColor: "green",
        });
        fetchData(); // Refresh data after deletion
      }
    } catch (error) {
      console.error("Errore nella cancellazione del dipendente:", error);

      // Handle specific error messages if necessary
      setAlertData({
        isOpen: true,
        onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
        alertTitle: "Errore",
        alertDescription:
          "Si è verificato un errore durante la cancellazione del dipendente. Per favore, riprova più tardi.",
        alertColor: "red",
      });
    }
  }

  const exportCSV = () => {
    const headers = [
      "ID Dipendente",
      "Nome Dipendente",
      "Email Dipendente",
      "Telefono Dipendente",
      "Ruolo",
    ];

    const wrapInQuotes = (value: any) => {
      return typeof value === "string" ? `"${value}"` : value;
    };

    const sortedEmployees = employees.sort(
      (a, b) => a.EmployeeId - b.EmployeeId
    );

    const rows = sortedEmployees.map((employee) => [
      wrapInQuotes(employee.EmployeeId),
      wrapInQuotes(employee.EmployeeFullName),
      wrapInQuotes(employee.EmployeeEmail),
      wrapInQuotes(employee.EmployeePhone),
      wrapInQuotes(employee.RoleName),
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      headers.map(wrapInQuotes).join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "employees_table.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pages = Math.ceil(employees.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return employees.slice(start, end);
  }, [page, employees, rowsPerPage]);

  const renderCell = React.useCallback(
    (employee: Employee, columnKey: React.Key) => {
      const cellValue = employee[columnKey as keyof Employee];

      switch (columnKey) {
        case "EmployeeFullName":
          return <p>{cellValue}</p>;
        case "EmployeeEmail":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small">{cellValue}</p>
            </div>
          );
        case "EmployeePhone":
          return (
            <div className="flex flex-col">
              {cellValue == "" ? (
                <p className="text-bold text-small capitalize">Non presente</p>
              ) : (
                <p className="text-bold text-small capitalize">
                  +39 {cellValue}
                </p>
              )}
            </div>
          );
        case "RoleName":
          return (
            <span className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium text-gray-900 ring-2 ring-inset ring-gray-200 bg-white">
              <svg
                viewBox="0 0 6 6"
                aria-hidden="true"
                className="h-1.5 w-1.5 fill-blue-500"
              >
                <circle r={3} cx={3} cy={3} />
              </svg>
              {cellValue}
            </span>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Button
                variant="light"
                size="sm"
                color="primary"
                startContent={<RemoveRedEyeOutlinedIcon />}
                aria-label="View"
                aria-labelledby="View"
                isIconOnly
                onClick={() =>
                  setModalData({
                    ...modalData,
                    open: true,
                    Employee: employee,
                  })
                }
              />

              {adminEmployeePermission.deleteEmployeePermission && (
                <ConfirmDeleteModal
                  EmployeeData={employee}
                  DeleteEmployee={DeleteEmployee}
                />
              )}
            </div>
          );
        default:
          return cellValue;
      }
    },
    [adminEmployeePermission]
  );

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between gap-3 items-end">
          <div className="flex flex-row gap-3 w-full">
            <Input
              radius="full"
              variant="bordered"
              startContent={<SearchOutlinedIcon className="text-gray-400" />}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.trim() === "") {
                  fetchData(); // Chiama SearchEmployee se il campo è vuoto
                }
              }}
              value={searchTerm}
              className="md:w-1/3"
              placeholder="Cerca dipendente per email..."
            />

            <Button
              color="primary"
              radius="full"
              endContent={<SearchOutlinedIcon />}
              isDisabled={searchTerm == ""}
              onClick={SearchEmployee}
              className="hidden sm:flex"
            >
              Cerca
            </Button>
            <Button
              color="primary"
              radius="full"
              isDisabled={searchTerm == ""}
              onClick={SearchEmployee}
              className="sm:hidden"
              isIconOnly
            >
              <SearchOutlinedIcon />
            </Button>
          </div>
          <div className="flex gap-3">
            {adminEmployeePermission.addEmployeePermission && (
              <>
                <Button
                  as={Link}
                  href="./employee/add-employee"
                  color="primary"
                  radius="full"
                  startContent={<PersonAddAlt1RoundedIcon />}
                  className="hidden sm:flex"
                >
                  Aggiungi dipendente
                </Button>

                <Button
                  as={Link}
                  href="./employee/add-employee"
                  color="primary"
                  radius="full"
                  isIconOnly
                  className="sm:hidden"
                >
                  <PersonAddAlt1RoundedIcon />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }, [onRowsPerPageChange, employees.length, searchTerm, SearchEmployee]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <div className="w-full">
          {employees.length > 0 && (
            <Button
              color="primary"
              variant="ghost"
              radius="full"
              startContent={<FileDownloadOutlinedIcon />}
              onClick={exportCSV}
            >
              Esporta Tabella
            </Button>
          )}
        </div>

        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          radius="full"
          page={page}
          total={pages || 1}
          onChange={setPage}
          className="w-full flex justify-center"
        />
        <div className="w-full"></div>
      </div>
    );
  }, [items.length, page, pages]);

  return (
    <div className="bg-white">
      <StatusAlert AlertData={alertData} />

      <ViewEmployeeModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        EmployeeData={modalData.Employee}
      />

      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        isHeaderSticky
        isStriped
        bottomContent={bottomContent}
        bottomContentPlacement="inside"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="inside"
        onSortChange={setSortDescriptor}
        radius="lg"
        classNames={{
          wrapper: "border rounded-lg shadow-none",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={
            searchTerm == "" ? (
              <div className="text-center p-10">
                <PersonAddAlt1RoundedIcon sx={{ fontSize: 50 }} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun dipendente trovato!
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Inizia aggiungendo un nuovo dipendente al database.
                </p>
                <div className="mt-6">
                  <Button
                    as={Link}
                    color="primary"
                    radius="full"
                    startContent={<AddRoundedIcon />}
                    href="./employee/add-employee"
                  >
                    Aggiungi dipendente
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-10">
                <PersonAddAlt1RoundedIcon sx={{ fontSize: 50 }} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun dipendente trovato!
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Nessun risultato corrisponde alla tua ricerca:{" "}
                  <span className="font-semibold italic">{searchTerm}</span>
                </p>
              </div>
            )
          }
          items={items}
        >
          {(item) => (
            <TableRow key={item.EmployeeId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
