import { Button, Badge, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";

interface TicketProps {
  ProjectTicketId: string;
  ProjectTicketTitle: string;
  ProjectTicketDescription: string;
  ProjectTicketCreationDate: string;
  TicketStatusId: string;
  TicketRequestTypeId: string;
  ProjectId: string;
  ProjectTaskId?: string | null;
  CustomerId?: string;
  ProjectTicketCompletedDate?: string | null;
  CompanyId?: string;
  ProjectName?: string;
}

export default function ActiveTicketsCard({
  tickets = [],
  projectData,
}: {
  tickets: TicketProps[];
  projectData?: { CompanyId: string; ProjectName: string };
}) {
  // Funzione per determinare il colore del badge in base allo stato del ticket
  const getStatusColor = (statusId: string) => {
    switch (statusId) {
      case "1": // Aperto
        return "primary";
      case "2": // In Corso
        return "primary";
      case "3": // In Attesa
        return "warning";
      case "4": // Risolto
        return "success";
      case "5": // Chiuso
        return "default";
      case "6": // Annullato
        return "danger";
      case "7": // Riaperto
        return "warning";
      case "8": // In attesa del Project Manager
        return "warning";
      case "9": // In attesa di Terzi
        return "warning";
      case "10": // Scalato
        return "danger";
      default:
        return "default";
    }
  };

  // Funzione per ottenere il testo dello stato
  const getStatusText = (statusId: string) => {
    switch (statusId) {
      case "1":
        return "Aperto";
      case "2":
        return "In Corso";
      case "3":
        return "In Attesa";
      case "4":
        return "Risolto";
      case "5":
        return "Chiuso";
      case "6":
        return "Annullato";
      case "7":
        return "Riaperto";
      case "8":
        return "In attesa del PM";
      case "9":
        return "In attesa di Terzi";
      case "10":
        return "Scalato";
      default:
        return "Stato sconosciuto";
    }
  };

  // Funzione per determinare l'icona del tipo di richiesta
  const getRequestTypeIcon = (typeId: string) => {
    switch (typeId) {
      case "1": // Segnalazione problemi
        return "solar:danger-triangle-linear";
      case "2": // Segnalazione bug
        return "solar:bug-linear";
      case "3": // Supporto tecnico
        return "solar:settings-linear";
      case "4": // Manutenzione
        return "solar:wrench-linear";
      case "5": // Nuova funzionalità
        return "solar:add-square-linear";
      case "6": // Aiuto uso software
        return "solar:question-circle-linear";
      case "7": // Richiesta accesso
        return "solar:lock-keyhole-linear";
      case "8": // Aggiornamento
        return "solar:refresh-linear";
      case "9": // Modifiche software
        return "solar:pen-2-linear";
      case "10": // Permessi accesso
        return "solar:key-linear";
      case "11": // Assistenza account
        return "solar:user-broken-linear";
      case "12": // Installazione
        return "solar:installation-linear";
      case "13": // Trasferimento dati
        return "solar:server-path-linear";
      case "14": // Formazione
        return "solar:graduation-cap-linear";
      default:
        return "solar:question-circle-linear";
    }
  };

  // Funzione per determinare il tipo di richiesta
  const getRequestType = (typeId: string) => {
    switch (typeId) {
      case "1":
        return "Segnalazione problemi";
      case "2":
        return "Segnalazione bug";
      case "3":
        return "Supporto tecnico";
      case "4":
        return "Manutenzione";
      case "5":
        return "Nuova funzionalità";
      case "6":
        return "Aiuto uso software";
      case "7":
        return "Richiesta accesso";
      case "8":
        return "Aggiornamento";
      case "9":
        return "Modifiche software";
      case "10":
        return "Permessi accesso";
      case "11":
        return "Assistenza account";
      case "12":
        return "Installazione";
      case "13":
        return "Trasferimento dati";
      case "14":
        return "Formazione";
      default:
        return "Altro";
    }
  };

  return (
    <div className="border border-gray-200 h-full rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
          Ticket Attivi
        </h1>
        <div className="bg-primary/10 p-2 rounded-full">
          <Icon icon="solar:ticket-linear" className="text-primary text-xl" />
        </div>
      </div>

      <div className="space-y-5">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div
              key={ticket.ProjectTicketId}
              className="transition-all duration-300 hover:translate-x-1 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center border-l-4 border border-gray-200 px-5 py-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md"
              style={{
                borderLeftColor:
                  ticket.TicketStatusId === "1" || ticket.TicketStatusId === "2"
                    ? "#0090FF"
                    : ticket.TicketStatusId === "3" ||
                      ticket.TicketStatusId === "7" ||
                      ticket.TicketStatusId === "8" ||
                      ticket.TicketStatusId === "9"
                    ? "#FFB800"
                    : ticket.TicketStatusId === "4"
                    ? "#10B981"
                    : ticket.TicketStatusId === "6" ||
                      ticket.TicketStatusId === "10"
                    ? "#FF4D4D"
                    : "#94A3B8",
              }}
            >
              <div className="flex flex-col gap-3 text-left w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-md sm:text-lg font-medium text-gray-800">
                    {ticket.ProjectTicketTitle}
                  </h2>
                  <Badge
                    color={getStatusColor(ticket.TicketStatusId)}
                    variant="solid"
                    size="sm"
                    className="font-medium"
                  >
                    {getStatusText(ticket.TicketStatusId)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <Tooltip content={getRequestType(ticket.TicketRequestTypeId)}>
                    <div className="flex items-center gap-1">
                      <Icon
                        icon={getRequestTypeIcon(ticket.TicketRequestTypeId)}
                        className="text-primary text-lg"
                      />
                      <span className="hidden md:inline-block">
                        {getRequestType(ticket.TicketRequestTypeId)}
                      </span>
                    </div>
                  </Tooltip>

                  <div className="flex items-center gap-1">
                    <Icon icon="solar:clock-linear" className="text-gray-500" />
                    <span>
                      {dayjs(ticket.ProjectTicketCreationDate).format(
                        "DD MMM YYYY"
                      )}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 pr-4">
                  {ticket.ProjectTicketDescription}
                </p>
              </div>
              <Button
                color="primary"
                radius="full"
                size="sm"
                className="px-6 py-2 font-medium shadow-sm hover:shadow transition-all duration-300 min-w-[140px] self-end sm:self-center mt-2 sm:mt-0"
                endContent={<Icon icon="solar:arrow-right-linear" />}
                href={
                  "/projects/" +
                  (ticket.CompanyId ||
                    (projectData && projectData.CompanyId) ||
                    "") +
                  "/" +
                  ticket.ProjectId +
                  "/" +
                  (ticket.ProjectName ||
                    (projectData && projectData.ProjectName) ||
                    "") +
                  "/ticket/" +
                  ticket.ProjectTicketId
                }
                as="a"
              >
                Dettagli
              </Button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Icon
                icon="solar:ticket-linear"
                className="text-4xl text-gray-400"
              />
            </div>
            <p className="text-lg">Nessun ticket attivo</p>
            <p className="text-sm text-gray-400 mt-1">
              I tuoi ticket appariranno qui
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
