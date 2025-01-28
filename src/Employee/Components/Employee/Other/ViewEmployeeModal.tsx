import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  Card,
  CardHeader,
  CardBody,
  Avatar,
} from "@heroui/react";
import { API_URL_IMG } from "../../../../API/API";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface Employee {
  EmployeeId: number;
  EmployeeFullName: string;
  EmployeeEmail: string;
  EmployeePhone: string;
  RoleName: string;
  EmployeeImageUrl?: string;
}

interface ViewEmployeeModalProps {
  isOpen: boolean;
  isClosed: () => void;
  EmployeeData: Employee;
}

export default function ViewEmployeeModal({
  isOpen,
  isClosed,
  EmployeeData,
}: ViewEmployeeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={isClosed}
      scrollBehavior="outside"
      backdrop="blur"
      className="w-0 h-0 absolute top-[25%]"
      hideCloseButton
    >
      <ModalContent>
        {(isClosed) => (
          <>
            <ModalBody className="flex justify-center items-center">
              <Card className="w-96">
                <CardHeader className="relative flex h-[100px] flex-col justify-end overflow-visible bg-gradient-to-br from-orange-300 via-red-400 to-rose-500">
                  <Avatar
                    className="h-20 w-20 translate-y-12"
                    src={
                      EmployeeData.EmployeeImageUrl
                        ? API_URL_IMG +
                          "/profileIcons/" +
                          EmployeeData.EmployeeImageUrl
                        : ""
                    }
                  />
                  <div className="absolute right-3 top-3 flex flex-row gap-2">
                    <Button
                      className="bg-white/20 text-white dark:bg-black/20"
                      radius="full"
                      size="sm"
                      variant="light"
                      href={
                        "/administration/employee/edit-employee/" +
                        EmployeeData.EmployeeId
                      }
                      as="a"
                    >
                      Modifica
                    </Button>
                    <Button
                      className="bg-white/20 text-white dark:bg-black/20 h-8 w-8"
                      radius="full"
                      isIconOnly
                      variant="light"
                      onPress={isClosed}
                      startContent={<CloseRoundedIcon className="h-1 w-1" />}
                    />
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="pb-4 pt-6">
                    <p className="text-large font-medium">
                      {EmployeeData.EmployeeFullName}
                    </p>
                    <p className="max-w-[90%] text-small text-default-400">
                      {EmployeeData.EmployeeEmail}
                    </p>
                    <div className="flex gap-2 pb-1 pt-2">
                      <span className="inline-flex my-auto items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium text-gray-900 ring-2 ring-inset ring-gray-200 bg-white">
                        <svg
                          viewBox="0 0 6 6"
                          aria-hidden="true"
                          className="h-1.5 w-1.5 fill-blue-500"
                        >
                          <circle r={3} cx={3} cy={3} />
                        </svg>
                        {EmployeeData.RoleName}
                      </span>
                    </div>
                    <p className="py-2 text-small text-foreground">
                      +39 {EmployeeData.EmployeePhone}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
