import { useState } from "react";

import { format, addMonths, subMonths } from "date-fns";
import { it } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";

interface Employee {
  id: string;
  name: string;
  avatar?: string;
  attendances: {
    date: string;
    status: "present" | "absent" | "smartworking" | "vacation";
  }[];
}

interface Props {
  employees: Employee[];
}

export default function EmployeeAttendanceTable({ employees }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1)); // Gennaio 2025

  if (!employees) return null; // Aggiungi questo controllo

  // Genera le date del mese corrente
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

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

  console.log(employees);

  // Aggiorna i colori per usare gli stessi del config
  const statusColors = {
    present: statusConfig.present.color,
    absent: statusConfig.absent.color,
    vacation: statusConfig.vacation.color,
    smartworking: statusConfig.smartworking.color,
  };

  const renderStreak = (
    streak: {
      status: string;
      count: number;
      isFirst: boolean;
    },
    key: string
  ) => (
    <div
      key={key}
      className={`h-12 ${
        statusColors[streak.status as keyof typeof statusColors]
      } rounded-xl flex items-center justify-center gap-2`}
      style={{
        width: `${streak.count * 64 - 8}px`,
        margin: "0 4px",
      }}
      title={statusConfig[streak.status as keyof typeof statusConfig].label}
    >
      <Icon
        icon={statusConfig[streak.status as keyof typeof statusConfig].icon}
        className="w-5 h-5 text-gray-700"
      />
    </div>
  );

  const renderAttendanceRow = (employee: Employee) => {
    const days = getDaysInMonth();
    let currentStreak: {
      status: string;
      count: number;
      isFirst: boolean;
    } | null = null;
    const attendanceBlocks: JSX.Element[] = [];

    days.forEach((date, index) => {
      const attendance = employee.attendances.find(
        (a) => new Date(a.date).toDateString() === date.toDateString()
      );

      if (!attendance) {
        if (currentStreak) {
          attendanceBlocks.push(
            renderStreak(currentStreak, `${date.toISOString()}-end`)
          );
          currentStreak = null;
        }
        return;
      }

      if (!currentStreak) {
        currentStreak = {
          status: attendance.status,
          count: 1,
          isFirst: true,
        };
      } else if (currentStreak.status === attendance.status) {
        currentStreak.count++;
      } else {
        attendanceBlocks.push(
          renderStreak(currentStreak, `${date.toISOString()}-streak`)
        );
        currentStreak = {
          status: attendance.status,
          count: 1,
          isFirst: true,
        };
      }

      if (index === days.length - 1 && currentStreak) {
        attendanceBlocks.push(
          renderStreak(currentStreak, `${date.toISOString()}-last`)
        );
      }
    });

    return (
      <div
        key={employee.id}
        className="h-16 flex border-b border-gray-100 items-center"
      >
        <div className="flex">{attendanceBlocks}</div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border-2">
      <div className="mb-6 flex justify-between items-center border-b border-gray-100 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 px-2 py-4">
          Presenze e assenze
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1 text-gray-600"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span className="text-sm">
              {format(subMonths(currentMonth, 1), "MMMM", { locale: it })}
            </span>
          </button>
          <span className="px-4 py-2 bg-gray-50 rounded-lg font-medium">
            {format(currentMonth, "MMMM yyyy", { locale: it })}
          </span>
          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1 text-gray-600"
          >
            <span className="text-sm">
              {format(addMonths(currentMonth, 1), "MMMM", { locale: it })}
            </span>
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="flex">
          {/* Colonna nomi fissa */}
          <div className="w-64 flex-shrink-0 sticky left-0 bg-white z-10 border-r border-gray-200">
            <div className="h-12 bg-gray-50 border-b border-gray-200 p-4 font-medium text-gray-600 text-sm">
              Nome
            </div>
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="h-16 flex items-center gap-2 p-4 border-b border-gray-100"
              >
                {employee.avatar ? (
                  <img
                    src={employee.avatar}
                    className="w-8 h-8 rounded-full"
                    alt={employee.name}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    {employee.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm">{employee.name}</span>
              </div>
            ))}
          </div>

          {/* Area scrollabile */}
          <div
            className="overflow-x-auto scrollbar-hide"
            style={{ width: "calc(100% - 16rem)" }}
          >
            <div className="min-w-max">
              {/* Header giorni */}
              <div className="h-12 bg-gray-50 border-b border-gray-200 flex divide-x divide-gray-200">
                {getDaysInMonth().map((date) => (
                  <div
                    key={date.toISOString()}
                    className="w-16 flex-shrink-0 flex flex-col justify-center items-center py-2 text-sm text-gray-600 font-medium"
                  >
                    <div className="text-xs text-gray-500">
                      {format(date, "EEE", { locale: it })
                        .toLowerCase()
                        .slice(0, 3)}
                    </div>
                    <div>{date.getDate()}</div>
                  </div>
                ))}
              </div>

              {/* Griglia presenze */}
              <div className="relative">
                {/* Linee verticali di sfondo */}
                <div className="absolute inset-0 flex divide-x divide-gray-200 pointer-events-none">
                  {getDaysInMonth().map((date) => (
                    <div
                      key={date.toISOString()}
                      className="w-16 flex-shrink-0"
                    />
                  ))}
                </div>

                <div className="relative">
                  {employees.map(renderAttendanceRow)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 px-2 py-4 flex gap-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
        {Object.entries(statusConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 ${config.color} rounded-xl border flex items-center justify-center`}
            >
              <Icon
                icon={config.icon}
                className="w-6 h-6 text-gray-700"
                style={{ strokeWidth: 1.5 }}
              />
            </div>
            <span className="font-medium">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
