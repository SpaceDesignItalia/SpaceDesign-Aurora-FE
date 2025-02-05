import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  cn,
} from "@heroui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL_IMG } from "../../../../API/API";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

interface Customer {
  CustomerId: number;
  CustomerFullName: string;
  CustomerEmail: string;
  CustomerPhone: string;
  CustomerImageUrl: string;
  IsActive: boolean;
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
  const navigate = useNavigate();
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
      onOpenChange={() => {
        isClosed();
        navigate("/administration/customer");
      }}
      scrollBehavior="outside"
      backdrop="blur"
      className="w-0 h-0 absolute top-[25%]"
      hideCloseButton
    >
      <ModalContent>
        {(isClosed) => (
          <>
            <ModalBody className="flex justify-center items-center">
              <Card
                className={cn(
                  "w-[400px]",
                  CustomerData.IsActive
                    ? "ring-2 ring-green-500/20"
                    : "ring-2 ring-gray-200"
                )}
              >
                <CardHeader
                  className={cn(
                    "relative flex h-[100px] flex-col justify-end overflow-visible",
                    CustomerData.IsActive
                      ? "bg-gradient-to-br from-yellow-300 via-lime-400 to-green-500"
                      : "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400"
                  )}
                >
                  {CustomerData.CustomerImageUrl && (
                    <Avatar
                      className="h-20 w-20 translate-y-12"
                      src={
                        API_URL_IMG +
                        "/profileIcons/" +
                        CustomerData.CustomerImageUrl
                      }
                    />
                  )}
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
                      onPress={() => {
                        isClosed();
                        navigate("/administration/customer");
                      }}
                      startContent={
                        <Icon icon="solar:close-circle-linear" fontSize={24} />
                      }
                    />
                  </div>
                </CardHeader>
                <CardBody>
                  <div
                    className={cn(
                      CustomerData.CustomerImageUrl && "pt-6",
                      "pb-4"
                    )}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-large font-medium">
                          {CustomerData.CustomerFullName}
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                            CustomerData.IsActive
                              ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                              : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20"
                          )}
                        >
                          <span className="flex items-center gap-1">
                            <div
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                CustomerData.IsActive
                                  ? "bg-green-600"
                                  : "bg-gray-500"
                              )}
                            />
                            {CustomerData.IsActive
                              ? "Utente attivato"
                              : "Utente disattivato"}
                          </span>
                        </span>
                      </div>
                      <p className="text-small text-default-400">
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
                      {CustomerData.CustomerPhone && (
                        <p className="py-2 text-small text-foreground">
                          +39 {CustomerData.CustomerPhone}
                        </p>
                      )}
                    </div>
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
