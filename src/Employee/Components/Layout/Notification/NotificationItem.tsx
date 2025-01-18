import React from "react";
import FolderCopyRoundedIcon from "@mui/icons-material/FolderCopyRounded";
import Person2RoundedIcon from "@mui/icons-material/Person2Rounded";
import CloseIcon from "@mui/icons-material/Close"; // Importa l'icona della X
import { Link } from "@heroui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/it";
import axios from "axios";

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
}: {
  NotificationInfo: Notification;
  NotificationUpdate: () => void;
}) {
  const formattedDate = formatNotificationDate(
    new Date(NotificationInfo.NotificationCreationDate)
  );

  const handleRemoveNotification = (event: React.MouseEvent) => {
    event.stopPropagation(); // Previene la propagazione dell'evento
    event.preventDefault(); // Previene il comportamento predefinito del link
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

  return (
    <>
      {NotificationInfo.NotificationTypeName === "Progetto" && (
        <Link
          className="w-full"
          color="foreground"
          onClick={handleReadProjectNotification}
        >
          <div className="relative h-fit w-full p-3 border-t-2 hover:bg-gray-100">
            {/* X per chiudere la notifica */}
            <span
              onClick={handleRemoveNotification}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
              role="button"
              aria-label="Close notification"
            >
              <CloseIcon className="hover:text-red-600" />
            </span>
            <div className="w-full flex justify-between items-center gap-3">
              <div className="flex w-full items-center gap-2 mr-4">
                <div className="bg-primary rounded-lg p-1 text-white">
                  <FolderCopyRoundedIcon />
                </div>{" "}
                Progetto:{" "}
                {NotificationInfo.userfullname !== " " ? (
                  <strong>
                    {NotificationInfo.ProjectName} -{" "}
                    {NotificationInfo.userfullname}
                  </strong>
                ) : (
                  <strong>{NotificationInfo.ProjectName}</strong>
                )}
              </div>
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: NotificationInfo.NotificationMessage,
              }}
            />
            <p>{formattedDate}</p>
          </div>
        </Link>
      )}

      {NotificationInfo.NotificationTypeName === "Dipendente" && (
        <Link
          className="w-full"
          color="foreground"
          onClick={handleReadMessageNotification}
          href={"/comunications/chat/"}
        >
          <div className="relative h-fit w-full p-3 border-t-2 hover:bg-gray-100">
            {/* X per chiudere la notifica */}
            <span
              onClick={handleRemoveNotification}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
              role="button"
              aria-label="Close notification"
            >
              <CloseIcon className="hover:text-red-600" />
            </span>
            <div className="w-full flex justify-between items-center gap-3">
              <div className="flex w-full items-center gap-2 mr-4">
                <div className="bg-primary rounded-lg p-1 text-white">
                  <Person2RoundedIcon />
                </div>{" "}
                Messaggio: <strong>{NotificationInfo.userfullname}</strong>
              </div>
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: NotificationInfo.NotificationMessage,
              }}
            />
            <p>{formattedDate}</p>
          </div>
        </Link>
      )}
    </>
  );
}
