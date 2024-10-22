import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Autocomplete,
  AutocompleteItem,
  Input,
  Textarea,
} from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AddTaskModal from "../ProjectTask/AddTaskModal"; // Importa il modale per aggiungere task

interface Ticket {
  ProjectTicketId: number;
  ProjectTicketTitle: string;
  TicketRequestName: string;
  ProjectTicketDescription: string;
  TicketStatusId: number;
  TicketStatusName: string;
  CompanyName: string;
  ProjectId: number;
  ProjectName: string;
}

interface TicketStatus {
  key: string;
  textValue: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  const [newTicket, setNewTicket] = useState<Ticket | null>(ticket);
  const [ticketStatuses, setTicketStatuses] = useState<TicketStatus[]>([]);
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false); // Stato per il modale di aggiunta task

  // Aggiorna lo stato del ticket selezionato
  useEffect(() => {
    if (ticket) {
      setNewTicket(ticket);
      // Imposta lo stato attuale del ticket come stato selezionato
      setSelectedStatusId(ticket.TicketStatusId.toString());
    }
  }, [ticket]);

  // Effettua una richiesta API per ottenere gli stati dei ticket
  useEffect(() => {
    axios
      .get("/Ticket/GET/GetAllTicketStatusTypes")
      .then((response) => {
        console.log("Risposta API:", response.data);
        const statuses = response.data.map((status: any) => ({
          key: status.TicketStatusId.toString(),
          textValue: status.TicketStatusName,
        }));

        setTicketStatuses(statuses);
      })
      .catch((error) => {
        console.error("Errore nel recupero degli stati del ticket", error);
      });
  }, []);

  // Cambio di stato dal campo Autocomplete
  const handleStatusChange = (key: string | number | null) => {
    if (key !== null) {
      const selectedStatus = ticketStatuses.find(
        (status) => status.key === key.toString()
      );
      if (selectedStatus) {
        setSelectedStatusId(selectedStatus.key);
        setNewTicket({
          ...newTicket!,
          TicketStatusId: Number(selectedStatus.key),
          TicketStatusName: selectedStatus.textValue,
        });
      }
    }
  };

  // Aggiornamento del ticket tramite API
  const handleUpdate = () => {
    console.log("Updating ticket:", newTicket);
    axios
      .put("/Ticket/PUT/UpdateTicketStatus", {
        TicketStatusId: newTicket?.TicketStatusId,
        ProjectTicketId: newTicket?.ProjectTicketId,
      })
      .then((response) => {
        console.log("Ticket status updated successfully");
        onClose(); // Chiudi il modal dopo il salvataggio
      })
      .catch((error) => {
        console.error("Error updating ticket status", error);
      });
  };

  // Naviga alla schermata di aggiunta task
  const handleAddTask = () => {
    setIsAddTaskModalOpen(true); // Apre il modale per aggiungere un task
    console.log("Apertura modale per aggiungere task");
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        size="5xl"
        scrollBehavior="inside"
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {newTicket && (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Modifica stato del ticket
                </h2>
              </ModalHeader>
              <ModalBody className="space-y-6 px-8 py-6">
                {/* Codice Richiesta */}
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Codice Richiesta
                  </dt>
                  <Input
                    value={newTicket.ProjectTicketId.toString()}
                    readOnly
                    fullWidth
                    className="sm:col-span-2"
                  />
                </div>
                {/* Titolo */}
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Titolo
                  </dt>
                  <Input
                    value={newTicket.ProjectTicketTitle}
                    readOnly
                    fullWidth
                    className="sm:col-span-2"
                  />
                </div>
                {/* Tipo di Richiesta */}
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Tipo di Richiesta
                  </dt>
                  <Input
                    value={newTicket.TicketRequestName}
                    readOnly
                    fullWidth
                    className="sm:col-span-2"
                  />
                </div>
                {/* Descrizione */}
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Descrizione
                  </dt>
                  <Textarea
                    value={newTicket.ProjectTicketDescription}
                    readOnly
                    fullWidth
                    className="sm:col-span-2"
                    rows={3}
                  />
                </div>
                {/* Stato Ticket - Autocomplete */}
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Stato Ticket
                  </dt>
                  <Autocomplete
                    selectedKey={
                      selectedStatusId ? selectedStatusId : undefined
                    }
                    defaultItems={ticketStatuses}
                    placeholder={
                      ticketStatuses.length > 0
                        ? "Seleziona lo stato del ticket"
                        : "Nessun stato disponibile"
                    }
                    onSelectionChange={handleStatusChange}
                    variant="bordered"
                    radius="sm"
                    aria-label="Stato Ticket"
                    className="sm:col-span-2"
                    fullWidth
                  >
                    {(item) => (
                      <AutocompleteItem
                        key={item.key}
                        textValue={item.textValue}
                      >
                        {item.textValue}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                </div>
              </ModalBody>
              <ModalFooter className="flex justify-end gap-4 px-8 py-6">
                <Button
                  color="success"
                  variant="light"
                  radius="sm"
                  onClick={handleUpdate}
                >
                  Salva Modifiche
                </Button>
                <Button
                  color="secondary"
                  variant="flat"
                  radius="sm"
                  onClick={handleAddTask}
                >
                  Aggiungi Task
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modale per aggiungere un task */}
      {newTicket && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          isClosed={() => setIsAddTaskModalOpen(false)}
          ProjectId={newTicket.ProjectId} // Passa l'ID del progetto al modale
          TicketId={newTicket.ProjectTicketId} // Passa l'ID del ticket
          defaultTitle={newTicket.ProjectTicketTitle} // Passa il titolo del ticket
          defaultDescription={newTicket.ProjectTicketDescription} // Passa la descrizione del ticket
        />
      )}
    </>
  );
};

export default TicketModal;
