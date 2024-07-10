import FileList from "../ProjectFiles/FileList";
import FileUploader from "../ProjectFiles/FileUploader";
import axios from "axios";
import { useEffect, useState } from "react";

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
  const [access, setAccess] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        axios
          .get("/Staffer/GET/GetStafferRoleById", {
            params: { EmployeeId: res.data.StafferId },
          })
          .then((res) => {
            axios
              .get("/Permission/GET/GetRoleById", {
                params: { RoleId: res.data[0].RoleId },
              })
              .then((res) => {
                if (
                  res.data.RoleName === "CEO" ||
                  res.data.RoleName === "Project Manager"
                ) {
                  setAccess(true);
                }
              });
          });
      });
  }, []);

  return (
    <div className="flex flex-row gap-10">
      <FileUploader ProjectId={projectData.ProjectId} access={access} />
      <FileList ProjectId={projectData.ProjectId} access={access} />
    </div>
  );
}
