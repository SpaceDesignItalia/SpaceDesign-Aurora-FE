import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

interface Employee {
  EmployeeId: number;
  EmployeeName: string;
  EmployeeSurname: string;
  EmplyeeEmail: string;
  EmployeePhone: string;
  EmployeeImageUrl: string;
  codeShareId: number;
}

interface ConfirmDeleteCodeShareModalProps {
  codeShareId: number;
  DeleteCodeShare: (codeShareId: number) => void;
  onlineCodeShareUsers: Employee[];
}

export default function ConfirmDeleteCodeShareModal({
  codeShareId,
  DeleteCodeShare,
  onlineCodeShareUsers,
}: ConfirmDeleteCodeShareModalProps) {
  const [, setIsOpen] = useState<boolean>(false);

  function checkDisabled() {
    if (onlineCodeShareUsers.length == 0) {
      return false;
    }

    for (const user of onlineCodeShareUsers) {
      if (user.codeShareId == codeShareId) {
        return true;
      }
    }

    return false;
  }

  useEffect(() => {
    checkDisabled();
  }, [onlineCodeShareUsers]);

  return (
    <>
      {onlineCodeShareUsers.filter((user) => user.codeShareId === codeShareId)
        .length == 0 && (
        <Popover placement="top" showArrow={true}>
          <PopoverTrigger>
            <Button
              size="sm"
              color="danger"
              radius="full"
              startContent={
                <Icon icon="solar:trash-bin-trash-linear" fontSize={17} />
              }
              aria-label="Remove"
              aria-labelledby="Remove"
              isIconOnly
              disabled={checkDisabled()}
              onClick={() => {
                setIsOpen(true);
              }}
              className="mt-1 mr-1"
            />
          </PopoverTrigger>
          <PopoverContent>
            <div className="px-1 py-2">
              <div className="flex flex-row gap-2 items-center text-small font-semibold mb-2">
                <Icon
                  icon="iconamoon:attention-circle-light"
                  className="text-warning"
                  fontSize={20}
                />
                Sei sicuro?{" "}
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
      )}
    </>
  );
}
