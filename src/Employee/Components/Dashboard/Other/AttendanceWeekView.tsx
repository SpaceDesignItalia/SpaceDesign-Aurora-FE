import { Icon } from "@iconify/react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { formatInTimeZone } from "date-fns-tz";
import { format, addDays } from "date-fns";
import { it } from "date-fns/locale";
import axios from "axios";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../API/API";
import { useState } from "react";
import StatusAlert from "../../Layout/StatusAlert";

const socket = io(API_WEBSOCKET_URL);

interface AttendanceWeekViewProps {
  stafferId: number;
  attendances: any[];
  onUpdate: () => void;
}

export default function AttendanceWeekView({
  stafferId,
  attendances,
}: AttendanceWeekViewProps) {
  const [statusAlert, setStatusAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const today = new Date();
  const days = [-3, -2, -1, 0, 1, 2, 3].map((offset) => addDays(today, offset));

  const statusConfig = {
    present: {
      color: "bg-emerald-100 border-emerald-300",
      icon: "hugeicons:office",
      label: "Presente in ufficio",
    },
    absent: {
      color: "bg-red-100 border-red-300",
      icon: "material-symbols-light:sick-outline-rounded",
      label: "Assente",
    },
    vacation: {
      color: "bg-blue-100 border-blue-300",
      icon: "proicons:beach",
      label: "Ferie",
    },
    smartworking: {
      color: "bg-amber-100 border-amber-300",
      icon: "solar:smart-home-linear",
      label: "Smart Working",
    },
  };

  const getAttendanceForDay = (date: Date) => {
    return attendances.find(
      (att) => new Date(att.date).toDateString() === date.toDateString()
    );
  };

  const handleStatusChange = async (status: string, date: Date) => {
    const attendance = getAttendanceForDay(date);

    // Se lo stato selezionato è uguale a quello corrente, non fare nulla
    if (attendance && attendance.status === status) {
      return;
    }

    try {
      const res = await axios.put("/Staffer/UPDATE/UpdateStafferAttendance", {
        Status: status,
        StafferId: stafferId,
        Date: formatInTimeZone(date, "Europe/Rome", "yyyy-MM-dd"),
      });

      if (res.status === 200) {
        socket.emit("employee-attendance-update");
        setStatusAlert({
          show: true,
          type: "success",
          message:
            status === "delete"
              ? "Presenza eliminata con successo!"
              : attendance
              ? `Presenza modificata da "${
                  statusConfig[attendance.status as keyof typeof statusConfig]
                    .label
                }" a "${
                  statusConfig[status as keyof typeof statusConfig]?.label ||
                  "Assente"
                }"`
              : "Nuova presenza aggiunta con successo!",
        });
      }
    } catch (error) {
      setStatusAlert({
        show: true,
        type: "error",
        message: "Errore durante l'aggiornamento della presenza",
      });
    }
  };

  return (
    <>
      <StatusAlert
        AlertData={{
          isOpen: statusAlert.show,
          onClose: () => setStatusAlert((prev) => ({ ...prev, show: false })),
          alertTitle: "",
          alertDescription: statusAlert.message,
          alertColor: statusAlert.type === "success" ? "green" : "red",
        }}
      />
      <div className="grid grid-cols-8 gap-3 items-center justify-center">
        {days.map((day) => {
          const attendance = getAttendanceForDay(day);
          const isToday = day.toDateString() === today.toDateString();
          const dayName = format(day, "EEE", { locale: it });
          const dayNum = format(day, "d");

          return (
            <Dropdown key={day.toISOString()} showArrow>
              <DropdownTrigger>
                <Button
                  className={`w-full h-24 flex flex-col items-center justify-center gap-2 border-2 rounded-xl
                    ${
                      isToday
                        ? "border-primary h-32 col-span-2"
                        : "border-gray-200"
                    }
                    ${
                      attendance
                        ? statusConfig[
                            attendance.status as keyof typeof statusConfig
                          ].color
                        : "bg-white"
                    }`}
                >
                  <span className="text-sm font-medium text-gray-600">
                    {isToday
                      ? format(day, "EEEE, MMMM yyyy", { locale: it })
                      : dayName}
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      isToday ? "text-primary" : "text-gray-800"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {attendance && (
                    <Icon
                      icon={
                        statusConfig[
                          attendance.status as keyof typeof statusConfig
                        ].icon
                      }
                      className="w-6 h-6 text-gray-700"
                    />
                  )}
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <DropdownItem
                    key={key}
                    onPress={() => handleStatusChange(key, day)}
                    startContent={
                      <div
                        className={`w-6 h-6 ${config.color} rounded-lg flex items-center justify-center`}
                      >
                        <Icon
                          icon={config.icon}
                          className="w-4 h-4 text-gray-700"
                        />
                      </div>
                    }
                  >
                    {config.label}
                  </DropdownItem>
                ))}
                {attendance && (
                  <DropdownItem
                    key="delete"
                    onPress={() => handleStatusChange("delete", day)}
                    startContent={
                      <div className="w-6 h-6 bg-zinc-300 rounded-lg flex items-center justify-center">
                        <Icon
                          icon="material-symbols-light:delete-outline"
                          className="w-4 h-4 text-gray-700"
                        />
                      </div>
                    }
                  >
                    Elimina
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          );
        })}
      </div>
    </>
  );
}
