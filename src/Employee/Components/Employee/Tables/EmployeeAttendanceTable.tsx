import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import { it } from "date-fns/locale";
import { Icon } from "@iconify/react";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { formatInTimeZone } from "date-fns-tz";
import axios from "axios";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../API/API";

const socket = io(API_WEBSOCKET_URL);

interface Employee {
  id: string;
  name: string;
  avatar?: string;
  attendances: {
    date: string;
    status: string;
  }[];
}

interface Props {
  employees: Employee[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  loggedStafferId: number;
  setStatusAlert: (alert: {
    show: boolean;
    message: string;
    type: "success" | "error";
  }) => void;
}

export default function EmployeeAttendanceTable({
  employees,
  selectedDate,
  onDateChange,
  loggedStafferId,
  setStatusAlert,
}: Props) {
  if (!employees) return null;

  // Genera le date del mese corrente
  const getDaysInMonth = () => {
    const start = startOfMonth(selectedDate);
    const year = start.getFullYear();
    const month = start.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

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
      startDate: Date;
    },
    key: string
  ) => {
    return (
      <div
        key={key}
        className={`h-9 ${
          statusColors[streak.status as keyof typeof statusColors]
        } rounded-xl border-2 flex items-center justify-center gap-2 cursor-pointer`}
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
  };

  const renderAttendanceRow = (employee: Employee) => {
    const days = getDaysInMonth();
    let currentStreak: {
      status: string;
      count: number;
      isFirst: boolean;
      startDate: Date;
    } | null = null;
    const attendanceBlocks: JSX.Element[] = [];
    let emptyDays = 0;

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
        emptyDays++;
        return;
      }

      // Aggiungi spazio vuoto prima del primo status se necessario
      if (!currentStreak && emptyDays > 0) {
        attendanceBlocks.push(
          <div
            key={`empty-${date.toISOString()}`}
            style={{ width: `${emptyDays * 64 - 8}px`, margin: "0 4px" }}
          />
        );
        emptyDays = 0;
      }

      if (!currentStreak) {
        currentStreak = {
          status: attendance.status,
          count: 1,
          isFirst: true,
          startDate: date,
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
          startDate: date,
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
        className="h-12 flex border-b border-gray-100 items-center"
      >
        <div className="flex">{attendanceBlocks}</div>
      </div>
    );
  };

  async function handleStatusChange(status: string, date: string) {
    const res = await axios.put("/Staffer/UPDATE/UpdateStafferAttendance", {
      Status: status,
      StafferId: loggedStafferId,
      Date: date,
    });

      const res = await axios.put("/Staffer/UPDATE/UpdateStafferAttendance", {
        Status: status,
        StafferId: loggedStafferId,
        Date: date,
      });

      if (res.status === 200) {
        socket.emit("employee-attendance-update");

        // Se lo stato selezionato è uguale a quello corrente, non fare nulla
        if (currentAttendance && currentAttendance.status === status) {
          return;
        }

        setStatusAlert({
          show: true,
          type: "success",
          message:
            status === "delete"
              ? "Presenza eliminata con successo!"
              : currentAttendance
              ? `Presenza modificata da "${
                  statusConfig[
                    currentAttendance.status as keyof typeof statusConfig
                  ].label
                }" a "${
                  statusConfig[status as keyof typeof statusConfig].label
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
  }

  const exportCSV = () => {
    const days = getDaysInMonth();
    const headers = ["Nome", ...days.map((date) => format(date, "dd"))];

    const statusInitials = {
      present: "P",
      absent: "A",
      vacation: "F",
      smartworking: "S",
    };

    const csvData = employees.map((employee) => {
      const row = [employee.name];
      days.forEach((date) => {
        const attendance = employee.attendances.find(
          (a) => new Date(a.date).toDateString() === date.toDateString()
        );
        row.push(
          attendance
            ? statusInitials[attendance.status as keyof typeof statusInitials]
            : ""
        );
      });
      return row;
    });

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `presenze_${format(selectedDate, "MMMM_yyyy", { locale: it })}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl shadow-sm border-2">
      <div className="mb-6 flex justify-between items-center border-b border-gray-100 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 px-2 py-4">
          Presenze e assenze
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onDateChange(subMonths(selectedDate, 1))}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-1 text-gray-600"
          >
            <Icon icon="solar:alt-arrow-left-linear" fontSize={24} />
            <span className="text-sm">
              {format(subMonths(selectedDate, 1), "MMMM", { locale: it })
                .charAt(0)
                .toUpperCase() +
                format(subMonths(selectedDate, 1), "MMMM", {
                  locale: it,
                }).slice(1)}
            </span>
          </button>
          <span className="px-4 py-2 bg-gray-50 rounded-lg font-medium">
            {format(selectedDate, "MMMM", { locale: it })
              .charAt(0)
              .toUpperCase() +
              format(selectedDate, "MMMM", { locale: it }).slice(1)}{" "}
            {format(selectedDate, "yyyy")}
          </span>
          <button
            onClick={() => onDateChange(addMonths(selectedDate, 1))}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1 text-gray-600"
          >
            <span className="text-sm">
              {format(addMonths(selectedDate, 1), "MMMM", { locale: it })
                .charAt(0)
                .toUpperCase() +
                format(addMonths(selectedDate, 1), "MMMM", {
                  locale: it,
                }).slice(1)}
            </span>
            <Icon icon="solar:alt-arrow-right-linear" fontSize={24} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="flex">
          {/* Colonna nomi fissa */}
          <div className="w-64 pl-2 flex-shrink-0 sticky left-0 bg-white z-10 border-r border-gray-200">
            <div className="flex items-center h-12 bg-gray-50 border-1 rounded-l-lg border-gray-200 p-4 font-medium text-gray-600 text-sm shadow-md">
              Nome
            </div>
            {employees.map((employee, index) => (
              <div
                key={employee.id}
                className={`h-12 flex items-center gap-2 p-4 border-b border-gray-100 rounded-l-lg ${
                  index % 2 === 0 ? "bg-gray-200" : ""
                }`}
              >
                {employee.avatar ? (
                  <Avatar
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
          <div className="flex-1 overflow-x-auto">
            <div
              style={{
                minWidth: `${getDaysInMonth().length * 64}px`,
                width: "100%",
              }}
            >
              {/* Header giorni */}
              <div className="h-12 bg-gray-50 border-b border-gray-200 flex divide-x divide-gray-200">
                {getDaysInMonth().map((date) => {
                  return (
                    <Popover showArrow>
                      <PopoverTrigger>
                        <div
                          key={date.toISOString()}
                          className="w-16 flex-shrink-0 flex flex-col justify-center items-center py-2 text-sm text-gray-600 font-medium border-r-1 border-t-1 hover:cursor-pointer"
                        >
                          <div className="text-xs text-gray-500">
                            {format(date, "EEE", { locale: it })
                              .toLowerCase()
                              .slice(0, 3)}
                          </div>
                          <div>{date.getDate()}</div>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="flex flex-col items-center gap-2 p-2">
                          {formatInTimeZone(date, "Europe/Rome", "dd/MM/yyyy")}
                          <Dropdown>
                            <DropdownTrigger>
                              <Button color="primary">Presenze</Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <>
                                {Object.entries(statusConfig).map(
                                  ([key, config]) => (
                                    <DropdownItem
                                      onPress={() =>
                                        handleStatusChange(
                                          key,
                                          formatInTimeZone(
                                            date,
                                            "Europe/Rome",
                                            "yyyy-MM-dd"
                                          )
                                        )
                                      }
                                      key={key}
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
                                  )
                                )}
                                <DropdownItem
                                  onPress={() =>
                                    handleStatusChange(
                                      "delete",
                                      formatInTimeZone(
                                        date,
                                        "Europe/Rome",
                                        "yyyy-MM-dd"
                                      )
                                    )
                                  }
                                  key="delete"
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
                              </>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })}
              </div>

              {/* Griglia presenze */}
              <div className="relative">
                {/* Linee verticali di sfondo */}
                <div className="absolute inset-0">
                  {employees.map((_, employeeIndex) => (
                    <div
                      key={employeeIndex}
                      className={`h-12 flex divide-x divide-gray-200 ${
                        employeeIndex % 2 === 0 ? "bg-gray-200" : ""
                      }`}
                    >
                      {getDaysInMonth().map((date) => (
                        <div
                          key={date.toISOString()}
                          className="w-16 flex-shrink-0"
                        />
                      ))}
                    </div>
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

      <div className="mt-6 px-2 py-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-4">
          <Button
            color="primary"
            variant="ghost"
            radius="full"
            startContent={
              <Icon icon="solar:file-download-linear" fontSize={24} />
            }
            onClick={exportCSV}
          >
            Esporta Tabella
          </Button>
          <div className="flex gap-6 text-sm text-gray-600">
            {Object.entries(statusConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 ${config.color} rounded-xl border-2 flex items-center justify-center`}
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
      </div>
    </div>
  );
}
