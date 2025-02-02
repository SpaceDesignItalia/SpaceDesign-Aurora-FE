// @ts-nocheck
import React, { useEffect, useState } from "react";
import { usePermissions } from "../../Layout/PermissionProvider";
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
  User,
  cn,
} from "@heroui/react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CreateNewFolderRoundedIcon from "@mui/icons-material/CreateNewFolderRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import axios from "axios";
import { API_URL_IMG } from "../../../../API/API";
import ConfirmDeleteProjectModal from "../Other/ConfirmDeleteProjectModal";
import StatusAlert from "../../Layout/StatusAlert";

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectCreationDate: string;
  ProjectEndDate: string;
  ProjectManagerName: string;
  StafferImageUrl: string;
  RoleName: string;
  CompanyName: string;
  StatusId: number;
  StatusName: string;
  UniqueCode: string;
}

interface ModalData {
  Project: Project;
  open: boolean;
}

interface ModalDeleteData {
  Project: Project;
  open: boolean;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

const columns = [
  { name: "Nome Progetto", uid: "ProjectName" },
  { name: "Azienda", uid: "CompanyName" },
  { name: "Project Manager", uid: "ProjectManager" },
  { name: "Stato", uid: "Status" },
  { name: "Azioni", uid: "actions" },
];

export default function ProjectTable() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);
  const [company, setCompany] = useState<Company>({
    CompanyId: 0,
    CompanyName: "",
    CompnayPhoto: "",
  });
  const [toDoTasks, setToDoTasks] = useState<number>(0);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [adminCompanyPermission, setAdminCompanyPermission] = useState({
    deleteCompanyPermission: false,
  });
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function checkPermissions() {
      setAdminCompanyPermission({
        deleteCompanyPermission: await hasPermission("DELETE_COMPANY"),
      });
    }
    checkPermissions();
    fetchData();
  }, []);

  function fetchData() {
    axios.get("/Project/GET/GetAllProjectsTable").then((res) => {
      setProjects(res.data);
    });
  }
  const [page, setPage] = useState(1);

  async function SearchProject() {
    try {
      const res = await axios.get("/Project/GET/SearchProjectByNameTable", {
        params: { ProjectName: searchTerm.trim() },
      });
      setProjects(res.data);
    } catch (error) {
      console.error("Errore durante la ricerca delle aziende:", error);
    }
  }

  function displayStatus(project: Project) {
    const statuses = [
      "text-green-700 bg-green-50 ring-green-600/20",
      "text-orange-600 bg-orange-50 ring-orange-500/20",
      "text-red-700 bg-red-50 ring-red-600/10",
    ];

    return (
      <span
        key={project.StatusId}
        className={cn(
          statuses[project.StatusId - 1],
          "rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset"
        )}
      >
        {project.StatusName}
      </span>
    );
  }

  async function DeleteProject(ProjectData: Project) {
    try {
      const res = await axios.delete("/Project/DELETE/DeleteProject", {
        params: { ProjectId: ProjectData.ProjectId },
      });

      if (res.status === 200) {
        fetchData();
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "Il progetto è stato eliminato con successo.",
          alertColor: "green",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // General error handling
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Errore durante l'operazione",
          alertDescription:
            "Si è verificato un errore durante l'eliminazione del progetto. Per favore, riprova più tardi.",
          alertColor: "red",
        });
      }
    }
  }

  const pages = Math.ceil(projects.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return projects.slice(start, end);
  }, [page, projects, rowsPerPage]);

  const renderCell = React.useCallback(
    (project: Project, columnKey: React.Key) => {
      const cellValue = project[columnKey as keyof Project];

      switch (columnKey) {
        case "CompanyName":
          return (
            <div className="text-sm text-gray-500 hover:text-gray-600">
              {project.CompanyName !== null
                ? project.CompanyName
                : "Senza Azienda"}
            </div>
          );
        case "ProjectManager":
          return (
            <div className="flex justify-start">
              <User
                name={project.ProjectManagerName}
                description={project.RoleName}
                avatarProps={{
                  isBordered: true,
                  size: "sm",
                  src:
                    project.StafferImageUrl &&
                    API_URL_IMG + "/profileIcons/" + project.StafferImageUrl,
                }}
              />
            </div>
          );
        case "Status":
          return <div> {displayStatus(project)}</div>;
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Button
                as={Link}
                href={"/projects/" + project.UniqueCode}
                variant="light"
                size="sm"
                color="primary"
                startContent={<RemoveRedEyeOutlinedIcon />}
                aria-label="View"
                aria-labelledby="View"
                isIconOnly
              />
              {adminCompanyPermission.deleteCompanyPermission && (
                <ConfirmDeleteProjectModal
                  ProjectData={project}
                  DeleteProject={DeleteProject}
                />
              )}
            </div>
          );
        default:
          return cellValue;
      }
    },
    [adminCompanyPermission]
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
              startContent={<SearchOutlinedIcon className="text-gray-400" />}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.trim() === "") {
                  fetchData();
                }
              }}
              value={searchTerm}
              className="md:w-1/3"
              placeholder="Cerca per nome progetto..."
            />
            <Button
              color="primary"
              radius="full"
              endContent={<SearchOutlinedIcon />}
              isDisabled={searchTerm == ""}
              onClick={SearchProject}
              className="hidden sm:flex"
            >
              Cerca
            </Button>
            <Button
              color="primary"
              radius="full"
              isDisabled={searchTerm == ""}
              onClick={SearchProject}
              className="sm:hidden"
              isIconOnly
            >
              <SearchOutlinedIcon />
            </Button>
          </div>
        </div>
      </div>
    );
  }, [onRowsPerPageChange, projects.length, searchTerm, SearchProject]);

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
      <StatusAlert AlertData={alertData} />
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
        {searchTerm}
        <TableBody
          emptyContent={
            searchTerm == "" ? (
              <div className="text-center p-10">
                <CreateNewFolderRoundedIcon sx={{ fontSize: 50 }} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun progetto trovato
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Inizia creando una nuovo progetto al database.
                </p>
                <div className="mt-6">
                  <Button
                    as={Link}
                    href="/projects/add-project"
                    color="primary"
                    radius="full"
                    startContent={<CreateNewFolderRoundedIcon />}
                  >
                    Crea progetto
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-10">
                <CreateNewFolderRoundedIcon sx={{ fontSize: 50 }} />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nessun progetto trovato!
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
          {(item: Project) => (
            <TableRow key={item.ProjectId}>
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
