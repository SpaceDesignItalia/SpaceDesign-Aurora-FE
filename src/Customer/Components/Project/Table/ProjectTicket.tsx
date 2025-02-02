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
  Link,
} from "@heroui/react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import axios from "axios";
import { useParams } from "react-router-dom";

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
  { name: "Tipo di richiesta", uid: "TicketRequestName" },
  { name: "Stato", uid: "TicketStatusName" },
  { name: "Azioni", uid: "actions" },
];

export default function ProjectTicket() {
  const { CompanyName, ProjectId, ProjectName } = useParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });

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
  const [page, setPage] = useState(1);

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
                as={Link}
                size="sm"
                href="./customer/add-company"
                color="primary"
                radius="sm"
                isIconOnly
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
          <div className="flex gap-3">
            <>
              <Button
                as={Link}
                href={
                  "/projects/" +
                  CompanyName +
                  "/" +
                  ProjectId +
                  "/" +
                  ProjectName +
                  "/open-new-ticket"
                }
                color="primary"
                radius="sm"
                startContent={<AddRoundedIcon />}
                className="hidden sm:flex"
              >
                Apri un ticket
              </Button>
              <Button
                as={Link}
                href="./customer/add-company"
                color="primary"
                radius="sm"
                isIconOnly
                className="sm:hidden"
              >
                <AddRoundedIcon />
              </Button>
            </>
          </div>
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
    <div className="border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6">
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
        <TableBody emptyContent={"Nessun azienda trovata!"} items={items}>
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
  );
}
