import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Pagination,
  SortDescriptor,
} from "@nextui-org/react";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import axios from "axios";
import { useParams } from "react-router-dom";
import TicketModal from "./TicketModal"; // Import the TicketModal component

interface Ticket {
  ProjectTicketId: number;
  ProjectTicketTitle: string;
  ProjectTicketDescription: string;
  ProjectTicketCreationDate: string;
  ProjectTicketCompletedDate: null;
  CustomerId: number;
  ProjectId: number;
  TicketRequestTypeId: number;
  TicketRequestName: string;
  TicketStatusId: number;
  TicketStatusName: string;
}

const columns = [
  { name: "Codice Richiesta", uid: "ProjectTicketId" },
  { name: "Titolo", uid: "ProjectTicketTitle" },
  { name: "Tipo di richiesta", uid: "TicketRequestName" },
  { name: "Stato", uid: "TicketStatusName" },
  { name: "Azioni", uid: "actions" },
];

export default function ResponseTicket() {
  const { ProjectId } = useParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "ProjectTicketCreationDate",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null); // Selected ticket state

  useEffect(() => {
    fetchData();
  }, [ProjectId]);

  function fetchData() {
    axios
      .get("/Ticket/GET/GetProjectOpenTicket", {
        params: { ProjectId: ProjectId },
      })
      .then((res) => {
        setTickets(res.data);
      });
  }

  const pages = Math.ceil(tickets.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return tickets.slice(start, end);
  }, [page, tickets, rowsPerPage]);

  const handleOpenModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const renderCell = React.useCallback(
    (ticket: Ticket, columnKey: React.Key) => {
      const cellValue = ticket[columnKey as keyof Ticket];
      switch (columnKey) {
        case "actions":
          return (
            <div className="relative flex justify-left items-center gap-2">
              <Button
                size="sm"
                color="primary"
                radius="sm"
                isIconOnly
                onClick={() => handleOpenModal(ticket)} // Open modal on click
              >
                <OpenInNewRoundedIcon />
              </Button>
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
        <div className="flex flex-row justify-between gap-3 items-end">
          <div className="flex gap-3">{/* Other content */}</div>
        </div>
      </div>
    );
  }, [onRowsPerPageChange, tickets.length]);

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
    <>
      <div className="border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6">
        <Table
          aria-label="Ticket table with custom cells, pagination and sorting"
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
          <TableBody emptyContent={"Nessun ticket trovato!"} items={items}>
            {(item) => (
              <TableRow key={item.ProjectTicketId}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Ticket Modal */}
      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticket={selectedTicket}
      />
    </>
  );
}
