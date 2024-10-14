// @ts-nocheck
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
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import axios from "axios";
import ViewRoleModal from "../Other/ViewRoleModal";
import { usePermissions } from "../../Layout/PermissionProvider";
import ConfirmDeleteRoleModal from "../Other/ConfirmDeleteRoleModal";

interface Role {
  RoleId: number;
  RoleName: string;
  RoleDescription: string;
  RolePriority: number;
}

interface ModalData {
  Role: Role;
  open: boolean;
}

const columns = [
  { name: "Ruolo", uid: "RoleName" },
  { name: "Descrizione", uid: "RoleDescription" },
  { name: "Grado di priorità", uid: "RolePriority" },
  { name: "Azioni", uid: "actions" },
];

export default function RoleTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [adminRolePermission, setAdminRolePermission] = useState({
    addRolePermission: false,
    editRolePermission: false,
    deleteRolePermission: false,
  });

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function checkPermissions() {
      setAdminRolePermission({
        addRolePermission: await hasPermission("CREATE_ROLE"),
        editRolePermission: await hasPermission("EDIT_ROLE"),
        deleteRolePermission: await hasPermission("DELETE_ROLE"),
      });
    }
    checkPermissions();
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

  async function SearchRole() {
    try {
      const response = await axios.get("/Permission/GET/SearchRoleByName", {
        params: { RoleName: searchTerm.trim() },
      });
      setRoles(response.data);
    } catch (error) {
      console.error("Errore durante la ricerca dei ruoli:", error);
    }
  }

  async function deleteRole(role: Role) {
    try {
      const res = await axios.delete("/Permission/DELETE/DeleteRole", {
        params: { RoleId: role.RoleId },
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

  const renderCell = React.useCallback(
    (role: Role, columnKey: React.Key) => {
      const cellValue = role[columnKey as keyof Role];

      switch (columnKey) {
        case "RoleName":
          return <p>{cellValue}</p>;
        case "RoleDescription":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{cellValue}</p>
            </div>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Button
                variant="light"
                size="sm"
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
                isIconOnly
              />

              {adminRolePermission.editRolePermission && (
                <Button
                  as={Link}
                  variant="light"
                  size="sm"
                  color="warning"
                  startContent={<ModeOutlinedIcon />}
                  aria-label="Edit"
                  aria-labelledby="Edit"
                  href={"/administration/permission/edit-role/" + role.RoleId}
                  isIconOnly
                />
              )}
              {adminRolePermission.deleteRolePermission && (
                <ConfirmDeleteRoleModal
                  RoleData={role}
                  DeleteRole={deleteRole}
                />
              )}
            </div>
          );
        default:
          return cellValue;
      }
    },
    [adminRolePermission]
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
              startContent={<SearchOutlinedIcon />}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.trim() === "") {
                  fetchData(); // Chiama SearchEmployee se il campo è vuoto
                }
              }}
              className="md:w-1/3"
              placeholder="Cerca ruolo per nome..."
            />
            <Button
              color="primary"
              radius="full"
              endContent={<SearchOutlinedIcon />}
              isDisabled={searchTerm == ""}
              onClick={SearchRole}
              className="hidden sm:flex"
            >
              Cerca
            </Button>
            <Button
              color="primary"
              radius="full"
              isDisabled={searchTerm == ""}
              onClick={SearchRole}
              className="sm:hidden"
              isIconOnly
            >
              <SearchOutlinedIcon />
            </Button>
          </div>
          <div className="flex gap-3">
            {adminRolePermission.addRolePermission && (
              <>
                <Button
                  as={Link}
                  href="./permission/add-role"
                  color="primary"
                  radius="full"
                  startContent={<AddModeratorRoundedIcon />}
                  className="hidden sm:flex"
                >
                  Aggiungi ruolo
                </Button>

                <Button
                  as={Link}
                  href="./permission/add-role"
                  color="primary"
                  radius="full"
                  isIconOnly
                  className="sm:hidden"
                >
                  <AddModeratorRoundedIcon />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }, [onRowsPerPageChange, roles.length, searchTerm, SearchRole]);

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
                <BadgeRoundedIcon sx={{ fontSize: 50 }} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun ruolo trovato!
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Inizia aggiungendo un nuovo ruolo al database.
                </p>
                <div className="mt-6">
                  <Button
                    as={Link}
                    color="primary"
                    radius="full"
                    startContent={<AddRoundedIcon />}
                    href="./permission/add-role"
                  >
                    Aggiungi ruolo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-10">
                <BadgeRoundedIcon sx={{ fontSize: 50 }} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun ruolo trovato!
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
