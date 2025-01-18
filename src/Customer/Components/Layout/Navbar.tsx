import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dropdown,
  DropdownTrigger,
  DropdownItem,
  DropdownMenu,
  Avatar,
  Skeleton,
} from "@heroui/react";
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Logo from "../../../assets/SpaceDesignLogo.png";
import axios from "axios";
import { API_URL_IMG } from "../../../API/API";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  requiredCondition: boolean;
  current: boolean;
}

interface UserData {
  CustomerId: number;
  CustomerName: string;
  CustomerSurname: string;
  CustomerEmail: string;
  CustomerPhone: string | null;
  CustomerImageUrl: string;
  IsStaffer: boolean;
}
const USERDATA_VALUE: UserData = {
  CustomerId: 0,
  CustomerName: "",
  CustomerSurname: "",
  CustomerEmail: "",
  CustomerPhone: null,
  CustomerImageUrl: "",
  IsStaffer: false,
};
export default function Navbar() {
  const currentUrl = window.location.pathname;
  const [userData, setUserData] = useState<UserData>(USERDATA_VALUE);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        setUserData(res.data);
      });
  }, []);

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
    {
      name: "Progetti",
      href: "/projects",
      icon: FolderCopyOutlinedIcon,
      requiredCondition: true,
      current: isSubRoute({
        currentUrl,
        parentRoute: { href: "/projects", subRoutes: ["/projects/"] },
      }),
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
    <div className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <img
                alt="Space Design Italia"
                src={Logo}
                className="h-20 w-auto"
              />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item, index) => {
                return (
                  <a
                    key={index}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? " border-primary px-1 pt-1 text-sm font-medium text-primary"
                        : "border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      "inline-flex justify-center items-center gap-2 border-b-2"
                    )}
                  >
                    <item.icon />
                    {item.name}
                  </a>
                );
              })}
            </div>
          </div>
          <div className="flex flex-1 justify-end items-center gap-x-4 self-stretch lg:gap-x-6">
            <button
              type="button"
              className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon aria-hidden="true" className="h-6 w-6" />
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
                      userData.CustomerImageUrl &&
                      API_URL_IMG + "/profileIcons/" + userData.CustomerImageUrl
                    }
                    alt=""
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span
                      className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                      aria-hidden="true"
                    >
                      {userData.CustomerId !== 0 ? (
                        userData.CustomerName + " " + userData.CustomerSurname
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
                  <div className="flex flex-row gap-2 ">
                    <LogoutRoundedIcon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-danger" />
                    Logout
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden"
          >
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "border-primary bg-indigo-50 py-2 pl-3 pr-4 text-base font-medium text-primary"
                      : "border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700",
                    "border-l-4 flex items-center gap-2"
                  )}
                >
                  <item.icon />
                  {item.name}
                </a>
              ))}
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="h-10 w-10 rounded-full"
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    Tom Cook
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    tom@example.com
                  </div>
                </div>
                <button
                  type="button"
                  className="relative ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-3 space-y-1">
                <a
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Your Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Settings
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Sign out
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
