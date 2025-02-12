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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver"; // npm install file-saver

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
}

export default function EmployeeAttendanceTable({
  employees,
  selectedDate,
  onDateChange,
  loggedStafferId,
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

    if (res.status === 200) {
      socket.emit("employee-attendance-update");
    }
  }

  async function sendAttendance() {
    await axios.post("/Staffer/POST/SendAttendanceReport", {
      month:
        format(selectedDate, "MMMM", { locale: it }).charAt(0).toUpperCase() +
        format(selectedDate, "MMMM", { locale: it }).slice(1),
      year: format(selectedDate, "yyyy"),
    });
  }

  async function exportAttendanceToExcel(employees, selectedDate) {
    // Creazione del workbook e del foglio
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Presenze");

    // Titolo della tabella
    worksheet.getCell("A1").value = `Nome completo`;
    worksheet.getCell("A1").font = { size: 16, bold: true };

    // Intestazione della tabella
    worksheet.columns = [
      { header: "Nome", key: "name", width: 30 },
      ...Array.from(
        {
          length: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
            0
          ).getDate(),
        },
        (_, i) => ({
          header: (i + 1).toString(),
          key: `day_${i + 1}`,
          width: 10,
        })
      ),
    ];

    // Definizione dei colori e delle iniziali per ciascuno stato
    const statusColors = {
      P: "FFCCFFCC", // Verde chiaro
      SW: "FFCCCCFF", // Viola chiaro
      A: "FFFFCCCC", // Giallo chiaro
      ML: "FFFF9999", // Rosso chiaro
    };

    // Riempimento dei dati
    employees.forEach((employee: Employee) => {
      const row = {
        name: employee.name,
      };

      employee.attendances.forEach((attendance: any) => {
        const date: any = new Date(attendance.date);
        if (
          date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear()
        ) {
          console.log(attendance.status);
          // Imposta solo l'iniziale nello stato
          const initial =
            attendance.status === "present"
              ? "P"
              : attendance.status === "smartworking"
              ? "SW"
              : attendance.status === "absent"
              ? "A"
              : attendance.status === "vacation"
              ? "F"
              : "";

          row[`day_${date.getDate()}`] = initial;
        }
      });

      // Aggiungi la riga al foglio
      const newRow = worksheet.addRow(row);

      // Colora ogni cella basata sullo stato
      newRow.eachCell((cell, colNumber) => {
        if (colNumber > 1) {
          // Escludi la colonna del nome
          const initial = cell.value;
          if (statusColors[initial]) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: statusColors[initial] },
            };
          }
        }
      });
    });

    // Formattazione delle celle
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
      if (rowNumber === 1) {
        row.font = { bold: true };
      }
    });

    // Aggiunta della legenda
    const legendRow = worksheet.addRow([]);
    legendRow.getCell(1).value = "Legenda:";
    legendRow.getCell(1).font = { bold: true };

    const statuses = [
      { label: "Presente", initial: "P", color: statusColors.P },
      { label: "SmartWorking", initial: "SW", color: statusColors.SW },
      { label: "Assente", initial: "A", color: statusColors.A },
      { label: "Malattia", initial: "ML", color: statusColors.ML },
    ];

    statuses.forEach((status, index) => {
      const cell = legendRow.getCell(index + 2);
      cell.value = `${status.initial} - ${status.label}`;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: status.color },
      };
    });

    // Salva il file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(
      blob,
      `Presenze_${selectedDate.toLocaleString("it-IT", {
        month: "long",
        year: "numeric",
      })}.xlsx`
    );
  }

  return (
    <div className="rounded-2xl shadow-sm border-2">
      <div className="mb-6 flex justify-between items-center border-b border-gray-100 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 px-2 py-4">
          Presenze e assenze
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onDateChange(subMonths(selectedDate, 1))}
            className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2 text-gray-600"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="w-5 h-5" />
            <span className="text-sm font-medium">
              {format(subMonths(selectedDate, 1), "MMMM", { locale: it })
                .charAt(0)
                .toUpperCase() +
                format(subMonths(selectedDate, 1), "MMMM", {
                  locale: it,
                }).slice(1)}
            </span>
          </button>
          <div className="px-4 py-2.5 bg-gray-50 rounded-xl font-medium text-gray-900">
            {format(selectedDate, "MMMM", { locale: it })
              .charAt(0)
              .toUpperCase() +
              format(selectedDate, "MMMM", { locale: it }).slice(1)}{" "}
            {format(selectedDate, "yyyy")}
          </div>
          <button
            onClick={() => onDateChange(addMonths(selectedDate, 1))}
            className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2 text-gray-600"
          >
            <span className="text-sm font-medium">
              {format(addMonths(selectedDate, 1), "MMMM", { locale: it })
                .charAt(0)
                .toUpperCase() +
                format(addMonths(selectedDate, 1), "MMMM", {
                  locale: it,
                }).slice(1)}
            </span>
            <Icon icon="solar:alt-arrow-right-linear" className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="flex">
          {/* Colonna nomi fissa */}
          <div className="w-64 border-r-2 flex-shrink-0 sticky left-0 bg-white z-10">
            <div className="flex items-center h-12 p-4 font-medium text-gray-600 text-sm">
              Nome
            </div>
            {employees.map((employee, index) => (
              <div
                key={employee.id}
                className={`h-12 flex items-center gap-2 p-4 border-b border-gray-100 ${
                  index % 2 === 0 ? "bg-gray-100" : ""
                }`}
              >
                {employee.avatar ? (
                  <Avatar
                    src={employee.avatar}
                    className="w-8 h-8 rounded-full"
                    alt={employee.name}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
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
                        employeeIndex % 2 === 0 ? "bg-gray-100" : ""
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
            onPress={() => exportAttendanceToExcel(employees, selectedDate)}
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

          <Button
            color="primary"
            variant="ghost"
            radius="full"
            startContent={<Icon icon="solar:letter-linear" fontSize={24} />}
            onPress={sendAttendance}
          >
            Invia presenze di{" "}
            {format(selectedDate, "MMMM", { locale: it })
              .charAt(0)
              .toUpperCase() +
              format(selectedDate, "MMMM", { locale: it }).slice(1)}
          </Button>
        </div>
      </div>
    </div>
  );
}
