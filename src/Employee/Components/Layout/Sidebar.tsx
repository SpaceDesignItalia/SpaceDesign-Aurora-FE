import { Dialog, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  Bars3Icon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
} from "@heroui/react";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL_IMG, API_WEBSOCKET_URL } from "../../../API/API";
import Logo from "../../../assets/SpaceDesignLogo.png";
import Notification from "./Notification/Notification";
import { usePermissions } from "./PermissionProvider";
import {
  administrationItems,
  communicationItems,
  mainNavigationItems,
  projectManagementItems,
  salesItems,
} from "./Sidebar/SidebarItems";
import Sidebar, { type SidebarItem } from "./Sidebar/sidebarOption";

interface Notification {
  NotificationId: number;
  NotificationTypeName: string;
  IsRead: boolean;
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
  NotificationCount: number;
  UniqueCode: string;
}

const USERDATA_VALUE: Employee = {
  EmployeeId: 0,
  StafferName: "",
  StafferSurname: "",
  EmployeeEmail: "",
  EmployeePhone: "",
  StafferImageUrl: "",
};

const socket: Socket = io(API_WEBSOCKET_URL);

export default function SidebarLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUrl = window.location.pathname;

  const { hasPermission } = usePermissions();

  const [userData, setUserData] = useState<Employee>(USERDATA_VALUE);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notificationUpdate, setNotificationUpdate] = useState(false);
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        setUserData(res.data);
        socket.emit("join-notifications", res.data.StafferId);
      });
    fetchProjects();
  }, [currentUrl, notificationUpdate]);

  useEffect(() => {
    getAllSidebarItems().then((items) => {
      setSidebarItems(items as SidebarItem[]);
    });
  }, [projects, currentUrl, notificationUpdate]);

  useEffect(() => {
    socket.on("delete-notifications", () => {
      setNotificationUpdate(!notificationUpdate);
    });

    socket.on("newNotification", () => {
      setNotificationUpdate(!notificationUpdate);
    });

    return () => {
      socket.off("delete-notifications");
      socket.off("newNotification");
    };
  }, [notificationUpdate]);

  function fetchProjects() {
    axios
      .get("/Project/GET/GetProjectInTeam", {
        withCredentials: true,
      })
      .then((res) => {
        setProjects(res.data);
      });
  }

  const getAllSidebarItems = async () => {
    // Get base items
    const baseItems = [
      ...mainNavigationItems,
      ...((await hasPermission("VIEW_LEAD")) ? salesItems : []),
      ...communicationItems,
      ...(await Promise.all(
        administrationItems.map(async (item) => {
          const permission = await hasPermission(
            getPermissionForRoute(item.items?.[0]?.href ?? "")
          );
          return permission ? item : null;
        })
      )),
    ].filter(Boolean);

    // Add projects if user has permission
    const hasProjectPermission = await hasPermission("VIEW_PROJECT");

    if (hasProjectPermission && projects.length > 0) {
      const currentPath = window.location.pathname;
      const projectSubItems = projects.map((project) => ({
        key: `project-${project.ProjectId}`,
        href: `/projects/${project.UniqueCode}`,
        title: project.ProjectName,
        startContent: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-white text-xs font-medium border-gray-400 text-gray-400 group-hover:border-gray-700 group-hover:text-gray-700">
            {project.ProjectName.charAt(0)}
          </span>
        ),
        endContent:
          project.NotificationCount > 0 ? (
            <span className="ml-auto inline-flex items-center justify-center h-fit px-[4px] py-0.5 text-xs font-bold leading-none text-white bg-primary rounded-full self-center">
              {project.NotificationCount}
            </span>
          ) : undefined,
        selected: currentPath === `/projects/${project.UniqueCode}`,
      }));

      const projectItems = projectManagementItems.map((section) => ({
        ...section,
        items: section.items?.map((item) =>
          item.key === "projects"
            ? {
                ...item,
                items: projectSubItems,
                selected: currentPath.startsWith("/projects/"),
              }
            : item
        ),
      }));

      baseItems.push(...projectItems);
    }

    return baseItems;
  };

  function logout() {
    axios
      .get("/Authentication/GET/Logout", { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          window.location.reload();
        }
      });
  }

  const getCurrentKey = (pathname: string): string => {
    if (pathname === "/") return "dashboard";

    // Per i progetti, seleziona il progetto specifico o la tab progetti
    if (pathname.startsWith("/projects/")) {
      const projectCode = pathname.split("/")[2];
      if (projectCode) {
        // Se siamo in una pagina di progetto specifica
        const project = projects.find((p) => p.UniqueCode === projectCode);
        if (project) {
          return `project-${project.ProjectId}`;
        }
      }
      // Se siamo nella pagina principale dei progetti o il progetto non è stato trovato
      return "projects";
    }

    // Per i sottomenu dei dipendenti
    if (pathname === "/administration/employee") return "employee-list";
    if (pathname === "/administration/employee/attendance") return "attendance";

    const pathMap: Record<string, string> = {
      "/lead": "lead",
      "/comunications/chat": "chat",
      "/comunications/calendar": "calendar",
      "/administration/customer": "customers",
      "/administration/permission": "permissions",
      "/projects": "projects",
    };

    return pathMap[pathname] || pathname;
  };

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 lg:hidden"
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
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center justify-center border-b">
                    <img
                      className="h-20 w-auto"
                      src={Logo}
                      alt="Your Company"
                    />
                  </div>
                  <Sidebar
                    items={sidebarItems}
                    defaultSelectedKey={getCurrentKey(currentUrl)}
                    defaultExpandedKeys={[
                      "overview",
                      "sales",
                      "communications",
                      "administration",
                      "project-management",
                      "employees",
                      "projects",
                    ]}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-center border-b">
            <img className="h-20 w-auto" src={Logo} alt="Your Company" />
          </div>
          <Sidebar
            items={sidebarItems}
            defaultSelectedKey={getCurrentKey(currentUrl)}
            selectedKeys={new Set([getCurrentKey(currentUrl)])}
            defaultExpandedKeys={[
              "overview",
              "sales",
              "communications",
              "administration",
              "project-management",
              "employees",
              "projects",
            ]}
          />
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
                <Notification />

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
                          userData.StafferImageUrl &&
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
                    <DropdownItem key="settings" href="/settings">
                      <div className="flex flex-row gap-2">
                        <Cog6ToothIcon
                          className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary"
                          aria-hidden="true"
                        />
                        Impostazioni
                      </div>
                    </DropdownItem>
                    <DropdownItem key="logout" color="danger" onClick={logout}>
                      <div className="flex flex-row gap-2">
                        <LogoutRoundedIcon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-danger" />
                        Logout
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

function getPermissionForRoute(route: string): string {
  switch (route) {
    case "/administration/customer":
      return "VIEW_CUSTOMER";
    case "/administration/employee":
    case "/administration/employee/attendance":
      return "VIEW_EMPLOYEE";
    case "/administration/permission":
      return "VIEW_ROLE";
    default:
      return "";
  }
}
