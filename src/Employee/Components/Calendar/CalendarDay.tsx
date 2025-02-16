import React, { useState, useEffect, useRef } from "react";
import ViewEventModal from "./ViewEventModal";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
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

interface CalendarDayProps {
  currentDate: Date;
  redLineBehavior: string;
  events: CalendarEvent[];
}

const stripHtml = (html: string) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const CalendarDay: React.FC<CalendarDayProps> = ({
  currentDate,
  redLineBehavior,
  events,
}) => {
  const now = new Date();
  const currentTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Rome" })
  );
  const [currentHour, setCurrentHour] = useState(
    currentTime.getHours() + currentTime.getMinutes() / 60
  );
  const isToday = currentDate.toDateString() === now.toDateString();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const newNow = new Date();
      const newCurrentTime = new Date(
        newNow.toLocaleString("en-US", { timeZone: "Europe/Rome" })
      );
      setCurrentHour(
        newCurrentTime.getHours() + newCurrentTime.getMinutes() / 60
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isToday && scrollRef.current) {
      const scrollPosition =
        currentHour * ROW_HEIGHT - window.innerHeight / 2 + HEADER_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, [isToday]);

  return (
    <>
      <ViewEventModal
        isOpen={isOpen}
        eventId={selectedEventId}
        isClosed={() => setIsOpen(false)}
      />
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-x-hidden" ref={scrollRef}>
          <div className="grid grid-cols-12 divide-x divide-gray-100 relative">
            <div className="col-span-1 divide-y divide-gray-100">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="sticky left-0 bg-white text-center py-3 text-sm leading-5 text-gray-500"
                  style={{ height: `${ROW_HEIGHT}px` }}
                >
                  {`${hour.toString().padStart(2, "0")}:00`}
                </div>
              ))}
            </div>
            <div className="col-span-11 divide-y divide-gray-100">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="group hover:bg-gray-50 relative"
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
                        currentDate.toDateString() !==
                          eventStartDate.toDateString() &&
                        currentDate.toDateString() !==
                          eventEndDate.toDateString() &&
                        currentDate >= eventStartDate &&
                        currentDate <= eventEndDate;

                      if (isMiddleDay) {
                        return hour === 0;
                      }

                      if (
                        currentDate.toDateString() ===
                        eventStartDate.toDateString()
                      ) {
                        return Math.floor(eventStartHour) === hour;
                      }

                      if (
                        currentDate.toDateString() ===
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
                        currentDate.toDateString() ===
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
                        currentDate.toDateString() ===
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
                          onClick={() => {
                            setIsOpen(true);
                            setSelectedEventId(event.EventId);
                          }}
                          key={event.EventId}
                          className="absolute mx-1 rounded-lg p-2 text-sm cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 border border-white/20"
                          style={{
                            backgroundColor: event.EventColor,
                            color: "white",
                            zIndex: 10,
                            height: `${duration * ROW_HEIGHT}px`,
                            top: `${topOffset}px`,
                            width: `${width}%`,
                            left: index * (width + 2) + "%",
                            opacity: 0.95,
                            transform: "scale(0.98)",
                            transition:
                              "transform 0.2s ease-in-out, opacity 0.2s ease-in-out",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.transform = "scale(1.01)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0.95";
                            e.currentTarget.style.transform = "scale(0.98)";
                          }}
                        >
                          <div className="h-full flex flex-col">
                            <div
                              className={`flex flex-col ${
                                duration <= 1.5 ? "h-full justify-center" : ""
                              }`}
                            >
                              <div className="font-semibold text-xs sm:text-sm truncate">
                                {event.EventTitle}
                              </div>
                              <div className="text-xs opacity-90 truncate">
                                {(() => {
                                  if (
                                    currentDate.toDateString() ===
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
                                    currentDate.toDateString() ===
                                    eventEndDate.toDateString()
                                  ) {
                                    return `fino alle ${event.EventEndTime}`;
                                  }
                                  return "Tutto il giorno";
                                })()}
                              </div>
                            </div>

                            {duration > 1.5 && width > 50 && (
                              <div className="mt-1.5 flex-1 min-h-0 flex flex-col">
                                {event.EventDescription && (
                                  <div
                                    className={`text-xs opacity-90 overflow-hidden ${
                                      duration <= 2
                                        ? "line-clamp-1"
                                        : duration <= 3
                                        ? "line-clamp-2"
                                        : duration <= 4
                                        ? "line-clamp-3"
                                        : "line-clamp-4"
                                    }`}
                                  >
                                    {stripHtml(event.EventDescription)}
                                  </div>
                                )}

                                {event.EventLocation && duration > 2 && (
                                  <div className="text-xs mt-1 flex items-start opacity-90">
                                    <svg
                                      className="w-3 h-3 mr-1 mt-0.5 shrink-0"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span
                                      className={`truncate ${
                                        duration <= 3
                                          ? "line-clamp-1"
                                          : "line-clamp-2"
                                      }`}
                                    >
                                      {event.EventLocation}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ))}
            </div>
            {(redLineBehavior === "always" || isToday) && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{ top: `${currentHour * ROW_HEIGHT}px` }}
              >
                <div
                  className="border-t-2 border-red-500 relative"
                  style={{
                    width: "100%",
                    marginLeft: "5.8%",
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
    </>
  );
};

export default CalendarDay;
