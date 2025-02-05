import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BarChart, CartesianGrid, XAxis, Bar } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../../components/ui/chart";
import { Button } from "@heroui/react";
import NavigateBeforeOutlinedIcon from "@mui/icons-material/NavigateBeforeOutlined";
import NavigateNextOutlinedIcon from "@mui/icons-material/NavigateNextOutlined";

// Chart Configuration Type
interface ChartConfig {
  label: string;
  color: string;
}

// Define `chartConfig` with ChartConfig type
const chartConfig: Record<string, ChartConfig> = {
  total: {
    label: "Lead Totali",
    color: "hsl(var(--chart-1))",
  },
};

// Types for Chart Data and API Responses
interface ChartData {
  date: string;
  total: number;
}

interface LeadResponse {
  month: string;
  read_lead_count?: string;
  unread_lead_count?: string;
}

export default function LeadGraph() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    fetchContacts();
  }, [selectedYear]);

  const fetchContacts = async () => {
    try {
      // Define API responses with expected shape
      const readResponse = await axios.get<LeadResponse[]>(
        `/Lead/GET/GetReadLeadsByMonth`
      );
      const pendingResponse = await axios.get<LeadResponse[]>(
        `/Lead/GET/GetPendingLeadsByMonth`
      );

      // Map data for read and pending leads by month
      const readDataMap = new Map<string, number>(
        readResponse.data.map((item) => [
          item.month.slice(0, 7),
          Number(item.read_lead_count),
        ])
      );
      const pendingDataMap = new Map<string, number>(
        pendingResponse.data.map((item) => [
          item.month.slice(0, 7),
          Number(item.unread_lead_count),
        ])
      );

      // Generate data for each month
      const processedData: ChartData[] = Array.from(
        { length: 12 },
        (_, index) => {
          const month = new Date(selectedYear, index, 2)
            .toISOString()
            .slice(0, 7);
          const readCount = readDataMap.get(month) || 0;
          const unreadCount = pendingDataMap.get(month) || 0;
          return {
            date: month,
            total: readCount + unreadCount,
          };
        }
      );
      setChartData(processedData);

      // Collect unique years from responses
      const allYears = new Set<number>([
        ...readResponse.data.map((item) => new Date(item.month).getFullYear()),
        ...pendingResponse.data.map((item) =>
          new Date(item.month).getFullYear()
        ),
      ]);

      setYears(Array.from(allYears).sort((a, b) => b - a));
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const total = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.total, 0),
    [chartData]
  );

  const currentIndex = years.indexOf(selectedYear);

  const handlePrevYear = () => {
    if (currentIndex < years.length - 1) {
      setSelectedYear(years[currentIndex + 1]);
    }
  };

  const handleNextYear = () => {
    if (currentIndex > 0) {
      setSelectedYear(years[currentIndex - 1]);
    }
  };

  const prevYearExists = years[currentIndex + 1] !== undefined;
  const nextYearExists = years[currentIndex - 1] !== undefined;

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Lead ricevuti nel {selectedYear}</CardTitle>
        </div>
        <div className="flex flex-2 items-center justify-center px-6 py-4">
          <div className="relative z-30 flex flex-col gap-1 border-t px-6 py-4 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <button className="flex flex-col justify-center">
              <span className="text-xs text-muted-foreground">
                {chartConfig.total.label} ({selectedYear})
              </span>
              <span className="text-lg font-semibold leading-none sm:text-3xl">
                {total.toLocaleString()}
              </span>
            </button>

            <div className="flex justify-between gap-2 mt-4 w-full">
              <Button
                isIconOnly
                onClick={handlePrevYear}
                disabled={!prevYearExists}
                radius="full"
                className={`my-auto ${
                  !prevYearExists
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-gray-700 text-white hover:bg-black"
                }`}
              >
                <NavigateBeforeOutlinedIcon />
              </Button>
              <Button
                isIconOnly
                onClick={handleNextYear}
                disabled={!nextYearExists}
                radius="full"
                className={`my-auto ${
                  !nextYearExists
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-gray-700 text-white hover:bg-black"
                }`}
              >
                <NavigateNextOutlinedIcon />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.toLocaleDateString("it-IT", {
                  month: "short",
                })} ${date.getFullYear()}`;
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="Lead"
                  labelFormatter={(value) =>
                    "Totale " +
                    new Date(value).toLocaleDateString("it-IT", {
                      month: "short",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Bar dataKey="total" fill={`var(--color-total)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
