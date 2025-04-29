import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";

interface EventPartecipant {
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
  EventAttachments: EventAttachment[];
  EventPartecipants: EventPartecipant[];
}

interface ViewEventModalProps {
  isOpen: boolean;
  eventId: string;
  isClosed: () => void;
}

const INITIAL_EVENT_DATA: CalendarEvent = {
  EventId: "",
  EventTitle: "",
  EventStartDate: "",
  EventEndDate: "",
  EventStartTime: "",
  EventEndTime: "",
  EventColor: "",
  EventDescription: "",
  EventLocation: "",
  EventTagName: "",
  EventAttachments: [],
  EventPartecipants: [],
};

export default function ViewEventCustomerModal({
  isOpen,
  eventId,
  isClosed,
}: ViewEventModalProps) {
  const [event, setEvent] = useState<CalendarEvent>(INITIAL_EVENT_DATA);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchEvent();
    }
  }, [eventId, isOpen]);

  async function fetchEvent() {
    setIsLoading(true);
    try {
      console.log("Fetching event with ID:", eventId, "Type:", typeof eventId);

      // Prova direttamente con l'ID ricevuto
      const res = await axios.get(`/Calendar/GET/GetEventByEventId`, {
        params: {
          eventId: eventId,
        },
      });

      console.log("Event data received:", res.data);

      if (!res.data || Object.keys(res.data).length === 0) {
        console.error("Empty event data received");
        // Prova a cercare l'evento usando un'altra API che potrebbe funzionare meglio
        try {
          console.log("Trying alternative method to fetch event");
          const allEventsRes = await axios.get(
            "Calendar/GET/GetEventsByEmail",
            {
              params: {
                email: sessionStorage.getItem("email"),
              },
            }
          );

          if (allEventsRes.data && Array.isArray(allEventsRes.data)) {
            console.log("All events received:", allEventsRes.data);
            // Cerca l'evento con l'ID corrispondente
            const foundEvent = allEventsRes.data.find(
              (e: any) =>
                Number(e.EventId) === Number(eventId) ||
                e.EventId === eventId.toString()
            );

            if (foundEvent) {
              console.log("Found event using alternative method:", foundEvent);
              setEvent(foundEvent);
            } else {
              console.error("Event not found in the list of all events");
            }
          }
        } catch (altError) {
          console.error("Error in alternative fetch method:", altError);
        }
      } else {
        // Usa i dati ricevuti dalla prima chiamata se sono validi
        setEvent(res.data);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCloseModal() {
    setEvent(INITIAL_EVENT_DATA);
    isClosed();
  }

  // Funzione per rimuovere tag HTML dal testo
  const stripHtml = (html: string) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  function formatDate(dateString: string) {
    return dayjs(dateString).format("DD MMMM YYYY");
  }

  const userStatus = () => {
    if (!event.EventPartecipants || !event.EventPartecipants.length)
      return null;

    const userEmail = sessionStorage.getItem("email");
    const userPartecipant = event.EventPartecipants.find(
      (p) => p.EventPartecipantEmail === userEmail
    );

    if (!userPartecipant) return null;

    return (
      <Chip
        className="ml-auto"
        color={
          userPartecipant.EventPartecipantStatus === "Accettato"
            ? "success"
            : userPartecipant.EventPartecipantStatus === "Rifiutato"
            ? "danger"
            : "warning"
        }
      >
        {userPartecipant.EventPartecipantStatus}
      </Chip>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} size="3xl">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center">
                <div
                  className="h-4 w-4 rounded-full mr-2"
                  style={{ backgroundColor: event.EventColor }}
                />
                <span>{event.EventTitle}</span>
                {userStatus()}
              </div>
            </ModalHeader>
            <ModalBody>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <ScrollShadow className="max-h-[50vh]">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                          Data e Ora
                        </h3>
                        <p className="flex items-center text-gray-700">
                          <Icon
                            icon="solar:calendar-linear"
                            className="mr-2 text-gray-500"
                          />
                          {formatDate(event.EventStartDate)}{" "}
                          {event.EventStartDate !== event.EventEndDate &&
                            ` - ${formatDate(event.EventEndDate)}`}
                        </p>
                        <p className="flex items-center text-gray-700 mt-1">
                          <Icon
                            icon="solar:clock-linear"
                            className="mr-2 text-gray-500"
                          />
                          {event.EventStartTime} - {event.EventEndTime}
                        </p>
                      </div>
                      {event.EventLocation && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">
                            Luogo
                          </h3>
                          <p className="flex items-center text-gray-700">
                            <Icon
                              icon="solar:map-point-linear"
                              className="mr-2 text-gray-500"
                            />
                            {event.EventLocation}
                          </p>
                        </div>
                      )}
                    </div>

                    {event.EventDescription && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                          Descrizione
                        </h3>
                        <div
                          className="text-gray-700 prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: event.EventDescription,
                          }}
                        />
                      </div>
                    )}

                    {event.EventAttachments &&
                      event.EventAttachments.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">
                            Allegati
                          </h3>
                          <div className="space-y-2">
                            {event.EventAttachments.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center p-2 border rounded-lg"
                              >
                                <Icon
                                  icon="solar:file-linear"
                                  className="text-primary h-5 w-5 mr-2"
                                />
                                <a
                                  href={`/API/v1/Calendar/GET/GetEventAttachment?EventAttachmentUrl=${file.EventAttachmentUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-gray-700 hover:text-primary"
                                >
                                  {file.EventAttachmentName}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {event.EventPartecipants &&
                      event.EventPartecipants.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">
                            Partecipanti
                          </h3>
                          <div className="space-y-2">
                            {event.EventPartecipants.map(
                              (participant, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 border rounded-lg"
                                >
                                  <div className="flex items-center">
                                    <Icon
                                      icon="solar:user-linear"
                                      className="text-primary h-5 w-5 mr-2"
                                    />
                                    <span className="text-sm text-gray-700">
                                      {participant.EventPartecipantEmail}
                                    </span>
                                  </div>
                                  <Chip
                                    size="sm"
                                    color={
                                      participant.EventPartecipantStatus ===
                                      "Accettato"
                                        ? "success"
                                        : participant.EventPartecipantStatus ===
                                          "Rifiutato"
                                        ? "danger"
                                        : "warning"
                                    }
                                  >
                                    {participant.EventPartecipantStatus}
                                  </Chip>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </ScrollShadow>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                variant="light"
                onPress={handleCloseModal}
              >
                Chiudi
              </Button>
              <Button
                color="primary"
                onPress={() => (window.location.href = "/calendar")}
              >
                Vai al Calendario
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
