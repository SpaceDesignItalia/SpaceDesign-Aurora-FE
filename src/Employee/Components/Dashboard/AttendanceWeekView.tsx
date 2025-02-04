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

interface AttendanceWeekViewProps {
  stafferId: number;
  attendances: any[];
  onUpdate: () => void;
}

export default function AttendanceWeekView({
  stafferId,
  attendances,
  onUpdate,
}: AttendanceWeekViewProps) {
  const today = new Date();
  const days = [-3, -2, -1, 0, 1, 2, 3].map((offset) => addDays(today, offset));

  const statusConfig = {
    present: {
      color: "bg-emerald-100 border-emerald-300",
      icon: "material-symbols-light:work-outline",
      label: "Presente in ufficio",
    },
    absent: {
      color: "bg-red-100 border-red-300",
      icon: "material-symbols-light:sick-outline",
      label: "Assente",
    },
    vacation: {
      color: "bg-blue-100 border-blue-300",
      icon: "material-symbols-light:beach-access-outline",
      label: "Ferie",
    },
    smartworking: {
      color: "bg-amber-100 border-amber-300",
      icon: "material-symbols-light:home-work-outline",
      label: "Smart Working",
    },
  };

  const getAttendanceForDay = (date: Date) => {
    return attendances.find(
      (att) => new Date(att.date).toDateString() === date.toDateString()
    );
  };

  const handleStatusChange = async (status: string, date: Date) => {
    try {
      await axios.put("/Staffer/UPDATE/UpdateStafferAttendance", {
        Status: status,
        StafferId: stafferId,
        Date: formatInTimeZone(date, "Europe/Rome", "yyyy-MM-dd"),
      });
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="grid grid-cols-7 gap-3">
      {days.map((day) => {
        const attendance = getAttendanceForDay(day);
        const isToday = day.toDateString() === today.toDateString();
        const dayName = format(day, "EEE", { locale: it });
        const dayNum = format(day, "d");

        return (
          <Dropdown key={day.toISOString()}>
            <DropdownTrigger>
              <Button
                className={`w-full h-24 flex flex-col items-center justify-center gap-2 border-2 rounded-xl
                  ${isToday ? "border-primary" : "border-gray-200"}
                  ${
                    attendance
                      ? statusConfig[
                          attendance.status as keyof typeof statusConfig
                        ].color
                      : "bg-white"
                  }`}
              >
                <span className="text-sm font-medium text-gray-600">
                  {dayName}
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
                  className="text-danger"
                  startContent={
                    <div className="w-6 h-6 bg-danger-100 rounded-lg flex items-center justify-center">
                      <Icon
                        icon="material-symbols-light:delete-outline"
                        className="w-4 h-4 text-danger"
                      />
                    </div>
                  }
                >
                  Rimuovi presenza
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        );
      })}
    </div>
  );
}
