import { useState, useEffect } from "react";
import VaultCard from "../ProjectDevelopment/ProjectCodeShare/VaultCard";
import { Button, Input, Pagination } from "@heroui/react";
import CodeShareContainer from "../ProjectDevelopment/ProjectCodeShare/CodeShareContainer";
import { Icon } from "@iconify/react/dist/iconify.js";

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: Date;
  ProjectEndDate: Date;
  CompanyId: number;
  ProjectBannerId: number;
  ProjectBannerPath: string;
  StatusName: string;
  ProjectManagerId: number;
  ProjectManagerFullName: string;
  ProjectManagerEmail: string;
  RoleName: string;
}

// Interfacce per i nuovi tipi di dati
interface Vault {
  id: number;
  name: string;
  description: string;
  creationDate: Date;
  items?: number; // Numero di elementi salvati nel vault
  // altri dati rilevanti per il vault
}

export default function DevelopmentContainer({
  projectData,
}: {
  projectData: Project;
}) {
  // Stato per memorizzare i vault e le stanze
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Effetto per caricare i dati
  useEffect(() => {
    // Simulazione di caricamento dei dati con un ritardo
    const loadDummyData = setTimeout(() => {
      try {
        // Dati dummy per i vault
        const dummyVaults: Vault[] = [
          {
            id: 1,
            name: "Vault Frontend",
            description: "Contiene tutto il codice del frontend del progetto",
            creationDate: new Date(2023, 5, 15),
            items: 10,
          },
          {
            id: 2,
            name: "Vault Backend",
            description: "API e logica di business del backend",
            creationDate: new Date(2023, 4, 20),
            items: 15,
          },
          {
            id: 3,
            name: "Vault Database",
            description: "Schema del database e query ottimizzate",
            creationDate: new Date(2023, 6, 10),
            items: 8,
          },
          {
            id: 4,
            name: "Vault Documentazione",
            description: "Documentazione tecnica e di progetto",
            creationDate: new Date(2023, 7, 5),
            items: 12,
          },
          {
            id: 5,
            name: "API Design",
            description: "Specifiche e design delle API REST",
            creationDate: new Date(2023, 8, 3),
            items: 7,
          },
          {
            id: 6,
            name: "Microservizi",
            description: "Architettura e implementazione dei microservizi",
            creationDate: new Date(2023, 8, 20),
            items: 9,
          },
          {
            id: 7,
            name: "UI Components",
            description: "Libreria di componenti UI riutilizzabili",
            creationDate: new Date(2023, 9, 12),
            items: 25,
          },
          {
            id: 8,
            name: "Testing Suite",
            description: "Test unitari e di integrazione",
            creationDate: new Date(2023, 9, 28),
            items: 14,
          },
          {
            id: 9,
            name: "DevOps Scripts",
            description: "Script per CI/CD e automazione",
            creationDate: new Date(2023, 10, 5),
            items: 18,
          },
          {
            id: 10,
            name: "Mobile App",
            description: "Codice per la versione mobile dell'applicazione",
            creationDate: new Date(2023, 10, 15),
            items: 22,
          },
          {
            id: 11,
            name: "Security Protocols",
            description: "Implementazioni di sicurezza e protocolli",
            creationDate: new Date(2023, 11, 7),
            items: 8,
          },
          {
            id: 12,
            name: "Authentication",
            description: "Sistema di autenticazione e autorizzazione",
            creationDate: new Date(2023, 11, 20),
            items: 6,
          },
          {
            id: 13,
            name: "Analytics Module",
            description: "Moduli per l'analisi dei dati e reporting",
            creationDate: new Date(2024, 0, 10),
            items: 11,
          },
          {
            id: 14,
            name: "Performance Testing",
            description: "Strumenti e risultati dei test di performance",
            creationDate: new Date(2024, 0, 28),
            items: 9,
          },
          {
            id: 15,
            name: "UX Research",
            description: "Risultati di ricerche UX e feedback utenti",
            creationDate: new Date(2024, 1, 15),
            items: 13,
          },
          {
            id: 16,
            name: "Configuration",
            description: "File di configurazione per diversi ambienti",
            creationDate: new Date(2024, 2, 3),
            items: 7,
          },
          {
            id: 17,
            name: "Localization",
            description: "File di traduzione e configurazioni i18n",
            creationDate: new Date(2024, 2, 22),
            items: 16,
          },
          {
            id: 18,
            name: "Third-party Integrations",
            description: "Codice di integrazione con servizi esterni",
            creationDate: new Date(2024, 3, 8),
            items: 12,
          },
          {
            id: 19,
            name: "Legacy Code",
            description: "Codice legacy mantenuto per compatibilità",
            creationDate: new Date(2024, 3, 27),
            items: 8,
          },
          {
            id: 20,
            name: "Machine Learning Models",
            description: "Modelli ML e script di addestramento",
            creationDate: new Date(2024, 4, 15),
            items: 5,
          },
        ];

        setVaults(dummyVaults);
      } catch (err) {
        console.error(err);
      }
    }, 1500); // Ritardo di 1.5 secondi per simulare il caricamento

    // Pulizia del timeout in caso di smontaggio del componente
    return () => clearTimeout(loadDummyData);
  }, [projectData.ProjectId]);

  // Filtraggio dei vault in base al termine di ricerca
  const filteredVaults = vaults.filter(
    (vault) =>
      vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcolo per la paginazione
  const totalPages = Math.ceil(filteredVaults.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVaults = filteredVaults.slice(indexOfFirstItem, indexOfLastItem);

  // Gestione del cambio pagina
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="development-container rounded-lg shadow-sm">
      <div className="vaults-section mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Vault del Progetto
          </h3>
        </div>

        {vaults.length === 0 ? (
          <div className="text-center">
            <p className="mb-4">Nessun vault disponibile per questo progetto</p>
            <Button>Crea il primo Vault</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="w-full flex items-center justify-between gap-2">
              <div className="w-1/4 flex flex-row items-center justify-center gap-2">
                <Input
                  radius="full"
                  variant="bordered"
                  placeholder="Cerca vault..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset alla prima pagina quando si cerca
                  }}
                  startContent={<Icon icon="lucide:search" />}
                />
              </div>

              <Button color="primary" radius="full">
                <Icon icon="solar:safe-square-linear" fontSize={20} /> Nuovo
                Vault
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentVaults.map((vault) => (
                <VaultCard key={vault.id} vault={vault} />
              ))}
            </div>

            {filteredVaults.length > itemsPerPage && (
              <div className="flex justify-center mt-6">
                <Pagination
                  color="primary"
                  total={totalPages}
                  initialPage={1}
                  page={currentPage}
                  onChange={handlePageChange}
                  showControls
                />
              </div>
            )}

            {filteredVaults.length === 0 && (
              <div className="text-center py-8">
                <p>Nessun vault corrisponde alla tua ricerca</p>
              </div>
            )}
          </div>
        )}
      </div>
      <CodeShareContainer projectData={projectData} />
    </div>
  );
}
