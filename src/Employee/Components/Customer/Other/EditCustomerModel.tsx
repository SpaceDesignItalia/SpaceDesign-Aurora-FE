import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Autocomplete,
  AutocompleteItem,
  Checkbox,
} from "@heroui/react";
import StatusAlert from "../../Layout/StatusAlert";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";

interface Customer {
  CustomerId: number;
  CustomerName: string;
  CustomerSurname: string;
  CustomerEmail: string;
  CustomerPhone: string;
  CompanyId: number;
  IsActive: boolean;
}

interface Company {
  CompanyId: number;
  CompanyName: string;
  CompanyAddress: string;
  CompanyEmail: string;
  CompanyPhone: string;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function EditCustomerModel() {
  const { CustomerId } = useParams();
  const [newCustomerData, setNewCustomerData] = useState<Customer>({
    CustomerId: 0,
    CustomerName: "",
    CustomerSurname: "",
    CustomerEmail: "",
    CustomerPhone: "",
    CompanyId: 0,
    IsActive: false,
  });
  const [initialCustomerData, setInitialCustomerData] = useState<Customer>({
    CustomerId: 0,
    CustomerName: "",
    CustomerSurname: "",
    CustomerEmail: "",
    CustomerPhone: "",
    CompanyId: 0,
    IsActive: false,
  });
  const [company, setCompany] = useState<Company[]>([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);

  useEffect(() => {
    axios
      .get("/Customer/GET/GetCustomerById", {
        params: { CustomerId: CustomerId },
      })
      .then((res) => {
        setNewCustomerData(res.data[0]);
        setInitialCustomerData(res.data[0]);
        console.log(res.data[0]);
      });
    axios.get("/Company/GET/GetAllCompany").then((res) => {
      setCompany(res.data);
    });
  }, []);

  function handleCustomerNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setNewCustomerData({ ...newCustomerData, CustomerName: e.target.value });
    }
  }

  function handleCustomerSurnameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setNewCustomerData({
        ...newCustomerData,
        CustomerSurname: e.target.value,
      });
    }
  }

  function handleCustomerEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 100) {
      setNewCustomerData({ ...newCustomerData, CustomerEmail: e.target.value });
    }
  }

  function handleCustomerPhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value.replace(/\D/g, ""); // Rimuove tutti i caratteri non numerici
    if (input.length <= 15) {
      setNewCustomerData({ ...newCustomerData, CustomerPhone: input });
    }
  }

  function handleCustomerCompanyId(e: React.Key | null) {
    setNewCustomerData({ ...newCustomerData, CompanyId: Number(e) });
  }

  const handleCheckboxChange = (isSelected: boolean) => {
    setNewCustomerData({ ...newCustomerData, IsActive: isSelected });
  };

  function checkAllDataCompiled() {
    if (
      newCustomerData.CustomerName !== initialCustomerData.CustomerName ||
      newCustomerData.CustomerSurname !== initialCustomerData.CustomerSurname ||
      newCustomerData.CustomerEmail !== initialCustomerData.CustomerEmail ||
      newCustomerData.CustomerPhone !== initialCustomerData.CustomerPhone ||
      (newCustomerData.CompanyId !== initialCustomerData.CompanyId &&
        newCustomerData.CompanyId !== null) ||
      newCustomerData.IsActive !== initialCustomerData.IsActive
    ) {
      return false;
    }
    return true;
  }

  async function handleUpdateCustomer() {
    try {
      setIsAddingData(true);

      const res = await axios.put("/Customer/UPDATE/UpdateCustomerData", {
        CustomerData: newCustomerData,
        OldCompanyId: initialCustomerData.CompanyId,
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "Il cliente è stato modificato con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/administration/customer";
        }, 2000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          // Handle 409 Conflict specifically
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Errore di conflitto",
            alertDescription:
              "L'email inserita è già in uso da un altro cliente.",
            alertColor: "yellow",
          });
        } else {
          // Handle other errors
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Errore durante l'operazione",
            alertDescription:
              "Si è verificato un errore durante la modifica del cliente. Per favore, riprova più tardi.",
            alertColor: "red",
          });
        }
      }
    } finally {
      setIsAddingData(false);
    }
  }

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <form action="#" method="POST">
          <div className="space-y-6 bg-white py-6">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Cliente
              </h3>
              <p className="mt-1 text-sm text-gray-500 sm:w-1/3">
                In questo pannello potrai modificare un cliente dal database. I
                campi contrassegnati con un asterisco (
                <span className="text-danger font-bold">*</span>) sono
                obbligatori.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="Name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nome <span className="text-red-600 font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="full"
                  value={newCustomerData.CustomerName}
                  onChange={handleCustomerNameChange}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Cognome <span className="text-red-600 font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="full"
                  value={newCustomerData.CustomerSurname}
                  onChange={handleCustomerSurnameChange}
                />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email <span className="text-red-600 font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="email"
                  radius="full"
                  value={newCustomerData.CustomerEmail}
                  onChange={handleCustomerEmailChange}
                  aria-label="Email"
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Numero di telefono
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="full"
                  value={newCustomerData.CustomerPhone}
                  onChange={handleCustomerPhoneChange}
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="company"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Azienda <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <Autocomplete
                    defaultItems={company}
                    placeholder="Seleziona azienda"
                    onSelectionChange={handleCustomerCompanyId}
                    selectedKey={String(newCustomerData.CompanyId)}
                    variant="bordered"
                    radius="full"
                    aria-label="company"
                    fullWidth
                  >
                    {(company) => (
                      <AutocompleteItem
                        key={company.CompanyId}
                        textValue={company.CompanyName}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2 items-center">
                            <div className="flex flex-col">
                              <span className="text-small">
                                {company.CompanyName}
                              </span>
                              <span className="text-tiny text-default-400">
                                {company.CompanyAddress}
                              </span>
                            </div>
                          </div>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                </div>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                  Stato utente
                </label>
                <Checkbox
                  isSelected={newCustomerData.IsActive}
                  onValueChange={handleCheckboxChange}
                  color="primary"
                  className="text-sm"
                >
                  Utente attivo sulla piattaforma
                </Checkbox>
                <p className="mt-1 text-sm text-gray-500">
                  Se selezionato, l'utente potrà accedere alla piattaforma,
                  verrà quindi inviata la mail di attivazione account.
                </p>
              </div>
            </div>
          </div>
          <div className="py-3 text-right">
            <Button
              color="primary"
              className="text-white"
              radius="full"
              startContent={
                !isAddingData && (
                  <Icon icon="basil:save-outline" fontSize={24} />
                )
              }
              isDisabled={checkAllDataCompiled()}
              isLoading={isAddingData}
              onClick={handleUpdateCustomer}
            >
              {isAddingData ? "Salvando il cliente..." : "Salva cliente"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
