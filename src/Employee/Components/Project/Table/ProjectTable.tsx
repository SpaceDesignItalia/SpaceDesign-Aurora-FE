import { Button, Input, Link } from "@nextui-org/react";
import TableCard from "../Other/TableCard";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePermissions } from "../../Layout/PermissionProvider";

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: string;
  ProjectEndDate: string;
  ProjectManagerId: number;
  ProjectBannerId: number;
  CompanyId: number;
  StatusId: number;
}

export default function ProjectTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [adminPermission, setAdminPermission] = useState({
    addProject: false,
  });
  const { hasPermission } = usePermissions();

  useEffect(() => {
    axios.get("/Project/GET/GetAllProjects").then((res) => {
      setProjects(res.data);
      console.log(res.data);
    });

    async function checkPermissions() {
      setAdminPermission({
        addProject: await hasPermission("CREATE_PROJECT"),
      });
    }
    checkPermissions();
  }, []);
  async function SearchProject(e: { target: { value: string } }) {
    const searchQuery = e.target.value.trim(); // Otteniamo il valore di ricerca e rimuoviamo gli spazi vuoti
    try {
      const res = await axios.get("/Project/GET/SearchProjectByName", {
        params: { ProjectName: searchQuery },
      });
      setProjects(res.data);
    } catch (error) {
      console.error("Errore durante la ricerca delle aziende:", error);
    }
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between gap-3 items-end">
        <Input
          radius="sm"
          variant="bordered"
          startContent={<SearchOutlinedIcon />}
          onChange={SearchProject}
          className="md:w-1/3"
          placeholder="Cerca progetto per nome..."
        />
        <div className="mt-3 sm:ml-4 sm:mt-0">
          {adminPermission.addProject && (
            <>
              <Button
                as={Link}
                color="primary"
                radius="sm"
                startContent={<CreateNewFolderIcon />}
                href="/projects/add-project"
                className="hidden sm:flex"
              >
                Crea progetto
              </Button>
              <Button
                as={Link}
                color="primary"
                radius="sm"
                href="/projects/add-project"
                className="sm:hidden"
                isIconOnly
              >
                <CreateNewFolderIcon />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.length > 0 &&
          projects.map((project) => {
            return <TableCard project={project} key={project.ProjectId} />;
          })}
      </div>
    </div>
  );
}
