import { Fragment, useEffect, useState } from "react";
import { usePermissions } from "../../Layout/PermissionProvider";
import axios from "axios";
import { API_URL_IMG } from "../../../../API/API";
import { Button, cn, DateValue, Input, Link, User } from "@heroui/react";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import CreateNewFolderRoundedIcon from "@mui/icons-material/CreateNewFolderRounded";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import dayjs from "dayjs";
import ConfirmDeleteProjectModal from "../Other/ConfirmDeleteProjectModal";
import StatusAlert from "../../Layout/StatusAlert";

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectCreationDate: DateValue;
  ProjectEndDate: DateValue;
  ProjectManagerName: string;
  StafferImageUrl: string;
  RoleName: string;
  CompanyId: number;
  CompanyName: string;
  StatusId: number;
  StatusName: string;
  UniqueCode: string;
}

interface Permissions {
  deleteCompanyPermission: boolean;
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

export default function ProjectList() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);
  const [projects, setProjects] = useState<{ [company: string]: Project[] }>(
    {}
  );
  const [adminCompanyPermission, setAdminCompanyPermission] =
    useState<Permissions>({
      deleteCompanyPermission: false,
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

  async function fetchData() {
    try {
      const res = await axios.get("/Project/GET/GetAllProjectsTable");
      const projectsArray: Project[] = res.data;

      // Raggruppare i progetti per CompanyName
      const groupedProjects = projectsArray.reduce((acc, project) => {
        if (!acc[project.CompanyName]) {
          acc[project.CompanyName] = [];
        }
        acc[project.CompanyName].push(project);
        return acc;
      }, {} as { [company: string]: Project[] });

      setProjects(groupedProjects);
      console.log("Progetto iniziale: ", res.data);
    } catch (error) {
      console.error("Errore nel caricamento dei progetti:", error);
    }
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
      console.error("Errore nella cancellazione del progetto:", error);
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

  async function SearchProject() {
    try {
      const res = await axios.get("/Project/GET/SearchProjectByNameTable", {
        params: { ProjectName: searchTerm.trim() },
      });
      const projectsArray: Project[] = res.data;

      // Raggruppa di nuovo i progetti per CompanyName
      const groupedProjects = projectsArray.reduce((acc, project) => {
        if (!acc[project.CompanyName]) {
          acc[project.CompanyName] = [];
        }
        acc[project.CompanyName].push(project);
        return acc;
      }, {} as { [company: string]: Project[] });

      console.log("Progetti raggruppati SearchProject:", groupedProjects); // Verifica che i progetti siano raggruppati correttamente
      setProjects(groupedProjects);
    } catch (error) {
      console.error("Errore durante la ricerca delle aziende:", error);
    }
  }

  return (
    <div className="border-2 rounded-xl py-5">
      <StatusAlert AlertData={alertData} />
      <div className="flex flex-row justify-between gap-3 items-end">
        <div className="flex flex-row gap-3 w-full px-4">
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
      <div className="mt-8">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {Object.keys(projects).length === 0 ? (
              <>
                {searchTerm == "" ? (
                  <div className="text-center p-10">
                    <CreateNewFolderRoundedIcon sx={{ fontSize: 50 }} />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                      Nessun progetto trovato!
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
                )}
              </>
            ) : (
              // Renderizza la tabella se ci sono progetti
              <table className="min-w-full">
                <thead className="bg-white border-t-2">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                    >
                      Nome Progetto
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Project Manager
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Durata
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Stato
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {Object.keys(projects).map((companyName) => (
                    <Fragment key={companyName}>
                      <tr>
                        <th
                          scope="colgroup"
                          colSpan={5}
                          className="bg-gray-100 py-2 pl-4 pr-3 text-left text-lg font-semibold sm:pl-3"
                        >
                          {companyName != "null"
                            ? companyName
                            : "Senza Azienda"}
                        </th>
                      </tr>
                      {projects[companyName].map((project: Project) => (
                        <tr
                          key={project.ProjectId}
                          className="border-t border-gray-200"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                            {project.ProjectName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <User
                              name={project.ProjectManagerName}
                              description={project.RoleName}
                              avatarProps={{
                                isBordered: true,
                                size: "sm",
                                src:
                                  project.StafferImageUrl &&
                                  API_URL_IMG +
                                    "/profileIcons/" +
                                    project.StafferImageUrl,
                              }}
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {dayjs(String(project.ProjectCreationDate)).format(
                              "DD MMM YYYY"
                            )}{" "}
                            -{" "}
                            {project.ProjectEndDate
                              ? dayjs(String(project.ProjectEndDate)).format(
                                  "DD MMM YYYY"
                                )
                              : "Nessuna data di fine"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {displayStatus(project)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 flex flex-row gap-3">
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
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
