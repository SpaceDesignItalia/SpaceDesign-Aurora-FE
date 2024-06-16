import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button, ScrollShadow } from "@nextui-org/react";
import ProjectTeamMemberCard from "../ProjectTeamMemberCard";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ChatMessage from "../ProjectTeamChat/ChatMessage";
import { useState } from "react";
import ChatKeyboard from "../ProjectTeamChat/ChatKeyboard";

export default function TeamContainer() {
  const member = {
    StafferId: 1,
    StafferFullName: "Andrea Braia",
    StafferEmail: "andrea@gmail.com",
  };
  const [messages, setMessages] = useState<string[]>([]);

  console.log(messages);
  const handleSendMessage = (message: string) => {
    setMessages([...messages, message]);
  };

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="flex flex-col gap-5 border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6 h-fit">
        <h1 className="font-bold">Team chat</h1>
        <ScrollShadow className="w-full h-[500px]">
          <div className="flex flex-col">
            {messages.map((msg) => {
              return <ChatMessage msg={msg} type="send" />;
            })}
          </div>
        </ScrollShadow>
        <ChatKeyboard onSendMessage={handleSendMessage} />
      </div>

      <div className="flex flex-col gap-5 border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6 h-fit">
        <div className="flex flex-row justify-between items-center">
          <h1 className="font-bold">Membri del progetto</h1>

          <div className="flex flex-row gap-2">
            <Button color="primary" radius="sm" size="sm" isIconOnly>
              <AddRoundedIcon />
            </Button>
            <Button
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
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
          <ProjectTeamMemberCard MemberData={member} />
        </div>
      </div>
    </div>
  );
}
