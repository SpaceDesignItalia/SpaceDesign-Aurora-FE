import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface Employee {
  EmployeeId: number;
  EmployeeFullName: string;
  EmployeeEmail: string;
  EmployeePhone: string;
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
      size="2xl"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {(isClosed) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Anteprima di {EmployeeData.EmployeeFullName}
            </ModalHeader>
            <ModalBody>
              <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Nome Dipendente
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {EmployeeData.EmployeeFullName}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Email Dipendente
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {EmployeeData.EmployeeEmail}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Telefono Dipendente
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {EmployeeData.EmployeePhone}
                    </dd>
                  </div>
                </dl>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onClick={isClosed}
                radius="sm"
              >
                Chiudi
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
