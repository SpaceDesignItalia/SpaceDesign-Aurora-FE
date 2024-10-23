import axios from "axios";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import { useParams } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { usePermissions } from "../../../Layout/PermissionProvider";
import { Folder } from "lucide-react";
import AddRounded from "@mui/icons-material/AddRounded";
import FilesContainer from "../ProjectFiles/FilesContainer";
import FolderSettingsModal from "../ProjectFiles/FolderSettingsModal";

const socket = io(API_WEBSOCKET_URL);

interface Project {
  ProjectId: number;
  ProjectName: string;
  ProjectDescription: string;
  ProjectCreationDate: Date;
  ProjectEndDate: Date;
  CompanyId: number;
  ProjectBannerId: number;
  ProjectBannerPath: string;
  StatusName: string;
  ProjectManagerId: number;
  ProjectManagerFullName: string;
  ProjectManagerEmail: string;
  RoleName: string;
}

interface Folder {
  FolderId: number;
  FolderName: string;
  ProjectId: number;
}

interface FolderSettingsModalProps {
  isOpen: boolean;
  isClosed: () => void;
  FolderData: Folder;
}

export default function FolderContainer({
  projectData,
}: {
  projectData: Project;
}) {
  const { ProjectId } = useParams();
  const { hasPermission } = usePermissions();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [adminPermission, setAdminPermission] = useState({
    addFile: false,
    removeFile: false,
    customerView: false,
  });
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null);
  const [folderModalData, setFolderModalData] =
    useState<FolderSettingsModalProps>({
      isOpen: false,
      isClosed: () => {},
      FolderData: {
        FolderId: 0,
        FolderName: "",
        ProjectId: 0,
      },
    });

  useEffect(() => {
    socket.on("file-update", () => {
      fetchFolders(); // Aggiorna i file quando ci sono aggiornamenti
    });
  }, []);

  useEffect(() => {
    fetchFolders(); // Carica i file iniziali quando cambia ProjectId o quando c'è un aggiornamento
  }, []);

  /*useEffect(() => {
    async function checkPermissions() {
      setAdminPermission({
        addFile: await hasPermission("ADD_NEW_FILE"),
        removeFile: await hasPermission("DELETE_FILE"),
        customerView: await hasPermission("ALLOW_CUSTOMER_VIEW"),
      });
    }
    checkPermissions();
    fetchFiles(); // Carica i file iniziali quando cambia ProjectId o quando c'è un aggiornamento
  }, [ProjectId]);*/

  const fetchFolders = async () => {
    try {
      const response = await axios.get("/Project/GET/GetFoldersByProjectId", {
        params: { ProjectId: ProjectId },
      });
      setFolders(response.data);
    } catch (err) {
      console.error("Error fetching fodlers:", err);
    }
  };

  const searchFile = () => {
    if (searchQuery.trim() === "") {
      fetchFolders();
    } else {
      // Esegui la ricerca dei file per nome
      axios
        .get("/Project/GET/SearchFolderByProjectIdAndName", {
          params: { ProjectId: ProjectId, FolderName: searchQuery },
        })
        .then((res) => {
          setFolders(res.data);
        })
        .catch((error) => {
          console.error("Error searching files:", error);
          fetchFolders();
        });
    }
  };

  function clearSearchInput() {
    setSearchQuery("");
    fetchFolders();
  }

  async function DeleteFolder(FolderData: Folder) {
    try {
      const res = await axios.delete("/Project/DELETE/DeleteFolder", {
        params: {
          ProjectId: FolderData.ProjectId,
          FolderId: FolderData.FolderId,
        },
      });

      if (res.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Errore nella cancellazione della cartella:", error);
    }
  }

  async function handleAddFolder() {
    try {
      const res = await axios.post("/Project/POST/AddFolder", {
        ProjectId: ProjectId,
        FolderName: newFolderName,
      });

      if (res.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Errore nell'aggiunta della cartella:", error);
    }
  }

  if (!activeFolder) {
    return (
      <>
        <FolderSettingsModal
          isOpen={folderModalData.isOpen}
          isClosed={folderModalData.isClosed}
          FolderData={folderModalData.FolderData}
        />
        <div className="flex flex-col gap-10 border border-gray-200 rounded-xl p-5">
          <div className="flex flex-row justify-between gap-5 items-center">
            <div className="flex flex-row gap-3 w-full">
              <Input
                radius="sm"
                variant="bordered"
                startContent={<SearchOutlinedIcon />}
                className="md:w-1/3"
                placeholder="Cerca cartella per nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                isClearable
                onClear={clearSearchInput}
              />

              <Button
                radius="sm"
                color="primary"
                startContent={<SearchOutlinedIcon />}
                onClick={searchFile} // Chiamata alla ricerca solo quando il pulsante è cliccato
              >
                Cerca
              </Button>
            </div>
            <Popover radius="lg" placement="bottom" showArrow shouldBlockScroll>
              <PopoverTrigger>
                <Button
                  color="primary"
                  radius="full"
                  startContent={<AddRounded />}
                  className="px-7"
                >
                  Crea cartella
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-5 w-80">
                {(titleProps) => (
                  <div className="px-1 py-2 w-full">
                    <p
                      className="text-small font-bold text-foreground"
                      {...titleProps}
                    >
                      Crea cartella
                    </p>
                    <div className="mt-2 flex flex-col gap-2 w-full">
                      <Input
                        autoFocus
                        variant="underlined"
                        color="primary"
                        placeholder="Nome cartella"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddFolder(); // Chiama la funzione quando premi "Enter"
                          }
                        }}
                      />
                      <Button
                        color="primary"
                        size="sm"
                        radius="full"
                        onClick={handleAddFolder}
                        startContent={<AddRounded />}
                        isDisabled={newFolderName === ""}
                      >
                        Crea cartella
                      </Button>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-wrap gap-5 mt-5">
            {folders.map((folder, index) => (
              <div
                className="flex items-center justify-center p-4"
                key={index}
                onClick={() => setActiveFolder(folder)}
              >
                <div className="relative">
                  <div className="bg-zinc-800 w-64 h-40 rounded-lg shadow-lg relative">
                    {/* Parte superiore della cartella */}
                    <div className="absolute top-0 left-0 w-32 h-10 bg-zinc-700 rounded-tl-lg rounded-tr-lg transform -translate-y-4"></div>
                  </div>
                  {/* Parte interna della cartella */}
                  <div className="bg-zinc-600 w-64 h-36 rounded-lg absolute top-0 left-0 mt-2">
                    <div>
                      <Button
                        color="primary"
                        radius="full"
                        startContent={<Folder size={48} />}
                        onClick={() =>
                          setFolderModalData({
                            isOpen: true,
                            isClosed: () => {},
                            FolderData: folder,
                          })
                        }
                      />
                      <Button
                        color="danger"
                        radius="full"
                        startContent={<Folder size={48} />}
                        onClick={() => DeleteFolder(folder)}
                      />
                    </div>
                    <div className="flex items-center justify-center h-full">
                      <span className="text-lg font-bold text-white">
                        {folder.FolderName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  } else {
    return (
      <FilesContainer
        projectData={projectData}
        Folder={activeFolder}
        setFolderId={() => setActiveFolder(null)}
      />
    );
  }
}
