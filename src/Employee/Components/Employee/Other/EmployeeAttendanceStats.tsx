import { Card, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Area, AreaChart, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

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
  previousMonthEmployees: Employee[];
  selectedDate: Date;
}

export default function EmployeeAttendanceStats({
  employees,
  previousMonthEmployees,
  selectedDate,
}: Props) {
  if (!employees) return null;

  // Calcola le statistiche mensili per il confronto
  const calculateMonthStats = (employeesData: Employee[] | undefined) => {
    if (!employeesData) return { present: 0, smartworking: 0, absent: 0 };

    let presentDays = 0;
    let smartworkingDays = 0;
    let absentDays = 0;
    let totalRecordedDays = 0;

    employeesData.forEach((employee) => {
      employee.attendances.forEach((att) => {
        if (att.status) {
          totalRecordedDays++;
          if (att.status === "present") presentDays++;
          else if (att.status === "smartworking") smartworkingDays++;
          else if (att.status === "absent" || att.status === "vacation")
            absentDays++;
        }
      });
    });

    if (totalRecordedDays === 0) {
      return { present: 0, smartworking: 0, absent: 0 };
    }

    return {
      present: (presentDays / totalRecordedDays) * 100,
      smartworking: (smartworkingDays / totalRecordedDays) * 100,
      absent: (absentDays / totalRecordedDays) * 100,
    };
  };

  const calculateWeekStats = () => {
    const weeklyStats = [];
    const today = dayjs(selectedDate);
    const endOfWeek = today.endOf("week");

    for (let week = 0; week < 4; week++) {
      const weekStart = endOfWeek.subtract(week * 7, "day");
      const weekEnd = weekStart.subtract(6, "day");

      const weekStats = {
        week: `${format(weekStart.toDate(), "'Settimana' w", { locale: it })}`,
        dateRange: `${weekEnd.format("DD/MM")} - ${weekStart.format("DD/MM")}`,
        date: weekStart.format("YYYY-MM-DD"),
        present: 0,
        smartworking: 0,
        absent: 0,
        total: 0,
      };

      for (let day = 0; day < 7; day++) {
        const currentDate = weekStart.subtract(day, "day");
        const currentDateStr = currentDate.format("YYYY-MM-DD");

        // Determina se usare i dati del mese corrente o precedente
        const isCurrentMonth = currentDate.month() === today.month();
        const employeesToUse = isCurrentMonth
          ? employees
          : previousMonthEmployees;

        employeesToUse.forEach((employee) => {
          const dayAttendance = employee.attendances.find(
            (att) => dayjs(att.date).format("YYYY-MM-DD") === currentDateStr
          );

          if (dayAttendance?.status) {
            weekStats.total++;
            if (dayAttendance.status === "present") weekStats.present++;
            else if (dayAttendance.status === "smartworking")
              weekStats.smartworking++;
            else if (
              dayAttendance.status === "absent" ||
              dayAttendance.status === "vacation"
            )
              weekStats.absent++;
          }
        });
      }

      weeklyStats.unshift({
        ...weekStats,
        present: weekStats.total
          ? (weekStats.present / weekStats.total) * 100
          : 0,
        smartworking: weekStats.total
          ? (weekStats.smartworking / weekStats.total) * 100
          : 0,
        absent: weekStats.total
          ? (weekStats.absent / weekStats.total) * 100
          : 0,
      });
    }

    return weeklyStats;
  };

  const currentMonthStats = calculateMonthStats(employees);
  const lastMonthStats = calculateMonthStats(previousMonthEmployees);
  const weeklyStats = calculateWeekStats();

  const getChangePercentage = (current: number, previous: number) => {
    // Se entrambi sono 0, non c'è variazione
    if (current === 0 && previous === 0) return "0.0";

    // Se il mese precedente era 0 e ora c'è un valore
    if (previous === 0 && current > 0) return "∞";

    // Calcolo normale della variazione percentuale
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  const getChangeType = (change: string) => {
    if (change === "∞") return "positive";
    const changeNum = parseFloat(change);
    if (changeNum >= 10) return "positive";
    if (changeNum <= -10) return "negative";
    return "neutral";
  };

  const data = [
    {
      title: "Presenti in ufficio",
      value: `${Math.round(currentMonthStats.present)}%`,
      chartData: weeklyStats,
      change: getChangePercentage(
        currentMonthStats.present,
        lastMonthStats.present
      ),
      changeType: getChangeType(
        getChangePercentage(currentMonthStats.present, lastMonthStats.present)
      ),
      dataKey: "present",
      icon: "material-symbols-light:work-outline",
    },
    {
      title: "Smart Working",
      value: `${Math.round(currentMonthStats.smartworking)}%`,
      chartData: weeklyStats,
      change: getChangePercentage(
        currentMonthStats.smartworking,
        lastMonthStats.smartworking
      ),
      changeType: getChangeType(
        getChangePercentage(
          currentMonthStats.smartworking,
          lastMonthStats.smartworking
        )
      ),
      dataKey: "smartworking",
      icon: "material-symbols-light:home-work-outline",
    },
    {
      title: "Assenti/Ferie",
      value: `${Math.round(currentMonthStats.absent)}%`,
      chartData: weeklyStats,
      change: getChangePercentage(
        currentMonthStats.absent,
        lastMonthStats.absent
      ),
      changeType: getChangeType(
        getChangePercentage(currentMonthStats.absent, lastMonthStats.absent)
      ),
      dataKey: "absent",
      icon: "material-symbols-light:beach-access-outline",
    },
  ];

  return (
    <dl className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
      {data.map(
        (
          { title, value, change, changeType, chartData, dataKey, icon },
          index
        ) => (
          <Card
            key={index}
            className="mt-5 border-2 dark:border-default-100 shadow-none"
          >
            <section className="flex flex-nowrap justify-between">
              <div className="flex flex-col justify-between gap-y-2 p-4">
                <div className="flex flex-col gap-y-4">
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Icon icon={icon} className="w-5 h-5" />
                    {title}
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {value}
                  </dd>
                </div>
                <div
                  className={cn(
                    "mt-2 flex items-center gap-x-1 text-xs font-medium",
                    {
                      "text-success-500": changeType === "positive",
                      "text-warning-500": changeType === "neutral",
                      "text-danger-500": changeType === "negative",
                    }
                  )}
                >
                  {changeType === "positive" ? (
                    <Icon
                      height={16}
                      icon="solar:arrow-right-up-linear"
                      width={16}
                    />
                  ) : changeType === "neutral" ? (
                    <Icon
                      height={16}
                      icon="solar:arrow-right-linear"
                      width={16}
                    />
                  ) : (
                    <Icon
                      height={16}
                      icon="solar:arrow-right-down-linear"
                      width={16}
                    />
                  )}
                  <span>{change}%</span>
                  <span className="text-gray-400">vs mese precedente</span>
                </div>
              </div>
              <div className="mt-10 min-h-24 w-36 min-w-[140px] shrink-0">
                <ResponsiveContainer className="[&_.recharts-surface]:outline-none">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id={`colorUv${index}`}
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={cn({
                            "hsl(var(--heroui-success))":
                              changeType === "positive",
                            "hsl(var(--heroui-danger))":
                              changeType === "negative",
                            "hsl(var(--heroui-warning))":
                              changeType === "neutral",
                          })}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="60%"
                          stopColor={cn({
                            "hsl(var(--heroui-success))":
                              changeType === "positive",
                            "hsl(var(--heroui-danger))":
                              changeType === "negative",
                            "hsl(var(--heroui-warning))":
                              changeType === "neutral",
                          })}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.[0]?.value !== undefined) {
                          return (
                            <div className="flex flex-col bg-white gap-y-1 justify-center items-center p-2 border rounded shadow">
                              <p className="text-sm text-gray-500">
                                {payload[0].payload.dateRange}
                              </p>
                              <p className="mt-1 font-semibold">
                                {`${Math.round(payload[0].value as number)}%`}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      dataKey={dataKey}
                      fill={`url(#colorUv${index})`}
                      stroke={cn({
                        "hsl(var(--heroui-success))": changeType === "positive",
                        "hsl(var(--heroui-danger))": changeType === "negative",
                        "hsl(var(--heroui-warning))": changeType === "neutral",
                      })}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          </Card>
        )
      )}
    </dl>
  );
}
