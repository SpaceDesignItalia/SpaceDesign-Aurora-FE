import { Card, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { format, subMonths } from "date-fns";
import { it } from "date-fns/locale";

interface AttendanceStatsProps {
  attendances: any[];
  selectedDate: Date;
}

export default function AttendanceStats({
  attendances,
  selectedDate,
}: AttendanceStatsProps) {
  // Calcola le statistiche mensili per il confronto
  const calculateMonthStats = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    let presentDays = 0;
    let smartworkingDays = 0;
    let absentDays = 0;

    attendances.forEach((att) => {
      const attDate = new Date(att.date);
      if (attDate.getMonth() === month && attDate.getFullYear() === year) {
        if (att.status === "present") presentDays++;
        else if (att.status === "smartworking") smartworkingDays++;
        else if (att.status === "absent" || att.status === "vacation")
          absentDays++;
      }
    });

    return {
      present: (presentDays / totalDays) * 100,
      smartworking: (smartworkingDays / totalDays) * 100,
      absent: (absentDays / totalDays) * 100,
    };
  };

  // Calcola le statistiche settimanali per il grafico
  const calculateWeekStats = () => {
    const weeklyStats = [];
    const lastDayOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    );

    for (let i = 6; i >= 0; i--) {
      const currentDate = new Date(lastDayOfMonth);
      currentDate.setDate(currentDate.getDate() - i);

      const dayAttendance = attendances.find(
        (att) =>
          new Date(att.date).toDateString() === currentDate.toDateString()
      );

      weeklyStats.push({
        date: format(currentDate, "EEE", { locale: it }),
        present: dayAttendance?.status === "present" ? 100 : 0,
        smartworking: dayAttendance?.status === "smartworking" ? 100 : 0,
        absent:
          dayAttendance?.status === "absent" ||
          dayAttendance?.status === "vacation"
            ? 100
            : 0,
      });
    }
    return weeklyStats;
  };

  const currentMonthStats = calculateMonthStats(selectedDate);
  const lastMonthStats = calculateMonthStats(subMonths(selectedDate, 1));
  const weeklyStats = calculateWeekStats();

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "100.0" : "0.0";
    const change = ((current - previous) / previous) * 100;
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
