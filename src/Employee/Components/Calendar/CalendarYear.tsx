import type React from "react";
import { useState, useRef, useEffect } from "react";
import ViewEventModal from "./ViewEventModal";

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

interface CalendarYearProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onMonthClick: (date: Date) => void;
  events: CalendarEvent[];
}

const CalendarYear: React.FC<CalendarYearProps> = ({
  currentDate,
  onDateClick,
  onMonthClick,
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
  const [popoverAnimation, setPopoverAnimation] = useState(false);
  const [popoverClosing, setPopoverClosing] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const year = currentDate.getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (hoveredDay) {
      setPopoverAnimation(true);
      setPopoverClosing(false);
    }
  }, [hoveredDay]);

  useEffect(() => {
    const handleGlobalScroll = (e: Event) => {
      if (hoveredDay) {
        const target = e.target as HTMLElement;
        if (target && !popoverRef.current?.contains(target)) {
          setHoveredDay(null);
        }
      }
    };

    document.addEventListener("scroll", handleGlobalScroll, true);
    return () => {
      document.removeEventListener("scroll", handleGlobalScroll, true);
    };
  }, [hoveredDay]);

  const handleDayClick = (day: Date, e: React.MouseEvent) => {
    e.stopPropagation();

    // Se il giorno cliccato è lo stesso di quello già visualizzato, chiudi il popup (effetto toggle)
    if (hoveredDay && hoveredDay.toDateString() === day.toDateString()) {
      setPopoverClosing(true);
      setTimeout(() => {
        setHoveredDay(null);
      }, 200);
      return;
    }

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

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const startDate = new Date(event.EventStartDate);
      const endDate = new Date(event.EventEndDate);
      return (
        date >= new Date(startDate.setHours(0, 0, 0, 0)) &&
        date <= new Date(endDate.setHours(0, 0, 0, 0))
      );
    });
  };

  return (
    <>
      <ViewEventModal
        isOpen={isOpen}
        eventId={selectedEventId}
        isClosed={() => setIsOpen(false)}
      />
      <div
        className="flex-1 overflow-y-auto bg-gray-50"
        style={{ minHeight: "100%" }}
        onClick={() => {
          if (hoveredDay) {
            setPopoverClosing(true);
            setTimeout(() => {
              setHoveredDay(null);
            }, 200);
          }
        }}
      >
        <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 p-6">
          {MONTHS.map((month, monthIndex) => (
            <div
              key={month}
              className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <h3
                className="text-lg font-medium text-center mb-4 px-4 py-2 rounded-full cursor-pointer w-fit mx-auto hover:bg-gray-100 transition-colors duration-200"
                onClick={() => onMonthClick(new Date(year, monthIndex, 1))}
              >
                {month}
              </h3>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center font-medium text-gray-600 flex items-center justify-center h-8"
                  >
                    {day}
                  </div>
                ))}
                {Array(new Date(year, monthIndex, 1).getDay() || 7 - 1)
                  .fill(null)
                  .map((_, i) => (
                    <div key={`empty-${i}`} className="h-8"></div>
                  ))}
                {Array.from(
                  { length: new Date(year, monthIndex + 1, 0).getDate() },
                  (_, i) => i + 1
                ).map((day) => {
                  const currentDay = new Date(year, monthIndex, day);
                  const isToday =
                    currentDay.toDateString() === today.toDateString();
                  const dayEvents = getEventsForDay(currentDay);
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <div
                      key={day}
                      className={`h-8 text-center rounded-full relative cursor-pointer
                        ${
                          isToday
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "hover:bg-gray-100"
                        } 
                        transition-colors duration-200 flex flex-col items-center justify-center`}
                      onClick={(e) => handleDayClick(currentDay, e)}
                      title={
                        dayEvents.length > 0 ? `${dayEvents.length} eventi` : ""
                      }
                    >
                      <span className={`${hasEvents ? "font-medium" : ""}`}>
                        {day}
                      </span>
                      {hasEvents && (
                        <div className="flex space-x-0.5 mt-0.5 justify-center">
                          {dayEvents.slice(0, 3).map((event, index) => (
                            <div
                              key={`${event.EventId}-${index}`}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: event.EventColor,
                                boxShadow: isToday
                                  ? "0 0 0 0.5px rgba(255,255,255,0.7)"
                                  : "none",
                              }}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div
                              className={`text-[9px] leading-none ${
                                isToday ? "text-white" : "text-gray-500"
                              }`}
                              style={{ marginTop: "-1px" }}
                            >
                              +{dayEvents.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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
            popoverClosing
              ? popoverPosition.isRight
                ? "opacity-0 scale-95 -translate-x-4"
                : "opacity-0 scale-95 translate-x-4"
              : popoverAnimation
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
            maxHeight: "min(calc(100vh - 100px), 400px)",
            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.12)",
            transformOrigin: popoverPosition.isRight
              ? "left center"
              : "right center",
            display: "flex",
            flexDirection: "column",
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
            <button
              onClick={() => {
                setPopoverClosing(true);
                setTimeout(() => {
                  setHoveredDay(null);
                }, 200);
              }}
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

          <div
            className="space-y-4 pr-2 overflow-y-auto custom-scrollbar flex-1"
            style={{
              scrollbarGutter: "stable",
              minHeight: "50px",
              maxHeight: "calc(min(100vh - 240px, 260px))",
            }}
          >
            {getEventsForDay(hoveredDay)
              .sort((a, b) => {
                const aIsAllDay =
                  a.EventStartTime === "00:00" && a.EventEndTime === "00:00";
                const bIsAllDay =
                  b.EventStartTime === "00:00" && b.EventEndTime === "00:00";
                if (aIsAllDay && !bIsAllDay) return -1;
                if (!aIsAllDay && bIsAllDay) return 1;
                return a.EventStartTime.localeCompare(b.EventStartTime);
              })
              .map((event, index) => {
                const isStartDay =
                  hoveredDay.toDateString() ===
                  new Date(event.EventStartDate).toDateString();
                const isEndDay =
                  hoveredDay.toDateString() ===
                  new Date(event.EventEndDate).toDateString();
                const isAllDay =
                  event.EventStartTime === "00:00" &&
                  event.EventEndTime === "00:00";

                return (
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
                        {isAllDay && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-normal">
                            Tutto il giorno
                          </span>
                        )}
                      </h4>
                      {!isAllDay && (
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
                          {!isStartDay && !isEndDay
                            ? "Tutto il giorno"
                            : isStartDay && !isEndDay
                            ? `Dalle ${event.EventStartTime}`
                            : !isStartDay && isEndDay
                            ? `Fino alle ${event.EventEndTime}`
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
                );
              })}
            {getEventsForDay(hoveredDay).length === 0 && (
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

          <div className="pt-3 mt-2 border-t border-gray-100 flex justify-center">
            <button
              onClick={() => {
                setPopoverClosing(true);
                setTimeout(() => {
                  setHoveredDay(null);
                  onDateClick(hoveredDay);
                }, 200);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow w-full justify-center"
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
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarYear;
