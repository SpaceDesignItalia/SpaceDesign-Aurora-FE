import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Link, Badge, Avatar, cn, Button } from "@heroui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/it";
import axios from "axios";
import Notification from "./Notification";
import { FRONTEND_URL } from "../../../../API/API";

dayjs.extend(relativeTime);
dayjs.locale("it");

interface Notification {
  NotificationId: number;
  NotificationMessage: string;
  NotificationTypeName: string;
  ProjectId: number;
  EventId: number;
  ProjectName: string;
  CompanyName: string;
  UserId: number;
  StafferEmail: string;
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

  const handleReadCalendarNotification = () => {
    handleReadNotification();
    location.href = "/comunications/calendar";
  };

  const contentByType: Record<string, JSX.Element | null> = {
    Progetto: (
      <div className="flex items-center gap-2">
        <Icon icon="solar:folder-linear" fontSize={24} />
        <strong>{NotificationInfo.ProjectName}</strong>
      </div>
    ),
    Dipendente: (
      <div className="flex items-center gap-2">
        <Icon icon="solar:user-rounded-linear" fontSize={24} />
        <strong>{NotificationInfo.userfullname}</strong>
      </div>
    ),
    Evento: (
      <div className="flex items-center gap-2">
        <Icon icon="solar:calendar-linear" fontSize={24} />
      </div>
    ),
    default: null,
  };

  console.log(NotificationInfo.EventId, NotificationInfo.StafferEmail);

  return (
    <Link
      className="w-full"
      color="foreground"
      onPress={
        NotificationInfo.NotificationTypeName === "Progetto"
          ? handleReadProjectNotification
          : NotificationInfo.NotificationTypeName === "Dipendente"
          ? handleReadMessageNotification
          : handleReadCalendarNotification
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
          <Icon icon="material-symbols:close-rounded" fontSize={24} />
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
          <div className="flex flex-row gap-2">
            {contentByType[NotificationInfo.NotificationTypeName]}
            <div className="flex flex-col">
              <p
                dangerouslySetInnerHTML={{
                  __html: NotificationInfo.NotificationMessage,
                }}
              />
              <time className="text-tiny text-default-400">
                {formattedDate}
              </time>
            </div>
          </div>
        </div>
        {NotificationInfo.NotificationTypeName === "Evento" && (
          <div className="flex gap-2 pt-2">
            <Button
              as={Link}
              color="primary"
              size="sm"
              href={
                FRONTEND_URL +
                "/comunications/calendar/" +
                NotificationInfo.EventId +
                "/" +
                NotificationInfo.StafferEmail +
                "/accept"
              }
            >
              Partecipa
            </Button>
            <Button
              as={Link}
              size="sm"
              variant="flat"
              href={
                FRONTEND_URL +
                "/comunications/calendar/" +
                NotificationInfo.EventId +
                "/" +
                NotificationInfo.StafferEmail +
                "/reject"
              }
            >
              Rifiuta
            </Button>
          </div>
        )}
      </div>
    </Link>
  );
}
