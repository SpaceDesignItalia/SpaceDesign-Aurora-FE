import axios from "axios";
import { useEffect, useState } from "react";
import UpcomingEventsCard from "../../Components/Dashboard/Other/UpcomingEventsCard";
import ActiveTicketsCard from "../../Components/Dashboard/Other/ActiveTicketsCard";
import ActiveProjectsCard from "../../Components/Dashboard/Other/ActiveProjectsCard";
import { Icon } from "@iconify/react";
import { Card } from "@heroui/react";

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

interface Project {
  ProjectId: number;
  CompanyName: string;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: string;
  ProjectEndDate: string | null;
  StatusId: number;
  UniqueCode: string;
}

export default function DashboardCustomer() {
  const [userData, setUserData] = useState<Customer>(CUSTOMER_DEFAULT);
  const [activeTickets, setActiveTickets] = useState<TicketData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/Authentication/GET/GetSessionData", {
          withCredentials: true,
        });
        setUserData(response.data);

        // Fetch customer stats once we have user data
        if (response.data.CustomerName && response.data.CustomerSurname) {
          // Ottieni i ticket
          const statsResponse = await axios.get(
            "/Project/GET/GetTicketFromCustomer",
            {
              withCredentials: true,
              params: {
                CustomerId: response.data.CustomerId,
              },
            }
          );

          // Ottieni i progetti
          const projectsResponse = await axios.get(
            "/Project/GET/GetProjectsByCustomerId",
            { withCredentials: true }
          );
          setProjects(projectsResponse.data);

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Filtra progetti attivi e non scaduti
  const activeProjects = projects.filter((project) => {
    const isActiveStatus = [1, 2, 3, 7].includes(Number(project.StatusId));
    const today = new Date();
    const isNotExpired =
      project.ProjectEndDate === null ||
      new Date(project.ProjectEndDate) > today;

    return isActiveStatus && isNotExpired;
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Header con sfondo */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Ciao,{" "}
                    {userData.CustomerName + " " + userData.CustomerSurname} 👋
                  </h1>
                  <p className="text-white/80">
                    Benvenuto nella tua area personale
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenuto principale */}
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              <Card className="p-6 rounded-xl border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:translate-y-[-3px] bg-white overflow-hidden">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Ticket Totali
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {activeTickets.length}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-violet-100 border border-violet-200">
                    <Icon
                      icon="fluent:ticket-24-filled"
                      className="text-violet-600 text-2xl"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-xl border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:translate-y-[-3px] bg-white overflow-hidden">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Ticket Attivi
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {
                        activeTickets.filter(
                          (t) =>
                            t.TicketStatusId !== "5" && t.TicketStatusId !== "6"
                        ).length
                      }
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 border border-blue-200">
                    <Icon
                      icon="fluent:ticket-diagonal-16-filled"
                      className="text-blue-600 text-2xl"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-xl border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:translate-y-[-3px] bg-white overflow-hidden">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Progetti Totali
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {projects.length}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-emerald-100 border border-emerald-200">
                    <Icon
                      icon="fluent:folder-24-filled"
                      className="text-emerald-600 text-2xl"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonna sinistra - Ticket Attivi */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="bg-violet-100 p-1.5 rounded-full">
                    <Icon
                      icon="fluent:ticket-24-filled"
                      className="text-violet-600 text-xl"
                    />
                  </div>
                  I tuoi ticket
                </h2>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  <ActiveTicketsCard tickets={activeTickets} />
                </div>
              </div>

              {/* Colonna destra - Eventi e Progetti */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="bg-blue-100 p-1.5 rounded-full">
                    <Icon
                      icon="fluent:calendar-month-24-filled"
                      className="text-blue-600 text-xl"
                    />
                  </div>
                  Eventi in arrivo
                </h2>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  <UpcomingEventsCard />
                </div>

                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2 mt-6">
                  <div className="bg-emerald-100 p-1.5 rounded-full">
                    <Icon
                      icon="fluent:folder-24-filled"
                      className="text-emerald-600 text-xl"
                    />
                  </div>
                  Progetti attivi
                </h2>
                <div className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  <ActiveProjectsCard customerId={userData.CustomerId} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
