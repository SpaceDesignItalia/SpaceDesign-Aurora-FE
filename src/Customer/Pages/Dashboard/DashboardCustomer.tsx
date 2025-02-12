import axios from "axios";
import { useEffect, useState } from "react";
import UpcomingEventsCard from "../../Components/Dashboard/Other/UpcomingEventsCard";

interface Customer {
  CustomerName: string;
  CustomerSurname: string;
}

const CUSTOMER_DEFAULT: Customer = {
  CustomerName: "",
  CustomerSurname: "",
};

export default function DashboardCustomer() {
  const [userData, setUserData] = useState<Customer>(CUSTOMER_DEFAULT);
  useEffect(() => {
    axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then((res) => {
        setUserData(res.data);
      });
  }, []);
  return (
    <div className="flex flex-col gap-5 py-10 m-0">
      <header>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900">
            Ciao, {userData.CustomerName + " " + userData.CustomerSurname}👋
          </h1>
        </div>
      </header>
      <main className="flex flex-col gap-5 px-4 sm:px-6 lg:px-8 h-96">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
          <div className="col-span-1 md:col-span-4">
            <div className="border-2 h-full rounded-xl p-5"></div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <UpcomingEventsCard />
          </div>
        </div>
      </main>
    </div>
  );
}
