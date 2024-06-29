import { useState } from "react";
import { Card, CardBody, Badge, User, Chip } from "@nextui-org/react";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
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
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

export default function ProjectTeamMemberCard({
  MemberData,
  ProjectId,
  type,
}: ProjectTeamMemberCardProps) {
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

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
        <Badge
          shape="rectangle"
          className="p-1 cursor-pointer"
          content={<DeleteOutlineRoundedIcon />}
          color="danger"
          onClick={handleMemberRemove}
        >
          <Card className="w-full" radius="sm">
            <CardBody className="flex flex-row justify-start items-center">
              <User
                name={
                  <>
                    {MemberData.StafferFullName}{" "}
                    <Chip color="primary" size="sm" radius="sm" variant="flat">
                      {MemberData.RoleName}
                    </Chip>
                  </>
                }
                description={MemberData.StafferEmail}
                avatarProps={{
                  src:
                    MemberData.StafferImageUrl &&
                    API_URL_IMG + "/profileIcons/" + MemberData.StafferImageUrl,
                  name: MemberData.StafferFullName,
                }}
              />
            </CardBody>
          </Card>
        </Badge>
      ) : (
        <Card className="w-full" radius="sm">
          <CardBody className="flex flex-row justify-start items-center">
            <User
              name={
                <>
                  {MemberData.StafferFullName}{" "}
                  <Chip color="primary" size="sm" radius="sm" variant="flat">
                    {MemberData.RoleName}
                  </Chip>
                </>
              }
              description={MemberData.StafferEmail}
              avatarProps={{
                src:
                  MemberData.StafferImageUrl &&
                  API_URL_IMG + "/profileIcons/" + MemberData.StafferImageUrl,
                name: MemberData.StafferFullName,
              }}
            />
          </CardBody>
        </Card>
      )}
    </>
  );
}
