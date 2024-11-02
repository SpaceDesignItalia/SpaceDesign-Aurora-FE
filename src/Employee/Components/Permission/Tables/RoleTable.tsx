import AddModeratorRoundedIcon from "@mui/icons-material/AddModeratorRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
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
} from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { usePermissions } from "../../Layout/PermissionProvider";
import ConfirmDeleteRoleModal from "../Other/ConfirmDeleteRoleModal";
import ViewRoleModal from "../Other/ViewRoleModal";

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
      RolePriority: 0,
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
        window.location.reload();
      }
    } catch (error) {
      console.error("Errore nella cancellazione del ruolo:", error);
    }
  }

  const exportCSV = () => {
    const headers = [
      "Role ID",
      "Role Name",
      "Role Description",
      "Role Priority",
    ];

    const wrapInQuotes = (value: any) => {
      return typeof value === "string" ? `"${value}"` : value;
    };

    const sortedRoles = roles.sort((a, b) => a.RoleId - b.RoleId);

    const rows = sortedRoles.map((role) => [
      wrapInQuotes(role.RoleId),
      wrapInQuotes(role.RoleName),
      wrapInQuotes(role.RoleDescription),
      wrapInQuotes(role.RolePriority),
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      headers.map(wrapInQuotes).join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "roles_table.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                  fetchData();
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
      <div className="py-2 px-2 flex justify-between items-center">
        <div className="w-full">
          {roles.length > 0 && (
            <Button
              color="primary"
              variant="ghost"
              radius="full"
              startContent={<FileDownloadOutlinedIcon />}
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
