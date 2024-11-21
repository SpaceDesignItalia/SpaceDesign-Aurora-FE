import { useState } from "react";
import { Card, CardBody, Badge, User, Button } from "@nextui-org/react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { API_URL_IMG } from "../../../../API/API";
import axios from "axios";
import StatusAlert from "../../Layout/StatusAlert";

interface Member {
  StafferId: number;
  StafferImageUrl: string;
  StafferFullName: string;
  StafferEmail: string;
  RoleName: string;
}

interface ProjectTeamMemberCardProps {
  MemberData: Member;
  ProjectId: number;
  type: boolean;
  onlineUser: onlineUser[];
}

interface onlineUser {
  socketId: string;
  status: string;
  userId: number;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function ProjectTeamMemberCard({
  MemberData,
  ProjectId,
  onlineUser,
  type,
}: ProjectTeamMemberCardProps) {
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);

  async function handleMemberRemove() {
    try {
      const res = await axios.delete(
        "/Project/DELETE/RemoveMemberFromProjectById",
        {
          params: { StafferId: MemberData.StafferId, ProjectId: ProjectId },
        }
      );

      if (res.status == 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il membro è stato eliminato con successo.",
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante l'eliminazione del membro. Per favore, riprova più tardi.",
        onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
        alertColor: "red",
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
      console.error("Errore durante la creazione del progetto:", error);
    }
  }

  return (
    <>
      <StatusAlert AlertData={alertData} />
      {type ? (
        <Card className="w-full" radius="sm">
          <CardBody className="flex flex-row justify-between items-center">
            <User
              name={MemberData.StafferFullName}
              description={MemberData.RoleName}
              avatarProps={{
                src:
                  MemberData.StafferImageUrl &&
                  API_URL_IMG + "/profileIcons/" + MemberData.StafferImageUrl,
                name: MemberData.StafferFullName,
              }}
            />
            <Button
              color="primary"
              radius="full"
              variant="light"
              size="sm"
              onClick={handleMemberRemove}
              startContent={<CloseRoundedIcon sx={{ fontSize: 15 }} />}
              isIconOnly
            />
          </CardBody>
        </Card>
      ) : (
        <Card className="w-full" radius="sm">
          <CardBody className="flex flex-row justify-start items-center">
            <Badge
              content=""
              placement="bottom-left"
              color={
                onlineUser.some((user) => user.userId === MemberData.StafferId)
                  ? "success"
                  : "danger"
              }
            >
              <User
                name={<>{MemberData.StafferFullName} </>}
                description={MemberData.RoleName}
                avatarProps={{
                  src:
                    MemberData.StafferImageUrl &&
                    API_URL_IMG + "/profileIcons/" + MemberData.StafferImageUrl,
                  name: MemberData.StafferFullName,
                }}
              />
            </Badge>
          </CardBody>
        </Card>
      )}
    </>
  );
}
