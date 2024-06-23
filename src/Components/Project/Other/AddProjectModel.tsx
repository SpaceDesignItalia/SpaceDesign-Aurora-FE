import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Textarea,
  Autocomplete,
  AutocompleteItem,
  Chip,
  DatePicker,
  Avatar,
  RadioGroup,
  Radio,
  cn,
} from "@nextui-org/react";
import { I18nProvider } from "@react-aria/i18n";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";
import { API_URL_IMG } from "../../../API/API";
import {
  DateValue,
  parseDate,
  getLocalTimeZone,
} from "@internationalized/date";
import dayjs from "dayjs";
import { useDateFormatter } from "@react-aria/i18n";

interface Project {
  ProjectName: string;
  ProjectDescription: string;
  ProjectEndDate: DateValue;
  ProjectManagerId: number;
  CompanyId: number;
  ProjectBannerId: number;
}

interface Company {
  CompanyId: number;
  CompanyName: string;
  CompanyAddress: string;
}

interface Manager {
  StafferId: number;
  StafferFullName: string;
  StafferEmail: string;
  RoleName: "CEO";
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
    ProjectEndDate: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
    ProjectManagerId: 0,
    CompanyId: 0,
    ProjectBannerId: 0,
  });
  const [banners, setBanners] = useState<Banner[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
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
    });
    axios.get("/Project/GET/GetAllManagers").then((res) => {
      setManagers(res.data);
    });
  }, []);

  function handleProjectBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNewProjectData({ ...newProjectData, ProjectBannerId: e.target.value });
  }

  function handleProjectNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 200) {
      setNewProjectData({ ...newProjectData, ProjectName: e.target.value });
    }
  }

  function handleProjectDescriptionChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (e.target.value.length <= 200) {
      setNewProjectData({
        ...newProjectData,
        ProjectDescription: e.target.value,
      });
    }
  }

  function handleProjectEndDateChange(date: DateValue) {
    setNewProjectData({
      ...newProjectData,
      ProjectEndDate: date,
    });
  }

  function handleProjectProjectManagerIdChange(e: React.Key) {
    setNewProjectData({ ...newProjectData, ProjectManagerId: String(e) });
  }

  function handleProjectCompanyIdChange(e: React.Key) {
    setNewProjectData({ ...newProjectData, CompanyId: String(e) });
  }

  function checkAllDataCompiled() {
    if (
      newProjectData.ProjectName !== "" &&
      newProjectData.ProjectDescription !== "" &&
      newProjectData.ProjectEndDate !== null &&
      newProjectData.ProjectManagerId !== 0 &&
      newProjectData.CompanyId !== 0 &&
      newProjectData.ProjectBannerId !== 0
    ) {
      return false;
    }
    return true;
  }

  async function handleCreateNewCompany() {
    try {
      setIsAddingData(true);

      // Formatta la data di fine progetto
      const formattedDate = dayjs(
        formatter.format(
          newProjectData.ProjectEndDate.toDate(getLocalTimeZone())
        )
      ).format("YYYY-MM-DD");

      // Crea una copia dei dati del progetto con la data formattata
      const formattedProjectData = {
        ...newProjectData,
        ProjectEndDate: formattedDate,
      };

      const res = await axios.post("/Project/POST/AddProject", {
        ProjectData: formattedProjectData,
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il progetto è stato aggiunto con successo.",
          alertColor: "green",
        });

        axios.post("/Project/POST/CreateProjectConversation", {
          ProjectId: res.data.ProjectId,
        });

        setTimeout(() => {
          window.location.href = "/projects";
        }, 2000);
        console.log("Successo:", res.data);
      }
      // Esegui altre azioni dopo la creazione del progetto, se necessario
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante l'aggiunta del progetto. Per favore, riprova più tardi.",
        alertColor: "red",
      });

      setTimeout(() => {
        window.location.href = "/projects";
      }, 2000);
      console.error("Errore durante la creazione del progetto:", error);
      // Gestisci l'errore in modo appropriato, ad esempio mostrando un messaggio all'utente
    }
  }

  let formatter = useDateFormatter({ dateStyle: "full" });

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
                  <RadioGroup
                    orientation="horizontal"
                    value={String(newProjectData.ProjectBannerId)}
                    onChange={handleProjectBannerChange}
                  >
                    {banners.length > 0 &&
                      banners.map((banner) => (
                        <CustomRadio
                          key={banner.ProjectBannerId}
                          value={banner.ProjectBannerId.toString()}
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
                  htmlFor="project-name"
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
                  htmlFor="project-end-date"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Fine Progetto
                </label>
                <I18nProvider locale="it-GB">
                  <DatePicker
                    variant="bordered"
                    radius="sm"
                    value={newProjectData.ProjectEndDate}
                    onChange={handleProjectEndDateChange}
                  />
                </I18nProvider>
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label
                  htmlFor="project-description"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Descrizione
                </label>
                <Textarea
                  variant="bordered"
                  type="textarea"
                  radius="sm"
                  value={newProjectData.ProjectDescription}
                  onChange={handleProjectDescriptionChange}
                  fullWidth
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="project-manager"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Project Manager
                </label>
                <Autocomplete
                  defaultItems={managers}
                  placeholder="Seleziona Project Manager"
                  onSelectionChange={handleProjectProjectManagerIdChange}
                  variant="bordered"
                  radius="sm"
                  aria-label="manager"
                  fullWidth
                >
                  {(manager) => (
                    <AutocompleteItem
                      key={manager.StafferId}
                      textValue={manager.StafferFullName}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <div className="flex flex-col">
                            <span className="text-small">
                              {manager.StafferFullName}{" "}
                              <Chip
                                color="primary"
                                size="sm"
                                radius="sm"
                                variant="flat"
                              >
                                {manager.RoleName}
                              </Chip>
                            </span>
                            <span className="text-tiny text-default-400">
                              {manager.StafferEmail}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="company"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Azienda
                </label>
                <Autocomplete
                  defaultItems={companies}
                  placeholder="Seleziona azienda"
                  onSelectionChange={handleProjectCompanyIdChange}
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
              isDisabled={checkAllDataCompiled()}
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
