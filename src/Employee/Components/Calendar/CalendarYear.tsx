import type React from "react";

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
  const year = currentDate.getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasEventsOnDay = (date: Date) => {
    return events.some((event) => {
      const startDate = new Date(event.EventStartDate);
      const endDate = new Date(event.EventEndDate);
      return (
        date >= new Date(startDate.setHours(0, 0, 0, 0)) &&
        date <= new Date(endDate.setHours(0, 0, 0, 0))
      );
    });
  };

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-50"
      style={{ minHeight: "100%" }}
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
                const hasEvents = hasEventsOnDay(currentDay);

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
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick(currentDay);
                    }}
                  >
                    <span className={`${hasEvents ? "font-medium" : ""}`}>
                      {day}
                    </span>
                    {hasEvents && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-0.5 
                        ${isToday ? "bg-white" : "bg-blue-500"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarYear;
