// @ts-nocheck
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
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import axios from "axios";
import ViewCustomerModal from "../Other/ViewCustomerModal";
import ConfirmDeleteCustomerModal from "../Other/ConfirmDeleteCustomerModal";
import { Edit } from "@mui/icons-material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [adminCustomerPermission, setAdminCustomerPermission] = useState({
    addCustomerPermission: false,
    editCustomerPermission: false,
    deleteCustomerPermission: false,
  });

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function checkPermissions() {
      setAdminCustomerPermission({
        addCustomerPermission: await hasPermission("CREATE_CUSTOMER"),
        editCustomerPermission: await hasPermission("EDIT_CUSTOMER"),
        deleteCustomerPermission: await hasPermission("DELETE_CUSTOMER"),
      });
    }

    checkPermissions();
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

  async function SearchCustomer() {
    try {
      const response = await axios.get("/Customer/GET/SearchCustomerByEmail", {
        params: { CustomerEmail: searchTerm },
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
        window.location.reload();
      }
    } catch (error) {
      console.error("Errore nella cancellazione del cliente:", error);
    }
  }

  const exportCSV = async () => {
    const headers = [
      "ID Cliente",
      "Nome Cliente",
      "Email Cliente",
      "Telefono Cliente",
      "Azienda associata",
    ];

    const wrapInQuotes = (value) => {
      return typeof value === "string" ? `"${value}"` : value;
    };

    const sortedCustomers = customers.sort(
      (a, b) => a.CustomerId - b.CustomerId
    );

    // Recupera le aziende per tutti i clienti
    const getCompanyNames = async () => {
      const updatedCustomers = await Promise.all(
        sortedCustomers.map(async (customer) => {
          try {
            const res = await axios.get(
              "/Customer/GET/GetCompanyAssociatedByCustomerId",
              {
                params: { CustomerId: customer.CustomerId },
              }
            );
            return {
              ...customer,
              CustomerCompany: res.data[0]?.CompanyName,
            };
          } catch (error) {
            console.error("Si è verificato un errore:", error);
            return {
              ...customer,
              CustomerCompany: "Non presente",
            };
          }
        })
      );
      return updatedCustomers;
    };

    const generateCSV = (updatedCustomers) => {
      const rows = updatedCustomers.map((customer) => [
        wrapInQuotes(customer.CustomerId),
        wrapInQuotes(customer.CustomerFullName),
        wrapInQuotes(customer.CustomerEmail),
        wrapInQuotes(customer.CustomerPhone),
        wrapInQuotes(customer.CustomerCompany),
      ]);

      let csvContent =
        "data:text/csv;charset=utf-8," +
        headers.map(wrapInQuotes).join(",") +
        "\n" +
        rows.map((row) => row.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "customers_table.csv");

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const updatedCustomers = await getCompanyNames();
    generateCSV(updatedCustomers);
  };

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
            <div className="relative flex justify-center items-center gap-2">
              <Button
                color="primary"
                variant="light"
                size="sm"
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
                isIconOnly
              />

              {adminCustomerPermission.editCustomerPermission ? (
                <Button
                  as={Link}
                  color="warning"
                  variant="light"
                  size="sm"
                  startContent={<ModeOutlinedIcon />}
                  aria-label="Edit"
                  aria-labelledby="Edit"
                  href={
                    "/administration/customer/edit-customer/" +
                    customer.CustomerId
                  }
                  isIconOnly
                />
              ) : null}

              {adminCustomerPermission.deleteCustomerPermission ? (
                <ConfirmDeleteCustomerModal
                  CustomerData={modalDeleteData.Customer}
                  DeleteCustomer={DeleteCustomer}
                />
              ) : null}
            </div>
          );
        default:
          return cellValue;
      }
    },
    [adminCustomerPermission] // Assicurati di includere adminCustomerPermission come dipendenza
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
                  fetchData();
                }
              }}
              value={searchTerm}
              className="md:w-1/3"
              placeholder="Cerca cliente per email..."
            />
            <Button
              color="primary"
              radius="full"
              endContent={<SearchOutlinedIcon />}
              isDisabled={searchTerm == ""}
              onClick={SearchCustomer}
              className="hidden sm:flex"
            >
              Cerca
            </Button>
            <Button
              color="primary"
              radius="full"
              isDisabled={searchTerm == ""}
              onClick={SearchCustomer}
              className="sm:hidden"
              isIconOnly
            >
              <SearchOutlinedIcon />
            </Button>
          </div>
          <div className="flex gap-3">
            {customers.length > 0 && (
              <Button
                color="primary"
                radius="full"
                startContent={<FileDownloadOutlinedIcon />}
                onClick={exportCSV}
              >
                Esporta tabella clienti
              </Button>
            )}
            {adminCustomerPermission.addCustomerPermission && (
              <>
                <Button
                  as={Link}
                  href="./customer/add-customer"
                  color="primary"
                  radius="full"
                  startContent={<PersonAddAlt1RoundedIcon />}
                  className="hidden sm:flex"
                >
                  Aggiungi cliente
                </Button>
                <Button
                  as={Link}
                  href="./customer/add-customer"
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
  }, [onRowsPerPageChange, customers.length, searchTerm, SearchCustomer]);

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
    <div className=" bg-white">
      <ViewCustomerModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        CustomerData={modalData.Customer}
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
        radius="full"
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
                  Nessun cliente trovato!
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Inizia aggiungendo un nuovo cliente al database.
                </p>
                <div className="mt-6">
                  <Button
                    color="primary"
                    radius="full"
                    startContent={<AddRoundedIcon />}
                  >
                    Aggiungi cliente
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-10">
                <PersonAddAlt1RoundedIcon sx={{ fontSize: 50 }} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun cliente trovato!
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
