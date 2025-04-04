"use client";

import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function LeadStats() {
  const [statistics, setStats] = useState({
    readLeads: 0,
    pendingLeads: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  function fetchStats() {
    axios
      .all([
        axios.get("/Lead/GET/GetAllLeads"),
        axios.get("/Lead/GET/GetReadLeads"),
      ])
      .then(([pendingLeadRes, readLeadRes]) => {
        const statsData = {
          pendingLeads: pendingLeadRes.data.length,
          readLeads: readLeadRes.data.length,
        };
        setStats(statsData);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const stats = [
    {
      title: "Contatti totali",
      value: statistics.readLeads + statistics.pendingLeads,
      icon: "material-symbols:mail-outline-rounded",
    },
    {
      title: "Contatti in attesa",
      value: statistics.pendingLeads,
      icon: "material-symbols:mark-email-unread-outline-rounded",
    },
    {
      title: "Contatti letti",
      value: statistics.readLeads,
      icon: "material-symbols:mark-email-read-outline-rounded",
    },
  ];

  return (
    <dl className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
      {stats.map((item, index) => (
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
                  {item.value || "0"}
                </dd>
              </div>
            </div>
          </section>
        </Card>
      ))}
    </dl>
  );
}
