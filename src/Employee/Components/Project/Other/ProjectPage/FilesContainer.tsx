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
    <div>
      <FileUploader ProjectId={projectData.ProjectId} />
    </div>
  );
}
