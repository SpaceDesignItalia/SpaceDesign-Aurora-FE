import {
  Button,
  Input,
  Link,
  Pagination,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePermissions } from "../../Layout/PermissionProvider";
import StatusAlert from "../../Layout/StatusAlert";
import ConfirmDeleteCompanyModal from "../Other/ConfirmDeleteCompanyModal";
import ViewCompanyModal from "../Other/ViewCompanyModal";

interface Company {
  CompanyId: number;
  CompanyName: string;
  CompanyAddress: string;
  CompanyEmail: string;
  CompanyPhone: string;
  CompanyImageUrl: string;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

interface ModalData {
  Company: Company;
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
  { name: "Nome azienda", uid: "CompanyName" },
  { name: "Indirizzo Azienda", uid: "CompanyAddress" },
  { name: "Email Azienda", uid: "CompanyEmail" },
  { name: "Telefono Azienda", uid: "CompanyPhone" },
  { name: "Azioni", uid: "actions" },
];

export default function CompanyTable() {
  const companyId =
    parseInt(useParams().CustomerId!) < 0
      ? useParams().CustomerId?.slice(1)
      : null;
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [adminCompanyPermission, setAdminCompanyPermission] = useState({
    addCompanyPermission: false,
    editCompanyermission: false,
    deleteCompanyPermission: false,
  });
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function checkPermissions() {
      setAdminCompanyPermission({
        addCompanyPermission: await hasPermission("CREATE_COMPANY"),
        editCompanyermission: await hasPermission("EDIT_COMPANY"),
        deleteCompanyPermission: await hasPermission("DELETE_COMPANY"),
      });
    }
    checkPermissions();
    fetchData();
  }, []);

  const [page, setPage] = useState(1);
  const [modalData, setModalData] = useState<ModalData>({
    Company: {
      CompanyId: 0,
      CompanyName: "",
      CompanyAddress: "",
      CompanyEmail: "",
      CompanyPhone: "",
      CompanyImageUrl: "",
    },
    open: false,
  });

  function fetchData() {
    axios.get("/Company/GET/GetAllCompany").then((res) => {
      setCompanies(res.data);
      if (companyId) {
        setModalData({
          ...modalData,
          open: true,
          Company: res.data.find(
            (company: Company) => company.CompanyId == parseInt(companyId)
          ),
        });
      }
    });
  }

  async function SearchCompany() {
    try {
      const response = await axios.get("/Company/GET/SearchCompanyByName", {
        params: { CompanyName: searchTerm },
      });
      setCompanies(response.data);
    } catch (error) {
      console.error("Errore durante la ricerca delle aziende:", error);
    }
  }

  async function DeleteCompany(CompanyData: Company) {
    try {
      const res = await axios.delete("/Company/DELETE/DeleteCompany", {
        params: { CompanyId: CompanyData.CompanyId }, // Adjusted to send the CompanyId instead of CompanyData directly
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData({ ...alertData, isOpen: false }),
          alertTitle: "Successo",
          alertDescription: "Azienda eliminata con successo!",
          alertColor: "green",
        });
        fetchData(); // Refresh the company data
      }
    } catch (error) {
      console.error("Errore nella cancellazione dell'azienda:", error);
      setAlertData({
        isOpen: true,
        onClose: () => setAlertData({ ...alertData, isOpen: false }),
        alertTitle: "Errore",
        alertDescription:
          "Si è verificato un errore durante la cancellazione dell'azienda.",
        alertColor: "red",
      });
    }
  }

  const exportCSV = () => {
    const headers = [
      "Id Azienda",
      "Nome Azienda",
      "Indirizzo Azienda",
      "Email Azienda",
      "Telefono Azienda",
    ];

    const wrapInQuotes = (value: any) => {
      return typeof value === "string" ? `"${value}"` : value;
    };

    const sortedCompanies = companies.sort((a, b) => a.CompanyId - b.CompanyId);

    const rows = sortedCompanies.map((company) => [
      wrapInQuotes(company.CompanyId),
      wrapInQuotes(company.CompanyName),
      wrapInQuotes(company.CompanyAddress),
      wrapInQuotes(company.CompanyEmail),
      wrapInQuotes(company.CompanyPhone),
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      headers.map(wrapInQuotes).join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "companies_table.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pages = Math.ceil(companies.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return companies.slice(start, end);
  }, [page, companies, rowsPerPage]);

  const renderCell = React.useCallback(
    (company: Company, columnKey: React.Key) => {
      const cellValue = company[columnKey as keyof Company];

      switch (columnKey) {
        case "CompanyPhone":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small">
                {cellValue == null ? "Non presente" : cellValue}
              </p>
            </div>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Button
                variant="light"
                size="sm"
                color="primary"
                startContent={<Icon icon="solar:eye-linear" fontSize={24} />}
                aria-label="View"
                aria-labelledby="View"
                isIconOnly
                onClick={() =>
                  setModalData({
                    ...modalData,
                    open: true,
                    Company: company,
                  })
                }
              />

              {adminCompanyPermission.deleteCompanyPermission && (
                <ConfirmDeleteCompanyModal
                  CompanyData={company}
                  DeleteCompany={DeleteCompany}
                />
              )}
            </div>
          );
        default:
          return cellValue;
      }
    },
    [adminCompanyPermission]
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
              startContent={
                <Icon
                  icon="solar:magnifer-linear"
                  fontSize={24}
                  color="gray-400"
                />
              }
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.trim() === "") {
                  fetchData();
                }
              }}
              value={searchTerm}
              className="md:w-1/3"
              placeholder="Cerca per nome azienda..."
            />
            <Button
              color="primary"
              radius="full"
              endContent={<Icon icon="solar:magnifer-linear" fontSize={22} />}
              isDisabled={searchTerm == ""}
              onClick={SearchCompany}
              className="hidden sm:flex"
            >
              Cerca
            </Button>
            <Button
              color="primary"
              radius="full"
              isDisabled={searchTerm == ""}
              onClick={SearchCompany}
              className="sm:hidden"
              isIconOnly
            >
              <Icon icon="solar:magnifer-linear" fontSize={22} />
            </Button>
          </div>
          <div className="flex gap-3">
            {adminCompanyPermission.addCompanyPermission && (
              <>
                <Button
                  as={Link}
                  href="./customer/add-company"
                  color="primary"
                  radius="full"
                  startContent={
                    <Icon icon="hugeicons:store-add-01" fontSize={24} />
                  }
                  className="hidden sm:flex"
                >
                  Aggiungi azienda
                </Button>
                <Button
                  as={Link}
                  href="./customer/add-company"
                  color="primary"
                  radius="full"
                  isIconOnly
                  className="sm:hidden"
                >
                  <Icon icon="hugeicons:store-add-01" fontSize={24} />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }, [onRowsPerPageChange, companies.length, searchTerm, SearchCompany]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <div className="w-full">
          {companies.length > 0 && (
            <Button
              color="primary"
              variant="ghost"
              radius="full"
              startContent={
                <Icon icon="solar:file-download-linear" fontSize={24} />
              }
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
      <ViewCompanyModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        CompanyData={modalData.Company}
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
        classNames={{
          wrapper: "border-2 rounded-2xl shadow-none",
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
              <div className="flex flex-col items-center justify-center p-10">
                <Icon icon="solar:store-linear" fontSize={50} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun azienda trovata!
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Inizia aggiungendo una nuova azienda al database.
                </p>
                <div className="mt-6">
                  <Button
                    color="primary"
                    radius="full"
                    startContent={
                      <Icon icon="mynaui:plus-solid" fontSize={24} />
                    }
                  >
                    Aggiungi azienda
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10">
                <Icon icon="solar:store-linear" fontSize={50} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun azienda trovata!
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Nessun risultato corrisponde alla tua ricerca:{" "}
                  <span className="font-medium italic">{searchTerm}</span>
                </p>
              </div>
            )
          }
          items={items}
        >
          {(item) => (
            <TableRow key={item.CompanyId}>
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
