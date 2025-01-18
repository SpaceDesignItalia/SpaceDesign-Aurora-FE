import BorderColorRoundedIcon from "@mui/icons-material/BorderColorRounded";
import CreateNewFolderRoundedIcon from "@mui/icons-material/CreateNewFolderRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import axios from "axios";
import { Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import AddFolderModal from "../ProjectFiles/AddFolderModal";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ProjectFiles/context-menu";
import FileCard from "../ProjectFiles/FileCard";
import FileUploaderModal from "../ProjectFiles/FileUploaderModal";
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
  UpFolderId: number;
}

interface File {
  ProjectFileId: number;
  FileName: string;
  FilePath: string;
  ForClient: boolean;
  ProjectId: number;
}

interface FolderSettingsModalProps {
  isOpen: boolean;
  isClosed: () => void;
  FolderData: Folder;
}

interface ModalData {
  ProjectId: number;
  open: boolean;
}

interface ModalAddFolderData {
  open: boolean;
}

export default function FolderContainer({
  projectData,
}: {
  projectData: Project;
}) {
  const { UniqueCode } = useParams();
  const [ProjectId, setProjectId] = useState<number>(0);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [modalAddFolder, setModalAddFolder] = useState<ModalAddFolderData>({
    open: false,
  });
  const [FolderTree, setFolderTree] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [folderModalData, setFolderModalData] =
    useState<FolderSettingsModalProps>({
      isOpen: false,
      isClosed: () => {},
      FolderData: {
        FolderId: 0,
        FolderName: "",
        ProjectId: 0,
        UpFolderId: 0,
      },
    });
  const [currentFolder, setCurrentFolder] = useState<Folder>({
    FolderId: 0,
    FolderName: "",
    ProjectId: 0,
    UpFolderId: 0,
  });

  const [modalUploadFile, setModalUploadFile] = useState<ModalData>({
    ProjectId: 0,
    open: false,
  });

  useEffect(() => {
    socket.on("file-update", () => {
      fetchFolders(); // Aggiorna i file quando ci sono aggiornamenti
      fetchFiles();
    });
  }, []);

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [currentFolder.FolderId]);

  useEffect(() => {
    axios
      .get("/Project/GET/GetProjectByUniqueCode", {
        params: { UniqueCode: UniqueCode },
      })
      .then((res) => {
        setProjectId(res.data.ProjectId);
      })
      .then(() => {
        fetchDefaultProjectFolder();
      });
  }, [ProjectId]);

  useEffect(() => {
    if (currentFolder.FolderId !== 0) {
      fetchFolderTree();
    }
  }, [currentFolder]);

  const fetchFolderTree = async () => {
    try {
      // Reset the folder tree state
      setFolderTree([]);

      // Fetch the initial folder data
      let response = await axios.get("/Project/GET/GetFolderByFolderId", {
        params: { FolderId: currentFolder.FolderId },
      });

      // If response data is not empty, add it to the folder tree
      if (response.data !== "") {
        setFolderTree((prev) => [...prev, response.data]);

        // Loop to fetch parent folders until no more are found
        while (response.data.UpFolderId) {
          response = await axios.get("/Project/GET/GetFolderByFolderId", {
            params: { FolderId: response.data.UpFolderId },
          });

          if (response.data !== "") {
            setFolderTree((prev) => [...prev, response.data]);
          } else {
            break;
          }
        }
      }
      // Reverse the folder tree array to display the correct hierarchy
      setFolderTree((prev) => prev.reverse());
    } catch (error) {
      console.error("Error fetching folder tree:", error);
    }
  };

  const fetchDefaultProjectFolder = () => {
    axios
      .get("/Project/GET/GetDefaultProjectFolder", {
        params: { ProjectId: ProjectId },
      })
      .then((res) => {
        setCurrentFolder(res.data);
      });
  };

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
      const response = await axios.get("/Project/GET/GetFoldersByUpFolderId", {
        params: { UpFolderId: currentFolder.FolderId },
      });
      setFolders(response.data);
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await axios.get("/Project/GET/GetFilesByFolderId", {
        params: { FolderId: currentFolder.FolderId },
      });
      setFiles(response.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  async function DeleteFolder(FolderData: Folder) {
    try {
      const res = await axios.delete("/Project/DELETE/DeleteFolder", {
        params: {
          ProjectId: FolderData.ProjectId,
          FolderId: FolderData.FolderId,
        },
      });

      if (res.status === 200) {
        fetchFolders();
      }
    } catch (error) {
      console.error("Errore nella cancellazione della cartella:", error);
    }
  }

  async function handleAddFolder(folderName: string) {
    try {
      const res = await axios.post("/Project/POST/AddFolder", {
        ProjectId: ProjectId,
        FolderName: folderName,
        UpFolderId: currentFolder.FolderId,
      });

      if (res.status === 200) {
        fetchFolders();
      }
    } catch (error) {
      console.error("Errore nell'aggiunta della cartella:", error);
    }
  }

  async function DeleteFile(FileData: File) {
    try {
      const res = await axios.delete("/Project/DELETE/DeleteFile", {
        params: {
          FolderId: currentFolder.FolderId,
          FilePath: FileData.FilePath,
        },
      });

      if (res.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Errore nella cancellazione del file:", error);
    }
  }

  return (
    <>
      <FileUploaderModal
        ProjectId={projectData.ProjectId}
        isOpen={modalUploadFile.open}
        isClosed={() => setModalUploadFile({ ...modalUploadFile, open: false })}
        FolderId={currentFolder.FolderId}
      />
      <FolderSettingsModal
        isOpen={folderModalData.isOpen}
        isClosed={() =>
          setFolderModalData({ ...folderModalData, isOpen: false })
        }
        FolderData={folderModalData.FolderData}
      />

      <AddFolderModal
        isOpen={modalAddFolder.open}
        isClosed={() => setModalAddFolder({ ...modalAddFolder, open: false })}
        handleAddFolder={handleAddFolder}
      />
      <ContextMenu>
        <Breadcrumbs>
          {FolderTree.map((folder, index) =>
            folder.FolderName === "Default" ? (
              <BreadcrumbItem
                key={index}
                onClick={() => setCurrentFolder(folder)}
              >
                Home
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem
                key={index}
                onClick={() => setCurrentFolder(folder)}
              >
                {folder.FolderName}
              </BreadcrumbItem>
            )
          )}
        </Breadcrumbs>

        <ContextMenuTrigger className="flex flex-col gap-7 mt-5 max-h-screen border-2 rounded-xl p-5 h-fit">
          {folders.length > 0 || files.length > 0 ? (
            <>
              <div>
                <h2 className="font-semibold text-lg flex flex-row gap-2 items-center">
                  Cartelle
                </h2>

                <div className="flex flex-row flex-wrap gap-3 mt-5 items-start justify-start">
                  {folders.map((folder, index) => (
                    <div
                      className="flex items-center justify-between p-4 border-2 rounded-xl w-full md:w-72 bg-gray-50 hover:shadow-md hover:scale-[102%] transition-all duration-200"
                      key={index}
                      onClick={() => setCurrentFolder(folder)}
                    >
                      <div className="flex flex-row gap-2 items-center w-3/4">
                        <div className="rounded-full border-2 p-2 bg-white">
                          <FolderRoundedIcon />
                        </div>
                        <h3 className="cursor-default truncate w-full">
                          {folder.FolderName}
                        </h3>
                      </div>

                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            variant="light"
                            radius="full"
                            isIconOnly
                            startContent={<MoreVertRoundedIcon />}
                            className="cursor-pointer"
                          />
                        </DropdownTrigger>
                        <DropdownMenu
                          variant="faded"
                          aria-label="Dropdown menu with description"
                        >
                          <DropdownItem
                            key="edit"
                            startContent={<BorderColorRoundedIcon />}
                            onClick={() =>
                              setFolderModalData({
                                isOpen: true,
                                isClosed: () => {},
                                FolderData: folder,
                              })
                            }
                          >
                            Modifica cartella
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<DeleteRoundedIcon />}
                            onClick={() => DeleteFolder(folder)}
                          >
                            Rimuovi cartella
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col flex-wrap gap-3 mt-5 items-start justify-start">
                {files.length > 0 && (
                  <>
                    <h2 className="font-semibold text-lg flex flex-row gap-2 items-center">
                      File
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
                      {files.map((file, index) => (
                        <FileCard
                          file={file}
                          variant="default"
                          index={index}
                          key={index}
                          DeleteFile={DeleteFile}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="text-center">
              <PermMediaIcon />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Nessun documento o cartella presente!
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Crea una cartella o aggiungi un file cliccando tasto destro o
                tenendo premuto dentro l'area!
              </p>
            </div>
          )}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem
            inset
            className="flex flex-row items-center gap-3"
            onClick={() =>
              setModalAddFolder({
                ...modalAddFolder,
                open: true,
              })
            }
          >
            <CreateNewFolderRoundedIcon sx={{ fontSize: 20 }} /> Crea nuova
            cartella
          </ContextMenuItem>
          <ContextMenuItem
            inset
            className="flex flex-row items-center gap-3"
            onClick={() =>
              setModalUploadFile({
                ...modalUploadFile,
                open: true,
              })
            }
          >
            <NoteAddRoundedIcon sx={{ fontSize: 20 }} /> Carica file
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}
