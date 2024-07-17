import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownItem,
  DropdownMenu,
} from "@nextui-org/react";
import FileUploaderModal from "../ProjectFiles/FileUploaderModal";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import { useParams } from "react-router-dom";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ConfirmDeleteFileModal from "../ConfirmDeleteFileModal";

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

interface File {
  ProjectFileId: number;
  FileName: string;
  FilePath: string;
  ForClient: boolean;
  ProjectId: number;
}

interface ModalData {
  ProjectId: number;
  open: boolean;
}

interface ModalDeleteData {
  File: File;
  open: boolean;
}

export default function FilesContainer({
  projectData,
}: {
  projectData: Project;
}) {
  const { ProjectId } = useParams();
  const [files, setFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<File[]>([]);
  const [modalUploadFile, setModalUploadFile] = useState<ModalData>({
    ProjectId: 0,
    open: false,
  });
  const [modalDeleteFile, setModalDeleteFile] = useState<ModalDeleteData>({
    File: null,
    open: false,
  });

  useEffect(() => {
    socket.on("file-update", () => {
      fetchFiles(); // Aggiorna i file quando ci sono aggiornamenti
    });
  }, []);

  useEffect(() => {
    fetchFiles(); // Carica i file iniziali quando cambia ProjectId o quando c'è un aggiornamento
  }, [ProjectId]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get("/Project/GET/GetFilesByProjectId", {
        params: { ProjectId: ProjectId },
      });
      setFiles(response.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const searchFile = () => {
    if (searchQuery.trim() === "") {
      fetchFiles();
    } else {
      // Esegui la ricerca dei file per nome
      axios
        .get("/Project/GET/SearchFilesByProjectIdAndName", {
          params: { ProjectId: ProjectId, FileName: searchQuery },
        })
        .then((res) => {
          setFiles(res.data);
        })
        .catch((error) => {
          console.error("Error searching files:", error);
          fetchFiles();
        });
    }
  };

  function clearSearchInput() {
    setSearchQuery("");
    fetchFiles();
  }

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const response = await axios({
        url: "/Project/GET/DownloadProjectFileByPath",
        method: "GET",
        params: { filePath, fileName },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  async function DeleteFile(FileData: File) {
    try {
      const res = await axios.delete("/Project/DELETE/DeleteFile", {
        params: { ProjectId: FileData.ProjectId, FilePath: FileData.FilePath },
      });

      if (res.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Errore nella cancellazione dell'azienda:", error);
    }
  }

  return (
    <>
      <FileUploaderModal
        ProjectId={projectData.ProjectId}
        isOpen={modalUploadFile.open}
        isClosed={() => setModalUploadFile({ ...modalUploadFile, open: false })}
      />
      <ConfirmDeleteFileModal
        FileData={modalDeleteFile.File}
        isOpen={modalDeleteFile.open}
        isClosed={() => setModalDeleteFile({ ...modalDeleteFile, open: false })}
        DeleteProject={DeleteFile}
      />
      <div className="flex flex-col gap-10 border border-gray-200 rounded-xl p-5">
        <div className="flex flex-row justify-between gap-5 items-center">
          <div className="flex flex-row gap-3 w-full">
            <Input
              radius="sm"
              variant="bordered"
              startContent={<SearchOutlinedIcon />}
              className="md:w-1/3"
              placeholder="Cerca file per nome..."
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
          {files.length > 0 && (
            <Button
              radius="sm"
              color="primary"
              startContent={<NoteAddRoundedIcon />}
              className="text-white"
              variant="solid"
              onClick={() =>
                setModalUploadFile({
                  ...modalUploadFile,
                  open: true,
                })
              }
            >
              Carica file
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {files.length > 0 ? (
            files.map((file, index) => (
              <Card radius="sm" key={index} className="col-span-1">
                <CardBody className="flex flex-row gap-5">
                  <div className="w-full">
                    <h4>{file.FileName}</h4>
                  </div>
                  <Dropdown radius="sm">
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <MoreVertRoundedIcon />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        color="danger"
                        startContent={<DeleteOutlinedIcon />}
                        onClick={() =>
                          setModalDeleteFile({
                            ...modalDeleteFile,
                            File: file,
                            open: true,
                          })
                        }
                      >
                        Rimuovi
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </CardBody>

                <CardFooter>
                  <Button
                    color="primary"
                    radius="sm"
                    startContent={<FileDownloadRoundedIcon />}
                    onClick={() => downloadFile(file.FilePath, file.FileName)}
                    fullWidth
                  >
                    Scarica file
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <>
              {searchQuery ? (
                <div className="text-center p-5 col-span-6">
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 50 }} />
                  <h3 className="mt-2 text-base font-semibold text-gray-900">
                    La ricerca non ha prodotto nessun risultato!
                  </h3>
                </div>
              ) : (
                <div className="text-center p-5 col-span-6">
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 50 }} />
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">
                    Nessun file presente
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Inizia caricando un nuovo file
                  </p>
                  <div className="mt-4">
                    <Button
                      color="primary"
                      radius="sm"
                      onClick={() =>
                        setModalUploadFile({ ...modalUploadFile, open: true })
                      }
                      startContent={<NoteAddRoundedIcon />}
                    >
                      Carica file
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
