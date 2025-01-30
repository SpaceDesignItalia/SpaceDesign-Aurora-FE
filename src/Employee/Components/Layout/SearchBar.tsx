import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  DialogBackdrop,
} from "@headlessui/react";

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
import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
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
}

interface UserAction {
  id: string;
  name: string;
  url: string;
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
    .replace(/^[#>:]/, "")
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
  const filteredProjects =
    rawQuery === "#"
      ? projects
      : query === "" || rawQuery.startsWith(">") || rawQuery.startsWith(":")
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
      : query === "" || rawQuery.startsWith("#") || rawQuery.startsWith(":")
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
      : query === "" || rawQuery.startsWith("#") || rawQuery.startsWith(">")
      ? []
      : pages.filter((page) => page.name.toLowerCase().includes(query));

  const optionsRefs = useRef<(HTMLLIElement | null)[]>([]);
  const userOptionsRefs = useRef<(HTMLLIElement | null)[]>([]);

  const setOptionRef = useCallback(
    (el: HTMLLIElement | null, index: number, isUser: boolean) => {
      if (isUser) {
        userOptionsRefs.current[index] = el;
      } else {
        optionsRefs.current[index] = el;
      }
    },
    []
  );

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

  useEffect(() => {
    if (filteredProjects.length === 1 && filteredUsers.length === 0) {
      setActiveProject(filteredProjects[0]);
      setActiveUser(null);
      setUserActions([]);
      return;
    }

    if (filteredUsers.length === 1 && filteredProjects.length === 0) {
      setActiveUser(filteredUsers[0]);
      setActiveProject(null);
      setProjectActions([]);
      return;
    }

    const handleFocus = async (element: HTMLElement, isUser: boolean) => {
      const focusedIndex = (
        isUser ? userOptionsRefs : optionsRefs
      ).current.findIndex((ref) => ref === element);
      if (focusedIndex !== -1) {
        const item = (isUser ? filteredUsers : filteredProjects)[focusedIndex];
        if (item) {
          if (isUser) {
            setActiveUser(item as User);
            setActiveProject(null);
            setUserActions(await fetchUserActions(item as User));
          } else {
            setActiveProject(item as Project);
            setActiveUser(null);
            fetchProjectAction((item as Project).UniqueCode);
          }
        }
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-focus"
        ) {
          const element = mutation.target as HTMLElement;
          if (element.hasAttribute("data-focus")) {
            handleFocus(element, element.classList.contains("user-option"));
          }
        }
      });
    });

    const allRefs = [...optionsRefs.current, ...userOptionsRefs.current];
    allRefs.forEach((ref) => {
      if (ref) {
        observer.observe(ref, {
          attributes: true,
          attributeFilter: ["data-focus"],
        });
      }
    });

    return () => observer.disconnect();
  }, [filteredProjects.length, filteredUsers.length, rawQuery, conversations]);

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
    console.log(loggedStafferId);
    const response = await axios.get("/Chat/GET/getConversationByStafferId", {
      params: { StafferId: stafferId },
      withCredentials: true,
    });
    console.log(response.data);
    setConversations(response.data);
  }

  async function fetchUserActions(user: User) {
    console.log(user);
    return [
      {
        id: `edit_${user.id}`,
        name: "Modifica",
        url: `/administration/${user.type.toLowerCase()}/${
          user.id.includes("_c_")
            ? "edit-customer"
            : user.id.includes("_b_")
            ? "edit-company"
            : "edit-employee"
        }/${user.id.split("_").pop()}${
          user.id.includes("_b_") ? `/${user.name}` : ""
        }`,
      },
      loggedStafferId !== user.id.split("_").pop()
        ? {
            id: `chat_${user.id}`,
            name: conversations.find(
              (conversation) =>
                (conversation.Staffer2Id == user.id.split("_").pop() &&
                  conversation.Staffer1Id == loggedStafferId) ||
                (conversation.Staffer1Id == user.id.split("_").pop() &&
                  conversation.Staffer2Id == loggedStafferId)
            )
              ? "Chatta"
              : "Crea conversazione",
            url: conversations.find(
              (conversation) =>
                (conversation.Staffer2Id == user.id.split("_").pop() &&
                  conversation.Staffer1Id == loggedStafferId) ||
                (conversation.Staffer1Id == user.id.split("_").pop() &&
                  conversation.Staffer2Id == loggedStafferId)
            )
              ? `/comunications/chat/send-${user.id.split("_").pop()}`
              : `/comunications/chat/create-${user.id.split("_").pop()}`,
          }
        : {
            id: `chat_${user.id}`,
            name: "Non puoi chattare con te stesso",
            url: ``,
          },
    ];
  }

  function fetchProjectAction(UniqueCode: string) {
    setProjectActions([
      {
        id: "action_p_1",
        name: "Aggiungi Task",
        url: `/projects/${UniqueCode}/add-task`,
      },
      {
        id: "action_p_2",
        name: "Modifica Progetto",
        url: `/projects/${UniqueCode}/edit-project`,
      },
      {
        id: "action_p_3",
        name: "Carica File",
        url: `/projects/${UniqueCode}/upload-file`,
      },
    ]);
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

  useEffect(() => {
    fetchProjects();
    fetchUsers();
    fetchPages();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      if (activeProject) {
        setRawQuery("#" + activeProject.name + "/");
      } else if (activeUser) {
        setRawQuery(">" + activeUser.name + "/");
      } else if (filteredPages.length > 0) {
        setRawQuery(":" + filteredPages[0].name + "/");
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
              filteredPages.length > 0) && (
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
                      {filteredProjects.map((project, index) => (
                        <div key={project.id}>
                          <ComboboxOption
                            as="li"
                            ref={(el: HTMLLIElement | null) =>
                              setOptionRef(el, index, false)
                            }
                            value={project}
                            className="group flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-zinc-800 data-[focus]:text-white data-[focus]:outline-none"
                          >
                            <FolderIcon
                              className="size-6 flex-none text-gray-400 group-data-[focus]:text-white forced-colors:group-data-[focus]:text-[Highlight]"
                              aria-hidden="true"
                            />
                            <span className="ml-3 flex-auto truncate">
                              {project.name}
                            </span>
                          </ComboboxOption>
                          {activeProject?.id === project.id &&
                            (actionQuery
                              ? filteredProjectActions
                              : projectActions
                            ).map((action) => (
                              <ComboboxOption
                                as="li"
                                key={action.id}
                                value={action}
                                className="flex cursor-default select-none items-center py-2 pl-16 data-[focus]:bg-zinc-800 data-[focus]:text-white"
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
                      {filteredUsers.map((user, index) => (
                        <div key={user.id}>
                          <ComboboxOption
                            as="li"
                            ref={(el: HTMLLIElement | null) =>
                              setOptionRef(el, index, true)
                            }
                            value={user}
                            className="user-option flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-zinc-800 data-[focus]:text-white"
                          >
                            <Avatar
                              src={user.imageUrl ? user.imageUrl : ""}
                              size="sm"
                              alt=""
                              className="size-6 flex-none rounded-full"
                            />
                            <span className="ml-3 flex-auto truncate">
                              {user.name}
                            </span>
                          </ComboboxOption>
                          {activeUser?.id === user.id &&
                            (actionQuery
                              ? filteredUserActions
                              : userActions
                            ).map((action) => (
                              <ComboboxOption
                                as="li"
                                key={action.id}
                                value={action}
                                className="flex cursor-default select-none items-center py-2 pl-16 data-[focus]:bg-zinc-800 data-[focus]:text-white"
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
                      {filteredPages.map((page, index) => (
                        <div key={page.id}>
                          <ComboboxOption
                            as="li"
                            ref={(el: HTMLLIElement | null) =>
                              setOptionRef(el, index, false)
                            }
                            value={page}
                            className="group flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-zinc-800 data-[focus]:text-white data-[focus]:outline-none"
                          >
                            <page.icon
                              className="size-6 flex-none text-gray-400 group-data-[focus]:text-white forced-colors:group-data-[focus]:text-[Highlight]"
                              aria-hidden="true"
                            />
                            <span className="ml-3 flex-auto truncate">
                              {page.name}
                            </span>
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
              filteredPages.length === 0 && (
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
              Type{" "}
              <kbd
                className={classNames(
                  "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                  rawQuery.startsWith("#")
                    ? "border-zinc-800 text-zinc-800"
                    : "border-gray-400 text-gray-900"
                )}
              >
                #
              </kbd>{" "}
              per progetti,
              <kbd
                className={classNames(
                  "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                  rawQuery.startsWith(">")
                    ? "border-zinc-800 text-zinc-800"
                    : "border-gray-400 text-gray-900"
                )}
              >
                &gt;
              </kbd>{" "}
              per utenti,
              <kbd
                className={classNames(
                  "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                  rawQuery.startsWith(":")
                    ? "border-zinc-800 text-zinc-800"
                    : "border-gray-400 text-gray-900"
                )}
              >
                :
              </kbd>{" "}
              per pagine e
              <kbd
                className={classNames(
                  "mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2",
                  rawQuery === "?"
                    ? "border-zinc-800 text-zinc-800"
                    : "border-gray-400 text-gray-900"
                )}
              >
                ?
              </kbd>{" "}
              per aiuto.
            </div>
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
