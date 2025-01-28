import { useState, useEffect, useRef } from "react";
import { Menu } from "@headlessui/react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";

export default function ProjectCalendar() {
  const [view, setView] = useState("week"); // Gestisce la vista
  const [currentDate, setCurrentDate] = useState(new Date());
  const container = useRef<HTMLDivElement>(null);
  const containerNav = useRef<HTMLDivElement>(null);
  const containerOffset = useRef<HTMLDivElement>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const changeMonth = (offset: any) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const scrollToCurrentTime = () => {
    if (container.current && containerNav.current && containerOffset.current) {
      const currentMinute =
        new Date().getHours() * 60 + new Date().getMinutes();
      container.current.scrollTop =
        ((container.current.scrollHeight -
          containerNav.current.offsetHeight -
          containerOffset.current.offsetHeight) *
          currentMinute) /
        1440;
    }
  };

  useEffect(() => {
    setTimeout(scrollToCurrentTime, 100);
  }, [currentDate]);

  return (
    <div className="flex flex-col w-full h-full">
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-base font-semibold text-gray-900">
          <time dateTime={`${currentYear}-${currentDate.getMonth() + 1}`}>
            {`${currentMonth} ${currentYear}`}
          </time>
        </h1>

        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
            <button
              onClick={() => changeMonth(-1)}
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
            >
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              onClick={() => setCurrentDate(new Date())}
              type="button"
              className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
            >
              Today
            </button>

            <button
              onClick={() => changeMonth(1)}
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
            >
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="hidden md:ml-4 md:flex md:items-center">
            <Menu as="div" className="relative">
              <Menu.Button
                type="button"
                className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                {view.charAt(0).toUpperCase() + view.slice(1)} view
                <ChevronDownIcon
                  className="-mr-1 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Menu.Button>

              <Menu.Items className="absolute right-0 z-10 mt-3 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    <button
                      onClick={() => setView("day")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Day view
                    </button>
                  </Menu.Item>
                  <Menu.Item>
                    <button
                      onClick={() => setView("week")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Week view
                    </button>
                  </Menu.Item>
                  <Menu.Item>
                    <button
                      onClick={() => setView("month")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Month view
                    </button>
                  </Menu.Item>
                  <Menu.Item>
                    <button
                      onClick={() => setView("year")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Year view
                    </button>
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </header>

      <div
        ref={container}
        className="isolate flex flex-auto flex-col overflow-auto bg-white h-full"
      >
        <div
          ref={containerNav}
          className="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8"
        >
          {/* Intestazioni come prima */}
        </div>

        <div className="flex flex-auto h-full">
          {/* Rendering della vista specifica in base allo stato di `view` */}
          {view === "day" && <CalendarDay />}
          {view === "week" && <CalendarWeek />}
          {view === "month" && <CalendarMonth />}
          {view === "year" && <CalendarYear />}
        </div>
      </div>
    </div>
  );
}
