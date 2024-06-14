import { Button, Input, Link } from "@nextui-org/react";
import TableCard from "../Other/TableCard";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const project = {
  ProjectId: 1,
  ProjectName: "Project 1",
  ProjectDescription: "Project 1 Description",
  ProjectCreationDate: "2021-01-01",
  ProjectEndDate: "2021-01-01",
  ProjectManagerId: 1,
  ProjectBannerId: 1,
  CompanyId: 4,
  ProjectStatusId: 1,
};

export default function ProjectTable() {
  async function SearchProject(e: { target: { value: string } }) {
    const searchQuery = e.target.value.trim(); // Otteniamo il valore di ricerca e rimuoviamo gli spazi vuoti
    try {
      /* const response = await axios.get("/Customer/GET/SearchCustomerByEmail", {
        params: { CustomerEmail: searchQuery },
      }); */
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
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <TableCard project={project} />
        <TableCard project={project} />
        <TableCard project={project} />
      </div>
    </div>
  );
}
