import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import Logo from "../../../assets/SpaceDesignLogo.png";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  requiredCondition: boolean;
  current: boolean;
}

export default function Navbar() {
  const currentUrl = window.location.pathname;
  const [isOpen, setIsOpen] = useState(false);

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
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              type="button"
              className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon aria-hidden="true" className="h-6 w-6" />
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <div>
                <Menu.Button className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="h-8 w-8 rounded-full"
                  />
                </Menu.Button>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <Menu.Items as={motion.div}>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={`block px-4 py-2 text-sm text-gray-700 ${
                              active ? "bg-gray-100" : ""
                            }`}
                          >
                            Your Profile
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={`block px-4 py-2 text-sm text-gray-700 ${
                              active ? "bg-gray-100" : ""
                            }`}
                          >
                            Settings
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={`block px-4 py-2 text-sm text-gray-700 ${
                              active ? "bg-gray-100" : ""
                            }`}
                          >
                            Sign out
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </motion.div>
                )}
              </AnimatePresence>
            </Menu>
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
