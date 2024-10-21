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

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

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
  const [newTicket, setNewTicket] = useState<Ticket | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Inizializza lo stato del ticket quando il modale viene aperto o il ticket cambia
  useEffect(() => {
    if (ticket) {
      setNewTicket(ticket);
      setInputValue(ticket.TicketStatusName);
    }
  }, [ticket]);

  const handleStatusChange = (keys: Set<React.Key>) => {
    const key = Array.from(keys)[0];
    if (key !== undefined && newTicket) {
      const selectedStatus = TICKET_STATUSES.find(
        (status) => status.TicketStatusId === Number(key)
      );
      if (selectedStatus) {
        setNewTicket({
          ...newTicket,
          TicketStatusId: selectedStatus.TicketStatusId,
          TicketStatusName: selectedStatus.TicketStatusName,
        });
        setInputValue(selectedStatus.TicketStatusName);
      }
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleBlur = () => {
    const status = TICKET_STATUSES.find(
      (status) => status.TicketStatusName === inputValue
    );
    if (status && newTicket) {
      setNewTicket({
        ...newTicket,
        TicketStatusId: status.TicketStatusId,
        TicketStatusName: status.TicketStatusName,
      });
    } else {
      // Reimposta l'input al nome dello stato corrente se il valore non è valido
      setInputValue(newTicket?.TicketStatusName || "");
    }
  };

  const handleUpdate = async () => {
    if (newTicket) {
      try {
        await axios.put(`/Ticket/PUT/UpdateTicketStatus`, {
          TicketStatusId: newTicket.TicketStatusId,
          ProjectTicketId: newTicket.ProjectTicketId,
        });
        onClose(); // Chiude il modale dei ticket
      } catch (error) {
        console.error(
          "Errore durante l'aggiornamento dello stato del ticket",
          error
        );
        // Puoi aggiungere un feedback visivo per l'utente qui
      }
    }
  };

  const handleAddTask = () => {
    setIsAddTaskModalOpen(true); // Apre il modale per aggiungere un task
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
                  <dt className="text-sm font-medium text-gray-900">
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
                  <dt className="text-sm font-medium text-gray-900">Titolo</dt>
                  <Input
                    value={newTicket.ProjectTicketTitle}
                    readOnly
                    fullWidth
                    className="sm:col-span-2"
                  />
                </div>
                {/* Tipo di Richiesta */}
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-900">
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
                  <dt className="text-sm font-medium text-gray-900">
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
                {/* Stato Ticket */}
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-900">
                    Stato Ticket
                  </dt>
                  <Autocomplete
                    selectedKeys={
                      newTicket?.TicketStatusId
                        ? new Set([newTicket.TicketStatusId.toString()])
                        : new Set()
                    }
                    onSelectionChange={handleStatusChange}
                    onInputChange={handleInputChange}
                    inputValue={inputValue}
                    onBlur={handleBlur}
                    fullWidth
                    className="sm:col-span-2"
                    aria-label="Stato Ticket"
                    defaultItems={TICKET_STATUSES}
                  >
                    {(status) => (
                      <AutocompleteItem key={status.TicketStatusId.toString()}>
                        {status.TicketStatusName}
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
          ProjectId={newTicket.ProjectId}
          TicketId={newTicket.ProjectTicketId}
          defaultTitle={newTicket.ProjectTicketTitle}
          defaultDescription={newTicket.ProjectTicketDescription}
        />
      )}
    </>
  );
};

export default TicketModal;
