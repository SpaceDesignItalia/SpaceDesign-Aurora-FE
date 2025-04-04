import axios from "axios";
import { useEffect, useState } from "react";
import UpcomingEventsCard from "../../Components/Dashboard/Other/UpcomingEventsCard";
import ActiveTicketsCard from "../../Components/Dashboard/Other/ActiveTicketsCard";

interface Customer {
  CustomerName: string;
  CustomerSurname: string;
  CustomerId: string;
}

const CUSTOMER_DEFAULT: Customer = {
  CustomerName: "",
  CustomerSurname: "",
  CustomerId: "",
};

interface CustomerStats {
  Leads: number;
  Projects: number;
  Tickets: number;
  ActiveTickets?: TicketData[];
}

interface TicketData {
  ProjectTicketId: string;
  ProjectTicketTitle: string;
  ProjectTicketDescription: string;
  ProjectTicketCreationDate: string;
  ProjectTicketCompletedDate: string | null;
  ProjectId: string;
  ProjectTaskId: string | null;
  CustomerId: string;
  TicketStatusId: string;
  TicketRequestTypeId: string;
  CompanyId?: string;
  ProjectName?: string;
}

export default function DashboardCustomer() {
  const [userData, setUserData] = useState<Customer>(CUSTOMER_DEFAULT);
  const [activeTickets, setActiveTickets] = useState<TicketData[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/Authentication/GET/GetSessionData", {
          withCredentials: true,
        });
        setUserData(response.data);

        // Fetch customer stats once we have user data
        if (response.data.CustomerName && response.data.CustomerSurname) {
          const statsResponse = await axios.get(
            "/Project/GET/GetTicketFromCustomer",
            {
              withCredentials: true,
              params: {
                CustomerId: response.data.CustomerId,
              },
            }
          );

          // Ottieni i ticket dalla risposta
          const tickets = statsResponse.data;

          // Arricchisci i ticket con dati di progetto
          const enrichedTickets = [];

          for (const ticket of tickets) {
            try {
              // Ottieni i dati del progetto associato al ticket
              const projectResponse = await axios.get(
                "/Project/GET/GetProjectByIdAndName",
                {
                  params: {
                    ProjectId: ticket.ProjectId,
                    ProjectName: "", // Lasciamo vuoto perché non conosciamo il nome ma ci serve l'ID
                  },
                }
              );

              // Aggiungi CompanyId e ProjectName al ticket
              if (projectResponse.data) {
                enrichedTickets.push({
                  ...ticket,
                  CompanyId: projectResponse.data.CompanyId || "",
                  ProjectName: projectResponse.data.ProjectName || "",
                });
              } else {
                // Se non ci sono dati di progetto, aggiungi il ticket originale
                enrichedTickets.push(ticket);
              }
            } catch (error) {
              console.error(
                `Errore nel recupero dati del progetto per il ticket ${ticket.ProjectTicketId}:`,
                error
              );
              // Aggiungi il ticket originale in caso di errore
              enrichedTickets.push(ticket);
            }
          }

          setActiveTickets(enrichedTickets);
        }
      } catch (error) {
        console.error("Errore durante il recupero dei dati:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex flex-col gap-5 py-10 m-0">
      <header>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900">
            Ciao, {userData.CustomerName + " " + userData.CustomerSurname} 👋
          </h1>
        </div>
      </header>
      <main className="flex flex-col gap-5 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
          <div className="col-span-1 md:col-span-4">
            <ActiveTicketsCard tickets={activeTickets} />
          </div>

          <div className="col-span-1 md:col-span-2">
            <UpcomingEventsCard />
          </div>
        </div>
      </main>
    </div>
  );
}
