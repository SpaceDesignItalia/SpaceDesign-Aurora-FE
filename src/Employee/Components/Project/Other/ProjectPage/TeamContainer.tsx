import { Button, Input, ScrollShadow } from "@heroui/react";
import ProjectTeamMemberCard from "../ProjectTeamMemberCard";
import { Icon } from "@iconify/react";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import AddProjectTeamMember from "../AddProjectTeamMember";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import { usePermissions } from "../../../Layout/PermissionProvider";
import ChatMessage from "../ProjectTeamChat/ChatMessage";

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
  const [onlineUsers, setOnlineUsers] = useState<onlineUser[]>([]);
  const [videoParticipantsCount, setVideoParticipantsCount] = useState(0);
  const [isInVideoCall, setIsInVideoCall] = useState(false);
  const { hasPermission } = usePermissions();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const getJitsiUrl = useCallback(() => {
    const sanitizedProjectName = projectData.ProjectName.replace(/\s+/g, "-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    return `https://meet.jit.si/${sanitizedProjectName}`;
  }, [projectData.ProjectName]);

  useEffect(() => {
    if (scrollRef.current) {
      (scrollRef.current as HTMLElement).scrollTop = (
        scrollRef.current as HTMLElement
      ).scrollHeight;
    }
  }, [scrollRef]);

  useEffect(() => {
    axios
      .get("Project/GET/GetProjetTeamMembers", {
        params: { ProjectId: projectData.ProjectId },
      })
      .then((res) => {
        setMembers(res.data);
      });

    socket.on("message-update", () => {
      handleOpenChat(Number.parseInt(localStorage.getItem("conversationId")!));
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
  }, [projectData.ProjectId]);

  useEffect(() => {
    socket.emit("get-users");
    socket.on("get-users", (users) => {
      setOnlineUsers(users);
    });
  }, []);

  useEffect(() => {
    // Controlla lo stato iniziale della stanza video
    socket.emit("check-video-room", projectData.ProjectId);

    // Ascolta gli aggiornamenti dei partecipanti
    const handleVideoParticipantsUpdate = (data: {
      projectId: number;
      count: number;
      participants: number[];
    }) => {
      if (data.projectId === projectData.ProjectId) {
        setVideoParticipantsCount(data.count);
        // Controlla se l'utente corrente è nella chiamata
        setIsInVideoCall(data.participants.includes(loggedStafferId));
      }
    };

    socket.on("video-participants-update", handleVideoParticipantsUpdate);

    // Ricevi lo stato iniziale delle stanze video
    socket.on(
      "initial-video-participants",
      (rooms: Record<string, Set<number>>) => {
        const projectRoom = rooms[projectData.ProjectId];
        if (projectRoom) {
          setVideoParticipantsCount(projectRoom.size);
          setIsInVideoCall(Array.from(projectRoom).includes(loggedStafferId));
        }
      }
    );

    return () => {
      socket.off("video-participants-update", handleVideoParticipantsUpdate);
      socket.off("initial-video-participants");
      // Se l'utente è in chiamata quando il componente viene smontato, fallo uscire
      if (isInVideoCall) {
        socket.emit("leave-video-room", projectData.ProjectId, loggedStafferId);
      }
    };
  }, [projectData.ProjectId, loggedStafferId]);

  const handleLeaveVideoCall = useCallback(() => {
    socket.emit("leave-video-room", projectData.ProjectId, loggedStafferId);
    setIsInVideoCall(false);
  }, [projectData.ProjectId, loggedStafferId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isInVideoCall) {
        handleLeaveVideoCall();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleBeforeUnload);
      if (isInVideoCall) {
        handleLeaveVideoCall();
      }
    };
  }, [isInVideoCall, handleLeaveVideoCall]);

  // Aggiungi un effetto per il ping di presenza quando si è in chiamata
  useEffect(() => {
    let pingInterval: NodeJS.Timeout | null = null;

    if (isInVideoCall) {
      // Invia un ping immediato
      socket.emit(
        "ping-video-presence",
        projectData.ProjectId,
        loggedStafferId
      );

      // Imposta l'intervallo di ping
      pingInterval = setInterval(() => {
        socket.emit(
          "ping-video-presence",
          projectData.ProjectId,
          loggedStafferId
        );
      }, 3000); // Ping ogni 3 secondi
    }

    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };
  }, [isInVideoCall, projectData.ProjectId, loggedStafferId]);

  const startJitsiCall = () => {
    const url = getJitsiUrl();
    const videoWindow = window.open(url, "_blank", "noopener,noreferrer");

    // Aggiungi l'utente alla stanza video
    socket.emit("join-video-room", projectData.ProjectId, loggedStafferId);
    setIsInVideoCall(true);

    // Gestisci la chiusura della finestra
    const checkWindow = setInterval(() => {
      if (videoWindow?.closed) {
        clearInterval(checkWindow);
        handleLeaveVideoCall();
      }
    }, 300);
  };

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
                <Icon icon="prime:send" fontSize={22} />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6 h-fit">
          <div className="flex flex-row justify-between items-center">
            <h1 className="font-semibold">Membri del progetto</h1>
            <div className="flex flex-row gap-2">
              <Button
                onClick={startJitsiCall}
                color="primary"
                variant={isInVideoCall ? "solid" : "faded"}
                radius="full"
                size="sm"
                endContent={
                  <div className="flex items-center gap-1">
                    {videoParticipantsCount > 0 && (
                      <span
                        className={`${
                          isInVideoCall
                            ? "bg-white text-primary-500"
                            : "bg-primary-500 text-white"
                        } rounded-full px-2 text-xs`}
                      >
                        {videoParticipantsCount}
                      </span>
                    )}
                    <Icon icon="solar:videocamera-linear" fontSize={22} />
                  </div>
                }
              >
                Video Chat
              </Button>
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
                      <Icon icon="mynaui:plus-solid" fontSize={22} />
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
                    <Icon icon="solar:pen-linear" fontSize={18} />
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
