import Calendar from "../../Components/Calendar/Calendar";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function CalendarPage() {
  return (
    <div className="py-10 m-0 lg:ml-72">
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
          <Calendar />
        </div>
      </main>
    </div>
  );
}
