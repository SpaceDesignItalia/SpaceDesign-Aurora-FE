import axios from "axios";
import { useEffect, useState } from "react";

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
        console.log(res.data);
        setUserData(res.data);
      });
  }, []);
  return (
    <div className="py-10 m-0">
      <header>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Ciao, {userData.CustomerName + " " + userData.CustomerSurname}👋
          </h1>
        </div>
      </header>
      <main className="flex flex-row px-4 sm:px-6 lg:px-8 h-96">
        <div className="py-6 lg:py-8"></div>
      </main>
    </div>
  );
}
