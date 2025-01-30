"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MONTHS = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

const ROW_HEIGHT = 60;
const HEADER_HEIGHT = 78;

const CalendarDay = ({ currentDate }: { currentDate: Date }) => {
  const now = new Date();
  const currentTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Rome" })
  );
  const [currentHour, setCurrentHour] = useState(
    currentTime.getHours() + currentTime.getMinutes() / 60
  );
  const isToday = currentDate.toDateString() === now.toDateString();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const newNow = new Date();
      const newCurrentTime = new Date(
        newNow.toLocaleString("en-US", { timeZone: "Europe/Rome" })
      );
      setCurrentHour(
        newCurrentTime.getHours() + newCurrentTime.getMinutes() / 60
      );
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []); // Empty dependency array to run only once on mount

  useEffect(() => {
    if (isToday && scrollRef.current) {
      const scrollPosition =
        currentHour * ROW_HEIGHT - window.innerHeight / 2 + HEADER_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, [isToday, currentHour]);

  return (
    <div
      className="flex flex-col h-full overflow-hidden relative"
      style={{ minHeight: "100%" }}
    >
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="grid grid-cols-10 divide-x divide-gray-100 relative">
          <div className="col-span-1 divide-y divide-gray-100">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="sticky left-0 bg-white text-center pr-4 py-3 text-sm leading-5 text-gray-500"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                {`${hour.toString().padStart(2, "0")}:00`}
              </div>
            ))}
          </div>
          <div className="col-span-9 divide-y divide-gray-100">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="py-3 group hover:bg-gray-50"
                style={{ height: `${ROW_HEIGHT}px` }}
              ></div>
            ))}
          </div>
          {isToday && (
            <div
              className="absolute left-0 right-0 z-10 pointer-events-none"
              style={{ top: `${currentHour * ROW_HEIGHT}px` }}
            >
              <div
                className="border-t-2 border-red-500 relative"
                style={{
                  width: "100%",
                  marginLeft: "10%",
                }}
              >
                <div className="absolute left-0 -top-3 -translate-x-full bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                  {new Date().toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CalendarWeek = ({ currentDate }: { currentDate: Date }) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));

  const [now, setNow] = useState(new Date());
  const currentTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Rome" })
  );
  const [currentHour, setCurrentHour] = useState(
    currentTime.getHours() + currentTime.getMinutes() / 60
  );
  const [currentDayIndex, setCurrentDayIndex] = useState(
    (new Date(
      new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Rome" }).format(now)
    ).getDay() +
      6) %
      7
  );

  const isCurrentWeek =
    startOfWeek.getTime() <= now.getTime() &&
    now.getTime() < startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const newNow = new Date();
      setNow(newNow);
      const newCurrentTime = new Date(
        newNow.toLocaleString("en-US", { timeZone: "Europe/Rome" })
      );
      setCurrentHour(
        newCurrentTime.getHours() + newCurrentTime.getMinutes() / 60
      );
      setCurrentDayIndex(
        (new Date(
          new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Rome" }).format(
            newNow
          )
        ).getDay() +
          6) %
          7
      );
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []); // Empty dependency array to run only once on mount

  useEffect(() => {
    if (isCurrentWeek && scrollRef.current) {
      const scrollPosition =
        currentHour * ROW_HEIGHT - window.innerHeight / 2 + HEADER_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, [isCurrentWeek, currentHour]);

  return (
    <div
      className="flex flex-col h-full overflow-hidden relative"
      style={{ minHeight: "100%" }}
    >
      <div className="flex-none bg-white sticky top-0 z-20 border-b border-gray-200">
        <div className="grid grid-cols-8 text-sm leading-6 text-gray-500">
          <div className="py-3"></div>
          {DAYS.map((day, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return (
              <div key={day} className="py-3 text-center font-semibold">
                <span className="block text-lg">{day}</span>
                <span
                  className={`block text-base font-bold ${
                    date.toDateString() === now.toDateString()
                      ? "text-blue-600"
                      : "text-gray-900"
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto relative" ref={scrollRef}>
        <div className="grid grid-cols-8 divide-x divide-gray-100 relative">
          <div className="col-span-1 divide-y divide-gray-100">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="sticky left-0 bg-white text-center pr-4 py-3 text-sm leading-5 text-gray-500"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                {hour === 0
                  ? "00:00"
                  : `${hour.toString().padStart(2, "0")}:00`}
              </div>
            ))}
          </div>
          {Array.from({ length: 7 }).map((_, dayIndex) => (
            <div key={dayIndex} className="col-span-1 divide-y divide-gray-100">
              {HOURS.map((hour) => (
                <div
                  key={`${dayIndex}-${hour}`}
                  className="py-3 group hover:bg-gray-50"
                  style={{ height: `${ROW_HEIGHT}px` }}
                ></div>
              ))}
            </div>
          ))}
          {isCurrentWeek && (
            <div
              className="absolute left-0 right-0 z-10 pointer-events-none"
              style={{
                top: `${currentHour * ROW_HEIGHT}px`,
              }}
            >
              <div
                className="border-t-2 border-red-500 relative"
                style={{
                  width: `calc(${(currentDayIndex + 1) * 12.5}%)`,
                  marginLeft: "12.5%",
                }}
              >
                <div
                  className="absolute left-0 -top-3 -translate-x-full bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                  style={{
                    top: "-0.75rem",
                  }}
                >
                  {currentTime.toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CalendarMonth = ({ currentDate }: { currentDate: Date }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month, i + 1)
  );

  return (
    <div
      className="flex-1 overflow-y-auto relative"
      style={{ minHeight: "100%" }}
    >
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {DAYS.map((day) => (
          <div
            key={day}
            className="bg-white py-2 text-center text-xs font-semibold text-gray-700 uppercase"
          >
            {day}
          </div>
        ))}
        {Array(firstDayIndex)
          .fill(null)
          .map((_, index) => (
            <div key={`empty-${index}`} className="bg-white"></div>
          ))}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="relative bg-white hover:bg-gray-50"
            style={{ height: "18vh" }}
          >
            <div className="absolute top-2 right-2">
              <time
                dateTime={day.toISOString()}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                  day.toDateString() === new Date().toDateString()
                    ? "bg-blue-600 font-semibold text-white"
                    : "text-gray-900"
                }`}
              >
                {day.getDate()}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CalendarYear = ({ currentDate }: { currentDate: Date }) => {
  const year = currentDate.getFullYear();

  return (
    <div className="flex-1 overflow-y-auto" style={{ minHeight: "100%" }}>
      <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 p-6">
        {MONTHS.map((month, monthIndex) => {
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
          const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
          const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

          const days = Array.from(
            { length: daysInMonth },
            (_, i) => new Date(year, monthIndex, i + 1)
          );

          return (
            <div key={month} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-center mb-4">
                {month}
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((day) => (
                  <div
                    key={`${month}-${day}`}
                    className="text-center text-xs font-medium text-gray-500"
                  >
                    {day[0]}
                  </div>
                ))}
                {Array(firstDayIndex)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={`empty-${month}-${index}`}
                      className="bg-white"
                    ></div>
                  ))}
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="relative bg-white hover:bg-gray-50 flex items-center justify-center"
                    style={{ height: `${ROW_HEIGHT * 0.75}px` }}
                  >
                    <time
                      dateTime={day.toISOString()}
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                        day.toDateString() === new Date().toDateString()
                          ? "bg-blue-600 font-semibold text-white"
                          : "text-gray-900"
                      }`}
                    >
                      {day.getDate()}
                    </time>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const formatDate = (date: Date, view: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    year: "numeric",
  };
  if (view === "year") return date.getFullYear().toString();
  if (view === "month") {
    const formatted = date.toLocaleDateString("it-IT", options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  if (view === "week") {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay() + 1);
    return `Settimana del ${weekStart.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`.replace(/^\w/, (c) => c.toUpperCase());
  }
  return date
    .toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(/^\w/, (c) => c.toUpperCase());
};

export default function Calendar() {
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const container = useRef<HTMLDivElement>(null);

  const changeDate = (offset: number) => {
    const newDate = new Date(currentDate);
    if (view === "year") {
      newDate.setFullYear(newDate.getFullYear() + offset);
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() + offset);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + offset * 7);
    } else {
      newDate.setDate(newDate.getDate() + offset);
    }
    setCurrentDate(newDate);
  };

  useEffect(() => {
    if (container.current) {
      container.current.scrollTop = 0;
    }
  }, [container]);

  return (
    <div className="flex flex-col w-full h-screen rounded-lg border-2">
      <header className="flex flex-none items-center justify-between border-b border-gray-300 px-6 py-4 bg-white my-2">
        <h1 className="text-xl font-bold text-gray-900">
          {formatDate(currentDate, view)}
        </h1>

        <div className="flex items-center gap-4">
          <div className="relative flex items-center rounded-lg bg-gray-100 border-2">
            <button
              onClick={() => changeDate(-1)}
              type="button"
              className="flex h-10 w-12 items-center justify-center rounded-l-lg border-r bg-white text-gray-600 hover:bg-gray-100 focus:relative"
            >
              <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              onClick={() => changeDate(1)}
              type="button"
              className="flex h-10 w-12 items-center justify-center rounded-r-lg border-l bg-white text-gray-600 hover:bg-gray-100 focus:relative"
            >
              <ChevronRightIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <Dropdown>
            <DropdownTrigger variant="bordered">
              <Button className="flex items-center px-4 text-sm font-semibold text-gray-600">
                {view === "day"
                  ? "Giorno"
                  : view === "week"
                  ? "Settimana"
                  : view === "month"
                  ? "Mese"
                  : "Anno"}
                <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-500" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="day" onClick={() => setView("day")}>
                Giorno
              </DropdownItem>
              <DropdownItem key="week" onClick={() => setView("week")}>
                Settimana
              </DropdownItem>
              <DropdownItem key="month" onClick={() => setView("month")}>
                Mese
              </DropdownItem>
              <DropdownItem key="year" onClick={() => setView("year")}>
                Anno
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto rounded-lg" ref={container}>
        {view === "day" && <CalendarDay currentDate={currentDate} />}
        {view === "week" && <CalendarWeek currentDate={currentDate} />}
        {view === "month" && <CalendarMonth currentDate={currentDate} />}
        {view === "year" && <CalendarYear currentDate={currentDate} />}
      </div>
    </div>
  );
}
