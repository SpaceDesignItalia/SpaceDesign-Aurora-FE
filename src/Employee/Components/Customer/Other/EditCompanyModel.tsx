import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input, Button } from "@nextui-org/react";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";
import { useParams } from "react-router-dom";

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

export default function EditCompanyModel() {
  const { CompanyId, CompanyName } = useParams();
  const [newCompanyData, setNewCompanyData] = useState<Company>({
    CompanyId: 0,
    CompanyName: "",
    CompanyAddress: "",
    CompanyEmail: "",
    CompanyPhone: "",
  });
  const [initialCompanyData, setInitialCompanyData] = useState<Company>({
    CompanyId: 0,
    CompanyName: "",
    CompanyAddress: "",
    CompanyEmail: "",
    CompanyPhone: "",
  });
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

  useEffect(() => {
    axios
      .get("/Company/GET/GetCompanyByIdAndName", {
        params: { CompanyId: CompanyId, CompanyName: CompanyName },
      })
      .then((res) => {
        const companyData = res.data[0];
        // Verifica se CompanyPhone è null e imposta una stringa vuota se lo è
        const updatedCompanyData = {
          ...companyData,
          CompanyPhone:
            companyData.CompanyPhone !== null ? "" : companyData.CompanyPhone,
        };
        setNewCompanyData(updatedCompanyData);
        setInitialCompanyData(updatedCompanyData);
      });
  }, []);

  function handleCompanyNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setNewCompanyData({ ...newCompanyData, CompanyName: e.target.value });
    }
  }

  function handleCompanyAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setNewCompanyData({ ...newCompanyData, CompanyAddress: e.target.value });
    }
  }

  function handleCompanyEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 100) {
      setNewCompanyData({ ...newCompanyData, CompanyEmail: e.target.value });
    }
  }

  function handleCompanyPhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value.replace(/\D/g, ""); // Rimuove tutti i caratteri non numerici
    if (input.length <= 15) {
      setNewCompanyData({ ...newCompanyData, CompanyPhone: input });
    }
  }

  function checkAllDataCompiled() {
    if (
      newCompanyData.CompanyName !== initialCompanyData.CompanyName ||
      newCompanyData.CompanyAddress !== initialCompanyData.CompanyAddress ||
      newCompanyData.CompanyEmail !== initialCompanyData.CompanyEmail ||
      newCompanyData.CompanyPhone !== initialCompanyData.CompanyPhone
    ) {
      return false;
    }
    return true;
  }

  async function handleUpdateCompany() {
    try {
      setIsAddingData(true);

      const res = await axios.put("/Company/UPDATE/UpdateCompanyData", {
        CompanyData: newCompanyData,
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "L'azienda è stata modificata con successo.",
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
          "Si è verificato un errore durante la modifica dell'azienda. Per favore, riprova più tardi.",
        alertColor: "red",
      });

      setTimeout(() => {
        window.location.href = "/administration/customer";
      }, 2000);
      console.error("Errore durante l'aggiornamento dell'azienda:", error);
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
                Modifica azienda
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                In questo pannello potrai modificare un'azienda dal database.
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
                  value={newCompanyData.CompanyName}
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
                  value={newCompanyData.CompanyAddress}
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
                  value={newCompanyData.CompanyEmail}
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
                  value={newCompanyData.CompanyPhone}
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
              onClick={handleUpdateCompany}
            >
              {isAddingData ? "Salvando le modifiche..." : "Salva modifiche"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
