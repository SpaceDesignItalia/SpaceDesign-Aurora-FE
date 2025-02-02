import React from "react";
import FolderCopyRoundedIcon from "@mui/icons-material/FolderCopyRounded";
import Person2RoundedIcon from "@mui/icons-material/Person2Rounded";
import CloseIcon from "@mui/icons-material/Close"; // Importa l'icona della X
import { Link, Badge, Avatar, cn } from "@heroui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/it";
import axios from "axios";
import Notification from "./Notification";

dayjs.extend(relativeTime);
dayjs.locale("it");

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

interface NotificationItemProps {
  NotificationInfo: Notification;
  NotificationUpdate: () => void;
}

function formatNotificationDate(date: Date): string {
  const now = dayjs();
  const notificationDate = dayjs(date);

  if (now.diff(notificationDate, "day") < 1) {
    return "oggi";
  } else if (now.diff(notificationDate, "day") < 2) {
    return "ieri";
  } else if (now.diff(notificationDate, "day") < 7) {
    return notificationDate.format("dddd");
  } else {
    return notificationDate.fromNow();
  }
}

export default function NotificationItem({
  NotificationInfo,
  NotificationUpdate,
}: NotificationItemProps): JSX.Element {
  const formattedDate = formatNotificationDate(
    new Date(NotificationInfo.NotificationCreationDate)
  );

  const handleRemoveNotification = (
    event: React.MouseEvent<HTMLSpanElement>
  ) => {
    event.stopPropagation();
    event.preventDefault();
    axios
      .delete("/Notification/DELETE/DeleteNotification", {
        params: {
          NotificationId: NotificationInfo.NotificationId,
        },
        withCredentials: true,
      })
      .then(() => {
        NotificationUpdate();
      });
  };

  const handleReadNotification = () => {
    axios
      .post(
        "/Notification/POST/ReadNotification",
        {
          NotificationId: NotificationInfo.NotificationId,
        },
        { withCredentials: true }
      )
      .then(() => {
        NotificationUpdate();
      });
  };

  const handleReadProjectNotification = () => {
    handleReadNotification();
    location.href = "/projects/" + NotificationInfo.UniqueCode;
  };

  const handleReadMessageNotification = () => {
    handleReadNotification();
    location.href = "/comunications/chat/";
  };

  const contentByType: Record<string, JSX.Element | null> = {
    Progetto: (
      <div className="flex items-center gap-2">
        <FolderCopyRoundedIcon />
        <strong>{NotificationInfo.ProjectName}</strong>
      </div>
    ),
    Dipendente: (
      <div className="flex items-center gap-2">
        <Person2RoundedIcon />
        <strong>{NotificationInfo.userfullname}</strong>
      </div>
    ),
    default: null,
  };

  return (
    <Link
      className="w-full"
      color="foreground"
      onClick={
        NotificationInfo.NotificationTypeName === "Progetto"
          ? handleReadProjectNotification
          : handleReadMessageNotification
      }
    >
      <div
        className={cn(
          "relative h-fit w-full p-4 border-t-2 hover:bg-gray-100",
          {
            "bg-slate-100": !NotificationInfo.IsRead,
          }
        )}
      >
        <span
          onClick={handleRemoveNotification}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
          role="button"
          aria-label="Close notification"
        >
          <CloseIcon className="hover:text-red-600" />
        </span>
        <div className="w-full flex gap-3 items-center">
          {NotificationInfo.NotificationTypeName === "Dipendente" && (
            <Badge color="primary" isInvisible={NotificationInfo.IsRead}>
              <Avatar
                src={
                  NotificationInfo.NotificationTypeName === "Dipendente"
                    ? "/path/to/avatar.jpg"
                    : "/path/to/project-icon.jpg"
                }
              />
            </Badge>
          )}
          <div className="flex flex-col">
            {contentByType[NotificationInfo.NotificationTypeName]}
            <p
              dangerouslySetInnerHTML={{
                __html: NotificationInfo.NotificationMessage,
              }}
            />
            <time className="text-tiny text-default-400">{formattedDate}</time>
          </div>
        </div>
        {/*  {NotificationInfo.NotificationTypeName === "Progetto" && (
          <div className="flex gap-2 pt-2">
            <Button color="primary" size="sm">
              Accept
            </Button>
            <Button size="sm" variant="flat">
              Decline
            </Button>
          </div>
        )} */}
      </div>
    </Link>
  );
}
