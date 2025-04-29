import { Button, Input } from "@heroui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import TableCard from "../Other/TableCard";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface Project {
  ProjectId: number;
  CompanyName: string;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: string;
  ProjectEndDate: string;
  StatusId: number;
  UniqueCode: string;
}

export default function ProjectTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  function fetchProjects() {
    axios
      .get("/Project/GET/GetProjectsByCustomerId", { withCredentials: true })
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
        withCredentials: true,
        params: { ProjectName: searchQuery },
      })
      .then((res) => {
        setFilteredProjects(res.data);
      });
  }

  function clearSearchInput() {
    setSearchQuery("");
    fetchProjects();
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

  // Controlla se non ci sono progetti
  const noProjects = Object.keys(groupedProjects).length === 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-lg border shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            I tuoi progetti
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-row justify-between gap-3 items-end mb-6">
            <div className="flex flex-row gap-3 w-full">
              <Input
                radius="sm"
                variant="bordered"
                startContent={
                  <Icon icon="solar:magnifer-linear" fontSize={22} />
                }
                isClearable
                onClear={clearSearchInput}
                className="md:w-1/4"
                placeholder="Cerca progetto per nome"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                startContent={
                  <Icon icon="solar:magnifer-linear" fontSize={22} />
                }
                isDisabled={searchQuery === ""}
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
                isDisabled={searchQuery === ""}
                className="flex sm:hidden"
              >
                <Icon icon="solar:magnifer-linear" fontSize={22} />
              </Button>
            </div>
          </div>

          {noProjects && (
            <div className="flex items-center justify-center p-12 bg-white rounded-lg border">
              <div className="text-center">
                <Icon
                  icon="solar:folder-broken-linear"
                  className="mx-auto mb-4"
                  fontSize={48}
                />
                <p className="text-gray-600">Nessun progetto trovato</p>
              </div>
            </div>
          )}

          {Object.keys(groupedProjects).map((companyName, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="mb-8"
            >
              <div className="bg-white rounded-lg border overflow-hidden mb-4">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    <div className="flex items-center">
                      <Icon
                        icon="solar:buildings-3-linear"
                        className="mr-2"
                        fontSize={22}
                      />
                      {companyName}
                    </div>
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {groupedProjects[companyName].map(
                      (project: Project, projectIndex: number) => (
                        <motion.div
                          key={project.ProjectId}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.2,
                            delay: projectIndex * 0.05,
                          }}
                        >
                          <TableCard
                            key={project.ProjectId}
                            project={project}
                          />
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
