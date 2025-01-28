import { useState } from "react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

interface ConfirmDeleteCodeShareModalProps {
  codeShareId: number;
  DeleteCodeShare: (codeShareId: number) => void;
}

export default function ConfirmDeleteCodeShareModal({
  codeShareId,
  DeleteCodeShare,
}: ConfirmDeleteCodeShareModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  console.log(codeShareId);
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
          radius="full"
          startContent={<DeleteRoundedIcon sx={{ fontSize: 17 }} />}
          aria-label="Remove"
          aria-labelledby="Remove"
          isIconOnly
          onClick={() => {
            setIsOpen(true);
          }}
          className="mt-1 mr-1"
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
              onPress={() => setIsOpen(false)}
            >
              Annulla
            </Button>
            <Button
              color="danger"
              variant="ghost"
              onPress={() => {
                DeleteCodeShare(codeShareId);
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
