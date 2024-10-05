import { useEffect, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tabs,
  Tab,
  ScrollShadow,
} from "@nextui-org/react";
import NotificationItem from "./NotificationItem";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../API/API";

interface Notification {
  NotificationId: number;
  NotificationMessage: string;
  NotificationTypeName: string;
  ProjectId: number;
  ProjectName: string;
  CompanyName: string;
  UserId: number;
  userfullname: string;
  NotificationCreationDate: Date;
  IsRead: boolean;
}

const socket: Socket = io(API_WEBSOCKET_URL);

export default function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [update, setUpdate] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState(false);
  const [stafferId, setStafferId] = useState<number | null>(null);

  useEffect(() => {
    if (update) {
      const timer = setTimeout(() => setUpdate(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [update]);

  // Filtra le notifiche non lette
  const unreadNotificationsCount = notifications.filter(
    (notification) => !notification.IsRead
  ).length;

  function notificationUpdate() {
    socket.emit("delete-notifications", stafferId);
    setUpdate(!update);
  }

  useEffect(() => {
    // Fetch logged in staffer's data and conversations
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then(async (res) => {
        setStafferId(res.data.StafferId);
      })
      .then(() => {
        socket.emit("join-notifications", stafferId);
      });
  });

  socket.on("newNotification", () => {
    notificationUpdate();
  });

  socket.on("delete-notifications", () => {
    setDeleteNotification(!deleteNotification);
  });

  useEffect(() => {
    axios
      .get("/Notification/GET/GetAllNotifications", { withCredentials: true })
      .then((response) => {
        setNotifications(response.data);
      });
  }, [update, deleteNotification]);

  const tabs = [{ title: "Non lette" }, { title: "Tutte" }];
  const [activeTab, setActiveTab] = useState("Non lette");

  return (
    <Popover
      size="lg"
      radius="sm"
      classNames={{
        base: "before:bg-default-200",
        content: "p-0 border-small border-divider bg-background",
      }}
    >
      <PopoverTrigger>
        <button
          type="button"
          className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon
            className={`h-6 w-6 ${update ? "animate-shake" : ""}`}
            aria-hidden="true"
          />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-[4px] py-0.5 text-xs font-bold leading-none text-white bg-primary rounded-full">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 h-fit">
        <div className="w-full pt-5">
          <div>
            <h1 className="px-5 font-bold">Notifiche</h1>
          </div>
          <div className="w-full mt-5">
            <Tabs
              variant="underlined"
              aria-label="Notification"
              color="primary"
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              classNames={{
                base: "w-full",
                tabList:
                  "gap-6 w-full relative rounded-none p-0 border-divider",
                tabContent: "group-data-[selected=true]:font-bold mb-3",
              }}
            >
              {tabs.map((tab) => (
                <Tab key={tab.title} title={tab.title} />
              ))}
            </Tabs>
          </div>
          <ScrollShadow className="w-full h-40">
            {activeTab === "Non lette" && (
              <>
                {notifications
                  .filter((notification) => !notification.IsRead)
                  .map((notification) => (
                    <NotificationItem
                      key={notification.NotificationId}
                      NotificationInfo={notification}
                      NotificationUpdate={notificationUpdate}
                    />
                  ))}
              </>
            )}
            {activeTab === "Tutte" && (
              <>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.NotificationId}
                    NotificationInfo={notification}
                    NotificationUpdate={notificationUpdate}
                  />
                ))}
              </>
            )}
          </ScrollShadow>
        </div>
      </PopoverContent>
    </Popover>
  );
}
