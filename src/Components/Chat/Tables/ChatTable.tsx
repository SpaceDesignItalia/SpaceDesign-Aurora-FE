import { Avatar, Button, Input, cn } from "@nextui-org/react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import axios from "axios";
import { useEffect, useState } from "react";

interface Employee {
  StafferId: number;
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
    const [newMessage, setNewMessage] = useState('');
    const [conversationId, setConversationId] = useState<number>(0);

    useEffect(() => {
      axios
        .get("/Authentication/GET/GetSessionData", { withCredentials: true })
        .then((res) => {
          setloggedStafferId(res.data.StafferId);
          axios.get("/Chat/GET/getConversationByStafferId", {params: { StafferId: res.data.StafferId }}).then((res) => {
          setConversations(res.data);
        });
        });
    }, []);

    async function SearchEmployee(e: { target: { value: string } }) {
        const searchQuery = e.target.value.trim(); // Otteniamo il valore di ricerca e rimuoviamo gli spazi vuoti
        try {
          const response = await axios.get("/Staffer/GET/SearchStafferByEmail", {
            params: { EmployeeEmail: searchQuery },
          });
        } catch (error) {
          console.error("Errore durante la ricerca del dipendente:", error);
        }
      }

    function handleOpenChat(conversationId: number) {
        try {
          axios.get("/Chat/GET/GetMessagesByConversationId", {params: { ConversationId: conversationId }}).then((res) => {
            setMessages(res.data);
            setConversationId(conversationId);
          });
        } catch (error) {
          console.error("Errore durante l'apertura della chat:", error);
        }
    }
    
    function handleSendMessage() {
        try {
          axios.post("/Chat/POST/SendMessage", {
            ConversationId: conversationId,
            StafferSenderId: loggedStafferId,
            Text: newMessage,
          }).then((res) => {
            setMessages([...messages, res.data]);
            setNewMessage('');
          });
        } catch (error) {
          console.error("Errore durante l'invio del messaggio:", error);
        }
    }

    const formatDate = (dateStr: Date) => {
      const now = new Date();
      const date = new Date(dateStr);
  
      const diffTime = Math.abs(now.getDay() - date.getDay());
  
      switch (diffTime) {
        case 0:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        case 1:
        return 'Ieri';
        case Number(diffTime < 7):
        return date.toLocaleDateString([], { weekday: 'long' });
        default:
        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
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
                    onChange={SearchEmployee}
                    placeholder="Cerca dipendente per email..."
                />  
                </div>
                <div className="flex flex-col gap-2 bg-white px-4 py-5 sm:px-6">
                    {conversations.map((conversation) => (
                        <div className="grid grid-cols-5 items-center border border-gray-200 rounded-xl p-5" onClick={() => handleOpenChat(conversation.ConversationId)}>
                            <Avatar src="https://miro.medium.com/v2/resize:fit:1224/1*XKpA4-JcY06QcMOiPB1zaQ.jpeg"/>
                            <div className="flex flex-col justify-start col-span-3">
                                <h2 className="font-bold">{conversation.Staffer1Id === loggedStafferId ? conversation.Staffer2FullName : conversation.Staffer1FullName}</h2>
                                <p className="text-gray-500">{messages.length > 0 && messages[messages.length - 1].Text}</p>
                            </div>
                            <p className="flex justify-end text-sm">{messages.length > 0 && formatDate(messages[messages.length - 1].Date)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className='flex flex-col w-full mx-auto px-4 py-2 gap-5'>
                <div className='flex flex-col space-y-2'>
                {messages.map((message) => (
                    <div key={message.MessageId} className={cn("relative mr-3 text-sm py-2 px-4 shadow rounded-xl flex flex-col", `message ${message.StafferSenderId === loggedStafferId ? 'self-end bg-green-200' : 'self-start bg-blue-200'}`)}>
                      <p className="font-semibold text-md">{message.Text}</p>
                      <p className={cn("text-xs", message.StafferSenderId === loggedStafferId ? 'self-end' : 'self-start')}>{formatDate(message.Date)}</p>
                    </div>
                ))}
                </div>
                    <div className='mt-4 flex flex-row gap-5'>
                    <Input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Scrivi un messaggio..."
                    />
                    <Button color='primary' onClick={() => handleSendMessage()}>
                        Invia
                    </Button>
                </div>
            </div>
        </div>
    )
}