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
  const [newTicket, setNewTicket] = useState<Ticket | null>(ticket);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false); // Stato per il modale di aggiunta task

  useEffect(() => {
    if (ticket) {
      setNewTicket(ticket);
      setSelectedStatusId(ticket.TicketStatusId); // Imposta lo stato selezionato inizialmente
    }
  }, [ticket]);

  const handleStatusChange = (key: string | number | null) => {
    if (key !== null) {
      const selectedStatus = TICKET_STATUSES.find(
        (status) => status.TicketStatusId === Number(key)
      );
      if (selectedStatus) {
        setSelectedStatusId(selectedStatus.TicketStatusId);
        setNewTicket({
          ...newTicket!,
          TicketStatusId: selectedStatus.TicketStatusId,
          TicketStatusName: selectedStatus.TicketStatusName,
        });
      }
    }
  };

  const handleUpdate = () => {
    axios
      .put(`/Ticket/PUT/UpdateTicketStatus`, {
        TicketStatusId: newTicket?.TicketStatusId,
        ProjectTicketId: newTicket?.ProjectTicketId,
      })
      .then(() => {
        onClose(); // Chiude il modale dei ticket
      })
      .catch((error) => {
        console.error("Error updating ticket status", error);
      });
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
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Stato Ticket
                  </dt>
                  <Autocomplete
                    selectedKeys={[selectedStatusId?.toString() || ""]}
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
        />
      )}
    </>
  );
};

export default TicketModal;
