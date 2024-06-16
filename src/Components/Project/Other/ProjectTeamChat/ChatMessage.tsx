import { Avatar } from "@nextui-org/react";

export default function ChatMessage({ msg, type }) {
  console.log(msg);
  return (
    <>
      {type == "send" && (
        <div className="flex flex-row justify-end items-end mb-4">
          <div className="flex flex-col items-end">
            <div className="flex flex-col gap-2 justify-end bg-primary px-3 py-2 rounded-xl rounded-br-none text-white max-w-md">
              <span className="text-xs mt-1 text-right">Andrea Braia</span>
              <p className="break-all">{msg}</p>
            </div>
            <span className="text-xs text-gray-500 mt-1 text-right">12:00</span>
          </div>
          <Avatar size="sm" className="ml-2" />
        </div>
      )}
      {type === "recive" && (
        <div className="flex flex-row justify-start items-end mb-4">
          <Avatar size="sm" className="mr-2" />
          <div className="flex flex-col items-end">
            <div className="flex flex-col justify-end bg-gray-500 px-3 py-2 rounded-xl rounded-bl-none text-white max-w-md">
              <span className="text-xs mt-1 text-right">Andrea Braia</span>
              <p className="break-all">{msg}</p>
            </div>
            <span className="text-xs text-gray-500 mt-1 text-left">12:00</span>
          </div>
        </div>
      )}
    </>
  );
}
