import { Button, Input, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useEffect, useState } from "react";
import TableCard from "../Other/TableCard";

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
  UniqueCode: string;
}

export default function ProjectGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData() {
    axios.get("/Project/GET/GetAllProjectsTable").then((res) => {
      setProjects(res.data);
    });
  }

  async function SearchProject() {
    try {
      const res = await axios.get("/Project/GET/SearchProjectByName", {
        params: { ProjectName: searchTerm.trim() },
      });
      setProjects(res.data);
    } catch (error) {
      console.error("Errore durante la ricerca delle aziende:", error);
    }
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between gap-3 items-end">
        <div className="flex flex-row gap-3 w-full px-4">
          <Input
            radius="full"
            variant="bordered"
            startContent={
              <Icon
                icon="solar:magnifer-linear"
                fontSize={24}
                color="gray-400"
              />
            }
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
            endContent={<Icon icon="solar:magnifer-linear" fontSize={22} />}
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
            <Icon icon="solar:magnifer-linear" fontSize={22} />
          </Button>
        </div>
      </div>
      <div className="grid lg:grid-cols-1 xl:grid-cols-2  2xl:grid-cols-3 gap-5">
        {projects.length > 0 &&
          projects.map((project) => {
            return (
              <TableCard
                project={project}
                UniqueCode={project.UniqueCode}
                key={project.ProjectId}
              />
            );
          })}
      </div>
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center p-10">
          <Icon icon="solar:add-folder-linear" fontSize={50} />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Nessun progetto trovato
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm === ""
              ? "Inizia creando un nuovo progetto al database."
              : `Nessun risultato corrisponde alla tua ricerca: "${searchTerm}".`}
          </p>
          {searchTerm === "" && (
            <div className="mt-6">
              <Button
                as={Link}
                href="/projects/add-project"
                color="primary"
                radius="full"
                startContent={
                  <Icon icon="solar:add-folder-linear" fontSize={24} />
                }
              >
                Crea progetto
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
