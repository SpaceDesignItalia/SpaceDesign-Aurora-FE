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
} from "@nextui-org/react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddModeratorRoundedIcon from "@mui/icons-material/AddModeratorRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import axios from "axios";
import ViewRoleModal from "../Other/ViewRoleModal";

interface Role {
  RoleId: number;
  RoleName: string;
  RoleDescription: string;
}

interface ModalData {
  Role: Role;
  open: boolean;
}

const columns = [
  { name: "Ruolo", uid: "RoleName" },
  { name: "Descrizione", uid: "RoleDescription" },
  { name: "Azioni", uid: "actions" },
];

export default function RoleTable() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData() {
    axios.get("/Permission/GET/GetAllRoles").then((res) => {
      setRoles(res.data);
    });
  }

  const [page, setPage] = useState(1);
  const [modalData, setModalData] = useState<ModalData>({
    Role: {
      RoleId: 0,
      RoleName: "",
      RoleDescription: "",
    },
    open: false,
  });

  async function SearchRole(e: { target: { value: string } }) {
    const searchQuery = e.target.value.trim();
    try {
      const response = await axios.get("/Permission/GET/SearchRoleByName", {
        params: { RoleName: searchQuery },
      });
      setRoles(response.data);
    } catch (error) {
      console.error("Errore durante la ricerca dei ruoli:", error);
    }
  }

  async function deleteRole(RoleId: number) {
    try {
      const res = await axios.delete("/Permission/DELETE/DeleteRole", {
        params: { RoleId: RoleId },
      });

      if (res.status === 200) {
        fetchData();
      }
    } catch (error) {
      console.error("Errore nella cancellazione del ruolo:", error);
    }
  }

  const pages = Math.ceil(roles.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return roles.slice(start, end);
  }, [page, roles, rowsPerPage]);

  const renderCell = React.useCallback((role: Role, columnKey: React.Key) => {
    const cellValue = role[columnKey as keyof Role];

    switch (columnKey) {
      case "name":
        return <p>{cellValue}</p>;
      case "description":
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
                      Role: role,
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
                  href={"/administration/permission/edit-role/" + role.RoleId}
                >
                  Modifica
                </DropdownItem>
                <DropdownItem
                  color="danger"
                  startContent={<DeleteOutlinedIcon />}
                  aria-label="Remove"
                  aria-labelledby="Remove"
                  onClick={() => deleteRole(role.RoleId)}
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
            onChange={SearchRole}
            className="w-1/3"
            placeholder="Cerca ruolo per nome..."
          />
          <div className="flex gap-3">
            <Button
              as={Link}
              href="./permission/add-permission"
              color="primary"
              radius="sm"
              startContent={<AddModeratorRoundedIcon />}
            >
              Aggiungi ruolo
            </Button>
          </div>
        </div>
      </div>
    );
  }, [onRowsPerPageChange, roles.length]);

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
      <ViewRoleModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        RoleData={modalData.Role}
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
        <TableBody emptyContent={"Nessun ruolo trovato!"} items={items}>
          {(item) => (
            <TableRow key={item.RoleId}>
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
