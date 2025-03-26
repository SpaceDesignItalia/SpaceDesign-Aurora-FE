import React, { useState, useRef, useEffect } from "react";
import ViewEventModal from "./ViewEventModal";

const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

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

interface CalendarMonthProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  events: CalendarEvent[];
}

const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  currentDate,
  onDateClick,
  events,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(0);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({
    x: 0,
    y: 0,
    isRight: false,
    isAbove: false,
  });
  const popoverRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState<{
    [key: string]: boolean;
  }>({});
  const [scrolledToTop, setScrolledToTop] = useState<{
    [key: string]: boolean;
  }>({});
  const scrollContainerRefs = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from({ length: firstDayIndex }, (_, i) => {
    return new Date(year, month - 1, prevMonthLastDay - firstDayIndex + i + 1);
  });

  const totalDays = prevMonthDays.length + daysInMonth;
  const nextMonthDays = Array.from({ length: 42 - totalDays }, (_, i) => {
    return new Date(year, month + 1, i + 1);
  });

  const days = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month, i + 1)
  );

  const [popoverAnimation, setPopoverAnimation] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (hoveredDay) {
        setHoveredDay(null);
      }
    };

    const calendar = calendarRef.current;
    if (calendar) {
      calendar.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (calendar) {
        calendar.removeEventListener("scroll", handleScroll);
      }
    };
  }, [hoveredDay]);

  useEffect(() => {
    if (hoveredDay) {
      setPopoverAnimation(true);
    }
  }, [hoveredDay]);

  useEffect(() => {
    const handleGlobalScroll = (e: Event) => {
      if (hoveredDay) {
        // Chiudi il popover se l'evento di scroll proviene da un elemento padre
        const target = e.target as HTMLElement;
        if (target && !popoverRef.current?.contains(target)) {
          setHoveredDay(null);
        }
      }
    };

    // Aggiungi l'event listener a tutti i contenitori scrollabili
    document.addEventListener("scroll", handleGlobalScroll, true);

    return () => {
      document.removeEventListener("scroll", handleGlobalScroll, true);
    };
  }, [hoveredDay]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, day: Date) => {
    const target = e.target as HTMLDivElement;
    const dayKey = day.toISOString();

    // Chiudi il popover quando si scrolla il calendario
    setHoveredDay(null);

    // Controlla se l'utente ha scrollato fino alla fine
    const isAtBottom =
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) <
      5;

    // Controlla se l'utente è all'inizio
    const isAtTop = target.scrollTop < 5;

    if (isAtBottom !== scrolledToBottom[dayKey]) {
      setScrolledToBottom((prev) => ({
        ...prev,
        [dayKey]: isAtBottom,
      }));
    }

    if (isAtTop !== scrolledToTop[dayKey]) {
      setScrolledToTop((prev) => ({
        ...prev,
        [dayKey]: isAtTop,
      }));
    }
  };

  const scrollToBottom = (dayKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const container = scrollContainerRefs.current[dayKey];
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = (dayKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const container = scrollContainerRefs.current[dayKey];
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleMoreEventsClick = (day: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setHoveredDay(day);

    const rect = e.currentTarget.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const cellRect = (
      e.currentTarget.closest("[data-cell]") as HTMLElement
    ).getBoundingClientRect();

    const shouldShowOnRight = cellRect.left < windowWidth / 2;
    const shouldShowAbove = cellRect.top > windowHeight / 2;

    setPopoverPosition({
      x: shouldShowOnRight ? cellRect.right : cellRect.left,
      y: shouldShowAbove ? cellRect.top : cellRect.bottom,
      isRight: shouldShowOnRight,
      isAbove: shouldShowAbove,
    });
  };

  const handleDayMouseEnter = (day: Date, e: React.MouseEvent) => {
    const dayEvents = events.filter(
      (event) =>
        day >= new Date(event.EventStartDate) &&
        day <= new Date(event.EventEndDate)
    );

    const rect = e.currentTarget.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const cellRect = (
      e.currentTarget.closest("[data-cell]") as HTMLElement
    ).getBoundingClientRect();

    const shouldShowOnRight = cellRect.left < windowWidth / 2;
    const shouldShowAbove = cellRect.top > windowHeight / 2;

    setHoveredDay(day);
    setPopoverPosition({
      x: shouldShowOnRight ? cellRect.right : cellRect.left,
      y: shouldShowAbove ? cellRect.top : cellRect.bottom,
      isRight: shouldShowOnRight,
      isAbove: shouldShowAbove,
    });
  };

  const handleDayClick = (day: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const shouldShowOnRight = rect.left < windowWidth / 2;
    const shouldShowAbove = rect.top > windowHeight / 2;

    setHoveredDay(day);
    setPopoverPosition({
      x: shouldShowOnRight ? rect.right : rect.left,
      y: shouldShowAbove ? rect.top : rect.bottom,
      isRight: shouldShowOnRight,
      isAbove: shouldShowAbove,
    });
  };

  const handlePopoverMouseLeave = () => {
    setHoveredDay(null);
  };

  return (
    <>
      <ViewEventModal
        isOpen={isOpen}
        eventId={selectedEventId}
        isClosed={() => setIsOpen(false)}
      />
      <div
        ref={calendarRef}
        className="flex-1 overflow-y-auto relative"
        style={{ minHeight: "100%" }}
        onClick={() => setHoveredDay(null)}
      >
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {DAYS.map((day) => (
            <div
              key={day}
              className="bg-white py-2 text-center text-xs font-medium text-gray-700 uppercase "
            >
              {day}
            </div>
          ))}
          {prevMonthDays.map((day) => (
            <div
              key={day.toISOString()}
              data-cell
              className="relative hover:bg-gray-50 cursor-pointer bg-gray-100 opacity-50"
              style={{ height: "18vh" }}
              onClick={(e) => handleDayClick(day, e)}
            >
              <div className="absolute top-2 right-2">
                <time
                  dateTime={day.toISOString()}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-sm text-gray-500"
                >
                  {day.getDate()}
                </time>
              </div>
              <div className="absolute top-10 left-1 right-1 flex flex-col gap-1.5">
                {events
                  .filter(
                    (event) =>
                      day >= new Date(event.EventStartDate) &&
                      day <= new Date(event.EventEndDate)
                  )
                  .sort((a, b) => {
                    // Prima gli eventi che durano tutto il giorno
                    const aIsAllDay =
                      a.EventStartTime === "00:00" &&
                      a.EventEndTime === "00:00";
                    const bIsAllDay =
                      b.EventStartTime === "00:00" &&
                      b.EventEndTime === "00:00";

                    if (aIsAllDay && !bIsAllDay) return -1;
                    if (!aIsAllDay && bIsAllDay) return 1;

                    // Poi ordina per orario di inizio
                    return a.EventStartTime.localeCompare(b.EventStartTime);
                  })
                  .slice(0, 3)
                  .map((event) => (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true && event.EventColor !== "#000000");
                        setSelectedEventId(event.EventId);
                      }}
                      key={event.EventId}
                      className="flex items-center gap-1 px-1 py-0.5 rounded text-xs hover:bg-gray-100"
                      title={`${event.EventTitle}\n${event.EventDescription}\nDove: ${event.EventLocation}`}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.EventColor }}
                      />
                      <div className="flex flex-col">
                        <div className="truncate">{event.EventTitle}</div>
                        {event.EventStartTime === "00:00" &&
                          event.EventEndTime === "00:00" && (
                            <div className="text-[10px] opacity-90">
                              Tutto il giorno
                            </div>
                          )}
                      </div>
                    </div>
                  ))}

                {/* Indicatore per più eventi */}
                {events.filter(
                  (event) =>
                    day >= new Date(event.EventStartDate) &&
                    day <= new Date(event.EventEndDate)
                ).length > 3 && (
                  <div className="mt-0.5 flex items-center justify-center">
                    <div
                      onClick={(e) => handleDayClick(day, e)}
                      className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1 group hover:shadow-sm"
                    >
                      <svg
                        className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <span className="group-hover:text-blue-600">
                        +
                        {events.filter(
                          (event) =>
                            day >= new Date(event.EventStartDate) &&
                            day <= new Date(event.EventEndDate)
                        ).length - 3}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {days.map((day) => {
            const dayEvents = events.filter(
              (event) =>
                day >= new Date(event.EventStartDate) &&
                day <= new Date(event.EventEndDate)
            );

            return (
              <div
                key={day.toISOString()}
                data-cell
                className={`relative hover:bg-gray-50 cursor-pointer ${
                  day < today ? "bg-gray-200" : "bg-white"
                } ${
                  hoveredDay?.toISOString() === day.toISOString() ? "z-10" : ""
                }`}
                style={{ height: "18vh" }}
                onClick={(e) => handleDayClick(day, e)}
              >
                <div className="absolute top-2 right-2">
                  <time
                    dateTime={day.toISOString()}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                      day.toDateString() === today.toDateString()
                        ? "bg-blue-600 font-medium text-white"
                        : day.getMonth() === month
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {day.getDate()}
                  </time>
                </div>
                <div className="absolute top-10 left-1 right-1 flex flex-col gap-1.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true && event.EventColor !== "#000000");
                        setSelectedEventId(event.EventId);
                      }}
                      key={event.EventId}
                      className="flex items-center gap-1 px-1 py-0.5 rounded text-xs hover:bg-gray-100"
                      title={`${event.EventTitle}\n${event.EventDescription}\nDove: ${event.EventLocation}`}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.EventColor }}
                      />
                      <div className="flex flex-col">
                        <div className="truncate">{event.EventTitle}</div>
                        {event.EventStartTime === "00:00" &&
                          event.EventEndTime === "00:00" && (
                            <div className="text-[10px] opacity-90">
                              Tutto il giorno
                            </div>
                          )}
                      </div>
                    </div>
                  ))}

                  {/* Indicatore per più eventi */}
                  {dayEvents.length > 3 && (
                    <div className="mt-0.5 flex items-center justify-center">
                      <div
                        onClick={(e) => handleDayClick(day, e)}
                        className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1 group hover:shadow-sm"
                      >
                        <svg
                          className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                        <span className="group-hover:text-blue-600">
                          +{dayEvents.length - 3}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {nextMonthDays.map((day) => (
            <div
              key={day.toISOString()}
              data-cell
              className="relative hover:bg-gray-50 cursor-pointer bg-gray-100 opacity-50"
              style={{ height: "18vh" }}
              onClick={(e) => handleDayClick(day, e)}
            >
              <div className="absolute top-2 right-2">
                <time
                  dateTime={day.toISOString()}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-sm text-gray-500"
                >
                  {day.getDate()}
                </time>
              </div>
              <div className="absolute top-10 left-1 right-1 flex flex-col gap-1.5">
                {events
                  .filter(
                    (event) =>
                      day >= new Date(event.EventStartDate) &&
                      day <= new Date(event.EventEndDate)
                  )
                  .sort((a, b) => {
                    // Prima gli eventi che durano tutto il giorno
                    const aIsAllDay =
                      a.EventStartTime === "00:00" &&
                      a.EventEndTime === "00:00";
                    const bIsAllDay =
                      b.EventStartTime === "00:00" &&
                      b.EventEndTime === "00:00";

                    if (aIsAllDay && !bIsAllDay) return -1;
                    if (!aIsAllDay && bIsAllDay) return 1;

                    // Poi ordina per orario di inizio
                    return a.EventStartTime.localeCompare(b.EventStartTime);
                  })
                  .slice(0, 3)
                  .map((event) => (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true && event.EventColor !== "#000000");
                        setSelectedEventId(event.EventId);
                      }}
                      key={event.EventId}
                      className="flex items-center gap-1 px-1 py-0.5 rounded text-xs hover:bg-gray-100"
                      title={`${event.EventTitle}\n${event.EventDescription}\nDove: ${event.EventLocation}`}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.EventColor }}
                      />
                      <div className="flex flex-col">
                        <div className="truncate">{event.EventTitle}</div>
                        {event.EventStartTime === "00:00" &&
                          event.EventEndTime === "00:00" && (
                            <div className="text-[10px] opacity-90">
                              Tutto il giorno
                            </div>
                          )}
                      </div>
                    </div>
                  ))}

                {/* Indicatore per più eventi */}
                {events.filter(
                  (event) =>
                    day >= new Date(event.EventStartDate) &&
                    day <= new Date(event.EventEndDate)
                ).length > 3 && (
                  <div className="mt-0.5 flex items-center justify-center">
                    <div
                      onClick={(e) => handleDayClick(day, e)}
                      className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1 group hover:shadow-sm"
                    >
                      <svg
                        className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <span className="group-hover:text-blue-600">
                        +
                        {events.filter(
                          (event) =>
                            day >= new Date(event.EventStartDate) &&
                            day <= new Date(event.EventEndDate)
                        ).length - 3}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popover per gli eventi */}
      {hoveredDay && (
        <div
          ref={popoverRef}
          className={`fixed z-40 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 min-w-[350px] max-w-[400px] overflow-hidden backdrop-blur-sm bg-white/95 transition-all duration-300 ease-out ${
            popoverAnimation
              ? "opacity-100 scale-100 translate-y-0"
              : popoverPosition.isRight
              ? "opacity-0 scale-95 -translate-x-4"
              : "opacity-0 scale-95 translate-x-4"
          } ${
            popoverPosition.isAbove
              ? "origin-bottom translate-y-2"
              : "origin-top -translate-y-2"
          }`}
          style={{
            left: popoverPosition.isRight
              ? `${popoverPosition.x + 8}px`
              : "auto",
            right: !popoverPosition.isRight
              ? `calc(100% - ${popoverPosition.x - 8}px)`
              : "auto",
            top: popoverPosition.isAbove
              ? "auto"
              : `${popoverPosition.y + 8}px`,
            bottom: popoverPosition.isAbove
              ? `calc(100% - ${popoverPosition.y - 8}px)`
              : "auto",
            maxHeight: "min(calc(100vh - 100px), 500px)",
            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.12)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full">
                {hoveredDay.getDate()}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-normal text-gray-500">
                  {new Intl.DateTimeFormat("it-IT", { month: "long" }).format(
                    hoveredDay
                  )}
                </span>
                <span>Eventi del giorno</span>
              </div>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDateClick(hoveredDay)}
                className="text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 hover:bg-blue-50 rounded-full text-sm font-medium flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Vai al giorno
              </button>
              <button
                onClick={() => setHoveredDay(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-full"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div
            className="space-y-4 pr-2 overflow-y-auto custom-scrollbar"
            style={{
              height: "calc(100% - 80px)",
              maxHeight: "calc(min(100vh - 180px, 420px))",
              scrollbarGutter: "stable",
            }}
          >
            {events
              .filter(
                (event) =>
                  hoveredDay >= new Date(event.EventStartDate) &&
                  hoveredDay <= new Date(event.EventEndDate)
              )
              .sort((a, b) => {
                const aIsAllDay =
                  a.EventStartTime === "00:00" && a.EventEndTime === "00:00";
                const bIsAllDay =
                  b.EventStartTime === "00:00" && b.EventEndTime === "00:00";
                if (aIsAllDay && !bIsAllDay) return -1;
                if (!aIsAllDay && bIsAllDay) return 1;
                return a.EventStartTime.localeCompare(b.EventStartTime);
              })
              .map((event, index) => (
                <div
                  key={event.EventId}
                  onClick={() => {
                    setIsOpen(true && event.EventColor !== "#000000");
                    setSelectedEventId(event.EventId);
                    setHoveredDay(null);
                  }}
                  className={`flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-all cursor-pointer group`}
                  style={{
                    transform: popoverAnimation
                      ? "translateX(0) scale(1)"
                      : "translateX(-20px) scale(0.95)",
                    opacity: popoverAnimation ? 1 : 0,
                    transition: `all 300ms cubic-bezier(0.4, 0, 0.2, 1) ${
                      index * 50
                    }ms`,
                  }}
                >
                  <div
                    className="w-1 h-full min-h-[2.5rem] rounded-full flex-shrink-0 group-hover:scale-y-110 transition-transform"
                    style={{ backgroundColor: event.EventColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                      {event.EventTitle}
                      {event.EventStartTime === "00:00" &&
                        event.EventEndTime === "00:00" && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-normal">
                            Tutto il giorno
                          </span>
                        )}
                    </h4>
                    {!(
                      event.EventStartTime === "00:00" &&
                      event.EventEndTime === "00:00"
                    ) && (
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {event.EventStartTime === "00:00" &&
                        event.EventEndTime === "00:00"
                          ? "Tutto il giorno"
                          : `${event.EventStartTime} - ${event.EventEndTime}`}
                      </p>
                    )}
                    {event.EventLocation && (
                      <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5 group-hover:text-gray-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {event.EventLocation}
                      </p>
                    )}
                    {event.EventDescription && (
                      <p
                        className="text-sm text-gray-600 mt-2 line-clamp-2 group-hover:text-gray-700"
                        dangerouslySetInnerHTML={{
                          __html: event.EventDescription,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            {events.filter(
              (event) =>
                hoveredDay >= new Date(event.EventStartDate) &&
                hoveredDay <= new Date(event.EventEndDate)
            ).length === 0 && (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                <svg
                  className="w-16 h-16 mb-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium mb-1">Nessun evento</p>
                <p className="text-xs text-gray-400 text-center max-w-[250px]">
                  Non ci sono eventi programmati per questo giorno. Clicca su
                  "Vai al giorno" per visualizzare i dettagli.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connettori per eventi multi-giorno */}
      <div className="absolute inset-0 pointer-events-none">
        {events
          .filter((event) => {
            const startDate = new Date(event.EventStartDate);
            const endDate = new Date(event.EventEndDate);
            // Verifica se l'evento dura più di un giorno
            return (
              endDate.getTime() - startDate.getTime() > 24 * 60 * 60 * 1000
            );
          })
          .map((event) => {
            const startDate = new Date(event.EventStartDate);
            const endDate = new Date(event.EventEndDate);
            const allDates = [];

            // Genera un array di tutte le date dell'evento
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              allDates.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }

            // Filtra solo le date visibili nel calendario corrente
            const visibleDates = allDates.filter(
              (date) =>
                (date.getMonth() === currentDate.getMonth() &&
                  date.getFullYear() === currentDate.getFullYear()) ||
                (date.getMonth() === currentDate.getMonth() - 1 &&
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    1
                  ).getDay() !== 1) ||
                (date.getMonth() === currentDate.getMonth() + 1 &&
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    0
                  ).getDay() !== 0)
            );

            return visibleDates.map((date, index) => {
              if (index === visibleDates.length - 1) return null; // Salta l'ultimo giorno poiché non ha un giorno successivo da collegare

              const currentDay = date;
              const nextDay = visibleDates[index + 1];

              // Salta i giorni non consecutivi
              if (
                nextDay.getTime() - currentDay.getTime() !==
                24 * 60 * 60 * 1000
              )
                return null;

              // Trova le posizioni nella griglia per i due giorni
              const firstDayOfMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
              ).getDay();
              const firstDayIndex =
                firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

              const currentDayOffset =
                currentDay.getDate() -
                1 +
                firstDayIndex +
                (currentDay.getMonth() < currentDate.getMonth()
                  ? -firstDayIndex
                  : 0) +
                (currentDay.getMonth() > currentDate.getMonth()
                  ? new Date(
                      currentDay.getFullYear(),
                      currentDay.getMonth(),
                      0
                    ).getDate() + firstDayIndex
                  : 0);

              const nextDayOffset =
                nextDay.getDate() -
                1 +
                firstDayIndex +
                (nextDay.getMonth() < currentDate.getMonth()
                  ? -firstDayIndex
                  : 0) +
                (nextDay.getMonth() > currentDate.getMonth()
                  ? new Date(
                      nextDay.getFullYear(),
                      nextDay.getMonth(),
                      0
                    ).getDate() + firstDayIndex
                  : 0);

              // Calcola riga e colonna nella griglia
              const currentRow = Math.floor(currentDayOffset / 7);
              const currentCol = currentDayOffset % 7;
              const nextRow = Math.floor(nextDayOffset / 7);
              const nextCol = nextDayOffset % 7;

              // Calcola eventi nella stessa cella per trovare l'altezza giusta
              const eventsInCurrentDay = events.filter(
                (e) =>
                  currentDay >= new Date(e.EventStartDate) &&
                  currentDay <= new Date(e.EventEndDate)
              );
              const eventIndex = eventsInCurrentDay.findIndex(
                (e) => e.EventId === event.EventId
              );

              if (eventIndex === -1) return null;

              // Calcola la posizione Y in base a quanti eventi ci sono prima di questo
              const yPosition = 10 + 32 * eventIndex + 16; // 10px iniziali + altezza eventi precedenti + metà altezza evento corrente

              // Verifica se i giorni sono sulla stessa riga o su righe diverse
              if (currentRow === nextRow) {
                // Stessa riga - connettore orizzontale
                return (
                  <div
                    key={`conn-${event.EventId}-${index}`}
                    className="absolute"
                    style={{
                      top: `calc(${currentRow * 18}vh + ${yPosition}px)`,
                      left: `calc(${(currentCol + 1) * (100 / 7)}% - 3px)`,
                      width: `calc(${
                        (nextCol - currentCol - 1) * (100 / 7)
                      }% + 6px)`,
                      height: "2px",
                      backgroundColor: event.EventColor,
                      zIndex: 5,
                      opacity: 0.8,
                    }}
                  />
                );
              }

              return null; // Se sono su righe diverse, al momento non colleghiamo
            });
          })}
      </div>
    </>
  );
};

export default CalendarMonth;
