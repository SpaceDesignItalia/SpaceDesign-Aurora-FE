// ConfirmDeleteModal.tsx
import { useState } from "react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

interface Employee {
  EmployeeId: number;
  EmployeeFullName: string;
  EmployeeEmail: string;
  EmployeePhone: string;
  RoleName: string;
}

interface ConfirmDeleteModalProps {
  EmployeeData: Employee;
  DeleteEmployee: (EmployeeData: Employee) => void;
}

export default function ConfirmDeleteModal({
  EmployeeData,
  DeleteEmployee,
}: ConfirmDeleteModalProps) {
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
          startContent={<DeleteOutlinedIcon />}
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
          <div className="flex flex-row gap-2 items-center text-small font-semibold mb-2">
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
                DeleteEmployee(EmployeeData);
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
