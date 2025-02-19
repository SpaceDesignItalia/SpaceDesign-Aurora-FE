import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Kbd,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../API/API";
import AddEventModal from "./AddEventModal";
import CalendarDay from "./CalendarDay";
import CalendarMonth from "./CalendarMonth";
import CalendarWeek from "./CalendarWeek";
import CalendarYear from "./CalendarYear";
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "t":
            e.preventDefault();
            setCurrentDate(new Date());
            break;
          case "1":
            e.preventDefault();
            setView("day");
            break;
          case "2":
            e.preventDefault();
            setView("week");
            break;
          case "3":
            e.preventDefault();
            setView("month");
            break;
          case "4":
            e.preventDefault();
            setView("year");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

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
    setIsLoading(true);
    try {
      const res = await axios.get(`Calendar/GET/GetEventsByEmail`);
      setEvents([...res.data, ...events]);
    } catch (error) {
      console.error(error);
      // Add error handling UI here
    } finally {
      setIsLoading(false);
    }
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
    if (EventId && EventPartecipantEmail) {
      if (Action === "add-event") {
        setIsOpen(true);
      } else if (Action === "accept" && EventId && EventPartecipantEmail) {
        updateEventPartecipantStatus(
          EventId,
          EventPartecipantEmail,
          "Accettato"
        );
      } else if (Action === "reject" && EventId && EventPartecipantEmail) {
        updateEventPartecipantStatus(
          EventId,
          EventPartecipantEmail,
          "Rifiutato"
        );
      }
    }
    fetchEvents();
    fetchProjects();
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

  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  async function fetchProjects() {
    await axios
      .get("/Project/GET/GetProjectInTeam", {
        withCredentials: true,
      })
      .then((res) => {
        for (const project of res.data) {
          console.log(project);
          if (project.ProjectEndDate) {
            const endDate = new Date(project.ProjectEndDate);
            events.push({
              EventId: project.ProjectId,
              EventTitle: project.ProjectName.substring(0, 20),
              EventStartDate: endDate,
              EventEndDate: endDate,
              EventStartTime: "00:00",
              EventEndTime: "00:00",
              EventColor: "#000000",
              EventDescription: "",
              EventLocation: "",
              EventTagName: "",
              EventAttachments: [],
              EventPartecipants: [],
            });
          }
        }
      });
  }

  console.log(events);

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
        <header className="flex flex-none flex-col sm:flex-row items-center justify-between border-b border-gray-300 px-4 sm:px-6 py-4 bg-white mt-1 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Navigation Controls - Riorganizzati */}
            <div className="relative flex items-center rounded-full bg-gray-100 border-2 border-gray-300">
              <Button
                onClick={() => changeDate(-1)}
                className="flex h-10 w-12 items-center justify-center rounded-l-full border-r bg-white text-gray-600 hover:bg-gray-100"
              >
                <Icon icon="solar:alt-arrow-left-linear" fontSize={18} />
              </Button>
              <Button
                radius="none"
                className="flex h-10 px-4 items-center justify-center bg-white text-gray-600 hover:bg-gray-100 border-x"
                onClick={() => setCurrentDate(new Date())}
              >
                Oggi
              </Button>
              <Button
                onClick={() => changeDate(1)}
                className="flex h-10 w-12 items-center justify-center rounded-r-full border-l bg-white text-gray-600 hover:bg-gray-100"
              >
                <Icon icon="solar:alt-arrow-right-linear" fontSize={18} />
              </Button>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            {formatDate(currentDate, view)}
          </h1>
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Dropdown>
                <DropdownTrigger
                  variant="bordered"
                  className="rounded-full h-11"
                >
                  <Button className="flex items-center px-4 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50">
                    {view === "day"
                      ? "Giorno"
                      : view === "week"
                      ? "Settimana"
                      : view === "month"
                      ? "Mese"
                      : "Anno"}
                    <Icon
                      icon="solar:alt-arrow-down-linear"
                      className="ml-2 h-5 w-5 text-gray-500"
                    />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Vista calendario" className="w-48">
                  <DropdownItem
                    key="day"
                    onClick={() => setView("day")}
                    {...(isMac
                      ? { endContent: <Kbd keys={["command"]}>+ 1</Kbd> }
                      : { shortcut: "CTRL + 1" })}
                  >
                    Giorno
                  </DropdownItem>

                  <DropdownItem
                    key="week"
                    onClick={() => setView("week")}
                    {...(isMac
                      ? { endContent: <Kbd keys={["command"]}>+ 2</Kbd> }
                      : { shortcut: "CTRL + 2" })}
                  >
                    Settimana
                  </DropdownItem>
                  <DropdownItem
                    key="month"
                    onClick={() => setView("month")}
                    {...(isMac
                      ? { endContent: <Kbd keys={["command"]}>+ 3</Kbd> }
                      : { shortcut: "CTRL + 3" })}
                  >
                    Mese
                  </DropdownItem>
                  <DropdownItem
                    key="year"
                    onClick={() => setView("year")}
                    {...(isMac
                      ? { endContent: <Kbd keys={["command"]}>+ 4</Kbd> }
                      : { shortcut: "CTRL + 4" })}
                  >
                    Anno
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              {(view === "day" || view === "week") && (
                <Dropdown>
                  <DropdownTrigger
                    variant="bordered"
                    className="rounded-full h-11"
                  >
                    <Button className="flex items-center px-4 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50">
                      Indicatore orario
                      <Icon
                        icon="solar:alt-arrow-down-linear"
                        className="ml-2 h-5 w-5 text-gray-500"
                      />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu className="w-72">
                    <DropdownItem
                      key="current"
                      onClick={() => setRedLineBehavior("current")}
                      description="Mostra l'indicatore solo nel giorno/settimana corrente"
                    >
                      {view === "day"
                        ? "Giorno corrente"
                        : "Settimana corrente"}
                    </DropdownItem>
                    <DropdownItem
                      key="always"
                      onClick={() => setRedLineBehavior("always")}
                      description="Mostra l'indicatore in tutti i giorni visualizzati"
                    >
                      Sempre visibile
                    </DropdownItem>
                    {view === "week" ? (
                      <DropdownItem
                        key="full-week"
                        onClick={() => setRedLineBehavior("full-week")}
                        description="Mostra l'indicatore su tutti i giorni della settimana"
                      >
                        Intera settimana
                      </DropdownItem>
                    ) : null}
                  </DropdownMenu>
                </Dropdown>
              )}
            </div>

            <Dropdown>
              <DropdownTrigger>
                <Button className="flex h-11 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark transition-colors">
                  <Icon
                    icon="mynaui:plus-solid"
                    className="h-5 w-5 sm:mr-2"
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">Nuovo evento</span>
                </Button>
              </DropdownTrigger>
              <DropdownMenu className="w-56">
                <DropdownItem
                  key="add"
                  onClick={() => {
                    setPrefilledEventData(null);
                    setIsOpen(true);
                  }}
                  startContent={
                    <Icon icon="mynaui:plus-solid" className="h-5 w-5" />
                  }
                >
                  Aggiungi evento
                </DropdownItem>
                <DropdownItem
                  key="import"
                  onClick={() => fileInputRef.current?.click()}
                  startContent={
                    <Icon icon="solar:file-upload-linear" className="h-5 w-5" />
                  }
                >
                  Importa da ICS
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto rounded-lg" ref={container}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Footer con pulsanti di esportazione */}
        <footer className="flex-none border-t border-gray-200 p-4 bg-white">
          <div className="flex justify-end gap-4">
            <Button
              className="flex h-10 items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-50 border border-gray-300 transition-colors"
              onClick={handleExportEvent}
            >
              <Icon
                icon="solar:file-download-linear"
                className="h-5 w-5 mr-2"
                aria-hidden="true"
              />
              Esporta calendario
            </Button>
          </div>
        </footer>
      </div>
    </>
  );
}
