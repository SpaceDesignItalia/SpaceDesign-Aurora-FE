import FileList from "../ProjectFiles/FileList";
import FileUploader from "../ProjectFiles/FileUploader";

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: Date;
  ProjectEndDate: Date;
  CompanyId: number;
  ProjectBannerId: number;
  ProjectBannerPath: string;
  StatusName: string;
  ProjectManagerId: number;
  ProjectManagerFullName: string;
  ProjectManagerEmail: string;
  RoleName: string;
}

export default function FilesContainer({
  projectData,
}: {
  projectData: Project;
}) {
  return (
    <div className="flex flex-row gap-10">
      <FileUploader ProjectId={projectData.ProjectId} />
      <FileList ProjectId={projectData.ProjectId} />
    </div>
  );
}
