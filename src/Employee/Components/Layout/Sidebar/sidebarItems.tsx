import { type SidebarItem, SidebarItemType } from "./SidebarOption";

export const mainNavigationItems: SidebarItem[] = [
  {
    key: "overview",
    title: "Overview",
    items: [
      {
        key: "dashboard",
        href: "/",
        icon: "solar:home-2-linear",
        title: "Dashboard",
      },
    ],
  },
];

export const salesItems: SidebarItem[] = [
  {
    key: "sales",
    title: "Vendite",
    items: [
      {
        key: "lead",
        href: "/lead",
        icon: "solar:mailbox-linear",
        title: "Lead",
      },
    ],
  },
];

export const communicationItems: SidebarItem[] = [
  {
    key: "communications",
    title: "Comunicazioni",
    items: [
      {
        key: "chat",
        href: "/comunications/chat",
        icon: "solar:chat-round-dots-linear",
        title: "Chat",
      },
      {
        key: "calendar",
        href: "/comunications/calendar",
        icon: "solar:calendar-linear",
        title: "Calendario",
      },
    ],
  },
];

export const administrationItems: SidebarItem[] = [
  {
    key: "administration",
    title: "Amministrazione",
    items: [
      {
        key: "customers",
        href: "/administration/customer",
        icon: "solar:users-group-rounded-linear",
        title: "Clienti",
      },
      {
        key: "employees",
        href: "/administration/employee",
        icon: "solar:user-id-linear",
        title: "Dipendenti",
        type: SidebarItemType.Nest,
        items: [
          {
            key: "employee-list",
            href: "/administration/employee",
            icon: "solar:users-group-rounded-linear",
            title: "Lista Dipendenti",
          },
          {
            key: "attendance",
            href: "/administration/employee/attendance",
            icon: "solar:calendar-mark-linear",
            title: "Tabella Presenze",
          },
        ],
      },
      {
        key: "permissions",
        href: "/administration/permission",
        icon: "solar:key-linear",
        title: "Permessi",
      },
    ],
  },
];

export const projectManagementItems: SidebarItem[] = [
  {
    key: "project-management",
    title: "Progetti",
    items: [
      {
        key: "projects",
        href: "/projects",
        icon: "solar:folder-with-files-linear",
        title: "Progetti",
        type: SidebarItemType.Nest,
        items: [],
        selected: true,
      },
    ],
  },
];
