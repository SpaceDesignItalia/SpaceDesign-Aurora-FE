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
  CompanyPhone: string | null;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

const initialCompanyData: Company = {
  CompanyId: 0,
  CompanyName: "",
  CompanyAddress: "",
  CompanyEmail: "",
  CompanyPhone: null,
};

const EditCompanyModel: React.FC = () => {
  const { CompanyId, CompanyName } = useParams<{
    CompanyId: string;
    CompanyName: string;
  }>();
  const [newCompanyData, setNewCompanyData] =
    useState<Company>(initialCompanyData);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

  useEffect(() => {
    axios
      .get(
        `/Company/GET/GetCompanyByIdAndName?CompanyId=${CompanyId}&CompanyName=${CompanyName}`
      )
      .then((res) => {
        const companyData = res.data[0];
        const updatedCompanyData: Company = {
          ...companyData,
          CompanyPhone:
            companyData.CompanyPhone !== null ? companyData.CompanyPhone : null,
        };
        setNewCompanyData(updatedCompanyData);
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
    return (
      (newCompanyData.CompanyName === initialCompanyData.CompanyName &&
        newCompanyData.CompanyAddress === initialCompanyData.CompanyAddress &&
        newCompanyData.CompanyEmail === initialCompanyData.CompanyEmail &&
        newCompanyData.CompanyPhone === initialCompanyData.CompanyPhone) ||
      (newCompanyData.CompanyPhone === null &&
        initialCompanyData.CompanyPhone === null)
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
          alertTitle: "Operazione completata",
          alertDescription: "L'azienda è stata modificata con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/administration/customer";
        }, 2000);
        console.log("Successo:", res.data);
      }
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante la modifica dell'azienda. Per favore, riprova più tardi.",
        alertColor: "red",
      });
      console.error("Errore durante l'aggiornamento dell'azienda:", error);
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
                Modifica azienda
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                In questo pannello potrai modificare un'azienda dal database.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="CompanyName"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nome azienda <span className="text-red-600 font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="sm"
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
                  Indirizzo <span className="text-red-600 font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="sm"
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
                  <span className="text-red-600 font-bold">*</span>
                </label>
                <Input
                  variant="bordered"
                  type="email"
                  radius="sm"
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
                  radius="sm"
                  name="CompanyPhone"
                  value={newCompanyData.CompanyPhone || ""}
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
              onClick={handleUpdateCompany}
            >
              {isAddingData ? "Salvando le modifiche..." : "Salva modifiche"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditCompanyModel;
