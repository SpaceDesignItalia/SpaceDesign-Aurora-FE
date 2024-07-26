import FolderCopyRoundedIcon from "@mui/icons-material/FolderCopyRounded";
import { Link } from "@nextui-org/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/it";

dayjs.extend(relativeTime);
dayjs.locale("it");

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

function formatNotificationDate(date: Date): string {
  const now = dayjs();
  const notificationDate = dayjs(date);

  if (now.diff(notificationDate, "day") < 1) {
    return "ieri";
  } else if (now.diff(notificationDate, "day") < 2) {
    return "2 giorni fa";
  } else {
    return notificationDate.fromNow();
  }
}

export default function NotificationItem({
  NotificationInfo,
}: {
  NotificationInfo: Notification;
}) {
  const formattedDate = formatNotificationDate(
    new Date(NotificationInfo.NotificationCreationDate)
  );

  return (
    <>
      {NotificationInfo.NotificationTypeName == "Progetto" && (
        <Link
          className="w-full"
          color="foreground"
          href={
            "/projects/" +
            NotificationInfo.CompanyName +
            "/" +
            NotificationInfo.ProjectId +
            "/" +
            NotificationInfo.ProjectName
          }
        >
          <div className="h-fit w-full p-3 border-b-2 hover:bg-gray-100">
            <div className="w-full flex justify-between items-center gap-3">
              <div className="flex w-full items-center gap-2">
                <div className="bg-primary rounded-lg p-1 text-white">
                  <FolderCopyRoundedIcon />
                </div>{" "}
                Progetto: <strong>{NotificationInfo.ProjectName}</strong>
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

      {NotificationInfo.NotificationTypeName == "Messaggio" && (
        <Link
          className="w-full"
          color="foreground"
          href={
            "/projects/" +
            NotificationInfo.CompanyName +
            "/" +
            NotificationInfo.ProjectId +
            "/" +
            NotificationInfo.ProjectName
          }
        >
          <div className="h-fit w-full p-3 border-b-2 hover:bg-gray-100">
            <div className="w-full flex justify-between items-center gap-3">
              <div className="flex w-full items-center gap-2">
                <div className="bg-primary rounded-lg p-1 text-white">
                  <FolderCopyRoundedIcon />
                </div>{" "}
                Messaggio:
              </div>
            </div>
            <p>{NotificationInfo.}</p>
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
