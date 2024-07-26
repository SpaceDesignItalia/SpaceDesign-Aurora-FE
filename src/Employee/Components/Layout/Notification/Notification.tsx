import { useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tabs,
  Tab,
} from "@nextui-org/react";
import NotificationItem from "./NotificationItem";

interface Notification {
  NotificationId: number;
  NotificationTypeName: string;
  NotificationMessage: string;
  ProjectId: number;
  ProjectName: string;
  CompanyName: string;
  UserId: number;
  UserFullName: string;
  NotificationCreationDate: Date;
}

export default function Notification() {
  const tabs = [{ title: "Non lette" }, { title: "Tutte" }];
  const notifications: Notification[] = [
    {
      NotificationId: 1,
      NotificationTypeName: "Progetto",
      NotificationMessage: `Sei stato assegnato al progetto!</p>`,
      ProjectId: 9,
      ProjectName: "Zio pera",
      CompanyName: "Globalcom S.r.l",
      UserId: 3,
      UserFullName: "Andrea Braia",
      NotificationCreationDate: new Date(),
    },
    {
      NotificationId: 2,
      NotificationTypeName: "Progetto",
      NotificationMessage: `ti ha inviato un nuovo messaggio:</p>`,
      ProjectId: 9,
      ProjectName: "Zio pera",
      CompanyName: "Globalcom S.r.l",
      UserId: 4,
      UserFullName: "Luigi Rossi",
      NotificationCreationDate: new Date(
        new Date().setDate(new Date().getDate() - 1)
      ), // Yesterday
    },
    {
      NotificationId: 3,
      NotificationTypeName: "Messaggio",
      NotificationMessage: `ha inviato un avviso importante:</p>`,
      ProjectId: 9,
      ProjectName: "Zio pera",
      CompanyName: "Globalcom S.r.l",
      UserId: 5,
      UserFullName: "Giulia Bianchi",
      NotificationCreationDate: new Date(
        new Date().setDate(new Date().getDate() - 2)
      ), // Two days ago
    },
    {
      NotificationId: 4,
      NotificationTypeName: "Promemoria",
      NotificationMessage: `ti ricorda della riunione di domani:</p>`,
      ProjectId: 9,
      ProjectName: "Zio pera",
      CompanyName: "Globalcom S.r.l",
      UserId: 6,
      UserFullName: "Mario Verdi",
      NotificationCreationDate: new Date(
        new Date().setDate(new Date().getDate() - 3)
      ), // Three days ago
    },
  ];
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
              onSelectionChange={setActiveTab}
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
          {activeTab === "Non lette" && (
            <>
              {notifications.map((notification) => {
                return <NotificationItem NotificationInfo={notification} />;
              })}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
