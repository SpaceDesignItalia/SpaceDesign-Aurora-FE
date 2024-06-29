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
  Chip,
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

interface Staffer {
  StafferId: number;
  StafferImageUrl: string;
  StafferFullName: string;
  StafferEmail: string;
  RoleName: string;
}

interface AlertData {
  isOpen: boolean;
  alertTitle: string;
  alertDescription: string;
  alertColor: string;
}

export default function AddProjectTeamMember({
  isOpen,
  isClosed,
  ProjectId,
}: AddProjectLinkModalProps) {
  const [newTeamMember, setNewTeamMember] = useState<number>(0);
  const [availableStaff, setAvailableStaff] = useState<Staffer[]>([]);
  const [isAddingData, setIsAddingData] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertData>({
    isOpen: false,
    alertTitle: "",
    alertDescription: "",
    alertColor: "",
  });

  useEffect(() => {
    axios
      .get("/Project/GET/GetMembersNotInProjectTeam", {
        params: { ProjectId: ProjectId },
      })
      .then((res) => {
        setAvailableStaff(res.data);
      });
  }, [ProjectId]);

  function checkAllDataCompiled() {
    if (newTeamMember !== 0) {
      return false;
    }
    return true;
  }

  function handleProjectTeamMemberChange(e: React.Key) {
    setNewTeamMember(parseInt(e));
  }

  async function handleCreateNewLink() {
    try {
      setIsAddingData(true);

      const res = await axios.post("/Project/POST/AddProjectTeamMember", {
        ProjectMemberId: newTeamMember,
        ProjectId: ProjectId,
      });

      if (res.status === 200) {
        setAlertData({
          isOpen: true,
          alertTitle: "Operazione completata",
          alertDescription: "Il membro è stato aggiunto con successo.",
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
          "Si è verificato un errore durante l'aggiunta del membro. Per favore, riprova più tardi.",
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
                <h3 className="text-xl font-semibold">Aggiungi un membro</h3>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-6">
                    <label
                      htmlFor="project-description"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Membro
                    </label>
                    <Autocomplete
                      defaultItems={availableStaff}
                      placeholder="Seleziona il membro da aggiungere"
                      onSelectionChange={handleProjectTeamMemberChange}
                      variant="bordered"
                      radius="sm"
                      aria-label="manager"
                      fullWidth
                    >
                      {(staff) => (
                        <AutocompleteItem
                          key={staff.StafferId}
                          textValue={staff.StafferFullName}
                        >
                          <div className="flex gap-2 items-center ml-2">
                            <div className="flex flex-row gap-5 items-center">
                              <Avatar
                                radius="full"
                                isBordered
                                className="h-6 w-6 bg-white"
                                name={staff.StafferFullName}
                                src={
                                  staff.StafferImageUrl &&
                                  API_URL_IMG +
                                    "/profileIcons/" +
                                    staff.StafferImageUrl
                                }
                              />
                              <div className="flex flex-col">
                                <span className="text-small flex flex-row gap-3 items-center">
                                  {staff.StafferFullName}
                                  <Chip
                                    color="primary"
                                    size="sm"
                                    radius="sm"
                                    variant="flat"
                                  >
                                    {staff.RoleName}
                                  </Chip>
                                </span>
                                <span className="text-tiny text-default-400">
                                  {staff.StafferEmail}
                                </span>
                              </div>
                            </div>
                          </div>
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
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
                    ? "Aggiungendo il membro..."
                    : "Aggiungi membro"}
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
