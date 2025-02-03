import { useState } from "react";
import EmployeeAttendanceTable from "../../Components/Employee/Tables/EmployeeAttendanceTable";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { usePermissions } from "../../Components/Layout/PermissionProvider";
import { useEffect } from "react";
import EmployeeAttendanceStats from "../../Components/Employee/Other/EmployeeAttendanceStats";

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
  const [employees] = useState<Employee[]>([
    {
      id: "1",
      name: "Mario Rossi",
      avatar: "https://i.pravatar.cc/150?u=mario",
      attendances: [
        // Gennaio 2025 - Più presenze in ufficio
        ...Array.from({ length: 31 }, (_, i) => ({
          date: new Date(2025, 0, i + 1).toISOString(),
          status: (i % 5 === 0
            ? "smartworking"
            : i % 7 === 0
            ? "absent"
            : "present") as "present" | "absent" | "smartworking",
        })),
        // Dicembre 2024 - Più smart working
        ...Array.from({ length: 31 }, (_, i) => ({
          date: new Date(2024, 11, i + 1).toISOString(),
          status: (i % 3 === 0
            ? "present"
            : i % 7 === 0
            ? "absent"
            : "smartworking") as "present" | "absent" | "smartworking",
        })),
      ],
    },
    {
      id: "2",
      name: "Laura Bianchi",
      avatar: "https://i.pravatar.cc/150?u=laura",
      attendances: [
        // Gennaio 2025 - Bilanciato
        ...Array.from({ length: 31 }, (_, i) => ({
          date: new Date(2025, 0, i + 1).toISOString(),
          status: (i % 3 === 0
            ? "present"
            : i % 2 === 0
            ? "smartworking"
            : "absent") as "present" | "absent" | "smartworking",
        })),
        // Dicembre 2024 - Simile (variazione minima)
        ...Array.from({ length: 31 }, (_, i) => ({
          date: new Date(2024, 11, i + 1).toISOString(),
          status: (i % 3 === 0
            ? "present"
            : i % 2 === 0
            ? "smartworking"
            : "absent") as "present" | "absent" | "smartworking",
        })),
      ],
    },
    {
      id: "3",
      name: "Giuseppe Verdi",
      avatar: "https://i.pravatar.cc/150?u=giuseppe",
      attendances: [
        // Gennaio 2025 - Più smartworking
        ...Array.from({ length: 31 }, (_, i) => ({
          date: new Date(2025, 0, i + 1).toISOString(),
          status: (i % 4 === 0
            ? "present"
            : i % 5 === 0
            ? "absent"
            : "smartworking") as "present" | "absent" | "smartworking",
        })),
        // Dicembre 2024 - Più presenze
        ...Array.from({ length: 31 }, (_, i) => ({
          date: new Date(2024, 11, i + 1).toISOString(),
          status: (i % 4 === 0
            ? "smartworking"
            : i % 1 === 0
            ? "absent"
            : "present") as "present" | "absent" | "smartworking",
        })),
      ],
    },
    {
      id: "4",
      name: "Anna Neri",
      avatar: "https://i.pravatar.cc/150?u=anna",
      attendances: [
        // Gennaio 2025 - Molte presenze
        ...Array.from({ length: 31 }, (_, i) => ({
          date: new Date(2025, 0, i + 1).toISOString(),
          status: (i < 20
            ? "present"
            : i % 2 === 0
            ? "smartworking"
            : "absent") as "present" | "absent" | "smartworking",
        })),
        // Dicembre 2024 - Presenze simili (variazione minima)
        ...Array.from({ length: 31 }, (_, i) => ({
          date: new Date(2024, 11, i + 1).toISOString(),
          status: (i < 18
            ? "present"
            : i % 2 === 0
            ? "smartworking"
            : "absent") as "present" | "absent" | "smartworking",
        })),
      ],
    },
  ]);

  useEffect(() => {
    async function fetchData() {
      const permission = await hasPermission("VIEW_EMPLOYEE");

      if (!permission) {
        return (window.location.href = "/");
      }
    }
    fetchData();
  }, [hasPermission]);

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
        <EmployeeAttendanceStats employees={employees} />
        <div className="py-6 lg:py-8">
          <EmployeeAttendanceTable employees={employees} />
        </div>
      </main>
    </div>
  );
}
