import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function EmployeeStats() {
  const [stats, setStats] = useState([{ stat: 0 }, { stat: 0 }, { stat: 0 }]);

  async function fetchStats() {
    try {
      const [totalRes, newRes] = await Promise.all([
        axios.get("/Staffer/GET/GetAllStaffers"),
        axios.get("/Staffer/GET/GetNewStaffers"),
      ]);

      // Calcola la media dei progetti per dipendente
      const employeeProjects = await Promise.all(
        totalRes.data.map((emp: any) =>
          axios.get("/Staffer/GET/GetStafferProjectsForModal", {
            params: { EmployeeId: emp.EmployeeId },
          })
        )
      );

      const totalProjects = employeeProjects.reduce(
        (sum, res) => sum + res.data.length,
        0
      );
      const averageProjects =
        Math.round((totalProjects / totalRes.data.length) * 100) / 100;

      setStats([
        { stat: totalRes.data.length },
        { stat: newRes.data.length },
        { stat: averageProjects },
      ]);
    } catch (error) {
      console.error("Errore nel recupero delle statistiche:", error);
      setStats([{ stat: 0 }, { stat: 0 }, { stat: 0 }]);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const statistics = [
    {
      title: "Dipendenti Totali",
      value: stats[0]?.stat,
      icon: "material-symbols:engineering-rounded",
    },
    {
      title: "Nuovi dipendenti (Ultimo mese)",
      value: stats[1]?.stat,
      icon: "material-symbols:person-add-rounded",
    },
    {
      title: "Media Progetti per Dipendente",
      value: stats[2]?.stat,
      icon: "material-symbols:work-outline-rounded",
    },
  ];

  return (
    <dl className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
      {statistics.map((item, index) => (
        <Card
          key={index}
          className="mt-5 border-2 dark:border-default-100 shadow-none"
        >
          <section className="flex flex-nowrap justify-between p-4">
            <div className="flex flex-col justify-between gap-y-2">
              <div className="flex flex-col gap-y-4">
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Icon icon={item.icon} className="w-5 h-5" />
                  {item.title}
                </dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {item.value}
                </dd>
              </div>
            </div>
          </section>
        </Card>
      ))}
    </dl>
  );
}
