"use client";

import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function CustomerStats() {
  const [stats, setStats] = useState([{ stat: 0 }, { stat: 0 }, { stat: 0 }]);

  function fetchStats() {
    Promise.all([
      axios.get("/Customer/GET/GetAllCustomers"),
      axios.get("/Company/GET/GetAllCompany"),
    ]).then((res) => {
      setStats([
        { stat: res[0].data.length },
        { stat: res[1].data.length },
        {
          stat:
            Math.round((res[0].data.length / res[1].data.length) * 100) / 100,
        },
      ]);
    });
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const statistics = [
    {
      title: "Clienti Totali",
      value: stats[0]?.stat,
      icon: "material-symbols:groups-2-rounded",
    },
    {
      title: "Aziende Totali",
      value: stats[1]?.stat,
      icon: "material-symbols:store-rounded",
    },
    {
      title: "Media Clienti per Azienda",
      value: stats[2]?.stat,
      icon: "material-symbols:analytics-rounded",
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
                  {item.value !== 0 ? item.value : "Dati non disponibili"}
                </dd>
              </div>
            </div>
          </section>
        </Card>
      ))}
    </dl>
  );
}
