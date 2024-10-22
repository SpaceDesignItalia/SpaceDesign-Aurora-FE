import { Fragment, useEffect, useState } from "react";
import { usePermissions } from "../../Layout/PermissionProvider";
import axios from "axios";
import { API_URL_IMG } from "../../../../API/API";
import { Button, cn, DateValue, Link, User } from "@nextui-org/react";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import dayjs from "dayjs";
import ConfirmDeleteProjectModal from "../Other/ConfirmDeleteProjectModal";

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
}

interface Permissions {
  addCompanyPermission: boolean;
  editCompanyermission: boolean;
  deleteCompanyPermission: boolean;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<{ [company: string]: Project[] }>(
    {}
  );
  const [adminCompanyPermission, setAdminCompanyPermission] =
    useState<Permissions>({
      addCompanyPermission: false,
      editCompanyermission: false,
      deleteCompanyPermission: false,
    });
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function checkPermissions() {
      setAdminCompanyPermission({
        addCompanyPermission: await hasPermission("CREATE_COMPANY"),
        editCompanyermission: await hasPermission("EDIT_COMPANY"),
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
        window.location.reload();
      }
    } catch (error) {
      console.error("Errore nella cancellazione dell'azienda:", error);
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

  return (
    <div className="border-2 rounded-xl py-5">
      <div className="mt-8">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full">
              <thead className="bg-white">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                  >
                    Project Name
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
                    Status
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
                        className="bg-gray-100 py-2 pl-4 pr-3 text-left text-lg font-semibold sm:pl-3  "
                      >
                        {companyName}
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
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 ">
                          {dayjs(String(project.ProjectCreationDate)).format(
                            "DD MMM YYYY"
                          )}{" "}
                          -{" "}
                          {dayjs(String(project.ProjectEndDate)).format(
                            "DD MMM YYYY"
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {displayStatus(project)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 flex flex-row gap-3">
                          <Button
                            as={Link}
                            href={
                              "/projects/" +
                              project.CompanyName +
                              "/" +
                              project.ProjectId +
                              "/" +
                              project.ProjectName
                            }
                            variant="light"
                            size="sm"
                            color="primary"
                            startContent={<RemoveRedEyeOutlinedIcon />}
                            aria-label="View"
                            aria-labelledby="View"
                            isIconOnly
                          />
                          <ConfirmDeleteProjectModal
                            ProjectData={project}
                            DeleteProject={DeleteProject}
                          />
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
