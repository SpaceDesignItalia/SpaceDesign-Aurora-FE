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
import {
  AddRounded,
  FileDownloadOutlined,
  FileUploadOutlined,
} from "@mui/icons-material";
import axios from "axios";
import dayjs from "dayjs";
import { io, Socket } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../API/API";
import { useNavigate, useParams } from "react-router-dom";
import ViewEventModal from "./ViewEventModal";

const socket: Socket = io(API_WEBSOCKET_URL);

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

  onDateClick,
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
  const navigate = useNavigate();
  const { Action, EventId, EventPartecipantEmail } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const container = useRef<HTMLDivElement>(null);
  const [redLineBehavior, setRedLineBehavior] = useState<
    "current" | "always" | "full-week"
  >("current");
  const [prefilledEventData, setPrefilledEventData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIcsImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;

      const lines = content.split("\n");
      let event = {
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        location: "",
      };

      let isInEvent = false;

      for (let line of lines) {
        line = line.trim();

        if (line === "BEGIN:VEVENT") {
          isInEvent = true;
          continue;
        }

        if (line === "END:VEVENT") {
          isInEvent = false;
          continue;
        }

        if (!isInEvent) continue;

        if (line.startsWith("SUMMARY:")) {
          event.title = line.substring(8);
        } else if (line.startsWith("DESCRIPTION:")) {
          event.description = line.substring(12);
        } else if (line.startsWith("DTSTART;TZID=")) {
          const datetime = line.split(":")[1];
          event.startDate = `${datetime.substring(0, 4)}-${datetime.substring(
            4,
            6
          )}-${datetime.substring(6, 8)}`;
          event.startTime = `${datetime.substring(9, 11)}:${datetime.substring(
            11,
            13
          )}`;
        } else if (line.startsWith("DTEND;TZID=")) {
          const datetime = line.split(":")[1];
          event.endDate = `${datetime.substring(0, 4)}-${datetime.substring(
            4,
            6
          )}-${datetime.substring(6, 8)}`;
          event.endTime = `${datetime.substring(9, 11)}:${datetime.substring(
            11,
            13
          )}`;
        } else if (line.startsWith("LOCATION:")) {
          event.location = line.substring(9);
        }
      }

      setPrefilledEventData(event);
      setIsOpen(true);
    };
    reader.readAsText(file);
  };

  function handleExportEvent() {
    // Format date and time for ICS file
    const formatICSDateTime = (date: any, time: string) => {
      const dateStr = dayjs(date).format("YYYYMMDD");
      const timeStr = time.replace(":", "") + "00";
      return `${dateStr}T${timeStr}`;
    };

    const getCurrentTimestamp = () => {
      return dayjs().format("YYYYMMDDTHHmmss");
    };

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Calendar App//IT
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VTIMEZONE
TZID:Europe/Rome
LAST-MODIFIED:20240422T053451Z
TZURL:https://www.tzurl.org/zoneinfo-outlook/Europe/Rome
X-LIC-LOCATION:Europe/Rome
BEGIN:DAYLIGHT
TZNAME:CEST
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZNAME:CET
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE`;

    for (let event of events) {
      const startDateTime = formatICSDateTime(
        event.EventStartDate,
        event.EventStartTime
      );
      const endDateTime = formatICSDateTime(
        event.EventEndDate,
        event.EventEndTime
      );

      // Escape special characters and handle line folding
      const description = event.EventDescription.replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
      const location = event.EventLocation.replace(/,/g, "\\,").replace(
        /;/g,
        "\\;"
      );
      const summary = event.EventTitle.replace(/,/g, "\\,").replace(
        /;/g,
        "\\;"
      );

      icsContent += `
BEGIN:VEVENT
DTSTAMP:${getCurrentTimestamp()}Z
UID:${event.EventId}@calendar-app
DTSTART;TZID=Europe/Rome:${startDateTime}
DTEND;TZID=Europe/Rome:${endDateTime}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT`;
    }

    icsContent += `\nEND:VCALENDAR`;

    // Create and download the file
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "Calendario.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function fetchEvents() {
    const res = await axios.get(`Calendar/GET/GetEventsByEmail`);
    setEvents(res.data);
  }

  async function updateEventPartecipantStatus(
    eventId: string,
    partecipantEmail: string,
    status: string
  ) {
    try {
      const res = await axios.put(
        `Calendar/UPDATE/UpdateEventPartecipantStatus`,
        {
          EventId: eventId,
          EventPartecipantEmail: partecipantEmail,
          EventPartecipantStatus: status,
        }
      );
      if (res.status === 200) {
        socket.emit("calendar-update");
        navigate(`/comunications/calendar/`);
        setIsOpen(true);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (Action === "add-event") {
      setIsOpen(true);
    } else if (Action === "accept" && EventId && EventPartecipantEmail) {
      updateEventPartecipantStatus(EventId, EventPartecipantEmail, "Accettato");
    } else if (Action === "reject" && EventId && EventPartecipantEmail) {
      updateEventPartecipantStatus(EventId, EventPartecipantEmail, "Rifiutato");
    }
    fetchEvents();
    socket.on("calendar-update", () => {
      fetchEvents();
    });
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
      <ViewEventModal
        isOpen={isOpen}
        eventId={EventId ? parseInt(EventId) : 0}
        isClosed={() => {
          setIsOpen(false);
        }}
      />
      <AddEventModal
        isOpen={isOpen}
        isClosed={() => {
          setPrefilledEventData(null);
          setIsOpen(false);
        }}
        prefilledData={prefilledEventData}
      />

      <input
        type="file"
        accept=".ics"
        ref={fileInputRef}
        className="hidden"
        onChange={handleIcsImport}
      />

      <div className="flex flex-col w-full h-screen rounded-lg border-2">
        <header className="flex flex-none items-center justify-between border-b border-gray-300 px-6 py-4 bg-white mt-1">
          <h1 className="text-xl font-bold text-gray-900">
            {formatDate(currentDate, view)}
          </h1>

          <div className="flex items-center gap-4">
            <Button
              className="flex h-10 items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 focus:relative"
              variant="bordered"
              onClick={handleExportEvent}
            >
              <FileDownloadOutlined
                className="h-6 w-6 mr-2"
                aria-hidden="true"
              />
              Esporta calendario
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="flex h-10 items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 focus:relative"
                  variant="bordered"
                >
                  <AddRounded className="h-6 w-6 mr-2" aria-hidden="true" />
                  Aggiungi evento
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="add"
                  onClick={() => {
                    setPrefilledEventData(null);
                    setIsOpen(true);
                  }}
                  startContent={<AddRounded className="h-5 w-5" />}
                >
                  Aggiungi evento
                </DropdownItem>
                <DropdownItem
                  key="import"
                  onClick={() => fileInputRef.current?.click()}
                  startContent={<FileUploadOutlined className="h-5 w-5" />}
                >
                  Importa da ICS
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
