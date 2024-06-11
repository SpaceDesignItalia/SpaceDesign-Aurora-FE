import React, { useEffect, useState } from "react";
import { usePermissions } from "../../Layout/PermissionProvider";
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
import ViewCustomerModal from "../Other/ViewCustomerModal";
import ConfirmDeleteCustomerModal from "../Other/ConfirmDeleteCustomerModal";

interface Customer {
  CustomerId: number;
  CustomerFullName: string;
  CustomerEmail: string;
  CustomerPhone: string;
}

interface ModalData {
  Customer: Customer;
  open: boolean;
}

interface ModalDeleteData {
  Customer: Customer;
  open: boolean;
}

const columns = [
  { name: "Nome Cliente", uid: "CustomerFullName" },
  { name: "Email Cliente", uid: "CustomerEmail" },
  { name: "Telefono Cliente", uid: "CustomerPhone" },
  { name: "Azioni", uid: "actions" },
];

export default function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData() {
    axios.get("/Customer/GET/GetAllCustomers").then((res) => {
      setCustomers(res.data);
    });
  }

  const [page, setPage] = useState(1);
  const [modalData, setModalData] = useState<ModalData>({
    Customer: {
      CustomerId: 0,
      CustomerFullName: "",
      CustomerEmail: "",
      CustomerPhone: "",
    },
    open: false,
  });
  const [modalDeleteData, setModalDeleteData] = useState<ModalDeleteData>({
    Customer: {
      CustomerId: 0,
      CustomerFullName: "",
      CustomerEmail: "",
      CustomerPhone: "",
    },
    open: false,
  });

  async function SearchCompany(e: { target: { value: string } }) {
    const searchQuery = e.target.value.trim(); // Otteniamo il valore di ricerca e rimuoviamo gli spazi vuoti
    try {
      const response = await axios.get("/Customer/GET/SearchCustomerByEmail", {
        params: { CustomerEmail: searchQuery },
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Errore durante la ricerca delle aziende:", error);
    }
  }

  async function DeleteCustomer(CustomerData: any) {
    try {
      const res = await axios.delete("/Customer/DELETE/DeleteCustomer", {
        params: { CustomerData },
      });

      if (res.status === 200) {
        fetchData();
      }
    } catch (error) {
      console.error("Errore nella cancellazione del cliente:", error);
    }
  }

  const pages = Math.ceil(customers.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return customers.slice(start, end);
  }, [page, customers, rowsPerPage]);

  const renderCell = React.useCallback(
    (customer: Customer, columnKey: React.Key) => {
      const cellValue = customer[columnKey as keyof Customer];

      switch (columnKey) {
        case "CustomerPhone":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">
                {cellValue == null ? "Non presente" : cellValue}
              </p>
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
                        Customer: customer,
                      })
                    }
                  >
                    Visualizza
                  </DropdownItem>
                  {hasPermission("EDIT_CUSTOMER") && (
                    <DropdownItem
                      color="warning"
                      startContent={<ModeOutlinedIcon />}
                      aria-label="Edit"
                      aria-labelledby="Edit"
                      href={
                        "/administration/customer/edit-customer/" +
                        customer.CustomerId
                      }
                    >
                      Modifica
                    </DropdownItem>
                  )}

                  {hasPermission("DELETE_CUSTOMER") && (
                    <DropdownItem
                      color="danger"
                      startContent={<DeleteOutlinedIcon />}
                      aria-label="Remove"
                      aria-labelledby="Remove"
                      onClick={() =>
                        setModalDeleteData({
                          ...modalDeleteData,
                          open: true,
                          Customer: customer,
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
            onChange={SearchCompany}
            className="w-1/3"
            placeholder="Cerca cliente per email..."
          />
          <div className="flex gap-3">
            {hasPermission("CREATE_CUSTOMER") && (
              <Button
                as={Link}
                href="./customer/add-customer"
                color="primary"
                radius="sm"
                startContent={<PersonAddAlt1RoundedIcon />}
              >
                Aggiungi cliente
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }, [onRowsPerPageChange, customers.length]);

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
      <ViewCustomerModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        CustomerData={modalData.Customer}
      />
      <ConfirmDeleteCustomerModal
        isOpen={modalDeleteData.open}
        isClosed={() => setModalDeleteData({ ...modalDeleteData, open: false })}
        CustomerData={modalDeleteData.Customer}
        DeleteCustomer={DeleteCustomer}
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
        <TableBody emptyContent={"Nessun cliente trovato!"} items={items}>
          {(item) => (
            <TableRow key={item.CustomerId}>
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
