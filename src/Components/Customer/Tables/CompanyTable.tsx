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
  useDisclosure,
} from "@nextui-org/react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddBusinessRoundedIcon from "@mui/icons-material/AddBusinessRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import axios from "axios";
import ViewCompanyModal from "../Other/ViewCompanyModal";

interface Company {
  CompanyId: number;
  CompanyName: string;
  CompanyAddress: string;
  CompanyEmail: string;
  CompanyPhone: string;
}

interface ModalData {
  Company: Company;
  open: boolean;
}

const columns = [
  { name: "ID", uid: "CompanyId" },
  { name: "Nome azienda", uid: "CompanyName" },
  { name: "Indirizzo Azienda", uid: "CompanyAddress" },
  { name: "Email Azienda", uid: "CompanyEmail" },
  { name: "Telefono Azienda", uid: "CompanyPhone" },
  { name: "Azioni", uid: "actions" },
];

export default function CompanyTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData() {
    axios.get("/Company/GET/GetAllCompany").then((res) => {
      setCompanies(res.data);
    });
  }

  const [page, setPage] = useState(1);
  const [modalData, setModalData] = useState<ModalData>({
    Company: {
      CompanyId: 0,
      CompanyName: "",
      CompanyAddress: "",
      CompanyEmail: "",
      CompanyPhone: "",
    },
    open: false,
  });

  async function SearchCompany(e: { target: { value: string } }) {
    const searchQuery = e.target.value.trim(); // Otteniamo il valore di ricerca e rimuoviamo gli spazi vuoti
    console.log(searchQuery);
    try {
      const response = await axios.get("/Company/GET/SearchCompanyByName", {
        params: { CompanyName: searchQuery },
      });
      setCompanies(response.data);
    } catch (error) {
      console.error("Errore durante la ricerca delle aziende:", error);
    }
  }

  async function DeleteCompany(CompanyId: any) {
    try {
      const res = await axios.delete("/Company/DELETE/DeleteCompany", {
        params: { CompanyId: CompanyId },
      });

      if (res.status === 200) {
        fetchData();
      }
    } catch (error) {
      console.error("Errore nella cancellazione dell'azienda:", error);
    }
  }

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
                        Company: company,
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
                      "/administration/customer/edit-company/" +
                      company.CompanyId +
                      "/" +
                      company.CompanyName
                    }
                  >
                    Modifica
                  </DropdownItem>
                  <DropdownItem
                    color="danger"
                    startContent={<DeleteOutlinedIcon />}
                    aria-label="Remove"
                    aria-labelledby="Remove"
                    onClick={() => DeleteCompany(company.CompanyId)}
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
            onChange={SearchCompany}
            className="w-1/3"
            placeholder="Cerca per nome azienda..."
          />
          <div className="flex gap-3">
            <Button
              as={Link}
              href="./customer/add-company"
              color="primary"
              radius="sm"
              startContent={<AddBusinessRoundedIcon />}
            >
              Aggiungi azienda
            </Button>
          </div>
        </div>
      </div>
    );
  }, [onRowsPerPageChange, companies.length]);

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
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
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
