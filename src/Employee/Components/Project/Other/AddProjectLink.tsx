import {
  Button,
  Avatar,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Autocomplete,
  AutocompleteItem,
  Input,
} from "@heroui/react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { API_URL_IMG } from "../../../../API/API";
import StatusAlert from "../../Layout/StatusAlert";

interface AddProjectLinkModalProps {
  isOpen: boolean;
  isClosed: () => void;
  fetchAllData: () => void;
  ProjectId: number;
}

interface Link {
  ProjectId: number;
  ProjectLinkTitle: string;
  ProjectLinkUrl: string;
  ProjectLinkTypeId: number;
}

interface ProjectLinkType {
  ProjectLinkTypeId: number;
  ProjectLinkTypeName: string;
  ProjectLinkTypeImage: string;
}

interface AlertData {
  isOpen: boolean;
  onClose: () => void;
  alertTitle: string;
  alertDescription: string;
  alertColor: "green" | "red" | "yellow";
}

const INITIAL_LINK_DATA = {
  ProjectId: 0,
  ProjectLinkTitle: "",
  ProjectLinkUrl: "",
  ProjectLinkTypeId: 0,
};

const INITIAL_ALERT_DATA: AlertData = {
  isOpen: false,
  onClose: () => {},
  alertTitle: "",
  alertDescription: "",
  alertColor: "red",
};

