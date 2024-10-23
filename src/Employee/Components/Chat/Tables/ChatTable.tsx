import {
  Avatar,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ScrollShadow,
  cn,
  useDisclosure,
} from "@nextui-org/react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import RecentActorsRoundedIcon from "@mui/icons-material/RecentActorsRounded";
import AddCommentRoundedIcon from "@mui/icons-material/AddCommentRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import ChatMessage from "../Other/ChatMessage";
import AddConversationModal from "../Other/AddConversationModal";
import { API_URL_IMG, API_WEBSOCKET_URL } from "../../../../API/API";
import dayjs from "dayjs";
import "dayjs/locale/it";

dayjs.locale("it");

const socket: Socket = io(API_WEBSOCKET_URL);

interface Conversation {
  ConversationId: number;
  Staffer1Id: number;
  Staffer2Id: number;
  Staffer1FullName: string;
  Staffer2FullName: string;
  Staffer1ImageUrl: string;
  Staffer2ImageUrl: string;
  lastMessage: string;
  lastMessageDate?: Date;
  notificationCount: number;
}

interface Message {
  MessageId: number;
  StafferSenderId: number;
  StafferImageUrl: string;
  ConversationId: number;
  Date: Date;
  Text: string;
}

interface ModalAddData {
  loggedStafferId: number;
  open: boolean;
}

