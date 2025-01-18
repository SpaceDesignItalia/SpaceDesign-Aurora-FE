// ConfirmDeleteModal.tsx

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { useState } from "react";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

interface File {
  TaskFileId: number;
  FileName: string;
  FilePath: string;
  TaskId: number;
}

interface ConfirmDeleteTaskFileModalProps {
  FileData: File;
  DeleteFile: (File: File) => void;
}

export default function ConfirmDeleteFileModal({
  FileData,
  DeleteFile,
}: ConfirmDeleteTaskFileModalProps) {
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
                DeleteFile(FileData);
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
