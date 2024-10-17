"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../../components/ui/chart";
import axios from "axios";
import { useEffect } from "react";

export const description = "A donut chart showing project states";

const chartConfig = {
  created: { label: "Appena Creato", color: "hsl(var(--chart-1))" },
  inDevelopment: { label: "In Sviluppo", color: "hsl(var(--chart-2))" },
  completed: { label: "Terminato", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

interface Project {
  ProjectId: number;
  ProjectName: string;
  Status: "Appena Creato " | "In Sviluppo " | "Terminato ";
}

export default function ProjectChart() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [statusList, setStatusList] = React.useState<
    { StatusId: number; StatusName: string; StatusColor: string }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const projectsResponse = await axios.get("/Project/GET/GetAllProjects");
        const statusResponse = await axios.get("/Project/GET/GetAllStatus");
        setProjects(projectsResponse.data);
        setStatusList(statusResponse.data);
      } catch (error) {
        console.error(
          "Errore nel recupero dei progetti o degli status:",
          error
        );
      }
    }

    fetchData();
  }, []);

  const chartData = React.useMemo(() => {
    const stateCounts = {};
    statusList.forEach((status) => {
      stateCounts[status.StatusName] = { count: 0, color: status.StatusColor };
    });

    projects.forEach((project) => {
      const status = statusList.find((s) => s.StatusId === project.StatusId);
      if (status) {
        stateCounts[status.StatusName].count += 1;
      }
    });

    return Object.entries(stateCounts).map(([state, { count, color }]) => ({
      state,
      count,
      fill: color || "gray",
    }));
  }, [projects, statusList]);

  const totalProjects = projects.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Status dei progetti</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="state"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalProjects}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Progetti totali
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex text-center gap-2 font-medium leading-none">
            Percentuali progetti per status
          </div>
          <div className="leading-none py-1 text-muted-foreground text-center">
            {chartData.map(({ state, count }) => (
              <div className="py-1" key={state}>
                {state}: {((count / totalProjects) * 100).toFixed(0)}%
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
