"use client";

import { Card, Chip, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { format, subMonths } from "date-fns";
import { it } from "date-fns/locale";

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

export default function EmployeeAttendanceStats({ employees }: Props) {
  if (!employees) return null;

  // Calcola le statistiche mensili per il confronto
  const calculateMonthStats = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const totalEmployees = employees.length;

    let presentSum = 0;
    let smartworkingSum = 0;

    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month, day);

      const presentCount = employees.filter((emp) =>
        emp.attendances.some(
          (att) =>
            new Date(att.date).toDateString() === currentDate.toDateString() &&
            att.status === "present"
        )
      ).length;

      const smartworkingCount = employees.filter((emp) =>
        emp.attendances.some(
          (att) =>
            new Date(att.date).toDateString() === currentDate.toDateString() &&
            att.status === "smartworking"
        )
      ).length;

      presentSum += presentCount;
      smartworkingSum += smartworkingCount;
    }

    return {
      present: (presentSum / (totalDays * totalEmployees)) * 100,
      smartworking: (smartworkingSum / (totalDays * totalEmployees)) * 100,
      absent:
        100 -
        ((presentSum + smartworkingSum) / (totalDays * totalEmployees)) * 100,
    };
  };

  // Calcola le statistiche settimanali per il grafico
  const calculateLastWeekStats = (date: Date) => {
    const weeklyStats = [];
    for (let i = 6; i >= 0; i--) {
      const currentDate = new Date(date);
      currentDate.setDate(currentDate.getDate() - i);

      const totalEmployees = employees.length;
      const presentCount = employees.filter((emp) =>
        emp.attendances.some(
          (att) =>
            new Date(att.date).toDateString() === currentDate.toDateString() &&
            att.status === "present"
        )
      ).length;

      const smartworkingCount = employees.filter((emp) =>
        emp.attendances.some(
          (att) =>
            new Date(att.date).toDateString() === currentDate.toDateString() &&
            att.status === "smartworking"
        )
      ).length;

      weeklyStats.push({
        date: format(currentDate, "EEE", { locale: it }),
        present: (presentCount / totalEmployees) * 100,
        smartworking: (smartworkingCount / totalEmployees) * 100,
        absent:
          100 - ((presentCount + smartworkingCount) / totalEmployees) * 100,
      });
    }
    return weeklyStats;
  };

  const currentMonthStats = calculateMonthStats(new Date(2025, 0, 15));
  const lastMonthStats = calculateMonthStats(
    subMonths(new Date(2025, 0, 15), 1)
  );
  const weeklyStats = calculateLastWeekStats(new Date(2025, 0, 15));

  const getChangePercentage = (current: number, previous: number) => {
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
