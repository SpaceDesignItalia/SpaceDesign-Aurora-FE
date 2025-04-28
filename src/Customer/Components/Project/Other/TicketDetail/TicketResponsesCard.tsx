import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { Card, Button, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";
import StatusAlert from "../../../Layout/StatusAlert";

interface TicketResponse {
  ProjectTicketResponseId: number;
  ProjectTicketResponseText: string;
  ProjectTicketResponseCreationDate: string;
  ProjectTicketId: number;
  EmployeeId: number | null;
  CustomerId: number | null;
  ResponderName: string;
  ResponderImageUrl: string | null;
  IsEmployee: boolean;
}

interface TicketResponsesCardProps {
  ticketId: number;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

const ALERTDATA: AlertData = {
  isOpen: false,
  alertTitle: "",
  alertDescription: "",
  alertColor: "",
};

export default function TicketResponsesCard({
  ticketId,
}: TicketResponsesCardProps) {
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [newResponse, setNewResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alertData, setAlertData] = useState<AlertData>(ALERTDATA);

  useEffect(() => {
    fetchResponses();
  }, [ticketId]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/Ticket/GET/GetTicketResponses", {
        params: { ProjectTicketId: ticketId },
      });
      setResponses(response.data || []);
    } catch (error) {
      console.error("Errore durante il recupero delle risposte:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e: FormEvent) => {
    e.preventDefault();

    if (!newResponse.trim()) return;

    try {
      setSubmitting(true);
      const response = await axios.post(
        "/Ticket/POST/AddTicketResponse",
        {
          ProjectTicketId: ticketId,
          ProjectTicketResponseText: newResponse,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setNewResponse("");
        await fetchResponses();
        setAlertData({
          isOpen: true,
          alertTitle: "Risposta inviata",
          alertDescription: "La tua risposta è stata inviata con successo.",
          alertColor: "green",
        });
      }
    } catch (error) {
      console.error("Errore durante l'invio della risposta:", error);
      setAlertData({
        isOpen: true,
        alertTitle: "Errore",
        alertDescription:
          "Si è verificato un errore durante l'invio della risposta.",
        alertColor: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 rounded-xl border-none shadow bg-white overflow-hidden">
      <StatusAlert AlertData={alertData} />

      <div className="flex items-center gap-2 mb-6">
        <div className="bg-blue-100 p-1.5 rounded-full">
          <Icon
            icon="mdi:comment-text-outline"
            className="text-blue-600 text-xl"
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Risposte</h2>
      </div>

      <div className="space-y-6 mb-8">
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Caricamento risposte...</p>
          </div>
        ) : responses.length > 0 ? (
          responses.map((response) => (
            <div
              key={response.ProjectTicketResponseId}
              className={`flex gap-4 ${
                response.IsEmployee ? "bg-blue-50" : "bg-gray-50"
              } p-4 rounded-lg`}
            >
              <div className="flex-shrink-0">
                {response.ResponderImageUrl ? (
                  <img
                    src={response.ResponderImageUrl}
                    alt={response.ResponderName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Icon icon="ph:user" className="text-gray-500 text-xl" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                  <p className="font-semibold text-gray-800">
                    {response.ResponderName}
                    {response.IsEmployee && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Staff
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(
                      response.ProjectTicketResponseCreationDate
                    ).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {response.ProjectTicketResponseText}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Icon
              icon="ph:chats-teardrop"
              className="mx-auto mb-2 text-3xl text-gray-400"
            />
            <p>Non ci sono ancora risposte a questo ticket</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium mb-4">Aggiungi una risposta</h3>
        <form onSubmit={handleSubmitResponse}>
          <Textarea
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
            placeholder="Scrivi la tua risposta..."
            minRows={3}
            maxRows={8}
            className="w-full mb-4"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              isLoading={submitting}
              isDisabled={!newResponse.trim() || submitting}
            >
              Invia risposta
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
