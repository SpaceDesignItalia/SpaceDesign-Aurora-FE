import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Icon } from "@iconify/react";
import { Breadcrumbs, BreadcrumbItem, Chip } from "@heroui/react";
import TicketDetailCard from "../../Components/Project/Other/TicketDetail/TicketDetailCard";

// Creo un componente temporaneo in attesa della versione definitiva
const TicketResponsesCard = ({ ticketId }: { ticketId: number }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Risposte al ticket</h3>
      <p className="text-gray-500">Caricamento risposte...</p>
    </div>
  );
};

interface Ticket {
  ProjectTicketId: number;
  ProjectTicketTitle: string;
  ProjectTicketDescription: string;
  ProjectTicketCreationDate: string;
  ProjectTicketCompletedDate: string | null;
  CustomerId: number;
  ProjectId: number;
  TicketRequestTypeId: number;
  TicketRequestName: string;
  TicketStatusId: number;
  TicketStatusName: string;
  CompanyId?: number;
  ProjectName?: string;
  UniqueCode?: string;
}

export default function TicketDetailPage() {
  const { ProjectId, TicketId, ProjectName, CompanyId, UniqueCode } =
    useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<any>(null);
  const [projectUniqueCode, setProjectUniqueCode] = useState<string>("");
  const [projectData, setProjectData] = useState<{
    ProjectName: string;
    ProjectId: number;
    CompanyId: number;
  } | null>(null);

  useEffect(() => {
    // Imposta immediatamente l'UniqueCode se disponibile nei parametri URL
    if (UniqueCode) {
      setProjectUniqueCode(UniqueCode);

      // Ottieni i dati del progetto tramite UniqueCode
      fetchProjectData(UniqueCode);
    } else if (ProjectName) {
      // Se stiamo usando il vecchio formato URL, imposta i dati del progetto direttamente
      setProjectData({
        ProjectName: ProjectName,
        ProjectId: Number(ProjectId),
        CompanyId: Number(CompanyId),
      });
    }

    // Prima recupera i dati dell'utente per ottenere il CustomerId
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/Authentication/GET/GetSessionData", {
          withCredentials: true,
        });
        console.log("Dati utente:", response.data);
        setUserData(response.data);

        // Una volta ottenuti i dati utente, recupera i ticket
        if (response.data && response.data.CustomerId) {
          fetchTicketData(response.data.CustomerId);
        }
      } catch (error) {
        console.error("Errore durante il recupero dei dati utente:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [TicketId, UniqueCode, ProjectId, ProjectName, CompanyId]);

  // Funzione per recuperare i dati del progetto tramite UniqueCode
  const fetchProjectData = async (uniqueCode: string) => {
    try {
      const response = await axios.get("/Project/GET/GetProjectByUniqueCode", {
        params: { UniqueCode: uniqueCode },
      });

      if (response.data) {
        console.log("Dati progetto recuperati:", response.data);
        setProjectData({
          ProjectName: response.data.ProjectName,
          ProjectId: response.data.ProjectId,
          CompanyId: response.data.CompanyId,
        });
      }
    } catch (error) {
      console.error("Errore durante il recupero dei dati del progetto:", error);
    }
  };

  const fetchTicketData = async (customerId: number) => {
    try {
      // Utilizziamo GetTicketFromCustomer con il CustomerId richiesto
      const response = await axios.get("/Project/GET/GetTicketFromCustomer", {
        withCredentials: true,
        params: {
          CustomerId: customerId,
        },
      });

      console.log("Risposta API GetTicketFromCustomer:", response.data);

      if (response.data && Array.isArray(response.data)) {
        // Cerca il ticket specifico nell'array di tutti i ticket dell'utente
        const foundTicket = response.data.find(
          (t) => t.ProjectTicketId.toString() === TicketId
        );

        if (foundTicket) {
          const ticketData = {
            ...foundTicket,
            CompanyId,
            ProjectName,
          };
          console.log("Ticket trovato:", ticketData);

          // Utilizziamo direttamente l'UniqueCode restituito dalla API
          if (foundTicket.UniqueCode) {
            setProjectUniqueCode(foundTicket.UniqueCode);
          }

          setTicket(ticketData);
        } else {
          console.log("Ticket non trovato nell'elenco dei ticket dell'utente");
          setTicket(null);
        }
      }
    } catch (error) {
      console.error("Errore durante il recupero dei dati del ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  // Esempio di come usare GetTicketFromCustomer (commentato)
  /*
  const fetchTicketsFromCustomer = async () => {
    try {
      const response = await axios.get("/API/v1/Project/GET/GetTicketFromCustomer", {
        withCredentials: true,
        // Questo endpoint sembra richiedere il CustomerId
        // Dovresti passare il CustomerId dell'utente attualmente autenticato
      });
      
      console.log("Ticket dell'utente:", response.data);
      
      // Filtra per trovare il ticket specifico
      const foundTicket = response.data.find(
        (t: any) => t.ProjectTicketId.toString() === TicketId
      );
      
      if (foundTicket) {
        const ticketData = {
          ...foundTicket,
          CompanyId,
          ProjectName,
        };
        setTicket(ticketData);
      }
    } catch (error) {
      console.error("Errore durante il recupero dei ticket:", error);
    }
  };
  */

  return (
    <div className="py-10 m-0">
      <header>
        <div className="flex flex-col gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900">
              Ticket {ticket ? `#${ticket.ProjectTicketId}` : ""}
            </h1>
            {ticket && (
              <Chip
                color={
                  ticket.TicketStatusName === "Aperto"
                    ? "primary"
                    : ticket.TicketStatusName === "In lavorazione"
                    ? "warning"
                    : ticket.TicketStatusName === "Completato"
                    ? "success"
                    : "default"
                }
                variant="flat"
                size="sm"
              >
                {ticket.TicketStatusName}
              </Chip>
            )}
          </div>
          <Breadcrumbs variant="bordered" radius="full">
            <BreadcrumbItem href="/">
              <Icon icon="solar:home-2-linear" fontSize={18} />
            </BreadcrumbItem>
            <BreadcrumbItem href="/projects">Progetti</BreadcrumbItem>
            <BreadcrumbItem
              href={projectUniqueCode ? `/projects/${projectUniqueCode}` : "#"}
            >
              {projectData?.ProjectName || ProjectName || "Progetto"}
            </BreadcrumbItem>
            {ticket && (
              <BreadcrumbItem>Ticket #{ticket.ProjectTicketId}</BreadcrumbItem>
            )}
          </Breadcrumbs>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Caricamento...</p>
            </div>
          ) : ticket ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <TicketDetailCard ticket={ticket} />
                <div className="mt-6">
                  <TicketResponsesCard ticketId={ticket.ProjectTicketId} />
                </div>
              </div>
              <div>
                <div className="sticky top-6">
                  <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Informazioni</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Progetto</p>
                        <p className="font-medium">
                          {projectData?.ProjectName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Tipo di richiesta
                        </p>
                        <p className="font-medium">
                          {ticket.TicketRequestName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Data di apertura
                        </p>
                        <p className="font-medium">
                          {new Date(
                            ticket.ProjectTicketCreationDate
                          ).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {ticket.ProjectTicketCompletedDate && (
                        <div>
                          <p className="text-sm text-gray-500">
                            Data di chiusura
                          </p>
                          <p className="font-medium">
                            {new Date(
                              ticket.ProjectTicketCompletedDate
                            ).toLocaleDateString("it-IT", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                      <div className="pt-4">
                        <Link
                          to={
                            projectUniqueCode
                              ? `/projects/${projectUniqueCode}`
                              : "#"
                          }
                          className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-800"
                        >
                          <Icon icon="mdi:arrow-left" className="text-lg" />
                          Torna al progetto
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Ticket non trovato</p>
              <Link
                to="/"
                className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-violet-600 hover:text-violet-800"
              >
                <Icon icon="mdi:arrow-left" className="text-lg" />
                Torna alla dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
