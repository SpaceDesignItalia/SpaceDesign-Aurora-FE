import {
  Input,
  Autocomplete,
  AutocompleteItem,
  Button,
  Link,
} from "@nextui-org/react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SaveIcon from "@mui/icons-material/Save";
import { useEffect, useState } from "react";
import axios from "axios";
import StatusAlert from "../../Layout/StatusAlert";

interface Company {
  CompanyId: number;
  CompanyName: string;
  CompanyAddress: string;
  CompanyEmail: string;
  CompanyPhone: string;
}

interface Customer {
  CustomerName: string;
  CustomerSurname: string;
  CustomerEmail: string;
  CustomerPhone: string;
  CustomerPassword: string;
  CompanyId: string;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

export default function AddCustomerModel() {
  const [company, setCompany] = useState<Company[]>([]);
  const [customerData, setCustomerData] = useState<Customer>({
    CustomerName: "",
    CustomerSurname: "",
    CustomerEmail: "",
    CustomerPhone: null,
    CustomerPassword: "",
    CompanyId: "",
  });
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

  useEffect(() => {
    axios.get("/Company/GET/GetAllCompany").then((res) => {
      setCompany(res.data);
    });
  }, []);

  function handleCustomerNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setCustomerData({ ...customerData, CustomerName: e.target.value });
    }
  }

  function handleCustomerSurnameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setCustomerData({ ...customerData, CustomerSurname: e.target.value });
    }
  }

  function handleCustomerEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 100) {
      setCustomerData({ ...customerData, CustomerEmail: e.target.value });
    }
  }

  function handleCustomerPhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value.replace(/\D/g, ""); // Rimuove tutti i caratteri non numerici
    if (input.length <= 15) {
      setCustomerData({ ...customerData, CustomerPhone: input });
    }
  }

  function handleCustomerCompanyId(e: React.Key) {
    setCustomerData({ ...customerData, CompanyId: String(e) });
  }

  function checkAllDataCompiled() {
    if (
      customerData.CustomerName !== "" &&
      customerData.CustomerSurname !== "" &&
      customerData.CustomerEmail !== "" &&
      customerData.CompanyId !== ""
    ) {
      return false;
    }
    return true;
  }

  async function generateRandomPassword(length: number) {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]|;:,.<>?";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  async function handleCreateNewCustomer() {
    try {
      setIsAddingData(true);

      const password = await generateRandomPassword(14);

      const res = await axios.post("/Customer/POST/AddCustomer", {
        customerData: { ...customerData, CustomerPassword: password },
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il cliente è stato aggiunto con successo.",
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
          "Si è verificato un errore durante l'aggiunta del cliente. Per favore, riprova più tardi.",
        alertColor: "red",
      });

      setTimeout(() => {
        window.location.href = "/administration/customer";
      }, 2000);
      console.error("Errore durante la creazione del cliente:", error);
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
                  In questo pannello potrai aggiungere un nuovo cliente al
                  database.
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
                    value={customerData.CustomerName}
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
                    value={customerData.CustomerSurname}
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
                    value={customerData.CustomerEmail}
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
                    value={customerData.CustomerPhone}
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
                    <Button
                      as={Link}
                      href="/administration/customer/add-company"
                      color="primary"
                      radius="sm"
                      startContent={<AddRoundedIcon />}
                    >
                      Aggiungi azienda
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <Button
                color="success"
                className="text-white"
                radius="sm"
                startContent={<SaveIcon />}
                isDisabled={checkAllDataCompiled()}
                isLoading={isAddingData}
                onClick={handleCreateNewCustomer}
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
