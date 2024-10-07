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
import { useNavigate } from "react-router-dom"; // Importa useNavigate per la navigazione

interface Ticket {
  ProjectTicketId: number;
  ProjectTicketTitle: string;
  TicketRequestName: string;
  ProjectTicketDescription: string;
  TicketStatusId: number;
  TicketStatusName: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

// Lista degli stati del ticket
const TICKET_STATUSES = [
  { TicketStatusId: 1, TicketStatusName: "Aperto" },
  { TicketStatusId: 2, TicketStatusName: "In Corso" },
  { TicketStatusId: 3, TicketStatusName: "In Attesa" },
  { TicketStatusId: 4, TicketStatusName: "Risolto" },
  { TicketStatusId: 5, TicketStatusName: "Chiuso" },
  { TicketStatusId: 6, TicketStatusName: "Annullato" },
  { TicketStatusId: 7, TicketStatusName: "Riaperto" },
  { TicketStatusId: 8, TicketStatusName: "In attesa del Project Manager" },
  { TicketStatusId: 9, TicketStatusName: "In attesa di Terzi" },
  { TicketStatusId: 10, TicketStatusName: "Scalato" },
];

const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  const [newTicket, setNewTicket] = useState<Ticket | null>(ticket);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null); // Stato selezionato

  const navigate = useNavigate(); // Inizializza useNavigate

  useEffect(() => {
    if (ticket) {
      setNewTicket(ticket);
      setSelectedStatusId(ticket.TicketStatusId); // Stato pre-selezionato
    }
  }, [ticket]);

  // Cambio di stato dal campo Autocomplete
  const handleStatusChange = (key: string | number | null) => {
    if (key !== null) {
      const selectedStatus = TICKET_STATUSES.find(
        (status) => status.TicketStatusId === Number(key)
      );
      if (selectedStatus) {
        setSelectedStatusId(selectedStatus.TicketStatusId); // Aggiorna lo stato selezionato
        setNewTicket({
          ...newTicket!,
          TicketStatusId: selectedStatus.TicketStatusId,
          TicketStatusName: selectedStatus.TicketStatusName,
        });
      }
    }
  };

  // Aggiornamento del ticket tramite API
  const handleUpdate = () => {
    console.log("Updating ticket:", newTicket);
    axios
      .put(`/Ticket/PUT/UpdateTicketStatus`, {
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
    navigate(`/add-task/${newTicket?.ProjectTicketId}`); // Naviga alla pagina AddTask con l'ID del ticket
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      size="5xl" // Aumentiamo la larghezza del modal
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
              {" "}
              {/* Aggiunto più spazio interno */}
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
                  selectedKeys={[selectedStatusId?.toString() || ""]} // Mostra lo stato corrente
                  defaultItems={TICKET_STATUSES}
                  placeholder="Seleziona lo stato del ticket"
                  onSelectionChange={handleStatusChange}
                  variant="bordered"
                  radius="sm"
                  aria-label="Stato Ticket"
                  className="sm:col-span-2"
                  fullWidth
                >
                  {(status) => (
                    <AutocompleteItem key={status.TicketStatusId}>
                      {status.TicketStatusName}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-end gap-4 px-8 py-6">
              {" "}
              {/* Più spazio per i bottoni */}
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
                onClick={handleAddTask} // Chiama la funzione per aggiungere una task
              >
                Aggiungi Task
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TicketModal;
