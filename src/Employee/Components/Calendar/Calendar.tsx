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
import CalendarDay from "./CalendarDay";
import CalendarWeek from "./CalendarWeek";
import CalendarMonth from "./CalendarMonth";
import CalendarYear from "./CalendarYear";
import AddEventModal from "./AddEventModal";
import { AddRounded } from "@mui/icons-material";
import axios from "axios";

interface EventPartecipant {
  EventPartecipantId: number;
  EventPartecipantEmail: string;
  EventPartecipantRole: string;
  EventPartecipantStatus: string;
}

interface EventAttachment {
  EventAttachmentId: number;
  EventAttachmentUrl: string;
  EventAttachmentName: string;
}

interface CalendarEvent {
  EventId: number;
  EventTitle: string;
  EventStartDate: Date;
  EventEndDate: Date;
  EventStartTime: string;
  EventEndTime: string;
  EventColor: string;
  EventDescription: string;
  EventLocation: string;
  EventTagName: string;
  EventAttachments: EventAttachment[];
  EventPartecipants: EventPartecipant[];
}

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
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const container = useRef<HTMLDivElement>(null);
  const [redLineBehavior, setRedLineBehavior] = useState<
    "current" | "always" | "full-week"
  >("current");

  async function fetchEvents() {
    const res = await axios.get(`Calendar/GET/GetEventsByEmail`);
    setEvents(res.data);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setView("day");
  };

  const handleMonthClick = (date: Date) => {
    setCurrentDate(date);
    setView("month");
  };

  useEffect(() => {
    if (container.current) {
      container.current.scrollTop = 0;
    }
  }, [container]); //Corrected useEffect dependency

  return (
    <>
      <AddEventModal isOpen={isOpen} isClosed={() => setIsOpen(false)} />
      <div className="flex flex-col w-full h-screen rounded-lg border-2">
        <header className="flex flex-none items-center justify-between border-b border-gray-300 px-6 py-4 bg-white mt-1">
          <h1 className="text-xl font-bold text-gray-900">
            {formatDate(currentDate, view)}
          </h1>

          <div className="flex items-center gap-4">
            <Button
              className="flex h-10 items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 focus:relative"
              variant="bordered"
              onClick={() => setIsOpen(true)}
            >
              <AddRounded className="h-6 w-6" aria-hidden="true" />
              Aggiungi evento
            </Button>
            <div className="relative flex items-center rounded-full bg-gray-100 border-2 border-gray-300">
              <Button
                onClick={() => changeDate(-1)}
                className="flex h-10 w-12 items-center justify-center rounded-l-full border-r bg-white text-gray-600 hover:bg-gray-100 focus:relative"
              >
                <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
              </Button>
              <Button
                onClick={() => changeDate(1)}
                className="flex h-10 w-12 items-center justify-center rounded-r-full border-l bg-white text-gray-600 hover:bg-gray-100 focus:relative"
              >
                <ChevronRightIcon className="h-6 w-6" aria-hidden="true" />
              </Button>
            </div>
            {(view === "day" || view === "week") && (
              <Dropdown>
                <DropdownTrigger
                  variant="bordered"
                  className="rounded-full h-11"
                >
                  <Button className="flex items-center px-4 text-sm font-semibold text-gray-600">
                    Orario
                    <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-500" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="current"
                    onClick={() => setRedLineBehavior("current")}
                  >
                    {view === "day" ? "Giorno corrente" : "Settimana corrente"}
                  </DropdownItem>
                  <DropdownItem
                    key="always"
                    onClick={() => setRedLineBehavior("always")}
                  >
                    Sempre visibile
                  </DropdownItem>
                  {view === "week" ? (
                    <DropdownItem
                      key="full-week"
                      onClick={() => setRedLineBehavior("full-week")}
                    >
                      Intera settimana
                    </DropdownItem>
                  ) : null}
                </DropdownMenu>
              </Dropdown>
            )}

            <Dropdown>
              <DropdownTrigger variant="bordered" className="rounded-full h-11">
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
          {view === "day" && (
            <CalendarDay
              currentDate={currentDate}
              redLineBehavior={redLineBehavior}
              events={events}
            />
          )}
          {view === "week" && (
            <CalendarWeek
              currentDate={currentDate}
              onDateClick={handleDateClick}
              redLineBehavior={redLineBehavior}
              events={events}
            />
          )}
          {view === "month" && (
            <CalendarMonth
              currentDate={currentDate}
              onDateClick={handleDateClick}
              events={events}
            />
          )}
          {view === "year" && (
            <CalendarYear
              currentDate={currentDate}
              onDateClick={handleDateClick}
              onMonthClick={handleMonthClick}
              events={events}
            />
          )}
        </div>
      </div>
    </>
  );
}
