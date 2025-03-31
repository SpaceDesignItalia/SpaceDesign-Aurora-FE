import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";

interface Status {
  ProjectTaskStatusId: number;
  ProjectTaskStatusName: string;
}

interface ConfirmDeleteTaskStatusModalProps {
  column: Status;
  DeleteTaskStatus: (statusId: number) => void;
}

export default function ConfirmDeleteTaskStatusModal({
  column,
  DeleteTaskStatus,
}: ConfirmDeleteTaskStatusModalProps) {
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
            <Icon icon="solar:trash-bin-trash-linear" fontSize={22} />
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
            Sei sicuro di voler eliminare {column.ProjectTaskStatusName}?
          </div>
          <div className="flex flex-row gap-2 justify-center items-center">
            <Button
              variant="light"
              radius="sm"
              size="sm"
              onPress={() => setIsOpen(false)}
            >
              Annulla
            </Button>
            <Button
              color="danger"
              variant="ghost"
              onPress={() => {
                DeleteTaskStatus(column.ProjectTaskStatusId);
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
