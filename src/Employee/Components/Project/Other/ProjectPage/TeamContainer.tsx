import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button, Input, ScrollShadow } from "@nextui-org/react";
import ProjectTeamMemberCard from "../ProjectTeamMemberCard";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ChatMessage from "../ProjectTeamChat/ChatMessage";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import AddProjectTeamMember from "../AddProjectTeamMember";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import { usePermissions } from "../../../Layout/PermissionProvider";

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

interface onlineUser {
  socketId: string;
  status: string;
  userId: number;
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
  const [adminPermission, setAdminPermission] = useState({
    editTeamMember: false,
  });
  const { hasPermission } = usePermissions();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      (scrollRef.current as HTMLElement).scrollTop = (
        scrollRef.current as HTMLElement
      ).scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    axios
      .get("Project/GET/GetProjetTeamMembers", {
        params: { ProjectId: projectData.ProjectId },
      })
      .then((res) => {
        setMembers(res.data);
      });
    socket.on("message-update", () => {
      handleOpenChat(parseInt(localStorage.getItem("conversationId")!));
    });
    async function checkPermissions() {
      setAdminPermission({
        editTeamMember: await hasPermission("MANAGE_TEAM_MEMBER"),
      });
    }
    checkPermissions();
  }, [projectData.ProjectId]);

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
  }, [messages.length, projectData.ProjectId]);

  const [onlineUsers, setOnlineUsers] = useState<onlineUser[]>([]);

  useEffect(() => {
    socket.emit("get-users");

    socket.on("get-users", (users) => {
      setOnlineUsers(users);
    });
  }, []);

  useEffect(() => {
    // Tab has focus
    const handleFocus = async () => {
      socket.emit("new-user-add", loggedStafferId);
      socket.on("get-users", (users) => {
        setOnlineUsers(users);
      });
    };

    // Tab closed
    const handleBlur = () => {
      if (loggedStafferId !== 0) {
        socket.emit("offline");
      }
    };

    // Track if the user changes the tab to determine when they are online
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [loggedStafferId]);

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
        .post(
          "/Chat/POST/SendMessage",
          {
            ConversationId: conversationId,
            StafferSenderId: loggedStafferId,
            Text: newMessage,
          },
          { withCredentials: true }
        )
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

  // Funzione per raggruppare i messaggi per data
  const groupMessagesByDate = (messages: Message[]) => {
    const groupedMessages: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.Date).toLocaleDateString();

      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });

    return groupedMessages;
  };

  // Raggruppa i messaggi per data
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <>
      <AddProjectTeamMember
        isOpen={modalData.open}
        isClosed={() => setModalData({ ...modalData, open: false })}
        ProjectId={modalData.ProjectId}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">
        <div className="flex flex-col gap-5 border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6 h-fit">
          <div className="flex flex-col gap-5">
            <h1 className="font-bold">Team chat</h1>
            <ScrollShadow
              className="w-full h-[500px]"
              ref={scrollRef}
              hideScrollBar
            >
              <div className="flex flex-col">
                {Object.keys(groupedMessages).map((date) => (
                  <div key={date}>
                    <div className="relative py-5">
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center"
                      >
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-2 text-sm text-gray-500">
                          {date}
                        </span>
                      </div>
                    </div>
                    {/* Data dei messaggi */}
                    {groupedMessages[date].map((message) => {
                      return (
                        <ChatMessage
                          message={message}
                          type={
                            message.StafferSenderId !== loggedStafferId
                              ? "recive"
                              : "send"
                          }
                          key={message.MessageId}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </ScrollShadow>
            <div className="flex flex-row items-center gap-3 w-full">
              <Input
                variant="bordered"
                radius="full"
                className="w-full"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Messaggio"
              />
              <Button
                onClick={handleSendMessage}
                color="primary"
                radius="full"
                isIconOnly
                isDisabled={newMessage.trim() === ""}
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
              {adminPermission.editTeamMember && (
                <>
                  {editTeam && (
                    <Button
                      color="primary"
                      radius="full"
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
                      <AddRoundedIcon sx={{ fontSize: 20 }} />
                    </Button>
                  )}
                  <Button
                    onClick={handleEditTeam}
                    color="warning"
                    variant="faded"
                    radius="full"
                    size="sm"
                    isIconOnly
                  >
                    <EditRoundedIcon sx={{ fontSize: 20 }} />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {members.map((member) =>
              member.StafferId !== projectData.ProjectManagerId ? (
                <div key={member.StafferId}>
                  <ProjectTeamMemberCard
                    MemberData={member}
                    ProjectId={projectData.ProjectId}
                    onlineUser={onlineUsers}
                    type={editTeam}
                  />
                </div>
              ) : (
                <div key={member.StafferId}>
                  <ProjectTeamMemberCard
                    MemberData={member}
                    ProjectId={projectData.ProjectId}
                    onlineUser={onlineUsers}
                    type={false}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
