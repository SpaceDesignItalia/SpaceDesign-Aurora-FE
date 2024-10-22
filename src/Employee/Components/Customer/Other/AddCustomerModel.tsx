import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import {
  Input,
  Autocomplete,
  AutocompleteItem,
  Button,
} from "@nextui-org/react";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";
import { useParams } from "react-router-dom";

interface Customer {
  CustomerId: number;
  CustomerName: string;
  CustomerSurname: string;
  CustomerEmail: string;
  CustomerPhone: string | null;
  CompanyId: number;
}

interface Company {
  CompanyId: number;
  CompanyName: string;
  CompanyAddress: string;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const initialCustomerData: Customer = {
  CustomerId: 0,
  CustomerName: "",
  CustomerSurname: "",
  CustomerEmail: "",
  CustomerPhone: null,
  CompanyId: 0,
};

export default function EditCustomerModel() {
  const { CustomerId } = useParams();
  const [customerData, setCustomerData] =
    useState<Customer>(initialCustomerData);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "red",
  });

  useEffect(() => {
    axios
      .get(`/Customer/GET/GetCustomerById?CustomerId=${CustomerId}`)
      .then((res) => {
        const customer = res.data[0];
        setCustomerData(customer);
      })
      .catch((error) => {
        console.error("Errore nel recupero del cliente:", error);
      });

    axios
      .get("/Company/GET/GetAllCompany")
      .then((res) => {
        setCompanies(res.data);
      })
      .catch((error) => {
        console.error("Errore nel recupero delle aziende:", error);
      });
  }, [CustomerId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue =
      name === "CustomerPhone"
        ? value.replace(/\D/g, "").slice(0, 15) || null
        : value.slice(0, 150);
    setCustomerData((prevData) => ({ ...prevData, [name]: newValue }));
  };

  const handleCompanyIdChange = (key: string | number | null) => {
    if (key !== null) {
      setCustomerData((prevData) => ({ ...prevData, CompanyId: Number(key) }));
    }
  };

  const checkAllDataCompiled = () => {
    return !(
      customerData.CustomerName &&
      customerData.CustomerSurname &&
      customerData.CustomerEmail &&
      customerData.CompanyId
    );
  };

  const generatePassword = (): string => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const passwordLength = 8;
    let password = "";
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  const handleUpdateCustomer = async () => {
    try {
      setIsSaving(true);
      const res = await axios.post("/Customer/POST/AddCustomer", {
        CustomerData: {
          ...customerData,
          CustomerPassword: generatePassword(), // Assign the generated password
        },
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
      }
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante l'aggiunta del cliente. Per favore, riprova più tardi.",
        alertColor: "red",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <form>
          <div className="space-y-6 bg-white py-6">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Modifica Cliente
              </h3>
              <p className="mt-1 text-sm text-gray-500 sm:w-1/3">
                In questo pannello potrai aggiungere un nuovo cliente al
                database. I campi contrassegnati con un asterisco (
                <span className="text-danger font-bold">*</span>) sono
                obbligatori.
              </p>
            </div>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="CustomerName"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nome <span className="text-red-600 font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="full"
                  name="CustomerName"
                  placeholder="Inserisci il nome"
                  value={customerData.CustomerName}
                  onChange={handleChange}
                  aria-label="Nome"
                  fullWidth
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="CustomerSurname"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Cognome <span className="text-red-600 font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="full"
                  name="CustomerSurname"
                  placeholder="Inserisci il cognome"
                  value={customerData.CustomerSurname}
                  onChange={handleChange}
                  aria-label="Cognome"
                  fullWidth
                />
              </div>
              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="CustomerEmail"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email <span className="text-red-600 font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="email"
                  radius="full"
                  name="CustomerEmail"
                  placeholder="Inserisci l'email"
                  value={customerData.CustomerEmail}
                  onChange={handleChange}
                  aria-label="Email"
                  fullWidth
                />
              </div>
              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="CustomerPhone"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Numero di telefono
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="full"
                  name="CustomerPhone"
                  placeholder="Inserisci il numero di telefono"
                  value={customerData.CustomerPhone || ""}
                  onChange={handleChange}
                  aria-label="Numero di telefono"
                  fullWidth
                />
              </div>
              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="company"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Azienda <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <Autocomplete
                    defaultItems={companies}
                    placeholder="Seleziona azienda"
                    onSelectionChange={handleCompanyIdChange}
                    selectedKey={String(customerData.CompanyId)}
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
                          <div className="flex flex-col">
                            <span className="text-small">
                              {company.CompanyName}
                            </span>
                            <span className="text-tiny text-default-400">
                              {company.CompanyAddress}
                            </span>
                          </div>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 text-right sm:px-6">
            <Button
              color="primary"
              className="text-white"
              radius="full"
              startContent={<SaveIcon />}
              isDisabled={checkAllDataCompiled()}
              isLoading={isSaving}
              onClick={handleUpdateCustomer}
            >
              {isSaving ? "Salvando il cliente..." : "Salva cliente"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
