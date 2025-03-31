import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
  Image,
} from "@heroui/react";

import axios from "axios";
import { useEffect, useState } from "react";
import CodeShareEditor from "./CodeShareEditor";
import { io, Socket } from "socket.io-client";
import { API_URL_IMG, API_WEBSOCKET_URL } from "../../../../../../API/API";
import ConfirmDeleteCodeShareModal from "./ConfirmDeleteCodeShareModal";
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
  projectData,
}: {
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
    <div className="flex flex-col gap-6 p-4">
      {!selectedTab ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-default-900">
              Code Share
            </h2>
            {tabs.length > 0 && (
              <Popover
                radius="lg"
                placement="bottom"
                showArrow
                shouldBlockScroll
              >
                <PopoverTrigger>
                  <Button
                    color="primary"
                    radius="full"
                    size="md"
                    className="px-4"
                    startContent={
                      <Icon icon="mynaui:plus-solid" fontSize={20} />
                    }
                  >
                    Nuova stanza
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
                        <div className="flex flex-col gap-4 w-full">
                          <Input
                            size="sm"
                            autoFocus
                            variant="underlined"
                            color="primary"
                            label="Nome della stanza"
                            placeholder="Es. Notifiche.tsx"
                            value={newCodeShareName}
                            onChange={(e) =>
                              setNewCodeShareName(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddCodeShare();
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
                            className="w-full"
                          >
                            Crea stanza
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>

          {tabs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border-2 border-dashed">
              <Icon
                icon="solar:code-linear"
                fontSize={48}
                className="text-gray-400 mb-4"
              />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                Nessuna stanza di codice
              </h3>
              <p className="text-gray-500 mb-4 text-center max-w-md">
                Crea la tua prima stanza di code sharing per collaborare in
                tempo reale con il tuo team.
              </p>

              <Popover
                radius="lg"
                placement="bottom"
                showArrow
                shouldBlockScroll
              >
                <PopoverTrigger>
                  <Button
                    color="primary"
                    size="md"
                    radius="full"
                    startContent={
                      <Icon icon="mynaui:plus-solid" fontSize={20} />
                    }
                  >
                    Crea nuova stanza
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
                        <div className="flex flex-col gap-4 w-full">
                          <Input
                            size="sm"
                            autoFocus
                            variant="underlined"
                            color="primary"
                            label="Nome della stanza"
                            placeholder="Es. Notifiche.tsx"
                            value={newCodeShareName}
                            onChange={(e) =>
                              setNewCodeShareName(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddCodeShare();
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
                            className="w-full"
                          >
                            Crea stanza
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {tabs.map((tab) => (
                <div
                  className="overflow-hidden rounded-xl bg-white border hover:border-primary hover:shadow-md transition-all duration-300 group"
                  key={tab.ProjectCodeShareId}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="p-2.5 rounded-md bg-primary/10">
                      <Icon
                        icon="solar:code-linear"
                        fontSize={22}
                        className="text-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium line-clamp-1 text-default-900">
                        {tab.ProjectCodeShareName}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Icon icon="solar:user-rounded-linear" fontSize={15} />
                        <span>
                          {onlineCodeShareUsers.filter(
                            (codeRoom) =>
                              codeRoom.codeShareId === tab.ProjectCodeShareId
                          ).length || 0}{" "}
                          persone connesse
                        </span>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ConfirmDeleteCodeShareModal
                        codeShareId={tab.ProjectCodeShareId}
                        DeleteCodeShare={handleDeleteCodeShare}
                        onlineCodeShareUsers={onlineCodeShareUsers}
                      />
                    </div>
                  </div>
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedTab(tab)}
                  >
                    <Image
                      alt="Code Share Preview"
                      className="w-full h-auto aspect-[16/9] object-cover transition-all duration-300 group-hover:brightness-90"
                      src={
                        tab.ImageURL
                          ? API_URL_IMG + "/codeShare" + tab.ImageURL
                          : "https://www.economist.com/cdn-cgi/image/width=1424,quality=80,format=auto/sites/default/files/images/2015/09/blogs/economist-explains/code2.png"
                      }
                    />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Icon
                        icon="solar:login-linear"
                        fontSize={32}
                        className="text-primary"
                      />
                    </div>
                  </div>

                  <div className="px-4 py-4 sm:px-6">
                    <Button
                      size="md"
                      color="primary"
                      radius="full"
                      startContent={
                        <Icon icon="solar:login-linear" fontSize={18} />
                      }
                      onPress={() => setSelectedTab(tab)}
                      className="w-full shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Entra nella stanza
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <CodeShareEditor
          codeShare={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      )}
    </div>
  );
}
