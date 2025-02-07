import { Card, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Area, AreaChart, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

interface AttendanceStatsProps {
  attendances: {
    current: any[];
    previous: any[];
  };
  selectedDate: Date;
}

export default function AttendanceStats({
  attendances,
  selectedDate,
}: AttendanceStatsProps) {
  const calculateMonthStats = (monthAttendances: any[]) => {
    let presentDays = 0;
    let smartworkingDays = 0;
    let absentDays = 0;
    let totalRecordedDays = 0;

    monthAttendances.forEach((att) => {
      totalRecordedDays++;
      if (att.status === "present") presentDays++;
      else if (att.status === "smartworking") smartworkingDays++;
      else if (att.status === "absent" || att.status === "vacation")
        absentDays++;
    });

    if (totalRecordedDays === 0) {
      return {
        present: 0,
        smartworking: 0,
        absent: 0,
      };
    }

    return {
      present: (presentDays / totalRecordedDays) * 100,
      smartworking: (smartworkingDays / totalRecordedDays) * 100,
      absent: (absentDays / totalRecordedDays) * 100,
    };
  };

  // Calcola le statistiche settimanali per il grafico
  const calculateWeekStats = () => {
    const weeklyStats = [];
    const today = dayjs(selectedDate);
    const endOfWeek = today.endOf("week");

    for (let week = 0; week < 4; week++) {
      const weekStart = endOfWeek.subtract(week * 7, "day");
      const weekEnd = weekStart.subtract(6, "day"); // Il primo giorno della settimana

      const weekStats = {
        week: `${format(weekStart.toDate(), "'Settimana' w", {
          locale: it,
        })}`,
        dateRange: `${weekEnd.format("DD/MM")} - ${weekStart.format("DD/MM")}`,
        date: weekStart.format("YYYY-MM-DD"),
        present: 0,
        smartworking: 0,
        absent: 0,
        total: 0,
      };

      // Per ogni giorno della settimana
      for (let day = 0; day < 7; day++) {
        const currentDate = weekStart.subtract(day, "day");

        // Cerca nei dati del mese corrente e precedente
        let dayAttendance = attendances.current.find(
          (att) =>
            dayjs(att.date).format("YYYY-MM-DD") ===
            currentDate.format("YYYY-MM-DD")
        );

        if (!dayAttendance) {
          dayAttendance = attendances.previous.find(
            (att) =>
              dayjs(att.date).format("YYYY-MM-DD") ===
              currentDate.format("YYYY-MM-DD")
          );
        }

        if (dayAttendance) {
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
      }

      // Aggiungi la settimana all'inizio dell'array
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

  // Calcola le statistiche usando i dati corretti
  const currentMonthStats = calculateMonthStats(attendances.current);
  const lastMonthStats = calculateMonthStats(attendances.previous);
  const weeklyStats = calculateWeekStats();

  const getChangePercentage = (current: number, previous: number) => {
    // Se entrambi sono 0, non c'è variazione
    if (current === 0 && previous === 0) return "0.0";

    // Calcola la differenza assoluta tra le percentuali
    const change = current - previous;
    return change.toFixed(1);
  };

  const getChangeType = (change: string) => {
    const changeNum = parseFloat(change);
    if (changeNum >= 10) return "positive";
    if (changeNum <= -10) return "negative";
    return "neutral";
  };

  const data = [
    {
      title: "Giorni in ufficio",
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
      icon: "hugeicons:office",
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
      icon: "solar:smart-home-linear",
    },
    {
      title: "Assenze/Ferie",
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
      icon: "proicons:beach",
    },
  ];

  return (
    <dl className="grid grid-cols-3 gap-4">
      {data.map((item, index) => (
        <Card
          key={index}
          className="border-2 dark:border-default-100 shadow-none"
        >
          <section className="flex flex-nowrap justify-between">
            <div className="flex flex-col justify-between gap-y-2 p-4">
              <div className="flex flex-col gap-y-4">
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Icon icon={item.icon} className="w-5 h-5" />
                  {item.title}
                </dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {item.value}
                </dd>
              </div>
              <div
                className={cn(
                  "mt-2 flex items-center gap-x-1 text-xs font-medium",
                  {
                    "text-success-500": item.changeType === "positive",
                    "text-warning-500": item.changeType === "neutral",
                    "text-danger-500": item.changeType === "negative",
                  }
                )}
              >
                <Icon
                  height={16}
                  icon={
                    item.changeType === "positive"
                      ? "solar:arrow-right-up-linear"
                      : item.changeType === "neutral"
                      ? "solar:arrow-right-linear"
                      : "solar:arrow-right-down-linear"
                  }
                  width={16}
                />
                <span>{item.change}%</span>
                <span className="text-gray-400">vs mese precedente</span>
              </div>
            </div>
            <div className="mt-10 min-h-24 w-36 min-w-[140px] shrink-0">
              <ResponsiveContainer className="[&_.recharts-surface]:outline-none">
                <AreaChart data={item.chartData}>
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
                            item.changeType === "positive",
                          "hsl(var(--heroui-danger))":
                            item.changeType === "negative",
                          "hsl(var(--heroui-warning))":
                            item.changeType === "neutral",
                        })}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="60%"
                        stopColor={cn({
                          "hsl(var(--heroui-success))":
                            item.changeType === "positive",
                          "hsl(var(--heroui-danger))":
                            item.changeType === "negative",
                          "hsl(var(--heroui-warning))":
                            item.changeType === "neutral",
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
                    dataKey={item.dataKey}
                    fill={`url(#colorUv${index})`}
                    stroke={cn({
                      "hsl(var(--heroui-success))":
                        item.changeType === "positive",
                      "hsl(var(--heroui-danger))":
                        item.changeType === "negative",
                      "hsl(var(--heroui-warning))":
                        item.changeType === "neutral",
                    })}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </Card>
      ))}
    </dl>
  );
}
