import React from "react";

// Funzione per ottenere il numero di giorni del mese
const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

function CalendarMonth() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const daysInMonth = getDaysInMonth(year, month);
  const days = [];

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: `${year}-${month < 10 ? `0${month}` : month}-${
        i < 10 ? `0${i}` : i
      }`,
      isCurrentMonth: true,
      isToday: i === currentDate.getDate(),
      events: [],
    });
  }

  const firstDayOfMonth = new Date(year, month - 1, 0).getDay();
  const paddingDays = Array(firstDayOfMonth).fill(null);

  return (
    <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col h-full">
      <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs/6 font-semibold text-gray-700 lg:flex-none">
        <div className="bg-white py-2">
          M<span className="sr-only sm:not-sr-only">on</span>
        </div>
        <div className="bg-white py-2">
          T<span className="sr-only sm:not-sr-only">ue</span>
        </div>
        <div className="bg-white py-2">
          W<span className="sr-only sm:not-sr-only">ed</span>
        </div>
        <div className="bg-white py-2">
          T<span className="sr-only sm:not-sr-only">hu</span>
        </div>
        <div className="bg-white py-2">
          F<span className="sr-only sm:not-sr-only">ri</span>
        </div>
        <div className="bg-white py-2">
          S<span className="sr-only sm:not-sr-only">at</span>
        </div>
        <div className="bg-white py-2">
          S<span className="sr-only sm:not-sr-only">un</span>
        </div>
      </div>
      <div className="flex bg-gray-200 text-xs/6 text-gray-700 lg:flex-auto flex-grow h-full">
        <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px flex-grow">
          {/* Padding per giorni prima del mese */}
          {paddingDays.map((_, index) => (
            <div
              key={index}
              className="relative px-3 py-2 bg-gray-50 text-gray-500"
            ></div>
          ))}

          {/* Giorni del mese */}
          {days.map((day) => (
            <div
              key={day.date}
              className={`relative h-20 px-3 py-2 ${
                day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-500"
              }`}
            >
              <time
                dateTime={day.date}
                className={
                  day.isToday
                    ? "flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white"
                    : undefined
                }
              >
                {day.date.split("-").pop().replace(/^0/, "")}
              </time>
              {day.events.length > 0 && (
                <div className="mt-1 text-xs text-gray-600">
                  {day.events.map((event) => (
                    <div key={event.id} className="flex items-center">
                      {/* Icona oraria (ClockIcon deve essere definito o importato) */}
                      <span className="ml-1">{event.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CalendarMonth;