export default function AddProjectLink({
  isOpen,
  isClosed,
  fetchAllData,
  ProjectId,
}: AddProjectLinkModalProps) {
  const [newLinkData, setNewLinkData] = useState<Link>(INITIAL_LINK_DATA);
  const [linkTypes, setLinkTypes] = useState<ProjectLinkType[]>([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_ALERT_DATA);
  const [faviconUrl, setFaviconUrl] = useState<string>("");
  const [isWebsiteType, setIsWebsiteType] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setIsWebsiteType(false);
      setNewLinkData(INITIAL_LINK_DATA);
      setFaviconUrl("");
    } else {
      setNewLinkData({ ...INITIAL_LINK_DATA, ProjectId });
    }
    axios.get("/Project/GET/GetAllLinkType").then((res) => {
      setLinkTypes(res.data);
    });
  }, [isOpen, ProjectId]);

  function checkAllDataCompiled() {
    return !(
      newLinkData.ProjectId !== 0 &&
      newLinkData.ProjectLinkTitle.trim() !== "" &&
      newLinkData.ProjectLinkUrl.trim() !== "" &&
      newLinkData.ProjectLinkTypeId !== 0
    );
  }

  function handleProjectLinkTitleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (e.target.value.length <= 150) {
      setNewLinkData({
        ...newLinkData,
        ProjectLinkTitle: e.target.value,
      });
    }
  }

  function handleProjectLinkTypeChange(key: React.Key | null) {
    if (key !== null) {
      const selectedTypeId = parseInt(key.toString());
      setNewLinkData({
        ...newLinkData,
        ProjectLinkTypeId: selectedTypeId,
      });
      setIsWebsiteType(selectedTypeId === 7);
      if (selectedTypeId !== 7) {
        setFaviconUrl("");
      } else if (newLinkData.ProjectLinkUrl) {
        setFaviconUrl(getFaviconUrl(newLinkData.ProjectLinkUrl));
      }
    }
  }

  function getFaviconUrl(url: string) {
    try {
      const hostname = new URL(formatUrl(url)).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch {
      return "";
    }
  }

  function handleProjectLinkURLChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value.length <= 150) {
      setNewLinkData({
        ...newLinkData,
        ProjectLinkUrl: value,
      });
      if (isWebsiteType) {
        setFaviconUrl(getFaviconUrl(value));
      }
    }
  }

  function handleUrlKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab" && isWebsiteType) {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value;

      if (!value.startsWith("http://") && !value.startsWith("https://")) {
        const newValue = "https://" + value;
        setNewLinkData({
          ...newLinkData,
          ProjectLinkUrl: newValue,
        });
        setFaviconUrl(getFaviconUrl(newValue));
      }
    }
  }

  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  function formatUrl(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
    return url;
  }

  async function handleCreateNewLink() {
    try {
      setIsAddingData(true);

      let formattedUrl = formatUrl(newLinkData.ProjectLinkUrl);

      if (!isValidUrl(formattedUrl)) {
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "URL non valido",
          alertDescription: "Inserisci un URL valido per continuare.",
          alertColor: "yellow",
        });
        setIsAddingData(false);
        return;
      }

      const linkDataToSend = {
        ...newLinkData,
        ProjectLinkUrl: formattedUrl,
      };

      const res = await axios.post("/Project/POST/AddProjectLink", {
        ProjectLinkData: linkDataToSend,
      });

      if (res.status === 200) {
        fetchAllData();
        setAlertData({
          isOpen: true,
          onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
          alertTitle: "Operazione completata",
          alertDescription: "Il collegamento è stato aggiunto con successo.",
          alertColor: "green",
        });

        isClosed();
      }
      // Esegui altre azioni dopo la creazione del progetto, se necessario
    } catch (error) {
      setAlertData({
        isOpen: true,
        onClose: () => setAlertData((prev) => ({ ...prev, isOpen: false })),
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante l'aggiunta del collegamento. Per favore, riprova più tardi.",
        alertColor: "red",
      });

      console.error("Errore durante la creazione del progetto:", error);
      // Gestisci l'errore in modo appropriato, ad esempio mostrando un messaggio all'utente
    } finally {
      setIsAddingData(false);
      setNewLinkData(INITIAL_LINK_DATA);
    }
  }

  return (
    <>
      <StatusAlert AlertData={alertData} />
      <Modal
        isOpen={isOpen}
        onOpenChange={isClosed}
        size="2xl"
        scrollBehavior="inside"
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {(isClosed) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-medium">
                  Aggiungi un nuovo collegamento:
                </h3>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-6">
                    <label
                      htmlFor="project-name"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Testo visualizzato
                    </label>
                    <Input
                      placeholder="Es. Repository GitHub"
                      variant="bordered"
                      onChange={handleProjectLinkTitleChange}
                      type="text"
                      radius="full"
                      fullWidth
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-6">
                    <label
                      htmlFor="project-description"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Tipo di collegamento
                    </label>
                    <Autocomplete
                      defaultItems={linkTypes}
                      placeholder="Seleziona il tipo di collegamento"
                      onSelectionChange={handleProjectLinkTypeChange}
                      variant="bordered"
                      radius="full"
                      aria-label="manager"
                      fullWidth
                    >
                      {(link) => (
                        <AutocompleteItem
                          key={link.ProjectLinkTypeId}
                          textValue={link.ProjectLinkTypeName}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2 items-center">
                              <div className="flex flex-row gap-5 items-center">
                                <Avatar
                                  radius="full"
                                  className="h-6 w-6 bg-white"
                                  src={
                                    API_URL_IMG +
                                    "/linkIcons/" +
                                    link.ProjectLinkTypeImage
                                  }
                                />
                                <span className="text-small">
                                  {link.ProjectLinkTypeName}
                                </span>
                              </div>
                            </div>
                          </div>
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  </div>

                  <div className="col-span-6 sm:col-span-6">
                    <label
                      htmlFor="project-description"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      URL
                    </label>
                    <Input
                      variant="bordered"
                      placeholder={
                        isWebsiteType
                          ? "www.spacedesign-italia.it"
                          : "Inserisci URL"
                      }
                      onChange={handleProjectLinkURLChange}
                      onKeyDown={handleUrlKeyDown}
                      type="text"
                      radius="full"
                      fullWidth
                      startContent={
                        isWebsiteType &&
                        newLinkData.ProjectLinkUrl && (
                          <img
                            src={faviconUrl}
                            className="w-4 h-4 object-contain"
                          />
                        )
                      }
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="flex sm:flex-row flex-col-reverse">
                <Button variant="light" onClick={isClosed} radius="full">
                  Annulla
                </Button>
                <Button
                  color="primary"
                  className="text-white"
                  radius="full"
                  startContent={
                    !isAddingData && (
                      <Icon icon="basil:save-outline" fontSize={24} />
                    )
                  }
                  isDisabled={checkAllDataCompiled()}
                  isLoading={isAddingData}
                  onClick={handleCreateNewLink}
                >
                  {isAddingData
                    ? "Salvando il collegamento..."
                    : "Salva collegamento"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
