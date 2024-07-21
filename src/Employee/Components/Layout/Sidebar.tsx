import { usePermissions } from "./PermissionProvider";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

import Logo from "../../../assets/SpaceDesignLogo.png";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import axios from "axios";
import { API_URL_IMG } from "../../../API/API";
import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownItem,
  Skeleton,
  DropdownMenu,
} from "@nextui-org/react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  requiredCondition: boolean;
  current: boolean;
}

interface Employee {
  EmployeeId: number;
  StafferName: string;
  StafferSurname: string;
  EmployeeEmail: string;
  EmployeePhone: string;
  StafferImageUrl: string;
}

interface Project {
  ProjectId: number;
  ProjectName: string;
  CompanyName: string;
}

const USERDATA_VALUE: Employee = {
  EmployeeId: 0,
  StafferName: "",
  StafferSurname: "",
  EmployeeEmail: "",
  EmployeePhone: "",
  StafferImageUrl: "",
};

const PROJECT_DATA: Project[] = [
  {
    ProjectId: 0,
    ProjectName: "",
    CompanyName: "",
  },
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUrl = window.location.pathname;

  const { hasPermission } = usePermissions();

  const [administration, setAdministration] = useState<NavigationItem[]>([]);
  const [projectManagement, setProjectManagement] = useState<NavigationItem[]>(
    []
  );
  const [userData, setUserData] = useState<Employee>(USERDATA_VALUE);
  const [projects, setProjects] = useState<Project[]>(PROJECT_DATA);

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        setUserData(res.data);
        fetchProjects(res.data.StafferId);
      });

    fetchPermissions();
  }, [currentUrl]);

  async function fetchPermissions() {
    setAdministration([
      {
        name: "Clienti",
        href: "/administration/customer",
        icon: PeopleAltOutlinedIcon,
        requiredCondition:
          (await hasPermission("VIEW_CUSTOMER")) ||
          (await hasPermission("VIEW_COMPANY")),
        current: isSubRoute({
          currentUrl,
          parentRoute: {
            href: "/administration/customer",
            subRoutes: [
              "/administration/customer/add-customer",
              "/administration/customer/edit-customer",
              "/administration/customer/add-company",
              "/administration/customer/edit-company",
            ],
          },
        }),
      },
      {
        name: "Dipendenti",
        href: "/administration/employee",
        icon: EngineeringOutlinedIcon,
        requiredCondition: await hasPermission("VIEW_EMPLOYEE"),
        current: isSubRoute({
          currentUrl,
          parentRoute: {
            href: "/administration/employee",
            subRoutes: [
              "/administration/employee/add-employee",
              "/administration/employee/edit-employee",
            ],
          },
        }),
      },
      {
        name: "Permessi",
        href: "/administration/permission",
        icon: VpnKeyOutlinedIcon,
        requiredCondition: await hasPermission("VIEW_ROLE"),
        current: isSubRoute({
          currentUrl,
          parentRoute: {
            href: "/administration/permission",
            subRoutes: ["/administration/permission/edit-role"],
          },
        }),
      },
    ]);
    setProjectManagement([
      {
        name: "Progetti",
        href: "/projects",
        icon: FolderCopyOutlinedIcon,
        requiredCondition: await hasPermission("VIEW_PROJECT"),
        current: isSubRoute({
          currentUrl,
          parentRoute: { href: "/projects", subRoutes: ["/projects/"] },
        }),
      },
    ]);
  }

  function fetchProjects(StafferId: number) {
    axios
      .get("/Project/GET/GetProjectInTeam", {
        params: { StafferId: StafferId },
      })
      .then((res) => {
        setProjects(res.data);
      });
  }

  function isSubRoute({
    currentUrl,
    parentRoute,
  }: {
    currentUrl: string;
    parentRoute: { href: string; subRoutes: string[] };
  }): boolean {
    if (currentUrl === parentRoute.href) {
      return true;
    }
    if (parentRoute.subRoutes && parentRoute.subRoutes.length > 0) {
      return parentRoute.subRoutes.some((subRoute) =>
        currentUrl.startsWith(subRoute)
      );
    }
    return false;
  }

  const navigation: NavigationItem[] = [
    {
      name: "Dashboard",
      href: "/",
      icon: DashboardOutlinedIcon,
      requiredCondition: true,
      current: isSubRoute({
        currentUrl,
        parentRoute: { href: "/", subRoutes: [] },
      }),
    },
  ];

  const requests = [
    {
      name: "Messaggi",
      href: "/messages",
      icon: MailOutlineRoundedIcon,
      current: currentUrl === "/messages",
    },
    {
      name: "Ticket",
      href: "/tickets",
      icon: ConfirmationNumberOutlinedIcon,
      current: currentUrl === "/tickets",
    },
  ];

  const comunications = [
    {
      name: "Chat",
      href: "/comunications/chat",
      icon: ChatBubbleOutlineRoundedIcon,
      current: currentUrl === "/comunications/chat",
    },
  ];

  function logout() {
    axios
      .get("/Authentication/GET/Logout", { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          window.location.reload();
        }
      });
  }

  function classNames(...classes: string[]): string {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      className="h-20 w-auto"
                      src={Logo}
                      alt="Your Company"
                    />
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <a
                                href={item.href}
                                className={classNames(
                                  item.current
                                    ? "bg-gray-100 text-primary"
                                    : "text-gray-700 hover:text-primary hover:bg-gray-100",
                                  "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                )}
                              >
                                <item.icon
                                  className={classNames(
                                    item.current
                                      ? "text-primary"
                                      : "text-gray-400 group-hover:text-primary",
                                    "h-6 w-6 shrink-0"
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>

                      <li>
                        <div className="text-xs font-semibold leading-6 text-gray-400">
                          Richieste
                        </div>
                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                          {requests.map((item) => (
                            <li key={item.name}>
                              <a
                                href={item.href}
                                className={classNames(
                                  item.current
                                    ? "bg-gray-100 text-primary"
                                    : "text-gray-700 hover:text-primary hover:bg-gray-100",
                                  "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                )}
                              >
                                <item.icon
                                  className={classNames(
                                    item.current
                                      ? "text-primary"
                                      : "text-gray-400 group-hover:text-primary",
                                    "h-6 w-6 shrink-0"
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>

                      <li>
                        <div className="text-xs font-semibold leading-6 text-gray-400">
                          Comunicazioni
                        </div>
                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                          {comunications.map((item) => (
                            <li key={item.name}>
                              <a
                                href={item.href}
                                className={classNames(
                                  item.current
                                    ? "bg-gray-100 text-primary"
                                    : "text-gray-700 hover:text-primary hover:bg-gray-100",
                                  "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                )}
                              >
                                <item.icon
                                  className={classNames(
                                    item.current
                                      ? "text-primary"
                                      : "text-gray-400 group-hover:text-primary",
                                    "h-6 w-6 shrink-0"
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>

                      {administration &&
                        administration.some(
                          (admin) => admin.requiredCondition
                        ) && (
                          <li>
                            <div className="text-xs font-semibold leading-6 text-gray-400">
                              Amministrazione
                            </div>
                            <ul role="list" className="-mx-2 mt-2 space-y-1">
                              {administration.map(
                                (admin) =>
                                  admin.requiredCondition && (
                                    <li key={admin.name}>
                                      <a
                                        href={admin.href}
                                        className={classNames(
                                          admin.current
                                            ? "bg-gray-100 text-primary"
                                            : "text-gray-700 hover:text-primary hover:bg-gray-100",
                                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                        )}
                                      >
                                        <admin.icon
                                          className={classNames(
                                            admin.current
                                              ? "text-primary"
                                              : "text-gray-400 group-hover:text-primary",
                                            "h-6 w-6 shrink-0"
                                          )}
                                          aria-hidden="true"
                                        />
                                        {admin.name}
                                      </a>
                                    </li>
                                  )
                              )}
                            </ul>
                          </li>
                        )}

                      {projectManagement &&
                        projectManagement.some(
                          (project) => project.requiredCondition
                        ) && (
                          <li>
                            <div className="text-xs font-semibold leading-6 text-gray-400">
                              Gestione Progetti
                            </div>
                            <ul role="list" className="-mx-2 mt-2 space-y-1">
                              {projectManagement.map(
                                (project) =>
                                  project.requiredCondition && (
                                    <li key={project.name}>
                                      <a
                                        href={project.href}
                                        className={classNames(
                                          project.current
                                            ? "bg-gray-100 text-primary"
                                            : "text-gray-700 hover:text-primary hover:bg-gray-100",
                                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                        )}
                                      >
                                        <project.icon
                                          className={classNames(
                                            project.current
                                              ? "text-primary"
                                              : "text-gray-400 group-hover:text-primary",
                                            "h-6 w-6 shrink-0"
                                          )}
                                          aria-hidden="true"
                                        />
                                        {project.name}
                                      </a>
                                    </li>
                                  )
                              )}
                            </ul>
                          </li>
                        )}

                      {projects.length > 0 && (
                        <li>
                          <div className="text-xs font-semibold leading-6 text-gray-400">
                            Progetti
                          </div>
                          <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {projects.map((project: Project) => (
                              <li key={project.ProjectId}>
                                <a
                                  href={
                                    "/projects/" +
                                    project.CompanyName +
                                    "/" +
                                    project.ProjectId +
                                    "/" +
                                    project.ProjectName
                                  }
                                  className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:text-primary hover:bg-gray-100"
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-white text-xs font-medium border-gray-400 text-gray-400 group-hover:border-primary group-hover:text-primary">
                                    {project.ProjectName.charAt(0)}
                                  </span>
                                  <span className="truncate">
                                    {project.ProjectName}
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                      )}
                      <li className="mt-auto">
                        <a
                          href="/settings"
                          className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-primary"
                        >
                          <Cog6ToothIcon
                            className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary"
                            aria-hidden="true"
                          />
                          Settings
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img className="h-20 w-auto" src={Logo} alt="Your Company" />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-gray-100 text-primary"
                            : "text-gray-700 hover:text-primary hover:bg-gray-100",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? "text-primary"
                              : "text-gray-400 group-hover:text-primary",
                            "h-6 w-6 shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400">
                  Richieste
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {requests.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-gray-100 text-primary"
                            : "text-gray-700 hover:text-primary hover:bg-gray-100",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? "text-primary"
                              : "text-gray-400 group-hover:text-primary",
                            "h-6 w-6 shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400">
                  Comunicazioni
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {comunications.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-gray-100 text-primary"
                            : "text-gray-700 hover:text-primary hover:bg-gray-100",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? "text-primary"
                              : "text-gray-400 group-hover:text-primary",
                            "h-6 w-6 shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              {administration &&
                administration.some((admin) => admin.requiredCondition) && (
                  <li>
                    <div className="text-xs font-semibold leading-6 text-gray-400">
                      Amministrazione
                    </div>
                    <ul role="list" className="-mx-2 mt-2 space-y-1">
                      {administration.map(
                        (admin) =>
                          admin.requiredCondition && (
                            <li key={admin.name}>
                              <a
                                href={admin.href}
                                className={classNames(
                                  admin.current
                                    ? "bg-gray-100 text-primary"
                                    : "text-gray-700 hover:text-primary hover:bg-gray-100",
                                  "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                )}
                              >
                                <admin.icon
                                  className={classNames(
                                    admin.current
                                      ? "text-primary"
                                      : "text-gray-400 group-hover:text-primary",
                                    "h-6 w-6 shrink-0"
                                  )}
                                  aria-hidden="true"
                                />
                                {admin.name}
                              </a>
                            </li>
                          )
                      )}
                    </ul>
                  </li>
                )}

              {projectManagement &&
                projectManagement.some(
                  (project) => project.requiredCondition
                ) && (
                  <li>
                    <div className="text-xs font-semibold leading-6 text-gray-400">
                      Gestione Progetti
                    </div>
                    <ul role="list" className="-mx-2 mt-2 space-y-1">
                      {projectManagement.map(
                        (project) =>
                          project.requiredCondition && (
                            <li key={project.name}>
                              <a
                                href={project.href}
                                className={classNames(
                                  project.current
                                    ? "bg-gray-100 text-primary"
                                    : "text-gray-700 hover:text-primary hover:bg-gray-100",
                                  "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                )}
                              >
                                <project.icon
                                  className={classNames(
                                    project.current
                                      ? "text-primary"
                                      : "text-gray-400 group-hover:text-primary",
                                    "h-6 w-6 shrink-0"
                                  )}
                                  aria-hidden="true"
                                />
                                {project.name}
                              </a>
                            </li>
                          )
                      )}
                    </ul>
                  </li>
                )}

              {projects.length > 0 && (
                <li>
                  <div className="text-xs font-semibold leading-6 text-gray-400">
                    Progetti
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {projects.map((project: Project) => (
                      <li key={project.ProjectId}>
                        <a
                          href={
                            "/projects/" +
                            project.CompanyName +
                            "/" +
                            project.ProjectId +
                            "/" +
                            project.ProjectName
                          }
                          className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:text-primary hover:bg-gray-100"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-white text-xs font-medium border-gray-400 text-gray-400 group-hover:border-primary group-hover:text-primary">
                            {project.ProjectName.charAt(0)}
                          </span>
                          <span className="truncate">
                            {project.ProjectName}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
              <li className="mt-auto">
                <a
                  href="/settings"
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-primary"
                >
                  <Cog6ToothIcon
                    className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary"
                    aria-hidden="true"
                  />
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 lg:mx-auto border-b border-gray-200 lg:px-8">
          <div className="flex h-16 items-center gap-x-4 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            {/* Separator */}
            <div
              className="h-6 w-px bg-gray-200 lg:hidden"
              aria-hidden="true"
            />
            <p className="hidden sm:flex">
              Ciao,
              {" " + userData.StafferName + " " + userData.StafferSurname} 👋
            </p>

            <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Separator */}
                <div
                  className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
                  aria-hidden="true"
                />

                {/* Profile dropdown */}
                <Dropdown placement="bottom-start" radius="sm">
                  <DropdownTrigger>
                    <div className="-m-1.5 flex items-center p-1.5 cursor-pointer">
                      <Avatar
                        className="h-8 w-8 rounded-full bg-gray-100"
                        src={
                          API_URL_IMG +
                          "/profileIcons/" +
                          userData.StafferImageUrl
                        }
                        alt=""
                      />
                      <span className="hidden lg:flex lg:items-center">
                        <span
                          className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                          aria-hidden="true"
                        >
                          {userData.EmployeeId !== 0 ? (
                            userData.StafferName + " " + userData.StafferSurname
                          ) : (
                            <Skeleton className="h-3 rounded-lg" />
                          )}
                        </span>
                        <ChevronDownIcon
                          className="ml-2 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User Actions" variant="flat">
                    <DropdownItem key="logout" color="danger" onClick={logout}>
                      <div className="flex flex-row gap-2">
                        <LogoutRoundedIcon />
                        Log Out
                      </div>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
