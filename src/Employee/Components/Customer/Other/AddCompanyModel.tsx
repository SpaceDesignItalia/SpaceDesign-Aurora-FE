import React, { useState } from "react";
import axios from "axios";
import { Input, Button } from "@nextui-org/react";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";

// Interfacce per i dati dell'azienda e per i dati dell'alert
interface Company {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

// Dati iniziali vuoti per un'azienda e un alert
const initialCompanyData: Company = {
  companyName: "",
  companyAddress: "",
  companyEmail: "",
  companyPhone: "",
};

const initialAlertData: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

const AddCompanyModel: React.FC = () => {
  // Stato per i dati della nuova azienda, il caricamento, e l'alert
  const [newCompanyData, setNewCompanyData] =
    useState<Company>(initialCompanyData);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(initialAlertData);

  // Gestisce il cambiamento nei campi di input dell'azienda
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompanyData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Controlla che i campi obbligatori dell'azienda siano compilati
  const checkAllDataCompiled = () => {
    return !(
      newCompanyData.companyName &&
      newCompanyData.companyAddress &&
      newCompanyData.companyEmail
    );
  };

  // Effettua la richiesta per aggiungere una nuova azienda
  const handleCreateNewCompany = async () => {
    try {
      setIsAddingData(true); // Imposta lo stato di caricamento su true

      // Esegue la chiamata API per salvare i dati dell'azienda
      const res = await axios.post("/Company/POST/AddCompany", newCompanyData);

      // Messaggio di successo se l'azienda è stata aggiunta correttamente
      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "L'azienda è stata aggiunta con successo.",
          alertColor: "green",
        });

        // Reindirizza alla pagina specifica dopo 2 secondi
        setTimeout(() => {
          window.location.href = "/administration/customer";
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        // Controllo dell'errore specifico 409 (azienda con lo stesso nome)
        if (error.response?.status === 409) {
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Conflitto durante l'operazione",
            alertDescription:
              "Esiste già un'azienda con questo nome. Per favore, usa un nome differente.",
            alertColor: "yellow",
          });
        } else {
          // Messaggio di errore generico in caso di altri problemi con la richiesta
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Errore durante l'operazione",
            alertDescription:
              "Si è verificato un errore durante l'aggiunta dell'azienda. Per favore, riprova più tardi.",
            alertColor: "red",
          });
        }
        console.error("Errore durante la creazione dell'azienda:", error);
      }
    } finally {
      setIsAddingData(false); // Reimposta lo stato di caricamento su false
    }
  };

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <div className="space-y-6 bg-white py-6">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Azienda
            </h3>
            <p className="mt-1 text-sm text-gray-500 sm:w-1/3">
              In questo pannello potrai aggiungere una nuova azienda al
              database. I campi contrassegnati con un asterisco (
              <span className="text-danger font-bold">*</span>) sono
              obbligatori.
            </p>
          </div>

          <div className="grid grid-cols-6 gap-6">
            {/* Campo per il nome dell'azienda */}
            <div className="col-span-6 sm:col-span-6">
              <label
                htmlFor="companyName"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Nome azienda <span className="text-red-600 font-bold">*</span>
              </label>
              <Input
                variant="bordered"
                type="text"
                radius="full"
                name="companyName"
                placeholder="Inserisci la ragione sociale"
                value={newCompanyData.companyName}
                onChange={handleChange}
                fullWidth
              />
            </div>

            {/* Campo per l'indirizzo dell'azienda */}
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="companyAddress"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Indirizzo <span className="text-red-600 font-bold">*</span>
              </label>
              <Input
                variant="bordered"
                type="text"
                radius="full"
                name="companyAddress"
                placeholder="Inserisci l'indirizzo dell'azienda"
                value={newCompanyData.companyAddress}
                onChange={handleChange}
                fullWidth
              />
            </div>

            {/* Campo per l'email dell'azienda */}
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="companyEmail"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email azienda <span className="text-red-600 font-bold">*</span>
              </label>
              <Input
                variant="bordered"
                type="email"
                radius="full"
                name="companyEmail"
                placeholder="Inserisci l'email aziendale"
                value={newCompanyData.companyEmail}
                onChange={handleChange}
                fullWidth
              />
            </div>

            {/* Campo per il numero di telefono dell'azienda */}
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="companyPhone"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Numero di telefono
              </label>
              <Input
                variant="bordered"
                type="text"
                radius="full"
                name="companyPhone"
                placeholder="Inserisci il numero di telefono aziendale"
                value={newCompanyData.companyPhone}
                onChange={handleChange}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Bottone per salvare i dati */}
        <div className="py-3 text-right">
          <Button
            color="primary"
            className="text-white"
            radius="full"
            startContent={!isAddingData && <SaveIcon />}
            isDisabled={checkAllDataCompiled()} // Disabilita se i campi obbligatori sono vuoti
            isLoading={isAddingData}
            onClick={handleCreateNewCompany}
          >
            {isAddingData ? "Salvando l'azienda..." : "Salva azienda"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddCompanyModel;
