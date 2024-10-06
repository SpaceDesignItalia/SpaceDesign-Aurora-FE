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
  Pagination,
  SortDescriptor,
  Link,
} from "@nextui-org/react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ViewLeadModal from "../Other/ViewLeadModal";
import axios from "axios";
import { usePermissions } from "../../Layout/PermissionProvider";
import dayjs from "dayjs";
import ConfirmDeleteLeadModal from "../Other/ConfirmDeleteModal";

interface Lead {
  IdContact: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Company: string;
  Name: string;
  Range: string;
  CreatedAt: Date | null;
  Message: string;
}

interface ModalData {
  Lead: Lead;
  open: boolean;
}

const columns = [
  { name: "Nominativo", uid: "nominativo" },
  { name: "Azienda", uid: "Company" },
  { name: "Oggetto", uid: "Name" },
  { name: "Budget", uid: "Range" },
  { name: "Data creazione", uid: "CreatedAt" },
  { name: "Azioni", uid: "actions" },
];

export default function EmployeeTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const [adminLeadPermission, setAdminLeadPermission] = useState({
    viewLeadPermission: false,
    deleteLeadPermission: false,
  });

  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function checkPermissions() {
      setAdminLeadPermission({
        viewLeadPermission: await hasPermission("VIEW_LEAD"),
        deleteLeadPermission: await hasPermission("DELETE_LEAD"),
      });
    }

    fetchData();
    checkPermissions();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("/Lead/GET/GetAllLeads");
      setLeads(res.data);
    } catch (error) {
      console.error("Errore durante il recupero dei leads:", error);
    }
  };

  async function SearchLead() {
    try {
      const response = await axios.get("/Lead/GET/SearchLeadByCompany", {
        params: { Company: searchTerm.trim() },
      });
      setLeads(response.data);
    } catch (error) {
      console.error("Errore durante la ricerca del dipendente:", error);
    }
  }

  const DeleteLead = async (Lead: Lead) => {
    try {
      const res = await axios.delete("/Lead/DELETE/DeleteLeadById", {
        params: { LeadId: Lead.IdContact },
      });

      if (res.status === 200) {
        fetchData();
      }
    } catch (error) {
      console.error("Errore nella cancellazione del lead:", error);
    }
  };

  const [page, setPage] = useState(1);
  const [modalData, setModalData] = useState<ModalData>({
    Lead: {
      IdContact: 0,
      FirstName: "",
      LastName: "",
      Email: "",
      Company: "",
      Name: "",
      Range: "",
      CreatedAt: null,
      Message: "",
    },
    open: false,
  });

  const pages = Math.ceil(leads.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return leads.slice(start, end);
  }, [page, leads, rowsPerPage]);

  const renderCell = React.useCallback(
    (lead: Lead, columnKey: React.Key) => {
      const cellValue = lead[columnKey as keyof Lead];

      switch (columnKey) {
        case "nominativo":
          return <p>{lead.FirstName + " " + lead.LastName}</p>;
        case "CreatedAt":
          return dayjs(cellValue).format("DD MMM YYYY");
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              {adminLeadPermission.viewLeadPermission && (
                <Button
                  color="primary"
                  variant="light"
                  startContent={<RemoveRedEyeOutlinedIcon />}
                  onClick={() => setModalData({ open: true, Lead: lead })}
                  isIconOnly
                />
              )}
              {adminLeadPermission.deleteLeadPermission && (
                <ConfirmDeleteLeadModal
                  LeadData={lead}
                  DeleteLead={DeleteLead}
                />
              )}
            </div>
          );
        default:
          return cellValue;
      }
    },
    [adminLeadPermission]
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
              onClick={SearchLead}
              className="hidden sm:flex"
            >
              Cerca
            </Button>
            <Button
              color="primary"
              radius="full"
              isDisabled={searchTerm == ""}
              onClick={SearchLead}
              className="sm:hidden"
              isIconOnly
            >
              <SearchOutlinedIcon />
            </Button>
          </div>
        </div>
      </div>
    );
  }, [onRowsPerPageChange, leads.length, searchTerm, SearchLead]);

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
      <ViewLeadModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        LeadData={modalData.Lead}
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
                <EmailRoundedIcon sx={{ fontSize: 50 }} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun lead trovato!
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Nessuno ha compilato il form sul sito:{" "}
                  <a
                    className="underline text-primary"
                    href="https://www.spacedesign-italia.it"
                    target="blank"
                  >
                    www.spacedesign-italia.it
                  </a>
                  .
                </p>
              </div>
            ) : (
              <div className="text-center p-10">
                <EmailRoundedIcon sx={{ fontSize: 50 }} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun lead trovato!
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
            <TableRow key={item.IdContact}>
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
