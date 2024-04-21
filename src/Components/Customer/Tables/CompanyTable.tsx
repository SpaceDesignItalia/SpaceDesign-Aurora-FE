import React from "react";
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
import AddBusinessRoundedIcon from "@mui/icons-material/AddBusinessRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

const columns = [
  { name: "ID", uid: "companyId" },
  { name: "Nome azienda", uid: "companyName" },
  { name: "Indirizzo Azienda", uid: "companyAddress" },
  { name: "Email Azienda", uid: "companyEmail" },
  { name: "Telefono Azienda", uid: "companyPhone" },
  { name: "Azioni", uid: "actions" },
];

const users = [
  {
    companyId: 1,
    companyName: "Syllog S.r.l",
    companyAddress: "Viale Della Repubblica, PO",
    companyEmail: "info@syllog.ai",
    companyPhone: "3669826344",
  },
  {
    companyId: 2,
    companyName: "Globalcom S.r.l",
    companyAddress: "Via Benedetto Croce, 118, 91028 Partanna TP",
    companyEmail: "info@globalcomonline.it",
    companyPhone: "0924922226",
  },
];

export default function CompanyTable() {
  type User = (typeof users)[0];
  const [rowsPerPage, setRowsPerPage] = React.useState(15);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });

  const [page, setPage] = React.useState(1);

  const pages = Math.ceil(users.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return users.slice(start, end);
  }, [page, users, rowsPerPage]);

  const renderCell = React.useCallback((user: User, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof User];

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
                <DropdownItem startContent={<RemoveRedEyeOutlinedIcon />}>
                  Visualizza
                </DropdownItem>
                <DropdownItem startContent={<ModeOutlinedIcon />}>
                  Modifica
                </DropdownItem>
                <DropdownItem startContent={<DeleteOutlinedIcon />}>
                  Rimuovi
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

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
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Cerca per nome..."
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
  }, [onRowsPerPageChange, users.length]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-center items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
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
        <TableBody emptyContent={"Nessun cliente trovato!"} items={users}>
          {(item) => (
            <TableRow key={item.companyId}>
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
