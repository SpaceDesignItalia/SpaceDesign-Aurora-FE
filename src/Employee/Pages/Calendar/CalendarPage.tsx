import Calendar from "../../Components/Calendar/Calendar";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";
import StatusAlert from "../../Components/Layout/StatusAlert";

export default function CalendarPage() {
  const [statusAlert, setStatusAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  return (
    <div className="py-10 m-0 lg:ml-72">
      <StatusAlert
        AlertData={{
          isOpen: statusAlert.show,
          onClose: () => setStatusAlert((prev) => ({ ...prev, show: false })),
          alertTitle: "",
          alertDescription: statusAlert.message,
          alertColor: statusAlert.type === "success" ? "green" : "red",
        }}
      />
      <header>
        <div className="flex flex-col gap-3 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900">
            Calendario
          </h1>
          <Breadcrumbs variant="bordered" radius="full">
            <BreadcrumbItem href="/">
              <Icon icon="solar:home-2-linear" fontSize={18} />
            </BreadcrumbItem>
            <BreadcrumbItem href="/calendar">Calendario</BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          <Calendar setStatusAlert={setStatusAlert} />
        </div>
      </main>
    </div>
  );
}
