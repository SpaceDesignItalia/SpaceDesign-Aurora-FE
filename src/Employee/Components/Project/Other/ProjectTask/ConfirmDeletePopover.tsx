import { useState } from "react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { Icon } from "@iconify/react";

interface ConfirmDeletePopoverProps {
  onConfirm: () => void;
  triggerButton?: React.ReactNode;
}

export default function ConfirmDeletePopover({
  onConfirm,
  triggerButton,
}: ConfirmDeletePopoverProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const defaultTriggerButton = (
    <Button
      size="sm"
      color="danger"
      variant="light"
      radius="full"
      startContent={<Icon icon="solar:trash-bin-trash-linear" fontSize={22} />}
      aria-label="Remove"
      aria-labelledby="Remove"
      isIconOnly
    />
  );

  return (
    <Popover
      placement="top"
      showArrow={true}
      size="sm"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      offset={10}
    >
      <PopoverTrigger>{triggerButton || defaultTriggerButton}</PopoverTrigger>
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
                onConfirm();
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
