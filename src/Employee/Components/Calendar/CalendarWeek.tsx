import React, { useState, useEffect, useRef } from "react";
import ViewEventModal from "./ViewEventModal";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const ROW_HEIGHT = 60;
const HEADER_HEIGHT = 78;

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

interface CalendarWeekProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  redLineBehavior: string;
  events: CalendarEvent[];
}

const isPastDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const stripHtml = (html: string) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const CalendarWeek: React.FC<CalendarWeekProps> = ({
  currentDate,
  onDateClick,
  redLineBehavior,
  events,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(0);
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
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isCurrentWeek && scrollRef.current) {
      const scrollPosition =
        currentHour * ROW_HEIGHT - window.innerHeight / 2 + HEADER_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, [isCurrentWeek]);

  return (
    <>
      <ViewEventModal
        isOpen={isOpen}
        eventId={selectedEventId}
        isClosed={() => setIsOpen(false)}
      />
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
                <div
                  key={day}
                  className="py-3 text-center font-medium cursor-pointer hover:bg-gray-100 rounded-lg"
                  onClick={() => onDateClick(date)}
                >
                  <span className="block text-lg">{day}</span>
                  <span
                    className={`block text-base font-semibold ${
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
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const dayDate = new Date(startOfWeek);
              dayDate.setDate(startOfWeek.getDate() + dayIndex);
              const isPastDay = isPastDate(dayDate);
              return (
                <div
                  key={dayIndex}
                  className="col-span-1 divide-y divide-gray-100"
                >
                  {HOURS.map((hour) => (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={`group hover:bg-gray-50 relative ${
                        isPastDay ? "bg-gray-100" : ""
                      }`}
                      style={{ height: `${ROW_HEIGHT}px` }}
                    >
                      {(() => {
                        const eventsAtThisHour = events.filter((event) => {
                          const eventStartDate = new Date(event.EventStartDate);
                          const eventEndDate = new Date(event.EventEndDate);
                          const eventStartHour = parseInt(
                            event.EventStartTime.split(":")[0]
                          );

                          const isMiddleDay =
                            dayDate.toDateString() !==
                              eventStartDate.toDateString() &&
                            dayDate.toDateString() !==
                              eventEndDate.toDateString() &&
                            dayDate >= eventStartDate &&
                            dayDate <= eventEndDate;

                          if (isMiddleDay) {
                            return hour === 0;
                          }

                          if (
                            dayDate.toDateString() ===
                            eventStartDate.toDateString()
                          ) {
                            return Math.floor(eventStartHour) === hour;
                          }

                          if (
                            dayDate.toDateString() ===
                            eventEndDate.toDateString()
                          ) {
                            return hour === 0;
                          }

                          return false;
                        });

                        const width =
                          eventsAtThisHour.length > 1
                            ? 100 / eventsAtThisHour.length
                            : 100;

                        return eventsAtThisHour.map((event, index) => {
                          const eventStartDate = new Date(event.EventStartDate);
                          const eventEndDate = new Date(event.EventEndDate);
                          const eventStartHour = parseInt(
                            event.EventStartTime.split(":")[0]
                          );
                          const eventEndHour = parseInt(
                            event.EventEndTime.split(":")[0]
                          );
                          const eventStartMinutes = parseInt(
                            event.EventStartTime.split(":")[1]
                          );
                          const eventEndMinutes = parseInt(
                            event.EventEndTime.split(":")[1]
                          );

                          let duration = 0;
                          let topOffset = 0;

                          if (
                            dayDate.toDateString() ===
                            eventStartDate.toDateString()
                          ) {
                            if (
                              eventStartDate.toDateString() ===
                              eventEndDate.toDateString()
                            ) {
                              duration =
                                eventEndHour +
                                eventEndMinutes / 60 -
                                (eventStartHour + eventStartMinutes / 60);
                              topOffset = (eventStartMinutes / 60) * ROW_HEIGHT;
                            } else {
                              duration =
                                24 - (eventStartHour + eventStartMinutes / 60);
                              topOffset = (eventStartMinutes / 60) * ROW_HEIGHT;
                            }
                          } else if (
                            dayDate.toDateString() ===
                            eventEndDate.toDateString()
                          ) {
                            duration = eventEndHour + eventEndMinutes / 60;
                            topOffset = 0; // Inizia a mezzanotte
                          } else {
                            duration = 24;
                            topOffset = 0; // Inizia a mezzanotte
                          }

                          return (
                            <div
                              key={event.EventId}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(true);
                                setSelectedEventId(event.EventId);
                              }}
                              className="absolute mx-1 rounded-lg p-2 text-xs opacity-70 hover:opacity-90 transition-opacity cursor-pointer"
                              style={{
                                backgroundColor: event.EventColor,
                                color: "white",
                                zIndex: 10,
                                height: `${duration * ROW_HEIGHT}px`,
                                top: `${topOffset}px`,
                                overflow: "hidden",
                                width: `${width}%`,
                                left: index * (width + 2) + "%",
                              }}
                              title={`${stripHtml(
                                event.EventDescription
                              )}\nDove: ${event.EventLocation}`}
                            >
                              <div className="font-medium">
                                {event.EventTitle}
                              </div>
                              <div className="text-xs opacity-90">
                                {(() => {
                                  if (
                                    dayDate.toDateString() ===
                                    eventStartDate.toDateString()
                                  ) {
                                    if (
                                      eventStartDate.toDateString() ===
                                      eventEndDate.toDateString()
                                    ) {
                                      return `${event.EventStartTime} - ${event.EventEndTime}`;
                                    }
                                    return `dalle ${event.EventStartTime}`;
                                  } else if (
                                    dayDate.toDateString() ===
                                    eventEndDate.toDateString()
                                  ) {
                                    return `fino alle ${event.EventEndTime}`;
                                  }
                                  return "Tutto il giorno";
                                })()}
                              </div>
                              {width > 50 && (
                                <>
                                  <div className="text-xs mt-1">
                                    {stripHtml(event.EventDescription)}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {event.EventLocation}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ))}
                </div>
              );
            })}
            {(redLineBehavior === "always" ||
              redLineBehavior === "full-week" ||
              isCurrentWeek) && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{
                  top: `${currentHour * ROW_HEIGHT}px`,
                }}
              >
                <div
                  className="border-t-2 border-red-500 relative"
                  style={{
                    width:
                      redLineBehavior === "full-week"
                        ? "100%"
                        : `calc(${(currentDayIndex + 1) * 12.5}%)`,
                    marginLeft:
                      redLineBehavior === "full-week" ? "12.5%" : "12.5%",
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
    </>
  );
};

export default CalendarWeek;
