import { Button, Input } from "@nextui-org/react";
import TableCard from "../Other/TableCard";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useEffect, useState } from "react";
import axios from "axios";

interface Project {
  ProjectId: number;
  CompanyName: string;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: string;
  ProjectEndDate: string;
  StatusId: number;
}

interface userData {
  CustomerId: number;
  CustomerName: string;
  CustomerSurname: string;
  CustomerEmail: string;
  CustomerPhone: string | null;
}

const USERDATA_VALUE: userData = {
  CustomerId: 0,
  CustomerName: "",
  CustomerSurname: "",
  CustomerEmail: "",
  CustomerPhone: null,
};

export default function ProjectTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userData, setUserData] = useState<userData>(USERDATA_VALUE);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        setUserData(res.data);
        fetchProjects(res.data.CustomerId);
      });
  }, []);

  function fetchProjects(CustomerId: number) {
    axios
      .get("/Project/GET/GetProjectsByCustomerId", {
        params: { CustomerId: CustomerId },
      })
      .then((res) => {
        setProjects(res.data);
        setFilteredProjects(res.data);
      });
  }

  function searchProject() {
    if (searchQuery.trim() === "") {
      setFilteredProjects(projects);
      return;
    }

    axios
      .get("/Project/GET/SearchProjectByCustomerIdAndName", {
        params: { CustomerId: userData.CustomerId, ProjectName: searchQuery },
      })
      .then((res) => {
        setFilteredProjects(res.data);
      });
  }

  function clearSearchInput() {
    setSearchQuery("");
    fetchProjects(userData.CustomerId);
  }

  // Function to group projects by CompanyName
  const groupProjectsByCompany = (projects: Project[]) => {
    return projects.reduce((acc, project) => {
      const { CompanyName } = project;
      if (!acc[CompanyName]) {
        acc[CompanyName] = [];
      }
      acc[CompanyName].push(project);
      return acc;
    }, {} as { [key: string]: Project[] });
  };

  const groupedProjects = groupProjectsByCompany(filteredProjects);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between gap-3 items-end">
        <div className="flex flex-row gap-3 w-full">
          <Input
            radius="sm"
            variant="bordered"
            startContent={<SearchOutlinedIcon />}
            isClearable
            onClear={clearSearchInput}
            className="md:w-1/4"
            placeholder="Cerca progetto per nome"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            startContent={<SearchOutlinedIcon />}
            isDisabled={searchQuery == ""}
            color="primary"
            radius="sm"
            onClick={searchProject}
            className="hidden sm:flex"
          >
            Cerca
          </Button>
          <Button
            isIconOnly
            color="primary"
            radius="sm"
            onClick={searchProject}
            isDisabled={searchQuery == ""}
            className="flex sm:hidden"
          >
            <SearchOutlinedIcon />
          </Button>
        </div>
      </div>
      {Object.keys(groupedProjects).map((companyName, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{companyName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {groupedProjects[companyName].map((project: Project) => (
              <TableCard key={project.ProjectId} project={project} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
