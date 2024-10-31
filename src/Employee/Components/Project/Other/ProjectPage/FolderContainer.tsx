import CreateNewFolderRoundedIcon from "@mui/icons-material/CreateNewFolderRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import BorderColorRoundedIcon from "@mui/icons-material/BorderColorRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import axios from "axios";
import { Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import AddFolderModal from "../ProjectFiles/AddFolderModal";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../ProjectFiles/context-menu";
import FileUploaderModal from "../ProjectFiles/FileUploaderModal";
import FolderSettingsModal from "../ProjectFiles/FolderSettingsModal";
import FileCard from "../ProjectFiles/FileCard";

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

function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; Secure; SameSite=Strict`;
  document.cookie = cookieString;
}

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop();
    if (cookieValue) {
      return cookieValue.split(";").shift();
    }
  }
  return undefined;
}

export default function FolderContainer({
  projectData,
}: {
  projectData: Project;
}) {
  const { ProjectId } = useParams();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [modalAddFolder, setModalAddFolder] = useState<ModalAddFolderData>({
    open: false,
  });

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

  const [fileView, setFileView] = useState<string>(
    getCookie("fileView") || "Grid"
  );

  useEffect(() => {
    socket.on("file-update", () => {
      fetchFolders(); // Aggiorna i file quando ci sono aggiornamenti
      fetchFiles();
    });
  }, []);

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [currentFolder.FolderId, files.length > 0]);

  console.log("Current folder:", currentFolder);

  useEffect(() => {
    axios
      .get("/Project/GET/GetDefaultProjectFolder", {
        params: { ProjectId: ProjectId },
      })
      .then((res) => {
        setCurrentFolder(res.data);
      });
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
    console.log(currentFolder);
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

  async function handleGoBack() {
    try {
      const res = await axios.get("/Project/GET/GetFolderByFolderId", {
        params: { FolderId: currentFolder.UpFolderId },
      });
      setCurrentFolder(res.data);
    } catch (error) {
      console.error("Errore nel tornare alla cartella precedente:", error);
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

  useEffect(() => {
    setCookie("fileView", fileView, 7);
  }, [fileView]);

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
          <BreadcrumbItem>Test</BreadcrumbItem>
          {currentFolder.FolderName !== "Default" && (
            <BreadcrumbItem>{currentFolder.FolderName}</BreadcrumbItem>
          )}
        </Breadcrumbs>
        <ContextMenuTrigger className="flex flex-col gap-7 mt-5 h-screen border-2 rounded-xl p-5">
          <div>
            <h2 className="font-semibold text-lg flex flex-row gap-2 items-center">
              Cartelle
            </h2>
            <div className="flex flex-wrap gap-3 mt-5 items-start justify-start">
              {folders.map((folder, index) => (
                <div
                  className="flex items-center justify-between p-4 border-2 rounded-xl w-72 bg-gray-50 hover:shadow-md hover:scale-[102%] transition-all duration-200"
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
                <div className="grid grid-cols-4 gap-3 w-full">
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

          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Visualizzazione</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuCheckboxItem
                checked={fileView === "Grid"}
                className="flex flex-row items-center gap-3"
                onClick={() => setFileView("Grid")}
              >
                <GridViewRoundedIcon sx={{ fontSize: 20 }} />
                Griglia
              </ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem
                checked={fileView === "List"}
                className="flex flex-row items-center gap-3"
                onClick={() => setFileView("List")}
              >
                <ViewListRoundedIcon sx={{ fontSize: 20 }} />
                Lista
              </ContextMenuCheckboxItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}
