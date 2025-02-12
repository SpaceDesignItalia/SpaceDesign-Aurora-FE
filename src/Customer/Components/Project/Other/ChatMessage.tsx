import { Avatar } from "@heroui/react";
import { API_URL_IMG } from "../../../../API/API";
import dayjs from "dayjs";
import "dayjs/locale/it";

interface Message {
  MessageId: number;
  StafferSenderId: number;
  SenderImageUrl: string;
  SenderFullName: string;
  ConversationId: number;
  Date: Date;
  Text: string;
}

export default function ChatMessage({
  message,
  type,
}: {
  message: Message;
  type: string;
}) {
  const formatDate = (dateStr: Date | undefined): string => {
    if (!dateStr) return "";

    const messageDate = dayjs(dateStr);

    // Data attuale
    const now = dayjs();

    // Data di ieri a mezzanotte
    const yesterday = now.subtract(1, "day").startOf("day");

    // Se la data è oggi
    if (messageDate.isSame(now, "day")) {
      return messageDate.format("HH:mm"); // Orario nel formato "HH:mm"
    }

    // Se la data è ieri
    if (messageDate.isSame(yesterday, "day")) {
      return "Ieri";
    }

    // Altrimenti, formattazione completa della data
    return messageDate.format("DD/MM/YYYY");
  };
  return (
    <>
      {type == "send" && (
        <div className="flex flex-row justify-end items-end mb-4">
          <div className="flex flex-col items-end">
            <div className="flex flex-col justify-end bg-primary px-3 py-2 rounded-xl rounded-br-none text-white max-w-md">
              <span className="text-xs mt-1 text-right">
                {message.SenderFullName}
              </span>
              <p className="break-all text-right">{message.Text}</p>
            </div>
            <span className="text-xs text-gray-500 mt-1 text-right">
              {formatDate(message.Date)}
            </span>
          </div>
          <Avatar
            size="sm"
            className="ml-2"
            src={
              message.SenderImageUrl &&
              API_URL_IMG + "/profileIcons/" + message.SenderImageUrl
            }
          />
        </div>
      )}
      {type === "recive" && (
        <div className="flex flex-row justify-start items-end mb-4">
          <Avatar
            size="sm"
            className="mr-2"
            src={
              message.SenderImageUrl &&
              API_URL_IMG + "/profileIcons/" + message.SenderImageUrl
            }
          />
          <div className="flex flex-col items-end">
            <div className="flex flex-col justify-end bg-gray-500 px-3 py-2 rounded-xl rounded-bl-none text-white max-w-md">
              <span className="text-xs mt-1 text-left">
                {message.SenderFullName}
              </span>
              <p className="break-all">{message.Text}</p>
            </div>
            <span className="text-xs text-gray-500 mt-1 text-left w-full">
              {formatDate(message.Date)}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
