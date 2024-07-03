import { Avatar, Button, Input, ScrollShadow, cn } from "@nextui-org/react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ChatMessage from "../Other/ChatMessage";

const socket = io("http://localhost:3000");

interface Employee {
  EmployeeId: number;
  EmployeeFullName: string;
  EmployeeEmail: string;
  EmployeePhone: string;
}

interface Conversation {
  ConversationId: number;
  Staffer1Id: number;
  Staffer2Id: number;
  Staffer1FullName: string;
  Staffer2FullName: string;
  lastMessage: string;
  lastMessageDate?: Date;
}

interface Message {
  MessageId: number;
  StafferSenderId: number;
  ConversationId: number;
  Date: Date;
  Text: string;
}

export default function ChatTable() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loggedStafferId, setloggedStafferId] = useState<number>(0);
  const [loggedStafferFullName, setloggedStafferFullName] =
    useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<number>(-1);
  const [emplyees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    socket.on("message-update", (conversationIdWeb) => {
      const conversationId = localStorage.getItem("conversationId");
      if (conversationId !== null) {
        handleOpenChat(parseInt(conversationId));
      }
    });
  }, []);

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then(async (res) => {
        setloggedStafferId(res.data.StafferId);
        setloggedStafferFullName(
          res.data.StafferName + " " + res.data.StafferSurname
        );
        return axios.get("/Chat/GET/getConversationByStafferId", {
          params: { StafferId: res.data.StafferId },
        });
      })
      .then((res) => {
        if (res.data.length === 0) return;
        setConversations(res.data);
        setConversationId(res.data[0].ConversationId);
        socket.emit("join", res.data[0].ConversationId);
        getLastMessageInfo();
      });
  }, [conversations.length]);

  async function getLastMessageInfo() {
    conversations.map(async (conversation) => {
      await axios
        .get("/Chat/GET/GetMessagesByConversationId", {
          params: { ConversationId: conversation.ConversationId },
        })
        .then((res) => {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.ConversationId === conversation.ConversationId &&
              res.data.length > 0
                ? {
                    ...conv,
                    lastMessage: res.data[res.data.length - 1].Text,
                    lastMessageDate: res.data[res.data.length - 1].Date,
                  }
                : conv
            )
          );
          handleOpenChat(conversationId);
          setConversations((prev) => {
            const sortedConversations = [...prev];
            sortedConversations.sort((a, b) => {
              if (a.lastMessageDate && b.lastMessageDate) {
                return (
                  new Date(b.lastMessageDate).getTime() -
                  new Date(a.lastMessageDate).getTime()
                );
              }
              return 0;
            });
            return sortedConversations;
          });
        });
    });
  }

  async function SearchEmployee(e: { target: { value: string } }) {
    setSearchQuery(e.target.value.trim()); // Otteniamo il valore di ricerca e rimuoviamo gli spazi vuoti
    try {
      if (searchQuery.length === 0) {
        setEmployees([]);
        return;
      }
      await axios
        .get("/Staffer/GET/SearchStafferByEmail", {
          params: { EmployeeEmail: searchQuery },
        })
        .then((res) => {
          setMessages([]);
          setEmployees(res.data);
        });
    } catch (error) {
      console.error("Errore durante la ricerca del dipendente:", error);
    }
  }

  function handleOpenChat(conversationId: number) {
    try {
      localStorage.setItem("conversationId", conversationId.toString());
      axios
        .get("/Chat/GET/GetMessagesByConversationId", {
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

  async function doesConversationExist(employee: Employee) {
    try {
      const res = await axios.get("/Chat/GET/GetConversationByStaffersId", {
        params: {
          Staffer1Id: loggedStafferId,
          Staffer2Id: employee.EmployeeId,
        },
      });
      return res;
    } catch (error) {
      console.error(
        "Errore durante il controllo dell'esistenza della conversazione:",
        error
      );
      return undefined;
    }
  }

  async function handleCreateConversation(employee: Employee) {
    try {
      const res = await doesConversationExist(employee);
      if (res && res.data.length > 0) {
        const newConversationId = res.data[0].ConversationId;
        setConversationId(newConversationId);
        setSearchQuery("");
        handleOpenChat(newConversationId);
        return;
      }
      axios
        .post("/Chat/POST/CreateConversation", {
          Staffer1Id: loggedStafferId,
          Staffer2Id: employee.EmployeeId,
        })
        .then((res) => {
          setConversationId(res.data.ConversationId);
          setConversations((prev) => [
            ...prev,
            {
              ConversationId: res.data.ConversationId,
              Staffer1Id: loggedStafferId,
              Staffer2Id: employee.EmployeeId,
              Staffer1FullName: loggedStafferFullName,
              Staffer2FullName: employee.EmployeeFullName,
              lastMessage: "",
              lastMessageDate: undefined,
            },
          ]);
          socket.emit("join", res.data.ConversationId);
          setSearchQuery("");
          handleOpenChat(res.data.ConversationId);
        })
        .catch((error) => {
          console.error(
            "Errore durante la creazione della conversazione:",
            error
          );
        });
    } catch (error) {
      console.error("Errore durante la creazione della conversazione:", error);
    }
  }

  async function handleDeleteConversation(conversation: Conversation) {
    try {
      axios
        .delete("/Chat/DELETE/deleteConversationByConversationId", {
          params: { ConversationId: conversation.ConversationId },
        })
        .then(() => {
          setConversations((prev) =>
            prev.filter(
              (conv) => conv.ConversationId !== conversation.ConversationId
            )
          );
          setMessages([]);
        });
    } catch (error) {
      console.error(
        "Errore durante l'eliminazione della conversazione:",
        error
      );
    }
  }

  const formatDate = (dateStr: Date) => {
    if (dateStr === undefined) return undefined;

    const now = new Date();
    const date = new Date(dateStr);

    const diffTime = Math.abs(now.getDay() - date.getDay());

    switch (diffTime) {
      case 0:
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      case 1:
        return "Ieri";
      case Number(diffTime < 7):
        return date.toLocaleDateString([], { weekday: "long" });
      default:
        return date.toLocaleDateString([], {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
    }
  };

  return (
    <div className="flex flex-row w-full">
      <div className="w-1/3">
        <div className="flex flex-col gap-2 bg-white px-4 py-5 sm:px-6">
          <Input
            radius="sm"
            variant="bordered"
            startContent={<SearchOutlinedIcon />}
            value={searchQuery}
            onChange={SearchEmployee}
            placeholder="Cerca dipendente per email..."
          />
        </div>
        <div className="flex flex-col gap-2 bg-white px-4 py-5 sm:px-6">
          {searchQuery !== ""
            ? emplyees.map((employee) => (
                <div
                  key={employee.EmployeeEmail}
                  className="grid grid-cols-5 items-center border border-gray-200 rounded-xl p-5"
                  onClick={() => handleCreateConversation(employee)}
                >
                  <Avatar src="https://miro.medium.com/v2/resize:fit:1224/1*XKpA4-JcY06QcMOiPB1zaQ.jpeg" />
                  <div className="flex flex-col justify-start col-span-3">
                    <h2 className="font-bold">{employee.EmployeeFullName}</h2>
                  </div>
                </div>
              ))
            : conversations.map((conversation) => (
                <div
                  key={conversation.ConversationId}
                  className={cn(
                    "grid grid-cols-5 items-center border border-gray-200 rounded-xl p-5",
                    conversationId === conversation.ConversationId &&
                      "bg-blue-400"
                  )}
                  onClick={() => handleOpenChat(conversation.ConversationId)}
                >
                  <Avatar src="https://miro.medium.com/v2/resize:fit:1224/1*XKpA4-JcY06QcMOiPB1zaQ.jpeg" />
                  <div className="flex flex-col justify-start col-span-3">
                    <h2 className="font-bold">
                      {conversation.Staffer1Id === loggedStafferId
                        ? conversation.Staffer2FullName
                        : conversation.Staffer1FullName}
                    </h2>
                    <p className="text-gray-500">{conversation.lastMessage}</p>
                  </div>
                  <div className="flex flex-col justify-center items-center">
                    <Button
                      isIconOnly
                      color="danger"
                      onClick={() => handleDeleteConversation(conversation)}
                    >
                      <DeleteOutlinedIcon />
                    </Button>
                    <p className="flex justify-end text-sm">
                      {conversation.lastMessageDate &&
                        formatDate(conversation.lastMessageDate)}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>

      <div className="flex flex-col w-full mx-auto px-4 py-2 gap-5">
        <div className="flex flex-col space-y-2">
          <ScrollShadow>
            {searchQuery === "" &&
              messages.map((message) => {
                if (message.StafferSenderId !== loggedStafferId) {
                  return <ChatMessage message={message} type="recive" />;
                } else return <ChatMessage message={message} type="send" />;
              })}
          </ScrollShadow>
        </div>
        {conversationId != -1 && (
          <div className="flex flex-row items-center gap-3">
            <Input
              variant="bordered"
              className="w-full"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
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
        )}
      </div>
    </div>
  );
}
