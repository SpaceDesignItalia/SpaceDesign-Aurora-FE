import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import axios from "axios";
import { useState, useEffect } from "react";

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

        console.log(statsData);

        setStats(statsData);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  const stats = [
    {
      id: 1,
      name: "Contatti totali",
      stat: statistics.readLeads + statistics.pendingLeads,
      icon: MailOutlineRoundedIcon,
    },
    {
      id: 2,
      name: "Contatti in attesa",
      stat: statistics.pendingLeads,
      icon: MarkEmailUnreadOutlinedIcon,
    },
    {
      id: 3,
      name: "Contatti letti",
      stat: statistics.readLeads,
      icon: MarkEmailReadOutlinedIcon,
    },
  ];

  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 sm:px-6 sm:pt-6 border border-gray"
          >
            <dt>
              <div className="absolute rounded-md bg-primary p-3">
                <item.icon aria-hidden="true" className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-lg md:text-2xl font-semibold text-gray-900">
                {item.stat != 0 ? item.stat : "Dati non disponibili"}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
