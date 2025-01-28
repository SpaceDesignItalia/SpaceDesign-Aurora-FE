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
import { useEffect, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import axios from "axios";
import { API_URL_IMG } from "../../../../API/API";

interface Customer {
  CustomerId: number;
  CustomerFullName: string;
  CustomerEmail: string;
  CustomerPhone: string;
  CustomerImageUrl: string;
}

interface Company {
  CompanyId: number;
  CompanyName: string;
  CompanyAddress: string;
  CompanyEmail: string;
  CompanyPhone: string;
}

interface ViewCustomerModalProps {
  isOpen: boolean;
  isClosed: () => void;
  CustomerData: Customer;
}

export default function ViewCustomerModal({
  isOpen,
  isClosed,
  CustomerData,
}: ViewCustomerModalProps) {
  const [customerCompanies, setCustomerCompanies] = useState([]);

  useEffect(() => {
    axios
      .get("/Customer/GET/GetCompanyAssociatedByCustomerId", {
        params: { CustomerId: CustomerData.CustomerId },
      })
      .then((res) => {
        setCustomerCompanies(res.data);
      });
  }, [isOpen]);

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
              <Card className="w-[400px]">
                <CardHeader className="relative flex h-[100px] flex-col justify-end overflow-visible bg-gradient-to-br from-yellow-300 via-lime-400 to-green-500">
                  <Avatar
                    className="h-20 w-20 translate-y-12"
                    src={
                      CustomerData.CustomerImageUrl
                        ? API_URL_IMG +
                          "/profileIcons/" +
                          CustomerData.CustomerImageUrl
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
                        "/administration/customer/edit-customer/" +
                        CustomerData.CustomerId
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
                      {CustomerData.CustomerFullName}
                    </p>
                    <p className="max-w-[90%] text-small text-default-400">
                      {CustomerData.CustomerEmail}
                    </p>
                    <div className="flex gap-2 pb-1 pt-2">
                      {customerCompanies.length > 0 &&
                        customerCompanies.map((company: Company) => (
                          <span className="inline-flex my-auto items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium text-gray-900 ring-2 ring-inset ring-gray-200 bg-white">
                            <svg
                              viewBox="0 0 6 6"
                              aria-hidden="true"
                              className="h-1.5 w-1.5 fill-blue-500"
                            >
                              <circle r={3} cx={3} cy={3} />
                            </svg>
                            {company.CompanyName}
                          </span>
                        ))}
                    </div>
                    <p className="py-2 text-small text-foreground">
                      +39 {CustomerData.CustomerPhone}
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
