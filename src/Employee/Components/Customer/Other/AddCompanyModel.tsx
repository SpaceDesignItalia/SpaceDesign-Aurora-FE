import React, { useState } from "react";
import axios from "axios";
import { Input, Button } from "@nextui-org/react";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";

interface Company {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

const initialCompanyData: Company = {
  companyName: "",
  companyAddress: "",
  companyEmail: "",
  companyPhone: "",
};

const initialAlertData: AlertData = {
  isOpen: false,
  alertTitle: "",
  alertDescription: "",
  alertColor: "",
};

const AddCompanyModel: React.FC = () => {
  const [newCompanyData, setNewCompanyData] =
    useState<Company>(initialCompanyData);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(initialAlertData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompanyData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const checkAllDataCompiled = () => {
    return !(
      newCompanyData.companyName &&
      newCompanyData.companyAddress &&
      newCompanyData.companyEmail
    );
  };

  const handleCreateNewCompany = async () => {
    try {
      setIsAddingData(true);

      const res = await axios.post("/Company/POST/AddCompany", newCompanyData);

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "L'azienda è stata aggiunta con successo.",
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
          "Si è verificato un errore durante l'aggiunta dell'azienda. Per favore, riprova più tardi.",
        alertColor: "red",
      });
      console.error("Errore durante la creazione dell'azienda:", error);
    } finally {
      setIsAddingData(false);
    }
  };

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <div className="border border-gray-200 sm:overflow-hidden rounded-xl">
          <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Azienda
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                In questo pannello potrai aggiungere una nuova azienda al
                database.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-6">
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
                  radius="sm"
                  name="companyName"
                  placeholder="Inserisci la ragione sociale"
                  value={newCompanyData.companyName}
                  onChange={handleChange}
                  fullWidth
                />
              </div>

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
                  radius="sm"
                  name="companyAddress"
                  placeholder="Inserisci l'indirizzo dell'azienda"
                  value={newCompanyData.companyAddress}
                  onChange={handleChange}
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="companyEmail"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email azienda{" "}
                  <span className="text-red-600 font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="email"
                  radius="sm"
                  name="companyEmail"
                  placeholder="Inserisci l'email aziendale"
                  value={newCompanyData.companyEmail}
                  onChange={handleChange}
                  fullWidth
                />
              </div>

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
                  radius="sm"
                  name="companyPhone"
                  placeholder="Inserisci il numero di telefono aziendale"
                  value={newCompanyData.companyPhone}
                  onChange={handleChange}
                  fullWidth
                />
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
              onClick={handleCreateNewCompany}
            >
              {isAddingData ? "Salvando l'azienda..." : "Salva azienda"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddCompanyModel;
