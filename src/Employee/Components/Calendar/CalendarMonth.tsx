import React, { useState } from "react";
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
                  .map((event) => (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true);
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
              <div className="absolute top-10 left-1 right-1 flex flex-col gap-1 overflow-y-auto max-h-[calc(18vh-40px)]">
                {events
                  .filter(
                    (event) =>
                      day >= new Date(event.EventStartDate) &&
                      day <= new Date(event.EventEndDate)
                  )
                  .map((event) => (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true);
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
              <div className="absolute top-10 left-1 right-1 flex flex-col gap-1 overflow-y-auto max-h-[calc(18vh-40px)]">
                {events
                  .filter(
                    (event) =>
                      day >= new Date(event.EventStartDate) &&
                      day <= new Date(event.EventEndDate)
                  )
                  .map((event) => (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true);
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
        </div>
      </div>
    </>
  );
};

export default CalendarMonth;
