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
import LocalPoliceRoundedIcon from "@mui/icons-material/LocalPoliceRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import axios from "axios";
import ViewPermissionModal from "../Other/ViewPermissionModal";
import { usePermissions } from "../../Layout/PermissionProvider";
import ConfirmDeletePermissionModal from "../Other/ConfirmDeletePermissionModal";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

interface Permission {
  PermissionId: number;
  PermissionName: string;
  PermissionDescription: string;
  PermissionGroup: PermissionGroup;
}

interface PermissionDelete {
  PermissionId: number;
  PermissionName: string;
  PermissionDescription: string;
}

interface PermissionGroup {
  PermissionGroupId: number;
  PermissionGroupName: string;
}

interface ModalData {
  Permission: {
    PermissionId: number;
    PermissionName: string;
    PermissionDescription: string;
    PermissionGroup: {
      PermissionGroupId: number;
      PermissionGroupName: string;
    };
  };
  open: boolean;
}

interface ModalDeleteData {
  Permission: PermissionDelete;
  open: boolean;
}

const columns = [
  { name: "Permesso", uid: "PermissionName" },
  { name: "Descrizione", uid: "PermissionDescription" },
  { name: "Azioni", uid: "actions" },
];

export default function PermissionTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [adminPermission, setAdminPermission] = useState({
    addPermission: false,
    editPermission: false,
    deletePermission: false,
  });

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const [modalDeleteData, setModalDeleteData] = useState<ModalDeleteData>({
    Permission: {
      PermissionId: 0,
      PermissionName: "",
      PermissionDescription: "",
    },
    open: false,
  });

  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function checkPermissions() {
      setAdminPermission({
        addPermission: await hasPermission("CREATE_PERMISSION"),
        editPermission: await hasPermission("EDIT_PERMISSION"),
        deletePermission: await hasPermission("DELETE_PERMISSION"),
      });
    }
    checkPermissions();
    fetchData();
  }, []);

  function fetchData() {
    axios.get("/Permission/GET/GetAllPermissions").then((res) => {
      setPermissions(res.data);
    });
  }

  const [page, setPage] = useState(1);
  const [modalData, setModalData] = useState<ModalData>({
    Permission: {
      PermissionId: 0,
      PermissionName: "",
      PermissionDescription: "",
      PermissionGroup: {
        PermissionGroupId: 0,
        PermissionGroupName: "",
      },
    },
    open: false,
  });

  async function SearchPermission() {
    try {
      const response = await axios.get(
        "/Permission/GET/SearchPermissionByName",
        {
          params: { PermissionName: searchTerm.trim() },
        }
      );
      setPermissions(response.data);
    } catch (error) {
      console.error("Errore durante la ricerca dei ruoli:", error);
    }
  }

  function DeletePermission(PermissionData) {
    axios
      .delete("/Permission/DELETE/DeletePermission", {
        params: { PermissionId: PermissionData.PermissionId },
      })
      .then((res) => {
        if (res.status === 200) {
          fetchData();
          window.location.reload();
        }
      })
      .catch((error) => {
        console.error("Errore nella cancellazione del permesso:", error);
      });
  }

  const exportCSV = () => {
    const headers = [
      "Permission Id",
      "Permission Name",
      "Permission Description",
      "Permission Group Name",
    ];

    const wrapInQuotes = (value: any) => {
      return typeof value === "string" ? `"${value}"` : value;
    };

    const sortedPermissions = permissions.sort(
      (a, b) => a.PermissionId - b.PermissionId
    );

    const rows = sortedPermissions.map((permission) => [
      wrapInQuotes(permission.PermissionId),
      wrapInQuotes(permission.PermissionName),
      wrapInQuotes(permission.PermissionDescription),
      wrapInQuotes(permission.GroupName),
    ]);

    console.log(rows);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      headers.map(wrapInQuotes).join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "permissions_table.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pages = Math.ceil(permissions.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return permissions.slice(start, end);
  }, [page, permissions, rowsPerPage]);

  const renderCell = React.useCallback(
    (permission: Permission, columnKey: React.Key) => {
      const cellValue = permission[columnKey as keyof Permission];

      switch (columnKey) {
        case "PermissionName":
          return <p>{cellValue}</p>;
        case "PermissionDescription":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small">{cellValue}</p>
            </div>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Button
                size="sm"
                color="primary"
                variant="light"
                startContent={<RemoveRedEyeOutlinedIcon />}
                aria-label="View"
                aria-labelledby="View"
                onClick={() =>
                  setModalData({
                    ...modalData,
                    open: true,
                    Permission: permission,
                  })
                }
                isIconOnly
              />

              {adminPermission.editPermission && (
                <Button
                  as={Link}
                  size="sm"
                  color="warning"
                  variant="light"
                  startContent={<ModeOutlinedIcon />}
                  aria-label="Edit"
                  aria-labelledby="Edit"
                  href={
                    "/administration/permission/edit-permission/" +
                    permission.PermissionId
                  }
                  isIconOnly
                />
              )}
              {adminPermission.deletePermission && (
                <ConfirmDeletePermissionModal
                  PermissionData={permission}
                  DeletePermission={DeletePermission}
                />
              )}
            </div>
          );
      }
    },
    [adminPermission]
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
              placeholder="Cerca permesso per nome..."
            />
            <Button
              color="primary"
              radius="full"
              endContent={<SearchOutlinedIcon />}
              isDisabled={searchTerm == ""}
              onClick={SearchPermission}
              className="hidden sm:flex"
            >
              Cerca
            </Button>
            <Button
              color="primary"
              radius="full"
              isDisabled={searchTerm == ""}
              onClick={SearchPermission}
              className="sm:hidden"
              isIconOnly
            >
              <SearchOutlinedIcon />
            </Button>
          </div>
          <div className="flex gap-3">
            {adminPermission.addPermission && (
              <>
                {permissions.length > 0 && (
                  <Button
                    color="primary"
                    radius="full"
                    startContent={<FileDownloadOutlinedIcon />}
                    onClick={exportCSV}
                  >
                    Esporta tabella permessi
                  </Button>
                )}
                <Button
                  as={Link}
                  href="./permission/add-permission"
                  color="primary"
                  radius="full"
                  startContent={<VpnKeyIcon />}
                  className="hidden sm:flex"
                >
                  Aggiungi permesso
                </Button>

                <Button
                  as={Link}
                  href="./permission/add-permission"
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
  }, [onRowsPerPageChange, permissions.length, searchTerm, SearchPermission]);

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
      <ViewPermissionModal
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        PermData={modalData.Permission}
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
                <LocalPoliceRoundedIcon sx={{ fontSize: 50 }} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun permesso trovato!
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Inizia aggiungendo un nuovo permesso al database.
                </p>
                <div className="mt-6">
                  <Button
                    as={Link}
                    color="primary"
                    radius="full"
                    startContent={<AddRoundedIcon />}
                    href="./permission/add-permission"
                  >
                    Aggiungi permesso
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-10">
                <LocalPoliceRoundedIcon sx={{ fontSize: 50 }} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun permesso trovato!
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
            <TableRow key={item.PermissionId}>
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
