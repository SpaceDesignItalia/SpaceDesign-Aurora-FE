import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface TicketStatus {
  TicketStatusId: number;
  TicketStatusName: string;
}

interface Ticket {
  ProjectTicketId: number;
  TicketStatusId: number;
  TicketStatusName: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

// List of ticket statuses from your database
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

  useEffect(() => {
    if (ticket) {
      setNewTicket(ticket);
    }
  }, [ticket]);

  // Handle status selection from autocomplete
  const handleStatusChange = (key: string | number | null) => {
    if (newTicket && key !== null) {
      const selectedStatus = TICKET_STATUSES.find(
        (status) => status.TicketStatusId === Number(key)
      );
      if (selectedStatus) {
        setNewTicket({
          ...newTicket,
          TicketStatusId: selectedStatus.TicketStatusId,
          TicketStatusName: selectedStatus.TicketStatusName,
        });
      }
    }
  };

  // Handle ticket update (e.g., calling API)
  const handleUpdate = () => {
    console.log("Updating ticket:", newTicket);
    // Perform API call to update the ticket's status
    axios
      .put(`/Ticket/PUT/UpdateTicketStatus`, {
        TicketStatusId: newTicket?.TicketStatusId,
        ProjectTicketId: newTicket?.ProjectTicketId,
      })
      .then((response) => {
        console.log("Ticket status updated successfully");
        onClose(); // Close modal after saving
      })
      .catch((error) => {
        console.error("Error updating ticket status", error);
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      size="lg"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {newTicket && (
          <>
            <ModalHeader>Modifica stato del ticket</ModalHeader>
            <ModalBody>
              <div className="border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                  {/* Ticket Status - Autocomplete */}
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Stato Ticket
                    </dt>
                    <Autocomplete
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
                </dl>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="success"
                variant="light"
                radius="sm"
                onClick={handleUpdate}
              >
                Salva Modifiche
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TicketModal;
