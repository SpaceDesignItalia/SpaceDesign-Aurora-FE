import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { Button, ScrollShadow, Badge } from "@nextui-org/react";
import ProjectTeamMemberCard from "../ProjectTeamMemberCard";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ChatMessage from "../ProjectTeamChat/ChatMessage";
import { useState, useEffect } from "react";
import ChatKeyboard from "../ProjectTeamChat/ChatKeyboard";
import axios from "axios";
import AddProjectTeamMember from "../AddProjectTeamMember";

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

interface Member {
  StafferId: number;
  StafferFullName: string;
  StafferEmail: string;
}

interface ModalData {
  ProjectId: number;
  open: boolean;
}

export default function TeamContainer({
  projectData,
}: {
  projectData: Project;
}) {
  const [messages, setMessages] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [editTeam, setEditTeam] = useState<boolean>(false);
  const [modalData, setModalData] = useState<ModalData>({
    ProjectId: 0,
    open: false,
  });

  useEffect(() => {
    axios
      .get("Project/GET/GetProjetTeamMembers", {
        params: { ProjectId: projectData.ProjectId },
      })
      .then((res) => {
        console.log(res.data);
        setMembers(res.data);
      });
  }, [projectData.ProjectId]);

  const handleSendMessage = (message: string) => {
    setMessages([...messages, message]);
  };

  function handleEditTeam() {
    setEditTeam(!editTeam);
  }

  return (
    <>
      <AddProjectTeamMember
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        ProjectId={modalData.ProjectId}
      />
      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col gap-5 border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6 h-fit">
          <h1 className="font-bold">Team chat</h1>
          <ScrollShadow className="w-full h-[500px]">
            <div className="flex flex-col">
              {messages.map((msg) => {
                return <ChatMessage msg={msg} type="send" />;
              })}
            </div>
          </ScrollShadow>
          <ChatKeyboard onSendMessage={handleSendMessage} />
        </div>

        <div className="flex flex-col gap-5 border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6 h-fit">
          <div className="flex flex-row justify-between items-center">
            <h1 className="font-bold">Membri del progetto</h1>

            <div className="flex flex-row gap-2">
              <Button
                color="primary"
                radius="sm"
                size="sm"
                onClick={() =>
                  setModalData({
                    ...modalData,
                    open: true,
                    ProjectId: projectData.ProjectId,
                  })
                }
                isIconOnly
              >
                <AddRoundedIcon />
              </Button>
              <Button
                onClick={handleEditTeam}
                color="warning"
                radius="sm"
                size="sm"
                className="text-white"
                isIconOnly
              >
                <EditRoundedIcon />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {members.map((member) => (
              <ProjectTeamMemberCard MemberData={member} type={editTeam} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
