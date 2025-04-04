import ProjectTicket from "../../Table/ProjectTicket";

interface Project {
  ProjectId: number;
  ProjectName: string;
  CompanyId: number;
  UniqeCode: string;
}

interface TicketContainerProps {
  projectData: Project;
}

export default function TicketContainer({ projectData }: TicketContainerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-5 h-screen">
      <div className="col-span-6 sm:col-span-4">
        <ProjectTicket projectData={projectData} />
      </div>
    </div>
  );
}
