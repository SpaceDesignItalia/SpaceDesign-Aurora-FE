// ConfirmDeleteModal.tsx
import { useState } from "react";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

interface Company {
  CompanyName: string;
  CompanyAddress: string;
  CompanyEmail: string;
  CompanyPhone: string;
}

interface ConfirmDeleteCompanyModalProps {
  CompanyData: Company;
  DeleteCompany: (CompanyData: Company) => void;
}

export default function ConfirmDeleteCompanyModal({
  CompanyData,
  DeleteCompany,
}: ConfirmDeleteCompanyModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
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
            <div className="flex flex-row gap-2 items-center text-small font-bold mb-2">
              <ErrorRoundedIcon
                className="text-warning"
                sx={{ fontSize: 20 }}
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
                  DeleteCompany(CompanyData);
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
    </>
  );
}
