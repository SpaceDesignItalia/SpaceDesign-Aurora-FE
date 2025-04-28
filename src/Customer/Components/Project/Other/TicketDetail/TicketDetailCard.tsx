import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";

interface TicketProps {
  ProjectTicketId: number;
  ProjectTicketTitle: string;
  ProjectTicketDescription: string;
  ProjectTicketCreationDate: string;
  ProjectTicketCompletedDate: string | null;
  CustomerId: number;
  ProjectId: number;
  TicketRequestTypeId: number;
  TicketRequestName: string;
  TicketStatusId: number;
  TicketStatusName: string;
  CompanyId?: number;
  ProjectName?: string;
}

interface TicketDetailCardProps {
  ticket: TicketProps;
}

export default function TicketDetailCard({ ticket }: TicketDetailCardProps) {
  return (
    <Card className="p-6 rounded-xl border-none shadow bg-white overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-violet-100 p-1.5 rounded-full">
          <Icon
            icon="fluent:ticket-24-filled"
            className="text-violet-600 text-xl"
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          {ticket.ProjectTicketTitle}
        </h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Descrizione</h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">
            {ticket.ProjectTicketDescription}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Icon icon="ph:clock" className="text-lg" />
          <span>
            Creato il{" "}
            {new Date(ticket.ProjectTicketCreationDate).toLocaleDateString(
              "it-IT",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )}
          </span>
        </div>
      </div>
    </Card>
  );
}
