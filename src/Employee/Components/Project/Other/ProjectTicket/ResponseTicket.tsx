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

interface ModalData {
  Ticket: Ticket;
  open: boolean;
}

const columns = [
  { name: "Codice Richiesta", uid: "ProjectTicketId" },
  { name: "Titolo", uid: "ProjectTicketTitle" },
  { name: "Tipo di richiesta", uid: "TicketRequestName" },
  { name: "Stato", uid: "TicketStatusName" },
  { name: "Azioni", uid: "actions" },
];

export default function ResponseTicket() {
  const { UniqueCode } = useParams();
  const [ProjectId, setProjectId] = useState<number>(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "ProjectTicketCreationDate",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [modalData, setModalData] = useState<ModalData>({
    Ticket: {
      ProjectTicketId: 0,
      ProjectTicketTitle: "",
      ProjectTicketDescription: "",
      ProjectTicketCreationDate: "",
      ProjectTicketCompletedDate: null,
      CustomerId: 0,
      ProjectId: 0,
      TicketRequestTypeId: 0,
      TicketRequestName: "",
      TicketStatusId: 0,
      TicketStatusName: "",
    },
    open: false,
  });

  useEffect(() => {
    axios
      .get("/Project/GET/GetProjectByUniqueCode", {
        params: { UniqueCode: UniqueCode },
      })
      .then((res) => {
        setProjectId(res.data.ProjectId);
      });
  }, [UniqueCode]);

  useEffect(() => {
    fetchData();
  }, [ProjectId]);

  function fetchData() {
    axios
      .get("/Ticket/GET/GetProjectOpenTicket", {
        params: { ProjectId: ProjectId },
      })
      .then((res) => {
        console.log(res.data);
        setTickets(res.data);
      });
  }

  const pages = Math.ceil(tickets.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return tickets.slice(start, end);
  }, [page, tickets, rowsPerPage]);

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
                onClick={() =>
                  setModalData({ ...modalData, open: true, Ticket: ticket })
                }
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
      <TicketModal
        isOpen={modalData.open}
        onClose={() => setModalData({ ...modalData, open: false })}
        ticket={modalData.Ticket}
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
    </>
  );
}