export default function ChatTable() {
  const { isOpen, onOpenChange } = useDisclosure();
  const [modalAddData, setModalAddData] = useState<ModalAddData>({
    loggedStafferId: 0,
    open: false,
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loggedStafferId, setLoggedStafferId] = useState<number>(0);
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null); // State to hold selected conversation details
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [messagesLoaded, setMessagesLoaded] = useState<boolean>(false); // State to track if messages are already loaded
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      (scrollRef.current as HTMLElement).scrollTop = (
        scrollRef.current as HTMLElement
      ).scrollHeight;
    }
  }, [messages]);

  // Connect to socket and handle message updates
  useEffect(() => {
    socket.on("message-update", (updatedMessageConversationId: number) => {
      const storageConversationId = localStorage.getItem(
        "selectedConversationId"
      );
      if (
        storageConversationId &&
        Number(updatedMessageConversationId) === Number(storageConversationId)
      ) {
        handleOpenChat(Number(storageConversationId));
        setMessagesLoaded(false);
      } else {
        setMessagesLoaded(false);
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.ConversationId === updatedMessageConversationId
              ? { ...conv, notificationCount: conv.notificationCount + 1 }
              : conv
          )
        );
      }
    });
  }, []);

  useEffect(() => {
    // Fetch logged in staffer's data and conversations
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then(async (res) => {
        const stafferId = res.data.StafferId;
        setLoggedStafferId(stafferId);
        setModalAddData({ ...modalAddData, loggedStafferId: stafferId });

        const response = await axios.get(
          "/Chat/GET/getConversationByStafferId",
          {
            params: { StafferId: stafferId },
            withCredentials: true,
          }
        );

        const convData = response.data;
        if (convData.length > 0) {
          setConversations(convData);
        }
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
      });
  }, []); // This effect should run only once when component mounts

  useEffect(() => {
    // Fetch last messages for all conversations initially
    if (conversations.length > 0 && !messagesLoaded) {
      getLastMessageInfo(conversations);
      setMessagesLoaded(true);
    }
  }, [conversations, messagesLoaded]);

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

  async function getLastMessageInfo(conversations: Conversation[]) {
    // Fetch last messages for each conversation
    try {
      const fetchMessages = conversations.map(async (conversation) => {
        const response = await axios.get(
          "/Chat/GET/GetMessagesByConversationId",
          {
            params: { ConversationId: conversation.ConversationId },
          }
        );

        const messagesData = response.data;
        if (messagesData.length > 0) {
          const lastMessage = messagesData[messagesData.length - 1];
          return {
            ...conversation,
            lastMessage: lastMessage.Text,
            lastMessageDate: new Date(lastMessage.Date),
          };
        }
        return conversation;
      });

      const updatedConversations = await Promise.all(fetchMessages);
      updatedConversations.sort((a, b) =>
        b.lastMessageDate && a.lastMessageDate
          ? b.lastMessageDate.getTime() - a.lastMessageDate.getTime()
          : 0
      );
      setConversations(updatedConversations);
    } catch (error) {
      console.error("Error fetching last message info:", error);
    }
  }

  async function handleOpenChat(conversationId: number) {
    // Handle opening a conversation
    try {
      setSelectedConversationId(conversationId);
      localStorage.setItem("selectedConversationId", conversationId.toString());
      socket.emit("join-notifications", loggedStafferId);

      const response = await axios.get(
        "/Chat/GET/GetMessagesByConversationId",
        {
          params: { ConversationId: conversationId },
        }
      );
      let StafferId = 0;

      conversations.forEach((conv) => {
        if (conv.ConversationId === conversationId) {
          if (loggedStafferId === conv.Staffer1Id) {
            StafferId = conv.Staffer2Id;
          } else {
            StafferId = conv.Staffer1Id;
          }
        }
      });
      await axios
        .delete("Notification/DELETE/DeleteConversationNotifications", {
          params: {
            UserId: loggedStafferId,
            StafferId: StafferId,
          },
        })
        .then(() => {
          conversations.forEach((conv) => {
            if (conv.ConversationId === conversationId) {
              conv.notificationCount = 0;
            }
          });
          socket.emit("delete-notifications", loggedStafferId);
        });

      setMessages(response.data);
      socket.emit("join", conversationId);

      // Find the selected conversation details
      const selectedConv = conversations.find(
        (conv) => conv.ConversationId === conversationId
      );
      if (selectedConv) {
        setSelectedConversation(selectedConv);
      }
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  }

  function handleSendMessage() {
    // Handle sending a message
    if (newMessage.trim() === "") return;
    try {
      axios
        .post(
          "/Chat/POST/SendMessage",
          {
            ConversationId: selectedConversationId!,
            StafferSenderId: loggedStafferId,
            Text: newMessage,
          },
          { withCredentials: true }
        )
        .then(() => {
          socket.emit("message", selectedConversationId!);
          setNewMessage("");
        });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  async function handleDeleteConversation(conversation: Conversation) {
    // Handle deleting a conversation
    try {
      await axios.delete("/Chat/DELETE/deleteConversationByConversationId", {
        params: { ConversationId: conversation.ConversationId },
      });

      setConversations((prevConversations) =>
        prevConversations.filter(
          (conv) => conv.ConversationId !== conversation.ConversationId
        )
      );
      setMessages([]);
      setSelectedConversationId(null); // Reset selected conversation
      setSelectedConversation(null);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  }

  const formatDate = (dateStr: Date) => {
    // Format date for display
    const date = dayjs(dateStr);
    const now = dayjs();

    if (now.isSame(date, "day")) {
      return date.format("HH:mm");
    } else if (now.subtract(1, "day").isSame(date, "day")) {
      return "Ieri";
    } else if (now.diff(date, "day") < 7) {
      return date.format("dddd");
    } else {
      return date.format("DD/MM/YYYY");
    }
  };

  function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  }

  return (
    <div className="flex flex-col lg:flex-row w-full h-5/6">
      <AddConversationModal
        isOpen={modalAddData.open}
        isClosed={() => setModalAddData({ ...modalAddData, open: false })}
        loggedStafferId={modalAddData.loggedStafferId}
        handleOpenChat={handleOpenChat}
      />

      <div className="w-full lg:hidden flex justify-between items-center p-3">
        <h1 className="text-2xl font-semibold">Chat</h1>
        <Button
          size="lg"
          color="primary"
          variant="light"
          radius="full"
          isIconOnly
          startContent={<RecentActorsRoundedIcon />}
          className="lg:hidden"
          onClick={onOpenChange}
        />

        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full">
          <ModalContent>
            <ModalHeader>
              <h1>Seleziona una chat o creane una</h1>
            </ModalHeader>
            <div className="flex flex-row justify-between gap-3 px-4 py-5 sm:px-6">
              <Input
                radius="full"
                variant="bordered"
                startContent={<SearchOutlinedIcon />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca conversazione"
              />
              <Button
                isIconOnly
                color="primary"
                radius="full"
                onClick={() => setModalAddData({ ...modalAddData, open: true })}
              >
                <AddCommentRoundedIcon />
              </Button>
            </div>
            <div className="overflow-y-auto flex flex-col">
              {conversations
                .filter(
                  (conversation) =>
                    conversation.Staffer1FullName.toLowerCase().includes(
                      searchQuery.toLowerCase()
                    ) ||
                    conversation.Staffer2FullName.toLowerCase().includes(
                      searchQuery.toLowerCase()
                    )
                )
                .map((conversation) => (
                  <div
                    key={conversation.ConversationId}
                    className={cn(
                      "flex flex-row items-center p-3 cursor-pointer transition duration-300 ease-in-out border-b border-t w-full",
                      selectedConversationId === conversation.ConversationId &&
                        "bg-gray-100 border-0 border-r-3 border-primary"
                    )}
                    onClick={() => {
                      handleOpenChat(conversation.ConversationId);
                      onOpenChange();
                    }}
                  >
                    <div>
                      <Avatar
                        src={
                          conversation.Staffer1Id === loggedStafferId
                            ? API_URL_IMG +
                              "/profileIcons/" +
                              conversation.Staffer2ImageUrl
                            : API_URL_IMG +
                              "/profileIcons/" +
                              conversation.Staffer1ImageUrl
                        }
                        size="lg"
                      />
                    </div>
                    <div className="ml-4 flex flex-col w-5/6">
                      <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">
                          {conversation.Staffer1Id === loggedStafferId
                            ? conversation.Staffer2FullName
                            : conversation.Staffer1FullName}
                        </h2>
                        {conversation.lastMessageDate && (
                          <p className="text-sm text-gray-500">
                            {formatDate(conversation.lastMessageDate)}
                          </p>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-gray-500 truncate w-auto">
                          {conversation.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              {searchQuery !== "" &&
                !conversations.some(
                  (conversation) =>
                    conversation.Staffer1FullName.toLowerCase().includes(
                      searchQuery.toLowerCase()
                    ) ||
                    conversation.Staffer2FullName.toLowerCase().includes(
                      searchQuery.toLowerCase()
                    )
                ) && (
                  <div className="flex justify-center items-center py-4">
                    <p className="text-gray-500">
                      Nessuna conversazione trovata!
                    </p>
                  </div>
                )}
            </div>
          </ModalContent>
        </Modal>
      </div>

      {conversations.length > 0 ? (
        <>
          <div className="hidden lg:flex flex-col w-1/3 bg-white">
            <div className="flex flex-row justify-between gap-3 px-4 py-5 sm:px-6">
              <Input
                radius="full"
                variant="bordered"
                startContent={<SearchOutlinedIcon />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca conversazione"
              />
              <Button
                isIconOnly
                color="primary"
                radius="full"
                onClick={() => setModalAddData({ ...modalAddData, open: true })}
              >
                <AddCommentRoundedIcon />
              </Button>
            </div>
            <div className="overflow-y-auto flex flex-col">
              {conversations
                .filter(
                  (conversation) =>
                    conversation.Staffer1FullName.toLowerCase().includes(
                      searchQuery.toLowerCase()
                    ) ||
                    conversation.Staffer2FullName.toLowerCase().includes(
                      searchQuery.toLowerCase()
                    )
                )
                .map((conversation) => (
                  <div
                    key={conversation.ConversationId}
                    className={cn(
                      "flex flex-row items-center p-3 cursor-pointer transition duration-300 ease-in-out border-b border-t w-full",
                      selectedConversationId === conversation.ConversationId &&
                        "bg-gray-100 border-0 border-r-3 border-primary"
                    )}
                    onClick={() => handleOpenChat(conversation.ConversationId)}
                  >
                    <div>
                      <Avatar
                        src={
                          conversation.Staffer1Id === loggedStafferId
                            ? API_URL_IMG +
                              "/profileIcons/" +
                              conversation.Staffer2ImageUrl
                            : API_URL_IMG +
                              "/profileIcons/" +
                              conversation.Staffer1ImageUrl
                        }
                        size="lg"
                      />
                    </div>
                    <div className="ml-4 flex flex-col w-5/6">
                      <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">
                          {conversation.Staffer1Id === loggedStafferId
                            ? conversation.Staffer2FullName
                            : conversation.Staffer1FullName}
                        </h2>
                        {conversation.lastMessageDate && (
                          <p className="text-sm text-gray-500">
                            {formatDate(conversation.lastMessageDate)}
                          </p>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-gray-500 truncate w-auto">
                          {conversation.lastMessage}
                        </p>
                      )}
                    </div>
                    {conversation.notificationCount > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center h-fit px-[4px] py-0.5 text-xs font-bold leading-none text-white bg-primary rounded-full self-center">
                        {conversation.notificationCount}
                      </span>
                    )}
                  </div>
                ))}
              {searchQuery !== "" &&
                !conversations.some(
                  (conversation) =>
                    conversation.Staffer1FullName.toLowerCase().includes(
                      searchQuery.toLowerCase()
                    ) ||
                    conversation.Staffer2FullName.toLowerCase().includes(
                      searchQuery.toLowerCase()
                    )
                ) && (
                  <div className="flex justify-center items-center py-4">
                    <p className="text-gray-500">
                      Nessuna conversazione trovata!
                    </p>
                  </div>
                )}
            </div>
          </div>

          <div className="flex flex-col w-full mx-auto py-2 lg:border-l h-[calc(100vh-80px)]">
            {selectedConversation ? (
              <>
                <div className="flex justify-between items-center mb-3 px-4 py-2 border-b border-t lg:border-t-0">
                  <div className="flex flex-row gap-2 justify-center items-center">
                    <Avatar
                      src={
                        selectedConversation.Staffer1Id === loggedStafferId
                          ? selectedConversation.Staffer2ImageUrl &&
                            API_URL_IMG +
                              "/profileIcons/" +
                              selectedConversation.Staffer2ImageUrl
                          : selectedConversation.Staffer1ImageUrl &&
                            API_URL_IMG +
                              "/profileIcons/" +
                              selectedConversation.Staffer1ImageUrl
                      }
                      size="lg"
                    />
                    <h2 className="ml-2 font-bold">
                      {selectedConversation.Staffer1Id === loggedStafferId
                        ? selectedConversation.Staffer2FullName
                        : selectedConversation.Staffer1FullName}
                    </h2>
                  </div>
                  <Button
                    size="sm"
                    isIconOnly
                    color="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(selectedConversation);
                    }}
                  >
                    <DeleteOutlinedIcon />
                  </Button>
                </div>

                <div className="flex flex-col flex-1 space-y-2 overflow-y-auto mt-3 px-4 py-3">
                  <ScrollShadow
                    ref={scrollRef}
                    className="h-fit py-10"
                    hideScrollBar
                  >
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
                        {/* Mostra la data */}
                        {groupedMessages[date].map((message) =>
                          message.StafferSenderId !== loggedStafferId ? (
                            <ChatMessage
                              key={message.MessageId}
                              message={message}
                              type="recive"
                            />
                          ) : (
                            <ChatMessage
                              key={message.MessageId}
                              message={message}
                              type="send"
                            />
                          )
                        )}
                      </div>
                    ))}
                  </ScrollShadow>
                </div>

                <div className="flex flex-row items-center gap-3 w-full px-4">
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
                    radius="full"
                    isIconOnly
                    isDisabled={newMessage.trim() === "" ? true : false}
                  >
                    <SendRoundedIcon />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col h-screen justify-center items-center p-2">
                <Groups2RoundedIcon sx={{ fontSize: 50 }} />
                <h3 className="mt-2 text-base font-semibold text-gray-900">
                  Nessuna conversazione selezionata
                </h3>
                <p className="mt-1 text-base text-gray-500 text-center">
                  Inizia selezionando una conversazione dall'elenco o crea una
                  nuova conversazione.
                </p>
                <div className="mt-6">
                  <Button
                    startContent={<AddCommentRoundedIcon />}
                    color="primary"
                    radius="full"
                    onClick={() =>
                      setModalAddData({ ...modalAddData, open: true })
                    }
                  >
                    Crea una nuova conversazione
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full flex flex-col h-screen justify-center items-center">
          <Groups2RoundedIcon sx={{ fontSize: 50 }} />
          <h3 className="mt-2 text-base font-semibold text-gray-900">
            Nessuna conversazione trovata!
          </h3>
          <p className="mt-1 text-base text-gray-500">
            Inizia creando una nuova conversazione.
          </p>
          <div className="mt-6">
            <Button
              startContent={<AddCommentRoundedIcon />}
              color="primary"
              radius="sm"
              onClick={() => setModalAddData({ ...modalAddData, open: true })}
            >
              Crea una nuova conversazione
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
