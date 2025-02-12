import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@heroui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

interface Lead {
  IdContact: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Company: string;
  Name: string;
  Range: string;
  CreatedAt: string;
  Message: string;
}

interface ViewLeadModalProps {
  isOpen: boolean;
  isClosed: () => void;
  LeadData: Lead;
}

export default function ViewLeadModal({
  isOpen,
  isClosed,
  LeadData,
}: ViewLeadModalProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (LeadData.IdContact) {
        axios
          .get("/Lead/GET/GetLeadById", {
            params: { id: LeadData.IdContact },
          })
          .then((res) => {
            const leadData = res.data[0];
            setLead({
              IdContact: leadData.IdContact,
              FirstName: leadData.FirstName,
              LastName: leadData.LastName,
              Email: leadData.Email,
              Company: leadData.Company,
              Message: leadData.Message,
              Name: leadData.Name,
              Range: leadData.Range,
              CreatedAt: leadData.CreatedAt,
            });
            setError(null);
          })
          .catch((error) => {
            console.error(
              "Errore durante il recupero dei dettagli del lead:",
              error
            );
            setError("Si è verificato un errore nel caricamento dei dati.");
          });
      }
    } else {
      setLead(null);
      setError(null);
    }
  }, [isOpen, LeadData.IdContact]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={isClosed}
      size="4xl"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {(isClosed) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {lead
                ? `${lead.Name} per ${lead.FirstName} ${lead.LastName}${
                    lead.Company ? ` (${lead.Company})` : ""
                  }`
                : "Caricamento..."}
            </ModalHeader>

            <ModalBody>
              {error ? (
                <div className="text-red-500">{error}</div>
              ) : lead ? (
                <div className="mt-6 border-t border-gray-100">
                  <dl className="divide-y divide-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-6">
                      <div>
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Nome
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700">
                          {lead.FirstName} {lead.LastName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Email
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700">
                          {lead.Email}
                        </dd>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-6">
                      <div>
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Azienda
                        </dt>
                        {lead.Company ? (
                          <dd className="mt-1 text-sm leading-6 text-gray-700">
                            {lead.Company}
                          </dd>
                        ) : (
                          <dd className="mt-1 text-sm leading-6 text-gray-700">
                            Nessuna azienda specificata
                          </dd>
                        )}
                      </div>
                      <div>
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Oggetto
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700">
                          {lead.Name}
                        </dd>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-6">
                      <div>
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Data di creazione
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700">
                          {lead.CreatedAt !== null &&
                            dayjs(lead.CreatedAt).format("DD MMM YYYY HH:mm")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Range
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700">
                          {lead.Range}
                        </dd>
                      </div>
                    </div>
                    <div className="px-4 py-6">
                      <dt className="text-sm font-medium leading-6 mb-4 text-gray-900">
                        Messaggio
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 break-words">
                        {lead.Message}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <Spinner label="Caricamento..." color="danger" />
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onClick={isClosed}
                radius="sm"
              >
                Chiudi
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
