import { Avatar } from "@heroui/react";

interface Message {
  MessageId: number;
  StafferSenderId: number;
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
    <>
      {type == "send" && (
        <div className="flex flex-row justify-end items-end mb-4">
          <div className="flex flex-col items-end">
            <div className="flex flex-col justify-end bg-primary px-3 py-2 rounded-xl rounded-br-none text-white max-w-md">
              <p className="break-all">{message.Text}</p>
              <span className="text-xs text-gray-200 mt-1 text-right">
                {formatDate(message.Date)}
              </span>
            </div>
          </div>
          <Avatar size="sm" className="ml-2" />
        </div>
      )}
      {type === "recive" && (
        <div className="flex flex-row justify-start items-end mb-4">
          <Avatar size="sm" className="mr-2" />
          <div className="flex flex-col items-end">
            <div className="flex flex-col justify-end bg-gray-500 px-3 py-2 rounded-xl rounded-bl-none text-white max-w-md">
              <p className="break-all">{message.Text}</p>
              <span className="text-xs text-gray-2  00 mt-1 text-left">
                {formatDate(message.Date)}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
