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
import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import { API_URL_IMG } from "../../../API/API";
import { Avatar } from "@heroui/react";

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
  const query = rawQuery.toLowerCase().replace(/^[#>:]/, "");
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projectActions, setProjectActions] = useState<ProjectAction[]>([]);
  const [userActions, setUserActions] = useState<ProjectAction[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  const filteredProjects =
    rawQuery === "#"
      ? projects
      : query === "" || rawQuery.startsWith(">")
      ? []
      : projects.filter((project) =>
          project.name.toLowerCase().includes(query)
        );

  const filteredUsers =
    rawQuery === ">"
      ? users
      : query === "" || rawQuery.startsWith("#")
      ? []
      : users.filter((user) => user.name.toLowerCase().includes(query));

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

    const handleFocus = (element: HTMLElement, isUser: boolean) => {
      const focusedIndex = (
        isUser ? userOptionsRefs : optionsRefs
      ).current.findIndex((ref) => ref === element);
      if (focusedIndex !== -1) {
        const item = (isUser ? filteredUsers : filteredProjects)[focusedIndex];
        if (item) {
          if (isUser) {
            setActiveUser(item as User);
            setActiveProject(null);
            setUserActions(getUserActions(item as User));
          } else {
            setActiveProject(item as Project);
            setActiveUser(null);
            fetchProjectAction((item as Project).UniqueCode);
          }
          console.log(
            `${isUser ? "User" : "Project"} at index ${focusedIndex} focused:`,
            item
          );
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
  }, [filteredProjects.length, filteredUsers.length]);

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

  function getUserActions(user: User) {
    return [
      {
        id: `edit_${user.id}`,
        name: `Modifica ${user.type}`,
        url: `/administration/${
          user.type.toLowerCase() === "customer"
            ? "customer"
            : user.type.toLowerCase() === "company"
            ? "customer"
            : "employee"
        }/${
          user.id.includes("_c_")
            ? "edit-customer"
            : user.id.includes("_b_")
            ? "edit-company"
            : "edit-employee"
        }/${user.id.split("_").pop()}${
          user.id.includes("_b_") ? `/${user.name}` : ""
        }`,
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
    ]);
  }

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

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
                className="col-start-1 row-start-1 h-12 w-full pl-11 pr-4 text-base text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm"
                placeholder="Search..."
                onChange={(event) => setRawQuery(event.target.value)}
                onBlur={() => setRawQuery("")}
              />
              <MagnifyingGlassIcon
                className="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-400"
                aria-hidden="true"
              />
            </div>

            {(filteredProjects.length > 0 || filteredUsers.length > 0) && (
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
                            projectActions.map((action) => (
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
                            userActions.map((action) => (
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
              </ComboboxOptions>
            )}
            {rawQuery === "?" && (
              <div className="px-6 py-14 text-center text-sm sm:px-14">
                <LifebuoyIcon
                  className="mx-auto size-6 text-gray-400"
                  aria-hidden="true"
                />
                <p className="mt-4 font-semibold text-gray-900">
                  Help with searching
                </p>
                <p className="mt-2 text-gray-500">
                  Use this tool to quickly search for users and projects across
                  our entire platform. You can also use the search modifiers
                  found in the footer below to limit the results to just users
                  or projects.
                </p>
              </div>
            )}

            {query !== "" &&
              rawQuery !== "?" &&
              filteredProjects.length === 0 &&
              filteredUsers.length === 0 && (
                <div className="px-6 py-14 text-center text-sm sm:px-14">
                  <ExclamationTriangleIcon
                    className="mx-auto size-6 text-gray-400"
                    aria-hidden="true"
                  />
                  <p className="mt-4 font-semibold text-gray-900">
                    No results found
                  </p>
                  <p className="mt-2 text-gray-500">
                    We couldn't find anything with that term. Please try again.
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
              per utenti e
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
              for help.
            </div>
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
