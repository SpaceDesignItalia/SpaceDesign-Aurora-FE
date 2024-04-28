import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import SaveIcon from "@mui/icons-material/Save";
import CompanyAlert from "./StatusAlert";
import { useParams } from "react-router-dom";
import StatusAlert from "./StatusAlert";

interface Customer {
  CustomerId: number;
  CustomerName: string;
  CustomerSurname: string;
  CustomerEmail: string;
  CustomerPhone: string;
  CompanyId: number;
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
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

export default function EditCustomerModel() {
  const { CustomerId } = useParams();
  const [newCustomerData, setNewCustomerData] = useState<Customer>({
    CustomerId: 0,
    CustomerName: "",
    CustomerSurname: "",
    CustomerEmail: "",
    CustomerPhone: "",
    CompanyId: 0,
  });
  const [initialCustomerData, setInitialCustomerData] = useState<Customer>({
    CustomerId: 0,
    CustomerName: "",
    CustomerSurname: "",
    CustomerEmail: "",
    CustomerPhone: "",
    CompanyId: 0,
  });
  const [company, setCompany] = useState<Company[]>([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

  useEffect(() => {
    axios
      .get("/Customer/GET/GetCustomerById", {
        params: { CustomerId: CustomerId },
      })
      .then((res) => {
        setNewCustomerData(res.data[0]);
        setInitialCustomerData(res.data[0]);
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

  function handleCustomerCompanyId(e: React.Key) {
    setNewCustomerData({ ...newCustomerData, CompanyId: String(e) });
  }

  function checkAllDataCompiled() {
    if (
      newCustomerData.CustomerName !== initialCustomerData.CustomerName ||
      newCustomerData.CustomerSurname !== initialCustomerData.CustomerSurname ||
      newCustomerData.CustomerEmail !== initialCustomerData.CustomerEmail ||
      newCustomerData.CustomerPhone !== initialCustomerData.CustomerPhone ||
      newCustomerData.CompanyId !== initialCustomerData.CompanyId
    ) {
      return false;
    }
    return true;
  }

  async function handleUpdateCustomer() {
    try {
      const res = await axios
        .put("/Customer/UPDATE/UpdateCustomerData", {
          CustomerData: newCustomerData,
          OldCompanyId: initialCustomerData.CompanyId,
        })
        .then(setIsAddingData(true));

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il cliente è stato modificato con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/administration/customer";
        }, 2000);
        console.log("Successo:", res.data);
      }
      // Esegui altre azioni dopo la creazione dell'azienda, se necessario
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante la modifica del cliente. Per favore, riprova più tardi.",
        alertColor: "red",
      });

      setTimeout(() => {
        window.location.href = "/administration/customer";
      }, 2000);
      console.error("Errore durante l'aggiornamento del cliente:", error);
      // Gestisci l'errore in modo appropriato, ad esempio mostrando un messaggio all'utente
    }
  }

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <form action="#" method="POST">
          <div className="border border-gray-200 sm:overflow-hidden rounded-xl">
            <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
              <div>
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Cliente
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  In questo pannello potrai modificare un cliente dal database.
                </p>
              </div>

              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="Name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Nome
                  </label>
                  <Input
                    variant="bordered"
                    type="text"
                    radius="sm"
                    value={newCustomerData.CustomerName}
                    onChange={handleCustomerNameChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Cognome
                  </label>
                  <Input
                    variant="bordered"
                    type="text"
                    radius="sm"
                    value={newCustomerData.CustomerSurname}
                    onChange={handleCustomerSurnameChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-6">
                  <label
                    htmlFor="email-address"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Email
                  </label>
                  <Input
                    variant="bordered"
                    type="email"
                    radius="sm"
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
                    radius="sm"
                    value={newCustomerData.CustomerPhone}
                    onChange={handleCustomerPhoneChange}
                    fullWidth
                  />
                </div>

                <div className="col-span-6 sm:col-span-6">
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Azienda
                  </label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <Autocomplete
                      defaultItems={company}
                      placeholder="Seleziona azienda"
                      onSelectionChange={handleCustomerCompanyId}
                      selectedKey={newCustomerData.CompanyId}
                      variant="bordered"
                      radius="sm"
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
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <Button
                color="success"
                className="text-white"
                radius="sm"
                startContent={!isAddingData && <SaveIcon />}
                isDisabled={checkAllDataCompiled()}
                isLoading={isAddingData}
                onClick={handleUpdateCustomer}
              >
                {isAddingData ? "Salvando il cliente..." : "Salva cliente"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
