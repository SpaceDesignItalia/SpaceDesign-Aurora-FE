import React from "react";

const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

interface CalendarEvent {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  url: string;
  color?: string;
  description?: string;
  location?: string;
}

const placeholderEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Meeting Progetto A",
    startDate: new Date(2025, 0, 30),
    endDate: new Date(2025, 0, 31),
    startTime: "07:00",
    endTime: "10:30",
    url: "/meetings/1",
    color: "#4F46E5",
    description: "Discussione avanzamento sprint",
    location: "Sala Riunioni A",
  },
  {
    id: 2,
    title: "Review Sprint",
    startDate: new Date(2025, 0, 31),
    endDate: new Date(2025, 0, 31),
    startTime: "14:00",
    endTime: "17:59",
    url: "/meetings/2",
    color: "#059669",
    description: "Review finale sprint gennaio",
    location: "Meeting Room Virtual",
  },
  {
    id: 3,
    title: "Workshop Team",
    startDate: new Date(2025, 0, 31),
    endDate: new Date(2025, 1, 2),
    startTime: "11:00",
    endTime: "17:00",
    url: "/meetings/3",
    color: "#DC2626",
    description: "Workshop formativo nuovo framework",
    location: "Sala Conferenze",
  },
];

interface CalendarMonthProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
}

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  currentDate,
  onDateClick,
}) => {
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
    <div
      className="flex-1 overflow-y-auto relative"
      style={{ minHeight: "100%" }}
    >
      <div className="grid grid-cols-7 gap-px bg-gray-200 ">
        {DAYS.map((day) => (
          <div
            key={day}
            className="bg-white py-2 text-center text-xs font-semibold text-gray-700 uppercase "
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
                    ? "bg-blue-600 font-semibold text-white"
                    : "text-gray-900"
                }`}
              >
                {day.getDate()}
              </time>
            </div>
            <div className="absolute top-10 left-1 right-1 flex flex-col gap-1 overflow-y-auto max-h-[calc(18vh-40px)]">
              {placeholderEvents
                .filter(
                  (event) =>
                    day >= new Date(event.startDate) &&
                    day <= new Date(event.endDate)
                )
                .map((event) => (
                  <a
                    key={event.id}
                    href={event.url}
                    className="flex items-center gap-1 px-1 py-0.5 rounded text-xs hover:bg-gray-100"
                    title={`${event.title}\n${event.description}\nDove: ${event.location}`}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="truncate">{event.title}</div>
                  </a>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarMonth;
