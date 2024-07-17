import { Button, Input, ScrollShadow } from "@nextui-org/react";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ChatMessage from "../Other/ChatMessage";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../API/API";
import { useParams } from "react-router-dom";

const socket = io(API_WEBSOCKET_URL);

interface Message {
  MessageId: number;
  SenderImageUrl: string;
  StafferSenderId: number;
  SenderFullName: string;
  ConversationId: number;
  Date: Date;
  Text: string;
  IsCustomer: boolean;
}

export default function ProjectChat() {
  const { ProjectId } = useParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loggedCustomerId, setloggedCustomerId] = useState<number>(0);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<number>(-1);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      (scrollRef.current as HTMLElement).scrollTop = (
        scrollRef.current as HTMLElement
      ).scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then(async (res) => {
        setloggedCustomerId(res.data.CustomerId);

        return axios.get("/Project/GET/GetConversationByProjectId", {
          params: { ProjectId: ProjectId },
        });
      })
      .then((res) => {
        if (res.data.length === 0) return;
        setConversationId(res.data[1].ConversationId);
        socket.emit("join", res.data[1].ConversationId);
        handleOpenChat(res.data[1].ConversationId);
      });
    socket.on("message-update", () => {
      handleOpenChat(parseInt(localStorage.getItem("conversationId")!));
    });
  }, [messages.length]);

  function handleOpenChat(conversationId: number) {
    try {
      localStorage.setItem("conversationId", conversationId.toString());
      axios
        .get("/Project/GET/GetMessagesCustomerByConversationId", {
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
        .post("/Chat/POST/SendCustomerMessage", {
          ConversationId: conversationId,
          StafferSenderId: loggedCustomerId,
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

  function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-5 border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6 h-fit">
          <h1 className="font-bold">Team chat</h1>
          <ScrollShadow
            className="w-full h-[500px]"
            ref={scrollRef}
            hideScrollBar
          >
            <div className="flex flex-col">
              {messages.map((message) => {
                if (!message.IsCustomer) {
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
    </>
  );
}
