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

export default function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    axios
      .get("/Notification/GET/GetAllNotifications", { withCredentials: true })
      .then((response) => {
        setNotifications(response.data);
      });
  }, []);

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
          className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 h-fit">
        <div className="w-full py-5">
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
                  "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                tabContent: "group-data-[selected=true]:font-bold mb-3",
              }}
            >
              {tabs.map((tab) => (
                <Tab key={tab.title} title={tab.title} />
              ))}
            </Tabs>
          </div>
          <ScrollShadow className="w-full h-96">
            {activeTab === "Non lette" && (
              <>
                {notifications.map((notification) => {
                  return <NotificationItem NotificationInfo={notification} />;
                })}
              </>
            )}
            {activeTab === "Tutte" && (
              <>
                {notifications.map((notification) => {
                  return <NotificationItem NotificationInfo={notification} />;
                })}
              </>
            )}
          </ScrollShadow>
        </div>
      </PopoverContent>
    </Popover>
  );
}
