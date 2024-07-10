import { Input, Select, SelectItem } from "@nextui-org/react";
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
  CompanyId: number; // Assume this field represents the CompanyId associated with the project
  StatusId: number;
}

export default function ProjectTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null); // State to hold selected company

  useEffect(() => {
    axios.get("/Project/GET/GetAllProjects").then((res) => {
      setProjects(res.data);
      setFilteredProjects(res.data); // Initialize filtered projects with all projects
    });
  }, []);

  // Function to filter projects by selected company
  useEffect(() => {
    if (selectedCompany !== null) {
      const filtered = projects.filter(
        (project) => project.CompanyId === selectedCompany
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects); // Reset to all projects if no company selected
    }
  }, [selectedCompany, projects]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between gap-3 items-end">
        {/* Input for searching project by name */}
        <Input
          radius="sm"
          variant="bordered"
          startContent={<SearchOutlinedIcon />}
          className="md:w-1/3"
          placeholder="Cerca progetto per nome..."
        />
        {/* Select for choosing company */}
        <Select
          placeholder="Seleziona azienda"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(Number(e.target.value))}
          className="md:w-1/3"
        >
          {/* Replace with actual company options */}
          <SelectItem value={1}>Azienda 1</SelectItem>
          <SelectItem value={2}>Azienda 2</SelectItem>
          {/* Add more options based on your data */}
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Map through filteredProjects instead of projects */}
        {filteredProjects.length > 0 &&
          filteredProjects.map((project) => {
            return <TableCard project={project} key={project.ProjectId} />;
          })}
      </div>
    </div>
  );
}
