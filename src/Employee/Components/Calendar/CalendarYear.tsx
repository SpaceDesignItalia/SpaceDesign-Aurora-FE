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

interface CalendarYearProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onMonthClick: (date: Date) => void;
}

const CalendarYear: React.FC<CalendarYearProps> = ({
  currentDate,
  onDateClick,
  onMonthClick,
}) => {
  const year = currentDate.getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex-1 overflow-y-auto" style={{ minHeight: "100%" }}>
      <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 p-6">
        {MONTHS.map((month, monthIndex) => (
          <div
            key={month}
            className={`p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100`}
            onClick={() => onMonthClick(new Date(year, monthIndex, 1))}
          >
            <h3 className="text-lg font-semibold text-center mb-4  rounded-full">
              {month}
            </h3>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-600 flex items-center justify-center h-8"
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
                return (
                  <div
                    key={day}
                    className={`h-8 text-center rounded-full text-gray-900 relative cursor-pointer hover:bg-gray-300 ${
                      isToday ? "bg-blue-600 text-white" : ""
                    } flex items-center justify-center`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick(currentDay);
                    }}
                  >
                    {isToday && (
                      <div className="absolute left-0 w-full h-full flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
                        {day}
                      </div>
                    )}
                    {!isToday && <span>{day}</span>}
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
