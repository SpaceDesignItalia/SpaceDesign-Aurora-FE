// ConfirmDeleteModal.tsx
import {
  Button,
  DateValue,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { useState } from "react";
import { Icon } from "@iconify/react";
interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectCreationDate: DateValue;
  ProjectEndDate: DateValue;
  ProjectManagerName: string;
  StafferImageUrl: string;
  RoleName: string;
  CompanyId: number;
  CompanyName: string;
  StatusId: number;
  StatusName: string;
  UniqueCode: string;
}

interface ConfirmDeleteCustomerModalProps {
  ProjectData: Project;
  DeleteProject: (ProjectData: Project) => void;
}

export default function ConfirmDeleteProjectModal({
  ProjectData,
  DeleteProject,
}: ConfirmDeleteCustomerModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Popover
      placement="top"
      showArrow={true}
      size="sm"
      isOpen={isOpen}
      onOpenChange={() => setIsOpen(false)}
    >
      <PopoverTrigger>
        <Button
          variant="light"
          size="sm"
          color="danger"
          startContent={
            <Icon icon="solar:trash-bin-trash-linear" fontSize={24} />
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
                DeleteProject(ProjectData);
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
