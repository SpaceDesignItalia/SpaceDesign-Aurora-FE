import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  DialogBackdrop,
} from "@headlessui/react";

import { Kbd } from "@heroui/kbd";

import {
  ExclamationTriangleIcon,
  FolderIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
  ArrowTurnDownRightIcon,
} from "@heroicons/react/24/outline";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import AddBusinessRoundedIcon from "@mui/icons-material/AddBusinessRounded";
import AddModeratorRoundedIcon from "@mui/icons-material/AddModeratorRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CreateNewFolderRoundedIcon from "@mui/icons-material/CreateNewFolderRounded";
import EventIcon from "@mui/icons-material/Event";
import axios from "axios";
import { useState, useEffect } from "react";
import { API_URL_IMG } from "../../../API/API";
import { Avatar } from "@heroui/react";
import React from "react";

interface Project {
  id: number;
  name: string;
  category: string;
  url: string;
  UniqueCode: string;
}

interface User {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  type: string;
}

interface ProjectAction {
  id: string;
  name: string;
  url: string;
  projectId: number;
}

interface UserAction {
  id: string;
  name: string;
  url: string;
  userId: string;
}

interface Page {
  id: string;
  name: string;
  url: string;
  icon: React.ComponentType<any>;
}

interface Conversation {
  ConversationId: number;
  Staffer1Id: string;
  Staffer2Id: string;
  Staffer1FullName: string;
  Staffer2FullName: string;
  Staffer1ImageUrl: string;
  Staffer2ImageUrl: string;
  lastMessage: string;
  lastMessageDate?: Date;
  notificationCount: number;
}

interface Add {
  id: string;
  name: string;
  url: string;
  icon: React.ComponentType<any>;
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function SearchBar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [rawQuery, setRawQuery] = useState("");
  const query = rawQuery
    .toLowerCase()
    .replace(/^[#>:+]/, "")
    .split("/")[0];
  const actionQuery = rawQuery.toLowerCase().split("/")[1];
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projectActions, setProjectActions] = useState<ProjectAction[]>([]);
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePage, setActivePage] = useState<Page | null>(null);
  const [activeAdd, setActiveAdd] = useState<Add | null>(null);
  const [add, setAdd] = useState<Add[]>([]);

  const filteredProjects =
    rawQuery === "#"
      ? projects
      : query === "" ||
        rawQuery.startsWith(">") ||
        rawQuery.startsWith(":") ||
        rawQuery.startsWith("+")
      ? []
      : projects.filter((project) =>
          project.name.toLowerCase().includes(query)
        );

  const filteredProjectActions = actionQuery
    ? projectActions.filter((action) =>
        action.name.toLowerCase().includes(actionQuery)
      )
    : [];

  const filteredUsers =
    rawQuery === ">"
      ? users
      : query === "" ||
        rawQuery.startsWith("#") ||
        rawQuery.startsWith(":") ||
        rawQuery.startsWith("+")
      ? []
      : users.filter((user) => user.name.toLowerCase().includes(query));

  const filteredUserActions = actionQuery
    ? userActions.filter((action) =>
        action.name.toLowerCase().includes(actionQuery)
      )
    : [];

  const filteredPages =
    rawQuery === ":"
      ? pages
      : query === "" ||
        rawQuery.startsWith("#") ||
        rawQuery.startsWith(">") ||
        rawQuery.startsWith("+")
      ? []
      : pages.filter((page) => page.name.toLowerCase().includes(query));

  const filteredAdd =
    rawQuery === "+"
      ? add
      : query === "" ||
        rawQuery.startsWith("#") ||
        rawQuery.startsWith(">") ||
        rawQuery.startsWith(":")
      ? []
      : add.filter((add) => {
          const nameAfterSpace = add.name
            .split(" ")
            .slice(1)
            .join(" ")
            .toLowerCase();
          return nameAfterSpace.includes(query);
        });

