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

export default function AddCompanyModel() {
  const [newCompanyData, setNewCompanyData] = useState<Company>({
    companyName: "",
    companyAddress: "",
    companyEmail: "",
    companyPhone: null,
  });
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

  function handleCompanyNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setNewCompanyData({ ...newCompanyData, companyName: e.target.value });
    }
  }

  function handleCompanyAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setNewCompanyData({ ...newCompanyData, companyAddress: e.target.value });
    }
  }

  function handleCompanyEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 100) {
      setNewCompanyData({ ...newCompanyData, companyEmail: e.target.value });
    }
  }

  function handleCompanyPhoneChange(e) {
    const input = e.target.value.replace(/\D/g, ""); // Rimuove tutti i caratteri non numerici
    if (input.length <= 15) {
      setNewCompanyData({ ...newCompanyData, companyPhone: input });
    }
  }

  function checkAllDataCompiled() {
    if (
      newCompanyData.companyName !== "" &&
      newCompanyData.companyAddress !== "" &&
      newCompanyData.companyEmail !== ""
    ) {
      return false;
    }
    return true;
  }

  async function handleCreateNewCompany() {
    try {
      const res = await axios
        .post("/Company/POST/AddCompany", newCompanyData)
        .then(setIsAddingData(true));

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
        console.log("Successo:", res.data);
      }
      // Esegui altre azioni dopo la creazione dell'azienda, se necessario
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante l'aggiunta dell'azienda. Per favore, riprova più tardi.",
        alertColor: "red",
      });

      setTimeout(() => {
        window.location.href = "/administration/customer";
      }, 2000);
      console.error("Errore durante la creazione dell'azienda:", error);
      // Gestisci l'errore in modo appropriato, ad esempio mostrando un messaggio all'utente
    }
  }

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
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nome azienda
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="sm"
                  value={newCompanyData.companyName}
                  onChange={handleCompanyNameChange}
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Indirizzo
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="sm"
                  value={newCompanyData.companyAddress}
                  onChange={handleCompanyAddressChange}
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email azienda
                </label>
                <Input
                  variant="bordered"
                  type="email"
                  radius="sm"
                  value={newCompanyData.companyEmail}
                  onChange={handleCompanyEmailChange}
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
                  value={newCompanyData.companyPhone}
                  onChange={handleCompanyPhoneChange}
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
}
