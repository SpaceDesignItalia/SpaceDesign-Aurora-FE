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
} from "@nextui-org/react";
import { I18nProvider } from "@react-aria/i18n";
import SaveIcon from "@mui/icons-material/Save";
import StatusAlert from "../../Layout/StatusAlert";
import { DateValue, parseDate } from "@internationalized/date";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";

interface Project {
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: DateValue;
  ProjectEndDate: DateValue;
  ProjectManagerId: number;
  CompanyId: number;
  ProjectBannerId: number;
  StatusId: number;
}

interface Status {
  StatusId: number;
  StatusName: string;
  StatusColor: string;
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

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function EditProjectModel() {
  const { UniqueCode } = useParams<{
    UniqueCode: string;
  }>();
  const [ProjectId, setProjectId] = useState<number>(0);
  const [ProjectName, setProjectName] = useState<string>("");
  const [initialProjectData, setInitialProjectData] = useState<Project>({
    ProjectName: "",
    ProjectDescription: "",
    ProjectCreationDate: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
    ProjectEndDate: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
    ProjectManagerId: 0,
    CompanyId: 0,
    ProjectBannerId: 0,
    StatusId: 0,
  });
  const [newProjectData, setNewProjectData] = useState<Project>({
    ProjectName: "",
    ProjectDescription: "",
    ProjectCreationDate: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
    ProjectEndDate: parseDate(dayjs(new Date()).format("YYYY-MM-DD")),
    ProjectManagerId: 0,
    CompanyId: 0,
    ProjectBannerId: 0,
    StatusId: 0,
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Esegui tutte le chiamate API correlate in parallelo
        const [
          projectResponse,
          statusResponse,
          companiesResponse,
          managersResponse,
          statusListResponse,
        ] = await Promise.all([
          axios.get("/Project/GET/GetProjectByIdAndName", {
            params: { ProjectId, ProjectName },
          }),
          axios.get("/Project/GET/GetProjectStatus", { params: { ProjectId } }),
          axios.get("/Company/GET/GetAllCompany"),
          axios.get("/Project/GET/GetAllManagers"),
          axios.get("/Project/GET/GetAllStatus"),
        ]);

        let projectData = projectResponse.data;
        projectData = {
          ...projectData,
          ProjectEndDate: parseDate(
            dayjs(projectData.ProjectEndDate).format("YYYY-MM-DD")
          ),
          ProjectCreationDate: parseDate(
            dayjs(projectData.ProjectCreationDate).format("YYYY-MM-DD")
          ),
          StatusId: statusResponse.data.StatusId,
        };

        // Aggiorna lo stato combinando i dati
        setInitialProjectData(projectData);
        setNewProjectData(projectData);
        setCompanies(companiesResponse.data);
        setManagers(managersResponse.data);
        setStatusList(statusListResponse.data);
      } catch (error) {
        console.error(
          "Errore durante il recupero dei dati del progetto:",
          error
        );
      }
    };

    axios
      .get("/Project/GET/GetProjectByUniqueCode", { params: { UniqueCode } })
      .then((res: any) => {
        setProjectId(res.data.ProjectId);
        setProjectName(res.data.ProjectName);
        fetchProjectData();
      })
      .catch((error) => {
        console.error("Errore durante il recupero del progetto:", error);
      });
  }, [ProjectId, ProjectName]);

  function handleProjectNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 200) {
      setNewProjectData({ ...newProjectData, ProjectName: e.target.value });
    }
  }

  function handleProjectDescriptionChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setNewProjectData({
      ...newProjectData,
      ProjectDescription: e.target.value,
    });
  }

  function handleProjectCreationDateChange(date: DateValue) {
    setNewProjectData({
      ...newProjectData,
      ProjectCreationDate: date,
    });
  }

  function handleProjectEndDateChange(date: DateValue) {
    setNewProjectData({
      ...newProjectData,
      ProjectEndDate: date,
    });
  }

  function handleProjectProjectManagerIdChange(e: React.Key | null) {
    setNewProjectData({ ...newProjectData, ProjectManagerId: Number(e) });
  }

  function handleProjectCompanyIdChange(e: React.Key | null) {
    setNewProjectData({ ...newProjectData, CompanyId: Number(e) });
  }

  function handleProjectStatusChange(e: React.Key | null) {
    setNewProjectData({ ...newProjectData, StatusId: Number(e) });
  }

  function checkAllDataCompiled() {
    return (
      newProjectData.ProjectName === initialProjectData.ProjectName &&
      newProjectData.ProjectDescription ===
        initialProjectData.ProjectDescription &&
      dayjs(newProjectData.ProjectCreationDate.toString()).isSame(
        dayjs(initialProjectData.ProjectCreationDate.toString())
      ) &&
      dayjs(newProjectData.ProjectEndDate.toString()).isSame(
        dayjs(initialProjectData.ProjectEndDate.toString())
      ) &&
      newProjectData.ProjectManagerId === initialProjectData.ProjectManagerId &&
      newProjectData.CompanyId === initialProjectData.CompanyId &&
      newProjectData.StatusId === initialProjectData.StatusId
    );
  }

  async function handleUpdateProject() {
    try {
      setIsAddingData(true);

      // Formatta la data di inizio progetto
      const formattedCreationDate = dayjs(
        newProjectData.ProjectCreationDate.toString()
      ).format("YYYY-MM-DD");

      // Formatta la data di fine progetto
      const formattedEndDate = dayjs(
        newProjectData.ProjectEndDate.toString()
      ).format("YYYY-MM-DD");

      // Crea una copia dei dati del progetto con la data formattata
      const formattedProjectData = {
        ...newProjectData,
        ProjectCreationDate: formattedCreationDate,
        ProjectEndDate: formattedEndDate,
      };

      const res = await axios.put("/Project/UPDATE/UpdateProjectData", {
        ProjectData: formattedProjectData,
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "Il progetto è stato modificato con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.href = "/projects";
        }, 2000);
      }
      // Esegui altre azioni dopo la creazione del progetto, se necessario
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          // Handle conflict error (409)
          companies.find(
            (company) => company.CompanyId == newProjectData.CompanyId
          )?.CompanyName != undefined
            ? setAlertData({
                isOpen: true,
                onClose: () =>
                  setAlertData((prev) => ({ ...prev, isOpen: false })),
                alertTitle: "Conflitto durante l'operazione",
                alertDescription: `Un altro progetto con : ${
                  companies.find(
                    (company) => company.CompanyId == newProjectData.CompanyId
                  )?.CompanyName
                } ha già lo stesso nome. Scegli un nome diverso.`,
                alertColor: "yellow",
              })
            : setAlertData({
                isOpen: true,
                onClose: () =>
                  setAlertData((prev) => ({ ...prev, isOpen: false })),
                alertTitle: "Conflitto durante l'operazione",
                alertDescription: `Un altro progetto ha già lo stesso nome. Scegli un nome diverso.`,
                alertColor: "yellow",
              });
        } else {
          // General error handling
          setAlertData({
            isOpen: true,
            onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
            alertTitle: "Errore durante l'operazione",
            alertDescription:
              "Si è verificato un errore durante la modifica del progetto. Per favore, riprova più tardi.",
            alertColor: "red",
          });
        }
      }
    } finally {
      setIsAddingData(false);
    }
  }

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <div className="space-y-6 bg-white">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Progetto
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              In questo pannello potrai modificare un progetto esistente nel
              database.
            </p>
          </div>

          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6">
              <label
                htmlFor="project-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Nome progetto
              </label>
              <Input
                variant="bordered"
                type="text"
                radius="full"
                value={newProjectData.ProjectName}
                onChange={handleProjectNameChange}
                fullWidth
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="project-end-date"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Inizio Progetto
              </label>
              <I18nProvider locale="it-GB">
                <DatePicker
                  variant="bordered"
                  radius="full"
                  value={newProjectData.ProjectCreationDate}
                  onChange={handleProjectCreationDateChange}
                />
              </I18nProvider>
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="project-end-date"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Fine Progetto
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
                Descrizione
              </label>
              <Textarea
                variant="bordered"
                radius="full"
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
                selectedKey={
                  newProjectData.ProjectManagerId &&
                  newProjectData.ProjectManagerId.toString()
                }
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
                selectedKey={
                  newProjectData.CompanyId &&
                  newProjectData.CompanyId.toString()
                }
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
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="company"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Stato progetto
              </label>

              <Autocomplete
                defaultItems={statusList}
                placeholder="Seleziona stato"
                onSelectionChange={handleProjectStatusChange}
                selectedKey={
                  newProjectData.StatusId && newProjectData.StatusId.toString()
                }
                variant="bordered"
                radius="full"
                aria-label="status"
                fullWidth
              >
                {(status) => (
                  <AutocompleteItem
                    key={status.StatusId}
                    value={status.StatusId}
                  >
                    {status.StatusName}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
          </div>
        </div>
        <div className="py-3 text-right">
          <Button
            color="primary"
            className="text-white"
            radius="full"
            startContent={!isAddingData && <SaveIcon />}
            isDisabled={checkAllDataCompiled()}
            isLoading={isAddingData}
            onClick={handleUpdateProject}
          >
            {isAddingData ? "Salvando il progetto..." : "Salva progetto"}
          </Button>
        </div>
      </div>
    </>
  );
}
