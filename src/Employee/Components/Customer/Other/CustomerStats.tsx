import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import axios from "axios";
import { useEffect, useState } from "react";

export default function CustomerStats() {
  const [stats, setStats] = useState([{ stat: 0 }, { stat: 0 }]);

  function fetchStats() {
    Promise.all([
      axios.get("/Customer/GET/GetAllCustomers"),
      axios.get("/Company/GET/GetAllCompany"),
    ]).then((res) => {
      setStats([{ stat: res[0].data.length }, { stat: res[1].data.length }]);
    });
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const statistics = [
    {
      id: 1,
      name: "Clienti Totali",
      stat: stats[0]?.stat,
      icon: Groups2RoundedIcon,
    },
    {
      id: 2,
      name: "Aziende Totali",
      stat: stats[1]?.stat,
      icon: StoreRoundedIcon,
    },
  ];

  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statistics.map((item) => (
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
                {item.stat !== 0 ? item.stat : "Dati non disponibili"}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
