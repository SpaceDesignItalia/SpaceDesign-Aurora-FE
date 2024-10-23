import { Input } from "@nextui-org/react";
import TableCard from "../Other/TableCard";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useEffect, useState } from "react";
import axios from "axios";

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

export default function ProjectGrid() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    axios.get("/Project/GET/GetAllProjects").then((res) => {
      setProjects(res.data);
    });
  }, []);
  async function SearchProject(e: { target: { value: string } }) {
    const searchQuery = e.target.value.trim();
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
          radius="full"
          variant="bordered"
          startContent={<SearchOutlinedIcon />}
          onChange={SearchProject}
          className="md:w-1/3"
          placeholder="Cerca per nome progetto..."
        />
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
