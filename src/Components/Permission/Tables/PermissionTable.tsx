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
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import axios from "axios";
import ViewPermissionModal from "../Other/ViewPermissionModal";
import { usePermissions } from "../../Layout/PermissionProvider";

interface Permission {
  PermissionId: number;
  PermissionName: string;
  PermissionDescription: string;
  PermissionGroup: PermissionGroup;
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

const columns = [
  { name: "Permesso", uid: "PermissionName" },
  { name: "Descrizione", uid: "PermissionDescription" },
  { name: "Azioni", uid: "actions" },
];

export default function PermissionTable() {
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
  const { hasPermission, loadPermissions, setStafferId } = usePermissions();

  useEffect(() => {
    function checkPermissions() {
      Promise.all([
        hasPermission("CREATE_PERMISSION"),
        hasPermission("EDIT_PERMISSION"),
        hasPermission("DELETE_PERMISSION"),
      ])
        .then(([addPermission, editPermission, deletePermission]) => {
          setAdminPermission({
            addPermission,
            editPermission,
            deletePermission,
          });
        })
        .catch((error) => {
          console.error("Errore durante il controllo dei permessi:", error);
        });
    }

    function initialize() {
      setStafferId("someStafferId");
      loadPermissions("someStafferId").then(() => {
        checkPermissions();
        fetchData();
      });
    }

    initialize();
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

  function SearchPermission(e) {
    const searchQuery = e.target.value.trim();
    axios
      .get("/Permission/GET/SearchPermissionByName", {
        params: { PermissionName: searchQuery },
      })
      .then((response) => {
        setPermissions(response.data);
      })
      .catch((error) => {
        console.error("Errore durante la ricerca dei permessi:", error);
      });
  }

  function deletePermission(PermissionId) {
    axios
      .delete("/Permission/DELETE/DeletePermission", {
        params: { PermissionId: PermissionId },
      })
      .then((res) => {
        if (res.status === 200) {
          fetchData();
        }
      })
      .catch((error) => {
        console.error("Errore nella cancellazione del permesso:", error);
      });
  }

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
                        Permission: permission,
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
                    href={
                      "/administration/permission/edit-permission/" +
                      permission.PermissionId
                    }
                  >
                    Modifica
                  </DropdownItem>
                  <DropdownItem
                    color="danger"
                    startContent={<DeleteOutlinedIcon />}
                    aria-label="Remove"
                    aria-labelledby="Remove"
                    onClick={() => deletePermission(permission.PermissionId)}
                  >
                    Rimuovi
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
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
          <Input
            radius="sm"
            variant="bordered"
            startContent={<SearchOutlinedIcon />}
            onChange={SearchPermission}
            className="md:w-1/3"
            placeholder="Cerca permesso per nome..."
          />
          <div className="flex gap-3">
            {adminPermission.addPermission && (
              <>
                <Button
                  as={Link}
                  href="./permission/add-permission"
                  color="primary"
                  radius="sm"
                  startContent={<VpnKeyIcon />}
                  className="hidden sm:flex"
                >
                  Aggiungi permesso
                </Button>

                <Button
                  as={Link}
                  href="./permission/add-permission"
                  color="primary"
                  radius="sm"
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
  }, [onRowsPerPageChange, permissions.length]);

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
        <TableBody emptyContent={"Nessun permesso trovato!"} items={items}>
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
