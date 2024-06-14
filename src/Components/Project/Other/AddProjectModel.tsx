import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Textarea,
  Autocomplete,
  DatePicker,
  Avatar,
  RadioGroup,
  Radio,
  cn,
  AutocompleteItem,
} from "@nextui-org/react";
import { I18nProvider } from "@react-aria/i18n";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";
import { API_URL_IMG } from "../../../API/API";

interface Project {
  ProjectName: string;
  ProjectDescription: string;
  ProjectEndDate: Date;
  CompanyId: number;
  ProjectBannerId: number;
}

interface Company {
  CompanyId: number;
  CompanyName: string;
  CompanyAddress: string;
}

interface Banner {
  ProjectBannerId: number;
  ProjectBannerPath: string;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

export const CustomRadio = (props) => {
  const { children, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
          "flex-row cursor-pointer rounded-lg border-2 border-transparent",
          "data-[selected=true]:border-primary data-[selected=true]:bg-content2"
        ),
      }}
    >
      {children}
    </Radio>
  );
};

export default function AddProjectModel() {
  const [newProjectData, setNewProjectData] = useState<Project>({
    ProjectName: "",
    ProjectDescription: "",
    ProjectEndDate: null,
    CompanyId: 0,
    ProjectBannerId: 0,
  });
  const [banners, setBanners] = useState<Banner[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

  useEffect(() => {
    axios.get("/Project/GET/GetAllBanners").then((res) => {
      setBanners(res.data);
    });
    axios.get("/Company/GET/GetAllCompany").then((res) => {
      setCompanies(res.data);
      console.log(res.data);
    });
  }, []);

  function handleProjectNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setNewProjectData({ ...newProjectData, ProjectName: e.target.value });
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
                Progetto
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                In questo pannello potrai creare un nuovo progetto nel database.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Banner
                </label>
                <div className="flex flex-wrap gap-5 mt-3">
                  <RadioGroup orientation="horizontal">
                    {banners.length > 0 &&
                      banners.map((banner) => (
                        <CustomRadio
                          key={banner.ProjectBannerId}
                          value={banner.ProjectBannerId}
                        >
                          <Avatar
                            radius="sm"
                            src={
                              API_URL_IMG +
                              "/banners/" +
                              banner.ProjectBannerPath
                            }
                          />
                        </CustomRadio>
                      ))}
                  </RadioGroup>
                </div>
              </div>
              <div className="col-span-6 sm:col-span-4">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nome progetto
                </label>
                <Input
                  variant="bordered"
                  type="text"
                  radius="sm"
                  value={newProjectData.ProjectName}
                  onChange={handleProjectNameChange}
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label
                  htmlFor="Name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Fine Progetto
                </label>
                <I18nProvider locale="it-GB">
                  <DatePicker variant="bordered" radius="sm" />
                </I18nProvider>
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Descrizione
                </label>
                <Textarea
                  variant="bordered"
                  type="text"
                  radius="sm"
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="Name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Project Manager
                </label>
                <Autocomplete variant="bordered" type="text" radius="sm" />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Azienda
                </label>
                <Autocomplete
                  defaultItems={companies}
                  placeholder="Seleziona azienda"
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
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button
              color="success"
              className="text-white"
              radius="sm"
              startContent={!isAddingData && <SaveIcon />}
              isLoading={isAddingData}
              onClick={handleCreateNewCompany}
            >
              {isAddingData ? "Salvando il progetto..." : "Salva progetto"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
