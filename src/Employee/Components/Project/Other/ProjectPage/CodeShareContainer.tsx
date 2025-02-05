import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
  CardProps,
  Card,
  Image,
  CardBody,
  CardFooter,
  Spacer,
  AvatarGroup,
  Avatar,
} from "@heroui/react";

import axios from "axios";
import { useEffect, useState } from "react";
import CodeShareEditor from "../ProjectCodeShare/CodeShareEditor";
import { io, Socket } from "socket.io-client";
import { API_URL_IMG, API_WEBSOCKET_URL } from "../../../../../API/API";
import ConfirmDeleteCodeShareModal from "../ProjectCodeShare/ConfirmDeleteCodeShareModal";
import { Icon } from "@iconify/react";

const socket: Socket = io(API_WEBSOCKET_URL);

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: Date;
  ProjectEndDate: Date;
  CompanyId: number;
  ProjectBannerId: number;
  ProjectBannerPath: string;
  StatusName: string;
  ProjectManagerId: number;
  StafferImageUrl: string;
  ProjectManagerFullName: string;
  ProjectManagerEmail: string;
  RoleName: string;
}

interface CodeShareTab {
  ProjectCodeShareId: number;
  ProjectCodeShareName: string;
  Code: string;
  ImageURL: string;
}

interface OnlineUser {
  socketId: string;
  codeShareId: number;
  userId: number;
}

interface Employee {
  EmployeeId: number;
  EmployeeName: string;
  EmployeeSurname: string;
  EmplyeeEmail: string;
  EmployeePhone: string;
  EmployeeImageUrl: string;
  codeShareId: number;
}

export default function CodeShareContainer({
  props,
  projectData,
}: {
  props: CardProps;
  projectData: Project;
}) {
  const [tabs, setTabs] = useState<CodeShareTab[]>([]);
  const [selectedTab, setSelectedTab] = useState<CodeShareTab | null>(null);
  const [newCodeShareName, setNewCodeShareName] = useState("");
  const [onlineCodeShareUsers, setOnlineCodeShareUsers] = useState<Employee[]>(
    []
  );

  async function fetchCodeShareTabs() {
    const response = await axios.get("Project/GET/GetCodeShareTabs", {
      params: {
        ProjectId: projectData.ProjectId,
      },
    });
    setTabs(response.data);
  }

  const handleAddCodeShare = () => {
    if (newCodeShareName.trim() !== "") {
      axios
        .post(
          "/Project/POST/AddCodeShareTab",
          {
            ProjectId: projectData.ProjectId,
            ProjectCodeShareName: newCodeShareName,
          },
          { withCredentials: true }
        )
        .then(() => {
          setNewCodeShareName(""); // Resetta il nome della checklist dopo l'aggiunta
          socket.emit("share-code-update");
        });
    }
  };

  async function fetchOnlineUsers(users: OnlineUser[]) {
    setOnlineCodeShareUsers([]);
    for (const user of users) {
      const response = await axios.get("Staffer/GET/GetStafferById", {
        params: {
          EmployeeId: user.userId,
        },
      });

      setOnlineCodeShareUsers((prevUsers) => {
        // Check if user already exists by EmployeeId
        if (!prevUsers.find((u) => u.EmployeeId === response.data.EmployeeId)) {
          return [
            ...prevUsers,
            {
              ...response.data,
              codeShareId: user.codeShareId,
            },
          ];
        }
        return prevUsers;
      });
    }
  }

  async function handleDeleteCodeShare(codeShareId: number) {
    const res = await axios.delete("Project/DELETE/DeleteCodeShareTab", {
      params: {
        ProjectCodeShareId: codeShareId,
      },
    });

    if (res.status === 200) {
      socket.emit("share-code-update");
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchCodeShareTabs();
    };
    fetchData();
  }, [projectData.ProjectId, selectedTab]);

  useEffect(() => {
    socket.on("share-code-update", () => {
      fetchCodeShareTabs();
    });
  }, []);

  useEffect(() => {
    socket.emit("get-users-on-code-share");

    socket.on("get-users-on-code-share", (users) => {
      fetchOnlineUsers(users);
    });
  }, []);

  return (
    <>
      {!selectedTab ? (
        <>
          <Popover radius="lg" placement="bottom" showArrow shouldBlockScroll>
            <PopoverTrigger>
              <Button
                color="primary"
                radius="full"
                size="sm"
                className="mb-3"
                isIconOnly
              >
                <Icon icon="mynaui:plus-solid" fontSize={20} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-5 w-80">
              {(titleProps) => (
                <div className="px-1 py-2 w-full">
                  <p
                    className="text-small font-bold text-foreground"
                    {...titleProps}
                  >
                    Crea code share
                  </p>
                  <div className="mt-2 flex flex-col gap-2 w-full">
                    <Input
                      autoFocus
                      variant="underlined"
                      color="primary"
                      placeholder="Titolo del code share"
                      value={newCodeShareName}
                      onChange={(e) => setNewCodeShareName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCodeShare(); // Chiama la funzione quando premi "Enter"
                        }
                      }}
                    />
                    <Button
                      color="primary"
                      size="sm"
                      radius="full"
                      onPress={handleAddCodeShare}
                      startContent={
                        <Icon icon="mynaui:plus-solid" fontSize={20} />
                      }
                      isDisabled={newCodeShareName === ""}
                    >
                      Aggiungi code share
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {tabs.map((tab) => (
              <Card
                className="w-full relative" // Aggiungi "relative" per il posizionamento assoluto
                {...props}
                key={tab.ProjectCodeShareId}
              >
                {/* Pulsante Delete posizionato sopra l'immagine */}
                <div className="absolute top-2 right-2 z-20">
                  {" "}
                  {/* Posizionamento in alto a destra */}
                  <ConfirmDeleteCodeShareModal
                    codeShareId={tab.ProjectCodeShareId}
                    DeleteCodeShare={handleDeleteCodeShare}
                    onlineCodeShareUsers={onlineCodeShareUsers}
                  />
                </div>

                <CardBody className="px-3 pb-1">
                  <div className="relative">
                    {" "}
                    {/* Aggiungi relative per assicurarti che l'immagine non copra il pulsante */}
                    <Image
                      alt="Card image"
                      className="aspect-video w-full object-cover object-top"
                      src={
                        tab.ImageURL
                          ? API_URL_IMG + "/codeShare" + tab.ImageURL
                          : "https://www.economist.com/cdn-cgi/image/width=1424,quality=80,format=auto/sites/default/files/images/2015/09/blogs/economist-explains/code2.png"
                      }
                    />
                  </div>
                  <Spacer y={2} />
                  <div className="flex flex-col gap-2 px-2">
                    <p className="text-large font-medium">
                      {tab.ProjectCodeShareName}
                    </p>
                  </div>
                </CardBody>

                <CardFooter className="justify-between">
                  <AvatarGroup
                    max={3}
                    isGrid
                    isBordered
                    className="grid-cols-3"
                  >
                    {onlineCodeShareUsers.map(
                      (user) =>
                        user.codeShareId === tab.ProjectCodeShareId && (
                          <Avatar
                            key={user.EmployeeId}
                            src={
                              user.EmployeeImageUrl &&
                              API_URL_IMG +
                                "/profileIcons/" +
                                user.EmployeeImageUrl
                            }
                          />
                        )
                    )}
                  </AvatarGroup>
                  <Button
                    color="primary"
                    radius="full"
                    className="w-1/2"
                    onPress={() => setSelectedTab(tab)}
                  >
                    Unisciti
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <CodeShareEditor
          codeShare={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      )}
    </>
  );
}
