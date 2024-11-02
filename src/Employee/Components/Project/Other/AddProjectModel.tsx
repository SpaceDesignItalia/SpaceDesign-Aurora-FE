import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Textarea,
  Autocomplete,
  AutocompleteItem,
  DatePicker,
  Avatar,
  RadioGroup,
  Radio,
  cn,
  User,
} from "@nextui-org/react";
import { I18nProvider } from "@react-aria/i18n";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";
import { API_URL_IMG } from "../../../../API/API";
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
  StafferImageUrl: string;
  RoleName: string;
}

interface Banner {
  ProjectBannerId: number;
  ProjectBannerPath: string;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

export const CustomRadio = (props: any) => {
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
    alertColor: "red",
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
    setNewProjectData({
      ...newProjectData,
      ProjectBannerId: Number(e.target.value),
    });
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

  function handleProjectProjectManagerIdChange(e: string | number | null) {
    setNewProjectData({ ...newProjectData, ProjectManagerId: Number(e) });
  }

  function handleProjectCompanyIdChange(e: string | number | null) {
    setNewProjectData({ ...newProjectData, CompanyId: Number(e) });
  }

  function checkAllDataCompiled() {
    if (
      newProjectData.ProjectName !== "" &&
      newProjectData.ProjectDescription !== "" &&
      newProjectData.ProjectEndDate !== null &&
      newProjectData.ProjectManagerId !== 0 &&
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
        console.log("Creating conversation for project...");

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
        <div className="space-y-6 bg-white py-6">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Progetto
            </h3>
            <p className="mt-1 text-sm text-gray-500 sm:w-1/3">
              In questo pannello potrai creare un nuovo progetto nel database. I
              campi contrassegnati con un asterisco (
              <span className="text-danger font-bold">*</span>) sono obbligatori
              e devono essere compilati per completare la registrazione.
              Assicurati di fornire tutte le informazioni necessarie per
              garantire un inserimento corretto.
            </p>
          </div>

          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-6">
              <label
                htmlFor="last-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Banner <span className="text-red-600 font-bold">*</span>
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
                            API_URL_IMG + "/banners/" + banner.ProjectBannerPath
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
                Nome progetto <span className="text-red-600 font-bold">*</span>
              </label>
              <Input
                variant="bordered"
                type="text"
                radius="full"
                placeholder="Es. Nuova App Mobile"
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
                Fine Progetto <span className="text-red-600 font-bold">*</span>
              </label>
              <I18nProvider locale="it-GB">
                <DatePicker
                  variant="bordered"
                  radius="full"
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
                Descrizione <span className="text-red-600 font-bold">*</span>
              </label>
              <Textarea
                variant="bordered"
                type="textarea"
                radius="full"
                placeholder="Es. Creazione di un'app mobile per la gestione delle attività quotidiane"
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
                Project Manager{" "}
                <span className="text-red-600 font-bold">*</span>
              </label>

              <Autocomplete
                defaultItems={managers}
                placeholder="Seleziona Project Manager"
                onSelectionChange={handleProjectProjectManagerIdChange}
                variant="bordered"
                radius="full"
                aria-label="manager"
                fullWidth
              >
                {(manager) => (
                  <AutocompleteItem
                    key={manager.StafferId}
                    textValue={manager.StafferFullName}
                  >
                    <User
                      name={manager.StafferFullName}
                      description={manager.RoleName}
                      avatarProps={{
                        src:
                          manager.StafferImageUrl &&
                          API_URL_IMG +
                            "/profileIcons/" +
                            manager.StafferImageUrl,
                        name: manager.StafferFullName,
                      }}
                    />
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
        <div className="py-3 text-right">
          <Button
            color="primary"
            radius="full"
            startContent={!isAddingData && <SaveIcon />}
            isDisabled={checkAllDataCompiled()}
            isLoading={isAddingData}
            onClick={handleCreateNewCompany}
          >
            {isAddingData ? "Salvando il progetto..." : "Salva progetto"}
          </Button>
        </div>
      </div>
    </>
  );
}
