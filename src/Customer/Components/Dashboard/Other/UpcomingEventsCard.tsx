import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import axios from "axios";
import ViewEventCustomerModal from "./ViewEventCustomerModal";

interface CalendarEvent {
  EventId: string;
  EventTitle: string;
  EventStartDate: string;
  EventEndDate: string;
  EventStartTime: string;
  EventEndTime: string;
  EventColor: string;
  EventDescription: string;
  EventLocation: string;
  EventTagName: string;
  EventIsRecurring: boolean;
  EventPartecipantId: string;
  EventPartecipantEmail: string;
  EventPartecipantRole: string;
  EventPartecipantStatus: string;
  EventTagId: string;
}

export default function UpcomingEventsCard() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("Calendar/GET/GetEventsByEmail", {
          withCredentials: true,
          params: {
            email: sessionStorage.getItem("email"),
          },
        });
        console.log("Eventi ricevuti:", response.data);

        if (response.data) {
          // Ottieni la data corrente senza l'ora (solo la data)
          const now = new Date();
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );

          // Filtra gli eventi in corso o futuri e ordina per data
          const upcomingEvents = response.data
            .filter((event: CalendarEvent) => {
              const eventEndDate = new Date(event.EventEndDate);
              // Mostra eventi se la data di fine è oggi o nel futuro
              return eventEndDate >= today;
            })
            .sort(
              (a: CalendarEvent, b: CalendarEvent) =>
                new Date(a.EventStartDate).getTime() -
                new Date(b.EventStartDate).getTime()
            )
            .slice(0, 4); // Prende solo i primi 4 eventi

          console.log("Eventi filtrati:", upcomingEvents);
          setEvents(upcomingEvents);
        }
      } catch (error) {
        console.error("Errore nel caricamento degli eventi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatEventDate = (dateString: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = new Date(dateString);

    // Resettiamo le ore per confrontare solo le date
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return "Oggi";
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      return "Domani";
    }
    return dayjs(dateString).format("DD MMMM YYYY");
  };

  // Funzione per rimuovere tag HTML dal testo
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <>
      <ViewEventCustomerModal
        isOpen={isOpen}
        eventId={selectedEventId}
        isClosed={() => setIsOpen(false)}
      />

      <div className="border-2 h-full rounded-xl p-4 md:p-5 bg-white">
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
              <p>Caricamento eventi...</p>
            </div>
          ) : events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.EventId}
                onClick={() => {
                  setSelectedEventId(event.EventId);
                  setIsOpen(true);
                }}
                className="cursor-pointer flex flex-row justify-between gap-3 lg:flex-row items-center border px-5 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col gap-2 text-center lg:text-left w-full">
                  <div className="flex items-center">
                    <div
                      className="h-3 w-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: event.EventColor }}
                    />
                    <h2 className="text-sm sm:text-md font-medium text-gray-800 truncate">
                      {event.EventTitle}
                    </h2>
                    <div className="ml-auto text-xs bg-gray-200 rounded-full px-2 py-0.5">
                      {event.EventTagName}
                    </div>
                  </div>
                  <p className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Icon
                      icon="solar:clock-linear"
                      className="text-primary flex-shrink-0"
                    />
                    {event.EventStartTime} - {event.EventEndTime} |{" "}
                    {formatEventDate(event.EventStartDate)}
                  </p>
                  {event.EventLocation && (
                    <p className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 italic">
                      <Icon
                        icon="basil:location-outline"
                        className="text-primary flex-shrink-0"
                      />
                      <span className="truncate">{event.EventLocation}</span>
                    </p>
                  )}
                  {event.EventDescription && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {stripHtml(event.EventDescription)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        event.EventPartecipantStatus === "Accettato"
                          ? "bg-green-100 text-green-800"
                          : event.EventPartecipantStatus === "Rifiutato"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {event.EventPartecipantStatus}
                    </span>
                    {event.EventIsRecurring && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Ricorrente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Icon
                icon="fluent:calendar-month-24-filled"
                className="text-blue-600 text-4xl mb-2"
              />
              <p>Nessun evento in arrivo</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
