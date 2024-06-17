import { Card, CardBody, Badge, User } from "@nextui-org/react";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

interface Member {
  StafferId: number;
  StafferFullName: string;
  StafferEmail: string;
}

interface ProjectTeamMemberCardProps {
  MemberData: Member;
  type: boolean;
}

export default function ProjectTeamMemberCard({
  MemberData,
  type,
}: ProjectTeamMemberCardProps) {
  return (
    <>
      {type ? (
        <Badge
          size="lg"
          shape="rectangle"
          content={<DeleteOutlineRoundedIcon />}
          color="danger"
        >
          <Card className="w-full" radius="sm">
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
        </Badge>
      ) : (
        <Card className="w-full" radius="sm">
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
      )}
    </>
  );
}
