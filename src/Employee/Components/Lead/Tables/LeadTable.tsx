import React, { useEffect, useState, useMemo, useCallback } from "react";
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
} from "@nextui-org/react";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import axios from "axios";
import ViewLeadModal from "../Other/ViewLeadModal";
import { usePermissions } from "../../Layout/PermissionProvider";

// Modello del Lead
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

export default function LeadTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [page, setPage] = useState(1);
  const [modalData, setModalData] = useState({ open: false, lead: {} as Lead });
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

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim();
    try {
      const response = await axios.get("/Lead/GET/SearchLeadByCompany", {
        params: { company: query },
      });
      setLeads(response.data);
    } catch (error) {
      console.error("Errore durante la ricerca del lead:", error);
    }
  };

  const handleDeleteLead = async (IdContact: number) => {
    try {
      const res = await axios.delete("/Lead/DELETE/DeleteLeadById", {
        params: { LeadId: IdContact },
      });

      if (res.status === 200) {
        fetchData();
      }
    } catch (error) {
      console.error("Errore nella cancellazione del lead:", error);
    }
  };

  const pages = Math.ceil(leads.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return leads.slice(start, start + rowsPerPage);
  }, [page, leads, rowsPerPage]);

  const renderCell = useCallback(
    (lead: Lead, columnKey: string) => {
      switch (columnKey) {
        case "nominativo":
          return `${lead.FirstName} ${lead.LastName}`;
        case "CreatedAt":
          return formatDate(lead.CreatedAt);
        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertRoundedIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                {adminLeadPermission.viewLeadPermission && (
                  <DropdownItem
                    color="primary"
                    startContent={<RemoveRedEyeOutlinedIcon />}
                    onClick={() => setModalData({ open: true, lead })}
                  >
                    Visualizza
                  </DropdownItem>
                )}
                {adminLeadPermission.deleteLeadPermission && (
                  <DropdownItem
                    color="danger"
                    startContent={<DeleteOutlinedIcon />}
                    onClick={() => handleDeleteLead(lead.IdContact)}
                  >
                    Rimuovi
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          );
        default:
          return lead[columnKey as keyof Lead]
            ? lead[columnKey as keyof Lead]
            : "Non specificato";
      }
    },
    [adminLeadPermission]
  );

  const formatDate = (date: Date | null) => {
    if (!date) return "Non disponibile";
    const formattedDate = new Date(date);
    return `${String(formattedDate.getDate()).padStart(2, "0")}/${String(
      formattedDate.getMonth() + 1
    ).padStart(2, "0")}/${formattedDate.getFullYear()}`;
  };

  // Colonne della tabella Lead
  const columns = [
    { name: "Nominativo", uid: "nominativo" },
    { name: "Azienda", uid: "Company" },
    { name: "Oggetto", uid: "Name" },
    { name: "Budget", uid: "Range" },
    { name: "Data creazione", uid: "CreatedAt" },
    ...(adminLeadPermission.viewLeadPermission ||
    adminLeadPermission.deleteLeadPermission
      ? [{ name: "Azioni", uid: "actions" }]
      : []),
  ];

  return (
    <div className="border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6">
      <ViewLeadModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        LeadData={modalData.lead}
      />

      <div className="flex flex-col gap-4">
        {/* Campo di ricerca */}
        <div className="flex flex-row justify-between gap-3 items-end">
          <Input
            radius="sm"
            variant="bordered"
            startContent={<SearchOutlinedIcon />}
            onChange={handleSearchChange}
            className="md:w-1/3"
            placeholder="Cerca lead per azienda..."
          />
        </div>

        {/* Tabella dei lead */}
        <Table aria-label="Lead table" isHeaderSticky isStriped radius="sm">
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
          <TableBody emptyContent="Nessun lead trovato!" items={items}>
            {(item) => (
              <TableRow key={item.IdContact}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>

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
      </div>
    </div>
  );
}
