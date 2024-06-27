import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button, Input, ScrollShadow, cn } from "@nextui-org/react";
import ProjectTeamMemberCard from "../ProjectTeamMemberCard";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ChatMessage from "../ProjectTeamChat/ChatMessage";
import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import AddProjectTeamMember from "../AddProjectTeamMember";
import { API_WEBSOCKET_URL } from "../../../../API/API";

const socket = io(API_WEBSOCKET_URL);

interface Message {
  MessageId: number;
  StafferImageUrl: string;
  StafferSenderId: number;
  StafferSenderFullName: string;
  ConversationId: number;
  Date: Date;
  Text: string;
}

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
  StafferImageUrl: string;
  StafferFullName: string;
  StafferEmail: string;
  RoleName: string;
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
  const [members, setMembers] = useState<Member[]>([]);
  const [editTeam, setEditTeam] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loggedStafferId, setloggedStafferId] = useState<number>(0);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<number>(-1);
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
        setMembers(res.data);
      });
  }, [projectData.ProjectId]);

  useEffect(() => {
    socket.on("message-update", (conversationId) => {
      handleOpenChat(parseInt(localStorage.getItem("conversationId")!));
    });
  }, []);

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then(async (res) => {
        setloggedStafferId(res.data.StafferId);

        return axios.get("/Project/GET/GetConversationByProjectId", {
          params: { ProjectId: projectData.ProjectId },
        });
      })
      .then((res) => {
        if (res.data.length === 0) return;
        setConversationId(res.data[0].ConversationId);
        socket.emit("join", res.data[0].ConversationId);
        handleOpenChat(res.data[0].ConversationId);
      });
  }, [messages.length]);

  function handleOpenChat(conversationId: number) {
    try {
      localStorage.setItem("conversationId", conversationId.toString());
      axios
        .get("/Project/GET/GetMessagesByConversationId", {
          params: { ConversationId: conversationId },
        })
        .then((res) => {
          setMessages(res.data);
          setConversationId(conversationId);
          socket.emit("join", conversationId);
        });
    } catch (error) {
      console.error("Errore durante l'apertura della chat:", error);
    }
  }

  function handleSendMessage() {
    if (newMessage.trim() === "") return;
    try {
      axios
        .post("/Chat/POST/SendMessage", {
          ConversationId: conversationId,
          StafferSenderId: loggedStafferId,
          Text: newMessage,
        })
        .then(() => {
          socket.emit("message", conversationId);
          setConversationId(conversationId);
          setNewMessage("");
        });
    } catch (error) {
      console.error("Errore durante l'invio del messaggio:", error);
    }
  }

  function handleEditTeam() {
    setEditTeam(!editTeam);
  }

  function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleSendMessage();
    }
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
          <div className="flex flex-col gap-5">
            <h1 className="font-bold">Team chat</h1>
            <ScrollShadow className="w-full h-[500px]">
              <div className="flex flex-col">
                {messages.map((message) => {
                  if (message.StafferSenderId !== loggedStafferId) {
                    return (
                      <ChatMessage
                        message={message}
                        type="recive"
                        key={message.MessageId}
                      />
                    );
                  } else
                    return (
                      <ChatMessage
                        message={message}
                        type="send"
                        key={message.MessageId}
                      />
                    );
                })}
              </div>
            </ScrollShadow>
            <div className="flex flex-row items-center gap-3 w-full">
              <Input
                variant="bordered"
                className="w-full"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Messaggio"
              />
              <Button
                onClick={handleSendMessage}
                color="primary"
                isIconOnly
                isDisabled={newMessage.trim() === "" ? true : false}
              >
                <SendRoundedIcon />
              </Button>
            </div>
          </div>
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
            {members.map((member) =>
              member.StafferId !== projectData.ProjectManagerId ? (
                <ProjectTeamMemberCard
                  MemberData={member}
                  ProjectId={projectData.ProjectId}
                  type={editTeam}
                  key={member.StafferId}
                />
              ) : (
                <ProjectTeamMemberCard
                  MemberData={member}
                  ProjectId={projectData.ProjectId}
                  type={false}
                  key={member.StafferId}
                />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
