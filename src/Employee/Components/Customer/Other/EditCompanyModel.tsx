import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import StatusAlert from "../../Layout/StatusAlert";
import { useParams } from "react-router-dom";

interface Company {
  CompanyId: number;
  CompanyName: string;
  CompanyAddress: string;
  CompanyEmail: string;
  CompanyPhone: string | null;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const INITIAL_COMPANY_DATA: Company = {
  CompanyId: 0,
  CompanyName: "",
  CompanyAddress: "",
  CompanyEmail: "",
  CompanyPhone: null,
};

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

const EditCompanyModel: React.FC = () => {
  const { CompanyId, CompanyName } = useParams<{
    CompanyId: string;
    CompanyName: string;
  }>();

  const [newCompanyData, setNewCompanyData] =
    useState<Company>(INITIAL_COMPANY_DATA);
  const [originalCompanyData, setOriginalCompanyData] =
    useState<Company | null>(null); // Stato per i dati originali
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);

  useEffect(() => {
    axios
      .get("/Company/GET/GetCompanyByIdAndName", {
        params: { CompanyId: CompanyId, CompanyName: CompanyName },
      })
      .then((res) => {
        const companyData = res.data[0];
        const updatedCompanyData: Company = {
          ...companyData,
          CompanyPhone:
            companyData.CompanyPhone !== null ? companyData.CompanyPhone : null,
        };
        setNewCompanyData(updatedCompanyData);
        setOriginalCompanyData(updatedCompanyData); // Salva i dati originali
      });
  }, [CompanyId, CompanyName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompanyData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const checkAllDataCompiled = () => {
    // Se non ci sono dati originali, non disabilitare il pulsante
    if (!originalCompanyData) return true;

    // Confronta i dati attuali con i dati originali
    return (
      newCompanyData.CompanyName === originalCompanyData.CompanyName &&
      newCompanyData.CompanyAddress === originalCompanyData.CompanyAddress &&
      newCompanyData.CompanyEmail === originalCompanyData.CompanyEmail &&
      newCompanyData.CompanyPhone === originalCompanyData.CompanyPhone
    );
  };

  const handleUpdateCompany = async () => {
    try {
      setIsAddingData(true);

      const res = await axios.put("/Company/UPDATE/UpdateCompanyData", {
        CompanyData: {
          ...newCompanyData,
          CompanyPhone: newCompanyData.CompanyPhone || null,
        },
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "L'azienda è stata modificata con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/administration/customer";
        }, 2000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Conflitto durante l'operazione",
            alertDescription:
              "Il nome dell'azienda fornito è già presente nel database. Per favore, scegli un nome diverso.",
            alertColor: "yellow",
          });
        } else {
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Errore durante l'operazione",
            alertDescription:
              "Si è verificato un errore durante la modifica dell'azienda. Per favore, riprova più tardi.",
            alertColor: "red",
          });
        }
      } else {
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Errore sconosciuto",
          alertDescription:
            "Si è verificato un errore sconosciuto. Per favore, riprova più tardi.",
          alertColor: "red",
        });
      }
      console.error("Errore durante l'aggiornamento dell'azienda:", error);
    } finally {
      setIsAddingData(false);
    }
  };

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <div className="space-y-6 bg-white px-4 py-6 sm:p-6">
          <div>
            <h3 className="text-base font-medium leading-6 text-gray-900">
              Modifica azienda
            </h3>
            <p className="mt-1 text-sm text-gray-500 sm:w-1/3">
              In questo pannello potrai modificare un'azienda dal database. I
              campi contrassegnati con un asterisco (
              <span className="text-danger font-semibold">*</span>) sono
              obbligatori.
            </p>
          </div>

          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-6">
              <label
                htmlFor="CompanyName"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Nome azienda{" "}
                <span className="text-red-600 font-semibold">*</span>
              </label>
              <Input
                variant="bordered"
                type="text"
                radius="full"
                name="CompanyName"
                value={newCompanyData.CompanyName}
                onChange={handleChange}
                fullWidth
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="CompanyAddress"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Indirizzo <span className="text-red-600 font-semibold">*</span>
              </label>
              <Input
                variant="bordered"
                type="text"
                radius="full"
                name="CompanyAddress"
                value={newCompanyData.CompanyAddress}
                onChange={handleChange}
                fullWidth
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="CompanyEmail"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email azienda{" "}
                <span className="text-red-600 font-semibold">*</span>
              </label>
              <Input
                variant="bordered"
                type="email"
                radius="full"
                name="CompanyEmail"
                value={newCompanyData.CompanyEmail}
                onChange={handleChange}
                fullWidth
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="CompanyPhone"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Numero di telefono
              </label>
              <Input
                variant="bordered"
                type="text"
                radius="full"
                name="CompanyPhone"
                value={newCompanyData.CompanyPhone || ""}
                onChange={handleChange}
                fullWidth
              />
            </div>
          </div>
        </div>
        <div className="bg-gray-5 py-3 text-right">
          <Button
            color="primary"
            className="text-white"
            radius="full"
            startContent={
              !isAddingData && <Icon icon="basil:save-outline" fontSize={24} />
            }
            isDisabled={checkAllDataCompiled()}
            isLoading={isAddingData}
            onClick={handleUpdateCompany}
          >
            {isAddingData ? "Salvando le modifiche..." : "Salva modifiche"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default EditCompanyModel;
