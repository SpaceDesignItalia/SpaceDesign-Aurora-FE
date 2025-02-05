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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { usePermissions } from "../../Layout/PermissionProvider";
import ConfirmDeletePermissionModal from "../Other/ConfirmDeletePermissionModal";
import ViewPermissionModal from "../Other/ViewPermissionModal";

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

  function DeletePermission(PermissionData: PermissionDelete) {
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
      wrapInQuotes(permission.PermissionGroup.PermissionGroupName),
    ]);

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
      switch (columnKey) {
        case "PermissionName":
          return <p>{permission.PermissionName}</p>;
        case "PermissionDescription":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small">
                {permission.PermissionDescription}
              </p>
            </div>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Button
                size="sm"
                color="primary"
                variant="light"
                startContent={<Icon icon="solar:eye-linear" fontSize={24} />}
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
                  startContent={<Icon icon="solar:pen-linear" fontSize={22} />}
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
              startContent={<Icon icon="solar:magnifer-linear" fontSize={22} />}
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
              endContent={<Icon icon="solar:magnifer-linear" fontSize={22} />}
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
              <Icon icon="solar:magnifer-linear" fontSize={22} />
            </Button>
          </div>
          <div className="flex gap-3">
            {adminPermission.addPermission && (
              <>
                <Button
                  as={Link}
                  href="./permission/add-permission"
                  color="primary"
                  radius="full"
                  startContent={<Icon icon="solar:key-linear" fontSize={24} />}
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
                  <Icon icon="solar:shield-plus-linear" fontSize={24} />
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
      <div className="flex justify-between items-center">
        <div className="w-full">
          {permissions.length > 0 && (
            <Button
              color="primary"
              variant="ghost"
              radius="full"
              startContent={
                <Icon icon="solar:file-download-linear" fontSize={24} />
              }
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
              <div className="flex flex-col items-center justify-center p-10">
                <Icon icon="solar:shield-star-linear" fontSize={50} />
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
                    startContent={
                      <Icon icon="solar:shield-plus-linear" fontSize={24} />
                    }
                    href="./permission/add-permission"
                  >
                    Aggiungi permesso
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10">
                <Icon icon="solar:shield-star-linear" fontSize={50} />
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
