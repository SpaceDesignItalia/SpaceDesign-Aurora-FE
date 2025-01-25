import { useState } from "react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

interface Checkbox {
  CheckboxId: number;
  Text: string;
  IsSelected: boolean;
  ChecklistId: number;
}

interface Checklist {
  ChecklistId: number;
  Text: string;
  Checkboxes: Checkbox[];
}

interface ConfirmDeleteCheclistModalProps {
  checklist: Checklist;
  DeleteChecklist: (checklistId: number) => void;
}
export default function ConfirmDeleteChecklistModal({
  checklist,
  DeleteChecklist,
}: ConfirmDeleteCheclistModalProps) {
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
          startContent={<DeleteRoundedIcon sx={{ fontSize: 17 }} />}
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
            <ErrorRoundedIcon className="text-warning" sx={{ fontSize: 20 }} />
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
                DeleteChecklist(checklist.ChecklistId);
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
