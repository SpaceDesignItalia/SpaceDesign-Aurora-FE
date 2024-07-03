import axios from "axios";
import { useEffect, useState } from "react";

export default function ProfileInfo() {
  const [username, setUsername] = useState<string>("");
  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        setUsername(res.data.CustomerName + " " + res.data.CustomerSurname);
      });
  }, []);

  const stats = [
    { label: "Task totali da fare", value: 12 },
    { label: "Progetti attivi", value: 4 },
    { label: "Task in scadenza", value: 2 },
  ];
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <h2 className="sr-only" id="profile-overview-title">
        Profile Overview
      </h2>
      <div className="bg-white p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex sm:space-x-5">
            <div className="flex-shrink-0"></div>
            <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                👋 Ciao, {username}
              </p>

              <p className="text-sm font-medium text-gray-600">Cliente</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-gray-200 border-t border-gray-200 bg-gray-50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="px-6 py-5 text-center text-sm font-medium"
          >
            <span className="text-gray-900">{stat.value}</span>{" "}
            <span className="text-gray-600">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
