import { useEffect, useState } from "react";
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
import { Icon } from "@iconify/react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../API/API";
import NotificationItem from "./NotificationItem";

const socket: Socket = io(API_WEBSOCKET_URL);

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

export default function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [update, setUpdate] = useState(false);
  const [stafferId, setStafferId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false); // Stato del popover
  const [activeTab, setActiveTab] = useState("Non lette");

  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then(async (res) => {
        setStafferId(res.data.StafferId);
      })
      .then(() => {
        socket.emit("join-notifications", stafferId);
      });
  }, []);

  useEffect(() => {
    axios
      .get("/Notification/GET/GetAllNotifications", { withCredentials: true })
      .then((response) => {
        setNotifications(response.data);
      });
  }, [update]);

  const unreadNotificationsCount = notifications.filter(
    (notification) => !notification.IsRead
  ).length;

  const tabs = [{ title: "Tutte" }, { title: "Non lette" }];

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        (notification) => !notification.IsRead
      );

      for (const notification of unreadNotifications) {
        await axios.post(
          "/Notification/POST/ReadNotification",
          {
            NotificationId: notification.NotificationId,
          },
          { withCredentials: true }
        );
      }

      setUpdate((prev) => !prev);
    } catch (error) {
      console.error("Errore durante la marcatura delle notifiche:", error);
    }
  };

  return (
    <Popover
      size="lg"
      radius="sm"
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      showArrow
      classNames={{
        base: "before:bg-default-200",
        content: `p-0 border-lg border-divider bg-background ${
          isOpen ? "block" : "hidden"
        }`,
      }}
    >
      <PopoverTrigger>
        <button
          type="button"
          className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">View notifications</span>
          <Icon
            icon="solar:bell-linear"
            className={`h-6 w-6 ${update ? "animate-shake" : ""}`}
          />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-[4px] py-0.5 text-xs font-bold leading-none text-white bg-primary rounded-full">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      {/* Se il popover è chiuso, il contenuto non esiste nel DOM */}
      {isOpen && (
        <PopoverContent className="w-96 h-fit">
          <Card className="w-full max-w-[420px]">
            <CardHeader className="flex flex-col px-0 pb-0">
              <div className="flex w-full items-center justify-between px-5 py-2">
                <div className="inline-flex items-center gap-2">
                  <h4 className="inline-block align-middle text-large font-medium">
                    Notifiche
                  </h4>
                  <Chip size="sm" variant="flat">
                    {notifications.length}
                  </Chip>
                </div>
              </div>

              {/* Tabs */}
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
                          {tab.title === "Non lette"
                            ? unreadNotificationsCount
                            : notifications.length}
                        </Chip>
                      </div>
                    }
                  />
                ))}
              </Tabs>
            </CardHeader>

            <CardBody className="w-full gap-0 p-0">
              <ScrollShadow className="h-[500px] w-full">
                {activeTab === "Tutte"
                  ? notifications.length > 0
                    ? notifications.map((notification) => (
                        <NotificationItem
                          key={notification.NotificationId}
                          NotificationInfo={notification}
                          NotificationUpdate={() => setUpdate((prev) => !prev)}
                        />
                      ))
                    : renderEmptyState()
                  : notifications.filter((n) => !n.IsRead).length > 0
                  ? notifications
                      .filter((n) => !n.IsRead)
                      .map((notification) => (
                        <NotificationItem
                          key={notification.NotificationId}
                          NotificationInfo={notification}
                          NotificationUpdate={() => setUpdate((prev) => !prev)}
                        />
                      ))
                  : renderEmptyState()}
              </ScrollShadow>
            </CardBody>

            <CardFooter className="justify-end gap-2 px-4">
              <Button
                className="h-8 px-3"
                color="primary"
                radius="full"
                variant="light"
                onClick={markAllAsRead}
                isDisabled={unreadNotificationsCount === 0}
              >
                <Icon icon="solar:check-circle-linear" fontSize={18} /> Segna
                tutte come lette
              </Button>
            </CardFooter>
          </Card>
        </PopoverContent>
      )}
    </Popover>
  );
}

const renderEmptyState = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-2">
    <Icon icon="solar:bell-linear" fontSize={35} className="text-default-400" />
    <p className="text-small text-default-400">Nessuna notifica da mostrare</p>
  </div>
);
