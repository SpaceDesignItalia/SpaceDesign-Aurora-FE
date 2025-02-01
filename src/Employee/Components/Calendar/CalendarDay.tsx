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
      <div
        className="flex flex-col h-full overflow-hidden relative"
        style={{ minHeight: "100%" }}
      >
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="grid grid-cols-8 divide-x divide-gray-100 relative">
            <div className="col-span-2 divide-y divide-gray-100">
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
            <div className="col-span-6 divide-y divide-gray-100">
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
                      const eventHour = parseInt(
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
                        return eventHour === hour;
                      }

                      if (
                        currentDate.toDateString() ===
                        eventEndDate.toDateString()
                      ) {
                        return hour === 0;
                      }

                      return false;
                    });

                    const width = eventsAtThisHour.length > 1 ? 50 : 100;

                    return eventsAtThisHour.map((event, index) => {
                      const eventStartDate = new Date(event.EventStartDate);
                      const eventEndDate = new Date(event.EventEndDate);
                      const eventHour = parseInt(
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
                            (eventHour + eventStartMinutes / 60);
                        } else {
                          duration = 24 - eventHour;
                        }
                      } else if (
                        currentDate.toDateString() ===
                        eventEndDate.toDateString()
                      ) {
                        duration = eventEndHour + eventEndMinutes / 60;
                      } else {
                        duration = 24;
                      }

                      return (
                        <div
                          onClick={() => {
                            setIsOpen(true);
                            setSelectedEventId(event.EventId);
                          }}
                          key={event.EventId}
                          className="absolute mx-1 rounded-lg p-2 text-xs opacity-70 hover:opacity-90 transition-opacity"
                          style={{
                            backgroundColor: event.EventColor,
                            color: "white",
                            zIndex: 10,
                            height: `${duration * ROW_HEIGHT}px`,
                            overflow: "hidden",
                            width: `${width}%`,
                            left: index * (width + 2) + "%",
                          }}
                        >
                          <div className="font-semibold">
                            {event.EventTitle}
                          </div>
                          <div className="text-xs opacity-90">
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
            {(redLineBehavior === "always" || isToday) && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{ top: `${currentHour * ROW_HEIGHT}px` }}
              >
                <div
                  className="border-t-2 border-red-500 relative"
                  style={{
                    width: "100%",
                    marginLeft: "25%",
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
