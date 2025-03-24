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
  Select,
  SelectItem,
} from "@heroui/react";
import { formatInTimeZone } from "date-fns-tz";
import axios from "axios";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../API/API";
import { useState, useEffect } from "react";
import ExcelJS from "exceljs";

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

  const statusConfig: Record<
    string,
    { color: string; icon: string; label: string }
  > = {
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

  const renderStreak = (
    streak: {
      status: string;
      count: number;
      isFirst: boolean;
      startDate: Date;
    },
    key: string
  ) => {
    const config = statusConfig[streak.status as keyof typeof statusConfig];
    return (
      <div
        key={key}
        className={`h-9 ${config.color} ${config.color} rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02]`}
        style={{
          width: `${streak.count * 64 - 8}px`,
          margin: "0 4px",
        }}
        title={config.label}
      >
        <Icon icon={config.icon} className="w-5 h-5 text-gray-700" />
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
    try {
      // Trova la presenza attuale per questa data
      const currentAttendance = employees
        .find((emp) => emp.id === loggedStafferId.toString())
        ?.attendances.find(
          (att) =>
            new Date(att.date).toDateString() === new Date(date).toDateString()
        );

      // Se lo stato selezionato è uguale a quello corrente, non fare nulla
      if (currentAttendance && currentAttendance.status === status) {
        return;
      }

      const res = await axios.put("/Staffer/UPDATE/UpdateStafferAttendance", {
        Status: status,
        StafferId: loggedStafferId,
        Date: date,
      });

      if (res.status === 200) {
        socket.emit("employee-attendance-update");
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

  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const handleDaySelect = (date: Date) => {
    const dateString = date.toDateString();
    setSelectedDays((prev) =>
      prev.includes(dateString)
        ? prev.filter((d) => d !== dateString)
        : [...prev, dateString]
    );
  };

  const changeSelectedDaysStatus = (newStatus: string) => {
    selectedDays.forEach((date) => {
      handleStatusChange(newStatus, date);
    });
    setSelectedDays([]);
    setIsMultiSelect(false);
  };

  const toggleMultiSelect = () => {
    if (isMultiSelect) {
      setSelectedDays([]);
    }
    setIsMultiSelect(!isMultiSelect);
  };

  async function sendAttendance() {
    await axios.post("/Staffer/POST/SendAttendanceReport", {
      month:
        format(selectedDate, "MMMM", { locale: it }).charAt(0).toUpperCase() +
        format(selectedDate, "MMMM", { locale: it }).slice(1),
      year: format(selectedDate, "yyyy"),
    });
  }

  async function exportAttendanceToExcel(
    employees: Employee[],
    selectedDate: Date
  ): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Presenze");

      // Colori esatti da Tailwind convertiti in ARGB

      const excelColors = {
        present: "#FFF0FDF4",
        absent: "#FFFEF2F2", // bg-red-100
        vacation: "#FFEEF2FF", // bg-indigo-100 (cambiato da blue a indigo)
        smartworking: "#FFFEF9C3", // bg-amber-100
      };

      // Intestazioni
      worksheet.getCell("A1").value = "Nome completo";
      worksheet.getCell("A1").font = { bold: true };

      const daysInMonth = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0
      ).getDate();

      // Configura le colonne
      worksheet.columns = [
        { header: "Nome", key: "name", width: 30 },
        ...Array.from({ length: daysInMonth }, (_, i) => ({
          header: (i + 1).toString(),
          key: `day_${i + 1}`,
          width: 5,
        })),
      ];

      // Aggiungi i dati
      employees.forEach((employee) => {
        const rowData: any = {
          name: employee.name,
        };

        // Inizializza tutte le celle dei giorni come vuote
        for (let day = 1; day <= daysInMonth; day++) {
          rowData[`day_${day}`] = "";
        }

        // Popola le presenze
        employee.attendances.forEach((attendance) => {
          const date = new Date(attendance.date);
          if (
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
          ) {
            const dayKey = `day_${date.getDate()}`;
            rowData[dayKey] = attendance.status.charAt(0).toUpperCase();
          }
        });

        const row = worksheet.addRow(rowData);

        // Applica i colori alle celle
        row.eachCell((cell, colNumber) => {
          if (colNumber > 1) {
            // Salta la colonna del nome
            const value = cell.value as string;

            if (value) {
              let fillColor = "";
              switch (value) {
                case "P":
                  fillColor = excelColors.present;
                  break;
                case "A":
                  fillColor = excelColors.absent;
                  break;
                case "V":
                  fillColor = excelColors.vacation;
                  break;
                case "S":
                  fillColor = excelColors.smartworking;
                  break;
              }

              if (fillColor) {
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: fillColor },
                };
              }
            }
          }
        });
      });

      // Formattazione finale
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const formData = new FormData();
      const fileName = `Presenze_${selectedDate.toLocaleString("it-IT", {
        month: "long",
        year: "numeric",
      })}.xlsx`;

      formData.append("file", blob, fileName);

      // Assicuriamoci che la chiamata API venga eseguita
      try {
        const response = await axios.post(
          "/Staffer/POST/UploadAttendanceExcel",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        console.log("File Excel caricato con successo");
      } catch (uploadError) {
        console.error("Errore durante l'upload del file:", uploadError);
        throw uploadError;
      }
    } catch (error) {
      console.error("Errore durante l'esportazione:", error);
      throw error;
    }
  }

  const handleExportAndSend = async () => {
    try {
      console.log("Esportazione in corso...");
      await exportAttendanceToExcel(employees, selectedDate);
      await sendAttendance();
    } catch (error) {
      console.error("Errore durante l'esportazione e l'invio:", error);
    }
  };

  // Aggiungi questo stato per gestire la visualizzazione mobile
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Aggiungi questo useEffect per gestire il resize della finestra
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="rounded-2xl shadow-lg border-2 ">
      {/* Header superiore con titolo e controlli */}
      <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b bg-gray-50 rounded-t-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Presenze e assenze
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-white shadow-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full border w-full md:w-auto">
          <Icon
            icon="solar:calendar-linear"
            className="w-4 h-4 md:w-5 md:h-5 text-gray-600"
          />
          <button
            onClick={() => onDateChange(subMonths(selectedDate, 1))}
            className="hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <Icon
              icon="solar:alt-arrow-left-linear"
              className="w-4 h-4 md:w-5 md:h-5"
            />
          </button>
          <span className="font-medium px-2 min-w-[100px] md:min-w-[120px] text-center text-sm md:text-base">
            {format(selectedDate, "MMMM yyyy", { locale: it })}
          </span>
          <button
            onClick={() => onDateChange(addMonths(selectedDate, 1))}
            className="hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <Icon
              icon="solar:alt-arrow-right-linear"
              className="w-4 h-4 md:w-5 md:h-5"
            />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
          <Button
            variant={isMultiSelect ? "solid" : "ghost"}
            color="primary"
            radius="full"
            startContent={
              <Icon
                icon={
                  isMultiSelect
                    ? "solar:check-square-linear"
                    : "solar:square-linear"
                }
                className="w-5 h-5"
              />
            }
            onPress={toggleMultiSelect}
          >
            {isMultiSelect ? "Fine selezione" : "Selezione multipla"}
          </Button>

          <Dropdown>
            <DropdownTrigger>
              <Button color="primary" variant="ghost" radius="full" isIconOnly>
                <Icon icon="solar:menu-dots-linear" className="w-5 h-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="export-csv"
                startContent={
                  <Icon icon="solar:file-download-linear" className="w-5 h-5" />
                }
                onPress={exportCSV}
              >
                Esporta CSV
              </DropdownItem>
              <DropdownItem
                key="send-report"
                startContent={
                  <Icon icon="solar:letter-linear" className="w-5 h-5" />
                }
                onPress={handleExportAndSend}
              >
                Invia report mensile
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Tabella principale */}
      <div className="relative overflow-hidden">
        <div className="flex min-w-[800px]">
          {/* Colonna nomi fissa */}
          <div className="w-48 md:w-64 flex-shrink-0 sticky left-0 bg-white z-10 border-r border-gray-200">
            <div className="flex items-center h-12 bg-gray-50 border-1 border-gray-200 p-4 font-medium text-gray-600 text-sm shadow-md">
              Nome
            </div>
            {employees.map((employee, index) => (
              <div
                key={employee.id}
                className={`h-12 flex items-center gap-2 p-4 border-b border-gray-100 ${
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
                minWidth: isMobileView
                  ? `${getDaysInMonth().length * 48}px`
                  : `${getDaysInMonth().length * 64}px`,
                width: "100%",
              }}
            >
              {/* Header giorni */}
              {!isMultiSelect ? (
                <div className="h-12 bg-gray-50 border-b border-gray-200 flex">
                  {getDaysInMonth().map((date) => {
                    return (
                      <Popover showArrow key={date.toISOString()}>
                        <PopoverTrigger>
                          <div
                            key={date.toISOString()}
                            className="w-12 md:w-16 flex-shrink-0 flex flex-col justify-center items-center py-2 text-xs md:text-sm text-gray-600 font-medium border-r border-gray-300 hover:cursor-pointer hover:bg-gray-100"
                          >
                            <div className="text-xs text-gray-500">
                              {format(date, "EEE", { locale: it })
                                .toLowerCase()
                                .slice(0, 3)}
                            </div>
                            <div className="font-semibold">
                              {date.getDate()}
                            </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="flex flex-col items-center gap-2 p-2">
                            {formatInTimeZone(
                              date,
                              "Europe/Rome",
                              "dd/MM/yyyy"
                            )}
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
                                  {employees
                                    .find(
                                      (emp) =>
                                        emp.id === loggedStafferId.toString()
                                    )
                                    ?.attendances.some(
                                      (att) =>
                                        new Date(att.date).toDateString() ===
                                        date.toDateString()
                                    ) && (
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
                                  )}
                                </>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
              ) : (
                <div className="h-12 bg-gray-50 flex divide-x divide-gray-200">
                  {getDaysInMonth().map((date) => {
                    return (
                      <div
                        key={date.toISOString()}
                        onClick={() => handleDaySelect(date)}
                        className={`w-16 flex-shrink-0 flex flex-col justify-center items-center py-2 text-sm text-gray-600 font-medium  hover:cursor-pointer ${
                          selectedDays.includes(date.toDateString())
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }`}
                      >
                        <div className="text-xs text-gray-400">
                          {format(date, "EEE", { locale: it })
                            .toLowerCase()
                            .slice(0, 3)}
                        </div>
                        <div>{date.getDate()}</div>
                      </div>
                    );
                  })}
                </div>
              )}

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
      {/* Legenda stati aggiornata */}
      <div className="px-4 md:px-6 py-4 border-t bg-gray-50 rounded-b-xl">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
          <span className="font-medium text-gray-700">Legenda:</span>
          <div className="flex flex-wrap gap-3 md:gap-6 text-sm">
            {Object.entries(statusConfig).map(([key, config]) => (
              <div
                key={key}
                className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-white shadow-sm border border-gray-200"
              >
                <div
                  className={`w-6 md:w-8 h-6 md:h-8 ${config.color} rounded-lg flex items-center justify-center border`}
                >
                  <Icon
                    icon={config.icon}
                    className="w-4 md:w-5 h-4 md:h-5 text-gray-700"
                  />
                </div>
                <span className="font-medium text-gray-600 text-sm">
                  {config.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barra inferiore con azioni multiple */}
      {isMultiSelect && selectedDays.length > 0 && (
        <div className="sticky bottom-0 w-full p-4 bg-white border-t shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {selectedDays.length} giorni selezionati
            </span>
            <div className="flex gap-2">
              <Button
                color="danger"
                variant="light"
                radius="full"
                onPress={() => setSelectedDays([])}
              >
                Annulla
              </Button>
              <Select
                onChange={(e) =>
                  changeSelectedDaysStatus(e.target.value as string)
                }
                placeholder="Imposta stato"
                className="w-48"
                variant="bordered"
                color="primary"
                radius="full"
              >
                <>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem
                      value={key}
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
                    </SelectItem>
                  ))}
                  <SelectItem
                    value="delete"
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
                  </SelectItem>
                </>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
