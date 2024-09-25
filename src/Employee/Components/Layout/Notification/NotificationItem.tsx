import FolderCopyRoundedIcon from "@mui/icons-material/FolderCopyRounded";
import Person2RoundedIcon from "@mui/icons-material/Person2Rounded";
import { Link } from "@nextui-org/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/it";

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
}: {
  NotificationInfo: Notification;
}) {
  const formattedDate = formatNotificationDate(
    new Date(NotificationInfo.NotificationCreationDate)
  );

  console.log(NotificationInfo);
  return (
    <>
      {NotificationInfo.NotificationTypeName === "Progetto" && (
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
          href={"/comunications/chat/"}
        >
          <div className="h-fit w-full p-3 border-b-2 hover:bg-gray-100">
            <div className="w-full flex justify-between items-center gap-3">
              <div className="flex w-full items-center gap-2">
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
