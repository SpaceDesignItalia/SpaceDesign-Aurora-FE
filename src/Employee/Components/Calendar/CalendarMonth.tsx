import React, { useState, useRef } from "react";
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

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  currentDate,
  onDateClick,
  events,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(0);
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, day: Date) => {
    const target = e.target as HTMLDivElement;
    const dayKey = day.toISOString();

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

  return (
    <>
      <ViewEventModal
        isOpen={isOpen}
        eventId={selectedEventId}
        isClosed={() => setIsOpen(false)}
      />
      <div
        className="flex-1 overflow-y-auto relative"
        style={{ minHeight: "100%" }}
      >
        <div className="grid grid-cols-7 gap-px bg-gray-200 ">
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
              className="relative hover:bg-gray-50 cursor-pointer bg-gray-100 opacity-50"
              style={{ height: "18vh" }}
              onClick={() => onDateClick(day)}
            >
              <div className="absolute top-2 right-2">
                <time
                  dateTime={day.toISOString()}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-sm text-gray-500"
                >
                  {day.getDate()}
                </time>
              </div>
              <div className="absolute top-10 left-1 right-1 flex flex-col gap-1 overflow-y-auto max-h-[calc(18vh-40px)]">
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
                      <div className="truncate">{event.EventTitle}</div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={`relative hover:bg-gray-50 cursor-pointer ${
                day < today ? "bg-gray-200" : "bg-white"
              }`}
              style={{ height: "18vh" }}
              onClick={() => onDateClick(day)}
            >
              <div className="absolute top-2 right-2">
                <time
                  dateTime={day.toISOString()}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                    day.toDateString() === today.toDateString()
                      ? "bg-blue-600 font-medium text-white"
                      : "text-gray-900"
                  }`}
                >
                  {day.getDate()}
                </time>
              </div>
              <div
                className="absolute top-10 left-1 right-1 flex flex-col gap-2 overflow-y-auto max-h-[calc(18vh-40px)] py-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-2 relative"
                onWheel={(e) => e.stopPropagation()}
                onScroll={(e) => handleScroll(e, day)}
                ref={(el) => {
                  scrollContainerRefs.current[day.toISOString()] = el;
                }}
              >
                {(() => {
                  const dayEvents = events
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
                    });

                  // Se non ci sono eventi, ritorna null
                  if (dayEvents.length === 0) return null;

                  const maxVisibleEvents = 4; // Numero massimo di eventi da mostrare prima di indicare che ce ne sono altri
                  const hasMoreEvents = dayEvents.length > maxVisibleEvents;
                  const dayKey = day.toISOString();

                  return (
                    <>
                      {/* Freccia per scorrere verso l'alto */}
                      {scrolledToBottom[dayKey] && !scrolledToTop[dayKey] && (
                        <div
                          className={`sticky top-0 left-0 right-0 bg-gradient-to-b ${
                            day < today
                              ? "from-gray-200 via-gray-200"
                              : "from-white via-white"
                          } to-transparent pt-1 pb-5 -mb-6 flex justify-center items-center text-[10px] font-medium text-gray-600 cursor-pointer z-10`}
                          onClick={(e) => scrollToTop(dayKey, e)}
                          title="Torna all'inizio"
                        >
                          <div className="flex items-center px-1.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm transition-colors">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}

                      {dayEvents.map((event, index) => {
                        // Controllo se l'evento inizia nello stesso giorno
                        const isStartDay =
                          day.toDateString() ===
                          new Date(event.EventStartDate).toDateString();
                        // Controllo se l'evento finisce nello stesso giorno
                        const isEndDay =
                          day.toDateString() ===
                          new Date(event.EventEndDate).toDateString();
                        // Controllo se è un evento che dura tutto il giorno
                        const isAllDay =
                          event.EventStartTime === "00:00" &&
                          event.EventEndTime === "00:00";

                        // Calcolo la luminosità del colore per determinare se usare testo chiaro o scuro
                        const color = event.EventColor;
                        const r = parseInt(color.slice(1, 3), 16);
                        const g = parseInt(color.slice(3, 5), 16);
                        const b = parseInt(color.slice(5, 7), 16);
                        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                        const textColor =
                          brightness > 128 ? "#333333" : "#ffffff";

                        return (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(true && event.EventColor !== "#000000");
                              setSelectedEventId(event.EventId);
                            }}
                            key={event.EventId}
                            className={`flex items-center gap-1.5 px-2 rounded-lg shadow-sm transition-all duration-200 text-xs backdrop-blur-sm relative overflow-hidden group cursor-pointer`}
                            style={{
                              backgroundColor: `${event.EventColor}${
                                isAllDay ? "cc" : "99"
                              }`,
                              color: textColor,
                              transform: "scale(0.98)",
                              transformOrigin: "left center",
                              animationDelay: `${index * 0.05}s`,
                              minHeight: "28px",
                              paddingTop: "7px",
                              paddingBottom: "7px",
                            }}
                            title={`${event.EventTitle}\n${
                              event.EventDescription
                                ? event.EventDescription
                                : ""
                            }\n${
                              event.EventLocation
                                ? "Dove: " + event.EventLocation
                                : ""
                            }`}
                          >
                            {/* Indicatore laterale di evento */}
                            <div
                              className={`absolute left-0 top-0 bottom-0 w-1 ${
                                isStartDay && isEndDay
                                  ? "rounded-l"
                                  : isStartDay
                                  ? "rounded-tl"
                                  : isEndDay
                                  ? "rounded-bl"
                                  : ""
                              }`}
                              style={{ backgroundColor: event.EventColor }}
                            />

                            {/* Icona per tipo di evento (tutto il giorno o orario) */}
                            {isAllDay ? (
                              <svg
                                className="w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:rotate-12"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:rotate-12"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}

                            {/* Titolo e orario dell'evento */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate group-hover:underline decoration-1 underline-offset-2">
                                {event.EventTitle}
                              </div>
                              {!isAllDay && (
                                <div className="text-[10px] opacity-90">
                                  {isStartDay ? event.EventStartTime : ""}
                                  {isStartDay && isEndDay ? " - " : ""}
                                  {isEndDay ? event.EventEndTime : ""}
                                </div>
                              )}
                            </div>

                            {/* Indicatori per evento che si estende su più giorni */}
                            {!isStartDay && (
                              <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 text-[8px] text-white">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                            {!isEndDay && (
                              <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 text-[8px] text-white">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}

                            {/* Effetto hover */}
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded-lg" />
                          </div>
                        );
                      })}

                      {/* Indicatore per eventi aggiuntivi */}
                      {hasMoreEvents && !scrolledToBottom[dayKey] && (
                        <div
                          className={`sticky bottom-0 left-0 right-0 bg-gradient-to-t ${
                            day < today
                              ? "from-gray-200 via-gray-200"
                              : "from-white via-white"
                          } to-transparent pt-5 pb-1 -mt-6 flex justify-center items-center text-[10px] font-medium text-gray-600 cursor-pointer z-10`}
                          onClick={(e) => scrollToBottom(dayKey, e)}
                          title={`${dayEvents.length} eventi totali`}
                        >
                          <div className="flex items-center px-1.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm transition-colors">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
          {nextMonthDays.map((day) => (
            <div
              key={day.toISOString()}
              className="relative hover:bg-gray-50 cursor-pointer bg-gray-100 opacity-50"
              style={{ height: "18vh" }}
              onClick={() => onDateClick(day)}
            >
              <div className="absolute top-2 right-2">
                <time
                  dateTime={day.toISOString()}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-sm text-gray-500"
                >
                  {day.getDate()}
                </time>
              </div>
              <div className="absolute top-10 left-1 right-1 flex flex-col gap-1.5 overflow-y-auto max-h-[calc(18vh-40px)]">
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
                  .map((event, index) => {
                    // Controllo se l'evento inizia nello stesso giorno
                    const isStartDay =
                      day.toDateString() ===
                      new Date(event.EventStartDate).toDateString();
                    // Controllo se l'evento finisce nello stesso giorno
                    const isEndDay =
                      day.toDateString() ===
                      new Date(event.EventEndDate).toDateString();
                    // Controllo se è un evento che dura tutto il giorno
                    const isAllDay =
                      event.EventStartTime === "00:00" &&
                      event.EventEndTime === "00:00";

                    // Calcolo la luminosità del colore per determinare se usare testo chiaro o scuro
                    const color = event.EventColor;
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                    const textColor = brightness > 128 ? "#333333" : "#ffffff";

                    return (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(true && event.EventColor !== "#000000");
                          setSelectedEventId(event.EventId);
                        }}
                        key={event.EventId}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg shadow-sm transition-all duration-200 text-xs backdrop-blur-sm relative overflow-hidden group cursor-pointer`}
                        style={{
                          backgroundColor: `${event.EventColor}${
                            isAllDay ? "cc" : "99"
                          }`,
                          color: textColor,
                          transform: "scale(0.98)",
                          transformOrigin: "left center",
                          animationDelay: `${index * 0.05}s`,
                        }}
                        title={`${event.EventTitle}\n${
                          event.EventDescription ? event.EventDescription : ""
                        }\n${
                          event.EventLocation
                            ? "Dove: " + event.EventLocation
                            : ""
                        }`}
                      >
                        {/* Indicatore laterale di evento */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${
                            isStartDay && isEndDay
                              ? "rounded-l"
                              : isStartDay
                              ? "rounded-tl"
                              : isEndDay
                              ? "rounded-bl"
                              : ""
                          }`}
                          style={{ backgroundColor: event.EventColor }}
                        />

                        {/* Icona per tipo di evento (tutto il giorno o orario) */}
                        {isAllDay ? (
                          <svg
                            className="w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:rotate-12"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:rotate-12"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}

                        {/* Titolo e orario dell'evento */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate group-hover:underline decoration-1 underline-offset-2">
                            {event.EventTitle}
                          </div>
                          {!isAllDay && (
                            <div className="text-[10px] opacity-90">
                              {isStartDay ? event.EventStartTime : ""}
                              {isStartDay && isEndDay ? " - " : ""}
                              {isEndDay ? event.EventEndTime : ""}
                            </div>
                          )}
                        </div>

                        {/* Indicatori per evento che si estende su più giorni */}
                        {!isStartDay && (
                          <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 text-[8px] text-white">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        {!isEndDay && (
                          <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 text-[8px] text-white">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}

                        {/* Effetto hover */}
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded-lg" />
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

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
