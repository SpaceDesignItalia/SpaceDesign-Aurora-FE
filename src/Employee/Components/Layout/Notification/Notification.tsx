import { useEffect, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tabs,
  Tab,
  ScrollShadow,
  Card,
  CardHeader,
  Chip,
  Button,
  CardBody,
  CardFooter,
} from "@heroui/react";
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
  UniqueCode: string;
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
        content: "p-0 border-lg border-divider bg-background",
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
        <Card className="w-full max-w-[420px]">
          <CardHeader className="flex flex-col px-0 pb-0">
            <div className="flex w-full items-center justify-between px-5 py-2">
              <div className="inline-flex items-center gap-2">
                <h4 className="inline-block align-middle text-large font-medium">
                  Notifications
                </h4>
                <Chip size="sm" variant="flat">
                  {notifications.length}
                </Chip>
              </div>
              <Button
                className="h-8 px-3"
                color="primary"
                radius="full"
                variant="light"
              >
                Segna tutte come lette
              </Button>
            </div>
            <Tabs
              aria-label="Notifications"
              classNames={{
                base: "w-full",
                tabList:
                  "gap-6 px-6 py-0 w-full relative rounded-none border-b border-divider",
                cursor: "w-full",
                tab: "max-w-fit px-2 h-12",
              }}
              color="primary"
              selectedKey={activeTab}
              variant="underlined"
              onSelectionChange={(key) => setActiveTab(key as string)}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.title}
                  title={
                    <div className="flex items-center space-x-2">
                      <span>{tab.title}</span>
                      <Chip size="sm" variant="flat">
                        9
                      </Chip>
                    </div>
                  }
                />
              ))}
            </Tabs>
          </CardHeader>
          <CardBody className="w-full gap-0 p-0">
            <ScrollShadow className="h-[500px] w-full">
              {notifications?.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.NotificationId}
                    NotificationInfo={notification}
                    NotificationUpdate={notificationUpdate}
                  />
                ))
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                  {/*  <Icon
                    className="text-default-400"
                    icon="solar:bell-off-linear"
                    width={40}
                  /> */}
                  <p className="text-small text-default-400">
                    Nessuna notifica da mostrare
                  </p>
                </div>
              )}
            </ScrollShadow>
          </CardBody>
          <CardFooter className="justify-end gap-2 px-4">
            {/* <Button
              variant={
                activeTab === NotificationTabs.Archive ? "flat" : "light"
              }
            >
              Settings
            </Button>
            {activeTab !== NotificationTabs.Archive && (
              <Button variant="flat">Archive All</Button>
            )} */}
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