  const [loggedStafferId, setLoggedStafferId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      await axios
        .get("/Authentication/GET/GetSessionData", { withCredentials: true })
        .then(async (res) => {
          const stafferId = res.data.StafferId;
          setLoggedStafferId(stafferId);
          fetchUserConversations(res.data.StafferId);
        });
    };
    fetchSession();
  }, []);

  async function fetchProjects() {
    await axios
      .get("/Project/GET/GetProjectInTeam", {
        withCredentials: true,
      })
      .then((res) => {
        for (const project of res.data) {
          setProjects((prevProjects) => {
            if (prevProjects.some((p) => p.id === project.ProjectId)) {
              return prevProjects;
            }
            return [
              ...prevProjects,
              {
                id: project.ProjectId,
                name: project.ProjectName,
                category: "Projects",
                url: `/projects/${project.UniqueCode}`,
                UniqueCode: project.UniqueCode,
              },
            ];
          });
        }
      });
  }

  async function fetchUsers() {
    await axios
      .get("/Staffer/GET/GetAllStaffers", {
        withCredentials: true,
      })
      .then((res) => {
        for (const user of res.data) {
          setUsers((prevUsers) => {
            if (prevUsers.some((u) => u.id === `user_e_${user.EmployeeId}`)) {
              return prevUsers;
            }
            return [
              ...prevUsers,
              {
                id: `user_e_${user.EmployeeId}`,
                name: user.EmployeeFullName,
                url: `/administration/employee/${user.EmployeeId}`,
                imageUrl:
                  API_URL_IMG + "/profileIcons/" + user.EmployeeImageUrl,
                type: "Employee",
              },
            ];
          });
        }
      });

    await axios
      .get("/Customer/GET/GetAllCustomers", {
        withCredentials: true,
      })
      .then((res) => {
        for (const customer of res.data) {
          setUsers((prevUsers) => {
            if (
              prevUsers.some((u) => u.id === `user_c_${customer.CustomerId}`)
            ) {
              return prevUsers;
            }
            return [
              ...prevUsers,
              {
                id: `user_c_${customer.CustomerId}`,
                name: customer.CustomerFullName,
                url: `/administration/customer/${customer.CustomerId}`,
                imageUrl:
                  API_URL_IMG + "/profileIcons/" + customer.CustomerImageUrl,
                type: "Customer",
              },
            ];
          });
        }
      });

    await axios
      .get("/Company/GET/GetAllCompany", {
        withCredentials: true,
      })
      .then((res) => {
        for (const company of res.data) {
          setUsers((prevUsers) => {
            if (prevUsers.some((u) => u.id === `user_b_${company.CompanyId}`)) {
              return prevUsers;
            }
            return [
              ...prevUsers,
              {
                id: `user_b_${company.CompanyId}`,
                name: company.CompanyName,
                url: `/administration/customer/-${company.CompanyId}`,
                imageUrl:
                  API_URL_IMG + "/profileIcons/" + company.CompanyImageUrl,
                type: "Company",
              },
            ];
          });
        }
      });
  }

  async function fetchUserConversations(stafferId: number) {
    const response = await axios.get("/Chat/GET/getConversationByStafferId", {
      params: { StafferId: stafferId },
      withCredentials: true,
    });
    setConversations(response.data);
  }

  async function fetchUserActions() {
    for (const user of users) {
      setUserActions((prevUserActions) => {
        // Skip if this user's actions already exist
        if (prevUserActions.some((action) => action.userId === user.id)) {
          return prevUserActions;
        }

        const newActions = [
          {
            id: `edit_${user.id}`,
            name: "Modifica",
            url: `/administration/${
              user.type.toLowerCase() === "company"
                ? "customer"
                : user.type.toLowerCase()
            }/${
              user.id.includes("_c_")
                ? "edit-customer"
                : user.id.includes("_b_")
                ? "edit-company"
                : "edit-employee"
            }/${user.id.split("_").pop()}${
              user.id.includes("_b_") ? `/${user.name}` : ""
            }`,
            userId: user.id,
          },
        ];

        // Add chat action only if it's not the logged-in user
        if (
          loggedStafferId !== user.id.split("_").pop() &&
          user.type === "Employee" &&
          user.id !== loggedStafferId
        ) {
          const conversation = conversations.find(
            (conversation) =>
              (conversation.Staffer2Id === user.id.split("_").pop() &&
                conversation.Staffer1Id === loggedStafferId) ||
              (conversation.Staffer1Id === user.id.split("_").pop() &&
                conversation.Staffer2Id === loggedStafferId)
          );

          newActions.push({
            id: `chat_${user.id}`,
            name: conversation ? "chatta" : "crea conversazione",
            url: `/chat/${user.id}`,
            userId: user.id,
          });
        }

        return [...prevUserActions, ...newActions];
      });
    }
  }

  function fetchProjectAction() {
    for (const project of projects) {
      setProjectActions((prevProjectActions) => {
        const newActions = [
          {
            id: `action_p_1_${project.id}`,
            name: "Aggiungi Task",
            url: `/projects/${project.UniqueCode}/add-task`,
            projectId: project.id,
          },
          {
            id: `action_p_2_${project.id}`,
            name: "Modifica Progetto",
            url: `/projects/${project.UniqueCode}/edit-project`,
            projectId: project.id,
          },
          {
            id: `action_p_3_${project.id}`,
            name: "Carica File",
            url: `/projects/${project.UniqueCode}/upload-file`,
            projectId: project.id,
          },
        ];

        // Filter out any existing actions for this project
        const filteredPrevActions = prevProjectActions.filter(
          (action) => action.projectId !== project.id
        );

        return [...filteredPrevActions, ...newActions];
      });
    }
  }

  function fetchPages() {
    setPages([
      {
        id: "dashboard",
        name: "Dashboard",
        url: "/",
        icon: DashboardOutlinedIcon,
      },
      {
        id: "leads",
        name: "Leads",
        url: "/lead",
        icon: MailOutlineRoundedIcon,
      },
      {
        id: "chat",
        name: "Chat",
        url: "/comunications/chat",
        icon: ChatBubbleOutlineRoundedIcon,
      },
      {
        id: "calendar",
        name: "Calendario",
        url: "/comunications/calendar",
        icon: CalendarMonthIcon,
      },
      {
        id: "customers",
        name: "Clienti",
        url: "/administration/customer",
        icon: PeopleAltOutlinedIcon,
      },
      {
        id: "employees",
        name: "Dipendenti",
        url: "/administration/employee",
        icon: EngineeringOutlinedIcon,
      },
      {
        id: "permissions",
        name: "Permessi",
        url: "/administration/permission",
        icon: VpnKeyOutlinedIcon,
      },
      {
        id: "projects",
        name: "Progetti",
        url: "/projects",
        icon: FolderCopyOutlinedIcon,
      },
    ]);
  }

  function fetchAdd() {
    setAdd([
      {
        id: "add-project",
        name: "Aggiungi Progetto",
        url: "/projects/add-project",
        icon: CreateNewFolderRoundedIcon,
      },
      {
        id: "add-employee",
        name: "Aggiungi Dipendente",
        url: "/administration/employee/add-employee",
        icon: GroupAddIcon,
      },
      {
        id: "add-customer",
        name: "Aggiungi Cliente",
        url: "/administration/customer/add-customer",
        icon: PersonAddAlt1RoundedIcon,
      },
      {
        id: "add-company",
        name: "Aggiungi Azienda",
        url: "/administration/customer/-add-company",
        icon: AddBusinessRoundedIcon,
      },
      {
        id: "add-permission",
        name: "Aggiungi Permesso",
        url: "/administration/permission/add-permission",
        icon: VpnKeyOutlinedIcon,
      },
      {
        id: "add-role",
        name: "Aggiungi Ruolo",
        url: "/administration/permission/add-role",
        icon: AddModeratorRoundedIcon,
      },
      {
        id: "add-event",
        name: "Aggiungi Evento",
        url: "/comunications/calendar/add-event",
        icon: EventIcon,
      },
    ]);
  }

  useEffect(() => {
    fetchProjects();
    fetchUsers();
    fetchPages();
    fetchAdd();
  }, []);

  useEffect(() => {
    fetchProjectAction();
  }, [projects]);

  useEffect(() => {
    fetchUserActions();
  }, [users]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      if (activeProject) {
        setRawQuery("#" + activeProject.name + "/");
      } else if (activeUser) {
        setRawQuery(">" + activeUser.name + "/");
      } else if (activePage) {
        setRawQuery(":" + activePage.name + "/");
      } else if (activeAdd) {
        setRawQuery("+" + activeAdd.name + "/");
      }
    }
  };

  return (
    <Dialog
      className="relative z-50"
      open={open}
      onClose={() => {
        setOpen(false);
        setRawQuery("");
      }}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/25 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
        <DialogPanel
          transition
          className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <Combobox
            onChange={(item: any) => {
              if (item) {
                window.location = item.url;
              }
            }}
          >
            <div className="grid grid-cols-1">
              <ComboboxInput
                autoFocus
                onKeyDown={handleKeyDown}
                className="col-start-1 row-start-1 h-12 w-full pl-11 pr-4 text-base text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm"
                placeholder="Cerca..."
                value={rawQuery}
                onChange={(event) => setRawQuery(event.target.value)}
                onBlur={() => setRawQuery("")}
              />
              <MagnifyingGlassIcon
                className="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-400"
                aria-hidden="true"
              />
            </div>

            {(filteredProjects.length > 0 ||
              filteredUsers.length > 0 ||
              filteredPages.length > 0 ||
              filteredAdd.length > 0) && (
              <ComboboxOptions
                static
                as="ul"
                className="max-h-80 transform-gpu scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2"
              >
                {filteredProjects.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">
                      Progetti
                    </h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredProjects.map((project) => (
                        <div key={project.id}>
                          <ComboboxOption
                            as="li"
                            value={project}
                            className="group flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-primary data-[focus]:text-white data-[focus]:outline-none"
                          >
                            {({ focus }) => (
                              useEffect(() => {
                                if (focus) {
                                  setActiveProject(project);
                                  setActiveUser(null);
                                  setActivePage(null);
                                  setActiveAdd(null);
                                  fetchProjectAction();
                                }
                              }, [focus]),
                              (
                                <>
                                  <FolderIcon
                                    className={classNames(
                                      "size-6 flex-none text-gray-400 group-data-[focus]:text-white forced-colors:group-data-[focus]:text-[Highlight]",
                                      focus ? "text-white" : ""
                                    )}
                                    aria-hidden="true"
                                  />
                                  <span className="ml-3 flex-auto truncate">
                                    {project.name}
                                  </span>
                                  <Kbd
                                    keys={["tab"]}
                                    className={classNames(
                                      "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                                      rawQuery.endsWith("/")
                                        ? "border-primary text-primary"
                                        : "border-gray-400 text-gray-900"
                                    )}
                                  />
                                </>
                              )
                            )}
                          </ComboboxOption>
                          {activeProject?.id === project.id &&
                            (actionQuery
                              ? filteredProjectActions
                              : projectActions
                            )
                              .filter(
                                (action) => action.projectId === project.id
                              )
                              .map((action) => (
                                <ComboboxOption
                                  as="li"
                                  key={action.id}
                                  value={action}
                                  className="flex cursor-default select-none items-center py-2 pl-16 data-[focus]:bg-primary data-[focus]:text-white"
                                >
                                  <ArrowTurnDownRightIcon
                                    className="mb-1.5 pr-1 size-5 flex-none text-gray-300 group-data-[focus]:text-white forced-colors:group-data-[focus]:text-[Highlight]"
                                    aria-hidden="true"
                                  />
                                  {action.name}
                                </ComboboxOption>
                              ))}
                        </div>
                      ))}
                    </ul>
                  </li>
                )}
                {filteredUsers.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">
                      Utenti
                    </h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredUsers.map((user) => (
                        <div key={user.id}>
                          <ComboboxOption
                            as="li"
                            value={user}
                            className="user-option flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-primary data-[focus]:text-white"
                          >
                            {({ focus }) => (
                              useEffect(() => {
                                if (focus) {
                                  setActiveUser(user);
                                  setActiveProject(null);
                                  setActivePage(null);
                                  setActiveAdd(null);
                                  fetchUserActions();
                                }
                              }, [focus]),
                              (
                                <>
                                  <Avatar
                                    src={user.imageUrl ? user.imageUrl : ""}
                                    size="sm"
                                    alt=""
                                    className="size-6 flex-none rounded-full"
                                  />
                                  <span className="ml-3 flex-auto truncate">
                                    {user.name}
                                  </span>
                                  <Kbd
                                    keys={["tab"]}
                                    className={classNames(
                                      "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                                      rawQuery.endsWith("/")
                                        ? "border-primary text-primary"
                                        : "border-gray-400 text-gray-900"
                                    )}
                                  />
                                </>
                              )
                            )}
                          </ComboboxOption>
                          {activeUser?.id === user.id &&
                            (actionQuery ? filteredUserActions : userActions)
                              .filter((action) => action.userId === user.id)
                              .map((action) => (
                                <ComboboxOption
                                  as="li"
                                  key={action.id}
                                  value={action}
                                  className="flex cursor-default select-none items-center py-2 pl-16 data-[focus]:bg-primary data-[focus]:text-white"
                                >
                                  <ArrowTurnDownRightIcon
                                    className="mb-1.5 pr-1 size-5 flex-none text-gray-300 group-data-[focus]:text-white forced-colors:group-data-[focus]:text-[Highlight]"
                                    aria-hidden="true"
                                  />
                                  {action.name}
                                </ComboboxOption>
                              ))}
                        </div>
                      ))}
                    </ul>
                  </li>
                )}
                {filteredPages.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">
                      Pagine
                    </h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredPages.map((page) => (
                        <div key={page.id}>
                          <ComboboxOption
                            as="li"
                            value={page}
                            className="group flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-primary data-[focus]:text-white data-[focus]:outline-none"
                          >
                            {({ focus }) => (
                              useEffect(() => {
                                if (focus) {
                                  setActiveProject(null);
                                  setActiveUser(null);
                                  setActivePage(page);
                                  setActiveAdd(null);
                                }
                              }, [focus]),
                              (
                                <>
                                  <page.icon
                                    className="size-6 flex-none text-gray-400 group-data-[focus]:text-white forced-colors:group-data-[focus]:text-[Highlight]"
                                    aria-hidden="true"
                                  />
                                  <span className="ml-3 flex-auto truncate">
                                    {page.name}
                                  </span>
                                  <Kbd
                                    keys={["tab"]}
                                    className={classNames(
                                      "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                                      rawQuery.endsWith("/")
                                        ? "border-primary text-primary"
                                        : "border-gray-400 text-gray-900"
                                    )}
                                  />
                                </>
                              )
                            )}
                          </ComboboxOption>
                        </div>
                      ))}
                    </ul>
                  </li>
                )}
                {filteredAdd.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">
                      Pagine
                    </h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredAdd.map((add) => (
                        <div key={add.id}>
                          <ComboboxOption
                            as="li"
                            value={add}
                            className="group flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-primary data-[focus]:text-white data-[focus]:outline-none"
                          >
                            {({ focus }) => (
                              useEffect(() => {
                                if (focus) {
                                  setActiveProject(null);
                                  setActiveUser(null);
                                  setActivePage(null);
                                  setActiveAdd(add);
                                }
                              }, [focus]),
                              (
                                <>
                                  <add.icon
                                    className="size-6 flex-none text-gray-400 group-data-[focus]:text-white forced-colors:group-data-[focus]:text-[Highlight]"
                                    aria-hidden="true"
                                  />
                                  <span className="ml-3 flex-auto truncate">
                                    {add.name}
                                  </span>
                                  <Kbd
                                    keys={["tab"]}
                                    className={classNames(
                                      "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                                      rawQuery.endsWith("/")
                                        ? "border-primary text-primary"
                                        : "border-gray-400 text-gray-900"
                                    )}
                                  />
                                </>
                              )
                            )}
                          </ComboboxOption>
                        </div>
                      ))}
                    </ul>
                  </li>
                )}
              </ComboboxOptions>
            )}
            {rawQuery === "?" && (
              <div className="px-6 py-14 text-center text-sm sm:px-14">
                <LifebuoyIcon
                  className="mx-auto size-6 text-gray-400"
                  aria-hidden="true"
                />
                <p className="mt-4 font-semibold text-gray-900">
                  Aiuto con la ricerca
                </p>
                <p className="mt-2 text-gray-500">
                  Usa questo strumento per cercare utenti, progetti e pagine in
                  tutta la nostra piattaforma. Puoi anche usare i modificatori
                  di ricerca trovati nel piè di pagina per limitare i risultati
                  solo agli utenti, ai progetti o alle pagine.
                </p>
              </div>
            )}

            {query !== "" &&
              rawQuery !== "?" &&
              filteredProjects.length === 0 &&
              filteredUsers.length === 0 &&
              filteredPages.length === 0 &&
              filteredAdd.length === 0 && (
                <div className="px-6 py-14 text-center text-sm sm:px-14">
                  <ExclamationTriangleIcon
                    className="mx-auto size-6 text-gray-400"
                    aria-hidden="true"
                  />
                  <p className="mt-4 font-semibold text-gray-900">
                    Nessun risultato trovato
                  </p>
                  <p className="mt-2 text-gray-500">
                    Non abbiamo trovato nulla con questo termine. Per favore,
                    riprova.
                  </p>
                </div>
              )}

            <div className="flex flex-wrap items-center bg-gray-50 px-4 py-2.5 text-xs text-gray-700">
              Scrivi{" "}
              <Kbd
                className={classNames(
                  "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                  rawQuery.startsWith("#")
                    ? "border-primary text-primary"
                    : "border-gray-400 text-gray-900"
                )}
              >
                #
              </Kbd>{" "}
              per progetti,
              <Kbd
                className={classNames(
                  "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                  rawQuery.startsWith(">")
                    ? "border-primary text-primary"
                    : "border-gray-400 text-gray-900"
                )}
              >
                &gt;
              </Kbd>{" "}
              per utenti,
              <Kbd
                className={classNames(
                  "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                  rawQuery.startsWith(":")
                    ? "border-primary text-primary"
                    : "border-gray-400 text-gray-900"
                )}
              >
                :
              </Kbd>{" "}
              per pagine,
              <Kbd
                className={classNames(
                  "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                  rawQuery === "+"
                    ? "border-primary text-primary"
                    : "border-gray-400 text-gray-900"
                )}
              >
                +
              </Kbd>{" "}
              per aggiungere e{" "}
              <Kbd
                className={classNames(
                  "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                  rawQuery === "?"
                    ? "border-primary text-primary"
                    : "border-gray-400 text-gray-900"
                )}
              >
                ?
              </Kbd>{" "}
              per aiuto.
            </div>
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
