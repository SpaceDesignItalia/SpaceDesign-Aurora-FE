import { Card, CardBody, Button, User } from "@nextui-org/react";
interface Member {
  StafferId: number;
  StafferFullName: string;
  StafferEmail: string;
}

export default function ProjectTeamMemberCard({
  MemberData,
}: {
  MemberData: Member;
}) {
  return (
    <Card className="max-w-xs" radius="sm">
      <CardBody className="flex flex-row justify-start items-center">
        <User
          name={MemberData.StafferFullName}
          description={MemberData.StafferEmail}
          avatarProps={{
            src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
          }}
        />
      </CardBody>
    </Card>
  );
}
