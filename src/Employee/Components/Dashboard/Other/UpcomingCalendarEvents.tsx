import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import axios from "axios";
import ViewEventModal from "../../../Components/Calendar/ViewEventModal";

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
}

export default function UpcomingCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number>(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`Calendar/GET/GetEventsByEmail`);
      // Ordina gli eventi per data e ora di inizio
      const sortedEvents = res.data
        .map((event: CalendarEvent) => {
          // Convertiamo la data nel formato corretto
          const startDate = new Date(event.EventStartDate);
          // Aggiungiamo le ore e i minuti dalla EventStartTime
          const [hours, minutes] = event.EventStartTime.split(":").map(Number);
          startDate.setHours(hours, minutes);

          return {
            ...event,
            fullDate: startDate,
            // Convertiamo anche EventStartDate in un formato gestibile
            EventStartDate: startDate,
          };
        })
        .filter((event: CalendarEvent & { fullDate: Date }) => {
          return event.fullDate > new Date();
        })
        .sort(
          (
            a: CalendarEvent & { fullDate: Date },
            b: CalendarEvent & { fullDate: Date }
          ) => {
            return a.fullDate.getTime() - b.fullDate.getTime();
          }
        )
        .slice(0, 4)
        .map(({ fullDate, ...event }: CalendarEvent & { fullDate: Date }) => ({
          ...event,
          EventStartDate: event.EventStartDate,
        }));

      setEvents(sortedEvents);
    } catch (error) {
      console.error(error);
    }
  };

  const formatEventDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = new Date(date);

    // Resettiamo le ore per confrontare solo le date
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return "Oggi";
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      return "Domani";
    }
    return dayjs(date).format("DD MMMM YYYY");
  };

  return (
    <>
      <ViewEventModal
        isOpen={isOpen}
        eventId={selectedEventId}
        isClosed={() => setIsOpen(false)}
      />

      <Card className="h-fit shadow-none border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">Prossimi eventi</h3>
            <p className="text-sm text-gray-500">
              I tuoi prossimi appuntamenti
            </p>
          </div>
        </CardHeader>
        <CardBody className="p-2">
          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.EventId}
                  onClick={() => {
                    setSelectedEventId(event.EventId);
                    setIsOpen(true);
                  }}
                  className="group relative flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {event.EventTitle}
                      </p>
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: event.EventColor }}
                      />
                    </div>
                    <div className="mt-1 flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Icon
                          icon="material-symbols:schedule"
                          className="h-4 w-4 text-gray-500"
                        />
                        <p className="text-xs text-gray-500">
                          {event.EventStartTime} - {event.EventEndTime}
                        </p>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center space-x-1">
                        <Icon
                          icon="material-symbols:calendar-today"
                          className="h-4 w-4 text-gray-500"
                        />
                        <p className="text-xs text-gray-500">
                          {formatEventDate(event.EventStartDate)}
                        </p>
                      </div>
                    </div>
                    {event.EventLocation && (
                      <div className="mt-1 flex items-center space-x-1">
                        <Icon
                          icon="material-symbols:location-on"
                          className="h-4 w-4 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 italic truncate">
                          {event.EventLocation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Icon icon="solar:calendar-linear" className="h-12 w-12 mb-2" />
                <p>Nessun evento in programma</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </>
  );
}
