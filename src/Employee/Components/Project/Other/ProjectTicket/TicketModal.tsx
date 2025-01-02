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
import OpenTaskModal from "./OpenTaskModal";

interface Ticket {
  ProjectTicketId: number;
  ProjectTicketTitle: string;
  ProjectTicketDescription: string;
  ProjectTicketCreationDate: string;
  ProjectTicketCompletedDate: null;
  CustomerId: number;
  ProjectId: number;
  TicketRequestTypeId: number;
  TicketRequestName: string;
  TicketStatusId: number;
  TicketStatusName: string;
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

interface OpenTaskModalProps {
  isOpen: boolean;
  isClosed: () => void;
  Ticket: Ticket;
}

interface TaskStatus {
  ProjectTaskStatusName: string;
}

const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  const [newTicket, setNewTicket] = useState<Ticket | null>(ticket);
  const [ticketStatuses, setTicketStatuses] = useState<TicketStatus[]>([]);
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<OpenTaskModalProps>({
    isOpen: false,
    isClosed: () => {},
    Ticket: newTicket!,
  });
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);

  // Aggiorna lo stato del ticket selezionato
  useEffect(() => {
    if (ticket) {
      setNewTicket(ticket);
      // Imposta lo stato attuale del ticket come stato selezionato
      setSelectedStatusId(ticket.TicketStatusId.toString());
      axios
        .get("/Project/GET/GetTaskStatusByTicketId", {
          params: {
            ProjectTicketId: ticket.ProjectTicketId,
          },
        })
        .then((response) => {
          setTaskStatus(response.data);
        })
        .catch((error) => {
          console.error("Errore nel recupero dello stato del task", error);
        });
    }
  }, [ticket]);

  // Effettua una richiesta API per ottenere gli stati dei ticket
  useEffect(() => {
    axios
      .get("/Ticket/GET/GetAllTicketStatusTypes")
      .then((response) => {
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
    axios
      .put("/Ticket/PUT/UpdateTicketStatus", {
        TicketStatusId: newTicket?.TicketStatusId,
        ProjectTicketId: newTicket?.ProjectTicketId,
      })
      .then(() => {
        onClose(); // Chiudi il modal dopo il salvataggio
      })
      .catch((error) => {
        console.error("Error updating ticket status", error);
      });
  };

  console.log(taskStatus?.ProjectTaskStatusName);

  return (
    <>
      <OpenTaskModal
        isOpen={modalData.isOpen}
        isClosed={modalData.isClosed}
        Ticket={newTicket!}
      />
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
                {/* Stato Task collegata */}
                {taskStatus?.ProjectTaskStatusName !== "" && (
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Stato della task collegata
                    </dt>
                    <Input
                      value={taskStatus?.ProjectTaskStatusName}
                      readOnly
                      fullWidth
                      className="sm:col-span-2"
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="flex justify-end gap-4 px-8 py-6">
                <Button
                  color="primary"
                  variant="light"
                  radius="sm"
                  onClick={handleUpdate}
                >
                  Annulla
                </Button>
                <Button
                  color="primary"
                  variant="light"
                  radius="sm"
                  onClick={handleUpdate}
                >
                  Salva Modifiche
                </Button>
                {taskStatus?.ProjectTaskStatusName === "" && (
                  <Button
                    color="primary"
                    variant="light"
                    radius="sm"
                    onClick={() => setModalData({ ...modalData, isOpen: true })}
                  >
                    Crea Task
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default TicketModal;
