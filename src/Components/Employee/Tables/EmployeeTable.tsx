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
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import axios from "axios";
import ViewEmployeeModal from "../Other/ViewEmployeeModal";
import ConfirmDeleteModal from "../Other/ConfirmDeleteModal";

interface Employee {
  EmployeeId: number;
  EmployeeFullName: string;
  EmployeeEmail: string;
  EmployeePhone: string;
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
  { name: "ID", uid: "EmployeeId" },
  { name: "Nome Dipendente", uid: "EmployeeFullName" },
  { name: "Email Dipendente", uid: "EmployeeEmail" },
  { name: "Telefono Dipendente", uid: "EmployeePhone" },
  { name: "Azioni", uid: "actions" },
];

export default function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });

  useEffect(() => {
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
      console.log(EmployeeData);
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
        case "name":
          return <p>{cellValue}</p>;
        case "company":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{cellValue}</p>
            </div>
          );
        case "phone":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{cellValue}</p>
            </div>
          );
        case "actions":
          return (
            <div className="relative flex justify-left items-center gap-2">
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
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    []
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
        <div className="flex justify-between gap-3 items-end">
          <Input
            radius="sm"
            variant="bordered"
            startContent={<SearchOutlinedIcon />}
            onChange={SearchEmployee}
            className="w-1/3"
            placeholder="Cerca dipendente per email..."
          />
          <div className="flex gap-3">
            <Button
              as={Link}
              href="./employee/add-employee"
              color="primary"
              radius="sm"
              startContent={<PersonAddAlt1RoundedIcon />}
            >
              Aggiungi dipendente
            </Button>
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
          page={page}
          total={pages || 1}
          onChange={setPage}
        />
      </div>
    );
  }, [items.length, page, pages]);

  return (
    <div className="border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6">
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

      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        isHeaderSticky
        isStriped
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
        radius="sm"
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
    </div>
  );
}
