import { Avatar } from "@heroui/react";
import { cn } from "@heroui/react";

interface TeamAvatarProps {
  name: string;
  classNames?: {
    base?: string;
    name?: string;
  };
}

const TeamAvatar = ({ name, classNames }: TeamAvatarProps) => {
  return (
    <Avatar
      name={name}
      classNames={{
        base: cn("w-6 h-6", classNames?.base),
        name: cn("text-small", classNames?.name),
      }}
      getInitials={(name) => name.charAt(0)}
    />
  );
};

export default TeamAvatar;
