import { useState } from "react";
import EmployeeAttendanceTable from "../../Components/Employee/Tables/EmployeeAttendanceTable";
import { Breadcrumbs, BreadcrumbItem, Spinner } from "@heroui/react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { usePermissions } from "../../Components/Layout/PermissionProvider";
import { useEffect } from "react";
import EmployeeAttendanceStats from "../../Components/Employee/Other/EmployeeAttendanceStats";
import axios from "axios";
import { API_URL_IMG } from "../../../API/API";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../API/API";

const socket = io(API_WEBSOCKET_URL);

interface Employee {
  id: string;
  name: string;
  avatar?: string;
  attendances: {
    date: string;
    status: "present" | "absent" | "smartworking" | "vacation";
  }[];
}

export default function EmployeeAttendance() {
  const { hasPermission } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loggedStafferId, setLoggedStafferId] = useState<number>(0);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const permission = await hasPermission("VIEW_EMPLOYEE");
      if (!permission) {
        return (window.location.href = "/");
      }

      const sessionData = await axios.get("/Authentication/GET/GetSessionData");
      setLoggedStafferId(sessionData.data.StafferId);

      const staffers = await axios.get("/Staffer/GET/GetAllStaffers");

      // Reset employees all'inizio di ogni fetch
      setEmployees([]);

      for (const staffer of staffers.data) {
        const res = await axios.get("/Staffer/GET/GetAttendanceByStafferId", {
          params: {
            month: selectedDate.getMonth() + 1,
            year: selectedDate.getFullYear(),
            stafferId: staffer.EmployeeId,
          },
        });

        console.log(res.data);

        setEmployees((prev) => {
          // Controlla se esiste già un employee con lo stesso ID
          const exists = prev.some((emp) => emp.id === staffer.EmployeeId);
          if (exists) return prev;

          // Se non esiste, aggiungilo
          return [
            ...prev,
            {
              id: staffer.EmployeeId,
              name: staffer.EmployeeFullName,
              avatar: API_URL_IMG + "/profileIcons/" + staffer.EmployeeImageUrl,
              attendances: res.data,
            },
          ];
        });
      }
      setIsLoading(false);
    }

    fetchData();

    socket.on("employee-attendance-update", () => {
      fetchData();
    });
  }, [hasPermission, selectedDate]);

  console.log(isLoading);

  return (
    <div className="py-10 m-0 lg:ml-72">
      <header>
        <div className="flex flex-col gap-3 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Tabella presenze
          </h1>
          <Breadcrumbs variant="bordered" radius="full">
            <BreadcrumbItem href="/">
              <DashboardOutlinedIcon />
            </BreadcrumbItem>
            <BreadcrumbItem href="/administration/employee">
              Dipendenti
            </BreadcrumbItem>
            <BreadcrumbItem href="/administration/employee/attendance">
              Tabella presenze
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Spinner />
          </div>
        ) : (
          <>
            <EmployeeAttendanceStats
              employees={employees}
              selectedDate={selectedDate}
            />
            <div className="py-6 lg:py-8">
              <EmployeeAttendanceTable
                employees={employees}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                loggedStafferId={loggedStafferId}
              />{" "}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
