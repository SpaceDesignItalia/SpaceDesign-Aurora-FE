import {
  Button,
  Avatar,
  Radio,
  cn,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Autocomplete,
  AutocompleteItem,
  Input,
} from "@nextui-org/react";
import axios from "axios";
import { useState, useEffect } from "react";
import SaveIcon from "@mui/icons-material/Save";
import { API_URL_IMG } from "../../../../API/API";
import StatusAlert from "../../Layout/StatusAlert";

interface AddProjectLinkModalProps {
  isOpen: boolean;
  isClosed: () => void;
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
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

export default function AddProjectLink({
  isOpen,
  isClosed,
  ProjectId,
}: AddProjectLinkModalProps) {
  const [newLinkData, setNewLinkData] = useState<Link>({
    ProjectId: ProjectId,
    ProjectLinkTitle: "",
    ProjectLinkUrl: "",
    ProjectLinkTypeId: 0,
  });

  const [linkTypes, setLinkTypes] = useState<ProjectLinkType[]>([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

  useEffect(() => {
    setNewLinkData({ ...newLinkData, ProjectId });
    axios.get("/Project/GET/GetAllLinkType").then((res) => {
      setLinkTypes(res.data);
    });
  }, [ProjectId]);

  function checkAllDataCompiled() {
    if (
      newLinkData.ProjectId != 0 &&
      newLinkData.ProjectLinkTitle !== "" &&
      newLinkData.ProjectLinkUrl !== "" &&
      newLinkData.ProjectLinkTypeId != 0
    ) {
      return false;
    }
    return true;
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

  function handleProjectLinkTypeChange(e: React.Key) {
    setNewLinkData({
      ...newLinkData,
      ProjectLinkTypeId: parseInt(e),
    });
  }

  function handleProjectLinkURLChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length <= 150) {
      setNewLinkData({
        ...newLinkData,
        ProjectLinkUrl: e.target.value,
      });
    }
  }

  async function handleCreateNewLink() {
    try {
      setIsAddingData(true);

      const res = await axios.post("/Project/POST/AddProjectLink", {
        ProjectLinkData: newLinkData,
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il collegamento è stato creato con successo.",
          alertColor: "green",
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        console.log("Successo:", res.data);
      }
      // Esegui altre azioni dopo la creazione del progetto, se necessario
    } catch (error) {
      setAlertData({
        isOpen: true,
        alertTitle: "Errore durante l'operazione",
        alertDescription:
          "Si è verificato un errore durante l'aggiunta del collegamento. Per favore, riprova più tardi.",
        alertColor: "red",
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
      console.error("Errore durante la creazione del progetto:", error);
      // Gestisci l'errore in modo appropriato, ad esempio mostrando un messaggio all'utente
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
                <h3 className="text-xl font-semibold">
                  Aggiungi un nuovo collegamento
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
                      variant="bordered"
                      onChange={handleProjectLinkTitleChange}
                      type="text"
                      radius="sm"
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
                      radius="sm"
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
                      placeholder="https://www.spacedesign-italia.it"
                      onChange={handleProjectLinkURLChange}
                      type="text"
                      radius="sm"
                      fullWidth
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="flex sm:flex-row flex-col">
                <Button
                  color="success"
                  className="text-white"
                  radius="sm"
                  startContent={!isAddingData && <SaveIcon />}
                  isDisabled={checkAllDataCompiled()}
                  isLoading={isAddingData}
                  onClick={handleCreateNewLink}
                >
                  {isAddingData
                    ? "Salvando il collegamento..."
                    : "Salva collegamento"}
                </Button>
                <Button variant="light" onClick={isClosed} radius="sm">
                  Annulla
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
