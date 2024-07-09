import React, { useEffect, useState } from "react";
import { usePermissions } from "../../Layout/PermissionProvider";
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
} from "@nextui-org/react";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import axios from "axios";

interface Project {
  ProjectId: number;
  ProjectName: string;
}

const columns = [
  { name: "Nome Progetto", uid: "ProjectName" },
  { name: "Azioni", uid: "actions" },
];

export default function ProjectsTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const rowsPerPage = 15;
  const [adminCustomerPermission, setAdminCustomerPermission] = useState({
    addCustomerPermission: false,
    editCustomerPermission: false,
    deleteCustomerPermission: false,
  });

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });

  const { hasPermission } = usePermissions();

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        fetchData(res.data.StafferId);
      });
    async function checkPermissions() {
      setAdminCustomerPermission({
        addCustomerPermission: await hasPermission("CREATE_CUSTOMER"),
        editCustomerPermission: await hasPermission("EDIT_CUSTOMER"),
        deleteCustomerPermission: await hasPermission("DELETE_CUSTOMER"),
      });
    }
    checkPermissions();
  }, []);

  function fetchData(StafferId) {
    axios
      .get("/Project/GET/GetProjectInTeam", {
        params: { StafferId: StafferId },
      })
      .then((res) => {
        setProjects(res.data);
        console.log(res.data);
      });
  }

  const [page, setPage] = useState(1);
  const pages = Math.ceil(projects.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return projects.slice(start, end);
  }, [page, projects, rowsPerPage]);

  const renderCell = React.useCallback(
    (projects: Project, columnKey: React.Key) => {
      const cellValue = projects[columnKey as keyof Project];

      switch (columnKey) {
        case "CustomerPhone":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">
                {cellValue == null ? "Non presente" : cellValue}
              </p>
            </div>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Button color="primary" size="sm" isIconOnly>
                <OpenInNewRoundedIcon />
              </Button>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [adminCustomerPermission] // Assicurati di includere adminCustomerPermission come dipendenza
  );

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold">Progetti di cui fai parte</h1>
      </div>
    );
  }, [projects.length]);

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
    <Table
      aria-label="Example table with custom cells, pagination and sorting"
      isHeaderSticky
      isStriped
      topContent={topContent}
      bottomContent={bottomContent}
      sortDescriptor={sortDescriptor}
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
      <TableBody emptyContent={"Nessun cliente trovato!"} items={items}>
        {(item) => (
          <TableRow key={item.ProjectId}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
