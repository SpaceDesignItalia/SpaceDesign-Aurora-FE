// ConfirmDeleteModal.tsx

import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { useState } from "react";
import { Icon } from "@iconify/react";

interface Event {
  EventId: number;
  EventTitle: string;
  EventStartDate: Date;
  EventEndDate: Date;
  EventStartTime: string;
  EventEndTime: string;
  EventColor: string;
  EventDescription: string;
  EventLocation: string;
  EventTagName: string;
}

interface ConfirmDeleteEventModalProps {
  EventData: Event;
  DeleteEvent: (Event: Event) => void;
}

export default function ConfirmDeleteEventModal({
  EventData,
  DeleteEvent,
}: ConfirmDeleteEventModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Popover
      placement="top"
      showArrow={true}
      size="sm"
      isOpen={isOpen}
      onOpenChange={() => setIsOpen(false)}
      offset={10}
    >
      <PopoverTrigger>
        <Button
          size="sm"
          color="danger"
          variant="light"
          radius="full"
          startContent={
            <Icon icon="solar:trash-bin-trash-linear" fontSize={18} />
          }
          aria-label="Remove"
          aria-labelledby="Remove"
          isIconOnly
          onClick={() => {
            setIsOpen(true);
          }}
        />
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="flex flex-row gap-2 items-center text-small font-bold mb-2">
            <Icon
              icon="iconamoon:attention-circle-light"
              className="text-warning"
              fontSize={20}
            />
            Sei sicuro?
          </div>
          <div className="flex flex-row gap-2">
            <Button
              variant="light"
              radius="sm"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Annulla
            </Button>
            <Button
              color="danger"
              variant="ghost"
              onClick={() => {
                DeleteEvent(EventData);
                setIsOpen(false);
              }}
              radius="sm"
              size="sm"
            >
              Elimina
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
