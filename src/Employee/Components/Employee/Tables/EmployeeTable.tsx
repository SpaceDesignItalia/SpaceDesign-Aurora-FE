// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  SortDescriptor,
  Link,
} from "@nextui-org/react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import axios from "axios";
import ViewEmployeeModal from "../Other/ViewEmployeeModal";
import ConfirmDeleteModal from "../Other/ConfirmDeleteModal";
import { usePermissions } from "../../Layout/PermissionProvider";

interface Employee {
  EmployeeId: number;
  EmployeeFullName: string;
  EmployeeEmail: string;
  EmployeePhone: string;
  RoleName: string;
}

interface ModalData {
  Employee: Employee;
  open: boolean;
}

interface ModalDeleteData {
  Employee: Employee;
  open: boolean;
}

const columns = [
  { name: "Nome Dipendente", uid: "EmployeeFullName" },
  { name: "Email Dipendente", uid: "EmployeeEmail" },
  { name: "Telefono Dipendente", uid: "EmployeePhone" },
  { name: "Ruolo", uid: "RoleName" },
  { name: "Azioni", uid: "actions" },
];

export default function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
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

  function fetchData() {
    axios.get("/Staffer/GET/GetAllStaffers").then((res) => {
      setEmployees(res.data);
    });
  }

  const [page, setPage] = useState(1);
  const [modalData, setModalData] = useState<ModalData>({
    Employee: {
      EmployeeId: 0,
      EmployeeFullName: "",
      EmployeeEmail: "",
      EmployeePhone: "",
    },
    open: false,
  });

  const [modalDeleteData, setModalDeleteData] = useState<ModalDeleteData>({
    Employee: {
      EmployeeId: 0,
      EmployeeFullName: "",
      EmployeeEmail: "",
      EmployeePhone: "",
    },
    open: false,
  });

  async function SearchEmployee(e: { target: { value: string } }) {
    const searchQuery = e.target.value.trim(); // Otteniamo il valore di ricerca e rimuoviamo gli spazi vuoti
    try {
      const response = await axios.get("/Staffer/GET/SearchStafferByEmail", {
        params: { EmployeeEmail: searchQuery },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Errore durante la ricerca del dipendente:", error);
    }
  }

  async function DeleteEmployee(EmployeeData: any) {
    try {
      const res = await axios.delete("/Staffer/DELETE/DeleteStaffer", {
        params: { EmployeeData },
      });

      // Simulazione della chiamata API con setTimeout
      if (res.status === 200) {
        fetchData();
      }
    } catch (error) {
      console.error("Errore nella cancellazione del dipendente:", error);
    }
  }

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
            <span className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium text-gray-900 ring-2 ring-inset ring-gray-200">
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
              <Dropdown radius="sm">
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <MoreVertRoundedIcon />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    color="primary"
                    startContent={<RemoveRedEyeOutlinedIcon />}
                    aria-label="View"
                    aria-labelledby="View"
                    onClick={() =>
                      setModalData({
                        ...modalData,
                        open: true,
                        Employee: employee,
                      })
                    }
                  >
                    Visualizza
                  </DropdownItem>
                  {adminEmployeePermission.editEmployeePermission && (
                    <DropdownItem
                      color="warning"
                      startContent={<ModeOutlinedIcon />}
                      aria-label="Edit"
                      aria-labelledby="Edit"
                      href={
                        "/administration/employee/edit-employee/" +
                        employee.EmployeeId
                      }
                    >
                      Modifica
                    </DropdownItem>
                  )}

                  {adminEmployeePermission.deleteEmployeePermission && (
                    <DropdownItem
                      color="danger"
                      startContent={<DeleteOutlinedIcon />}
                      aria-label="Remove"
                      aria-labelledby="Remove"
                      onClick={() =>
                        setModalDeleteData({
                          ...modalDeleteData,
                          open: true,
                          Employee: employee,
                        })
                      }
                    >
                      Rimuovi
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
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
          <Input
            radius="full"
            variant="bordered"
            startContent={<SearchOutlinedIcon className="text-gray-400" />}
            onChange={SearchEmployee}
            className="md:w-1/3"
            placeholder="Cerca dipendente per email..."
          />
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
                  radius="sm"
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
  }, [onRowsPerPageChange, employees.length]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-center items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          radius="full"
          page={page}
          total={pages || 1}
          onChange={setPage}
        />
      </div>
    );
  }, [items.length, page, pages]);

  return (
    <div className="bg-white">
      <ViewEmployeeModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        EmployeeData={modalData.Employee}
      />
      <ConfirmDeleteModal
        isOpen={modalDeleteData.open}
        isClosed={() => setModalDeleteData({ ...modalDeleteData, open: false })}
        EmployeeData={modalDeleteData.Employee}
        DeleteEmployee={DeleteEmployee}
      />

      {employees.length > 0 ? (
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
          radius="full"
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
          <TableBody emptyContent={"Nessun dipendente trovato!"} items={items}>
            {(item) => (
              <TableRow key={item.EmployeeId}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-20">
          <PersonAddAlt1RoundedIcon sx={{ fontSize: 50 }} />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Nessun dipendente registrato
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Inizia aggiungendo nuovi dipendenti per visualizzarne i dettagli e
            accedere alle analisi.
          </p>
          <div className="mt-6">
            <Button
              as={Link}
              color="primary"
              radius="full"
              startContent={<AddRoundedIcon />}
              href="./employee/add-employee"
            >
              Aggiungi un nuovo dipendente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
