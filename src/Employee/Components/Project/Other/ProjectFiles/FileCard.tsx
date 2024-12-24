import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL_IMG } from "../../../../../API/API";
import ConfirmRemoveFilePopover from "../ConfirmRemoveFilePopover";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import BorderColorRoundedIcon from "@mui/icons-material/BorderColorRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

interface FileCardProps {
  file: any;
  index: number;
  DeleteFile: (index: number | any) => void;
  variant: "default" | "delete";
}

export default function FileCard({
  file,
  index,
  DeleteFile,
  variant,
}: FileCardProps) {
  const [fileIcon, setFileIcon] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  // Ottieni nome del file e la sua estensione separatamente
  const initialFileName = file.FileName || file.file.name;
  const extension = initialFileName.substring(initialFileName.lastIndexOf("."));
  const [newFileName, setNewFileName] = useState("");

  useEffect(() => {
    setNewFileName(initialFileName.replace(extension, ""));
    fetchFileIcon();
  }, [file, variant]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEditing) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      window.addEventListener("keydown", handleEsc);
    } else {
      window.removeEventListener("keydown", handleEsc);
    }

    return () => window.removeEventListener("keydown", handleEsc);
  }, [isEditing]);

  async function fetchFileIcon() {
    try {
      const fileName = variant === "default" ? file.FileName : file.file.name;
      const res = await axios.get(`/Fileicon/GET/GetFileIconByExtension`, {
        params: { fileName },
      });

      if (res.status === 200) {
        setFileIcon(res.data);
      }
    } catch (error) {
      console.error("Estrazione dell'icona fallita");
    }
  }

  const handleRename = async () => {
    if (!newFileName.trim()) {
      alert("Il nome del file non può essere vuoto.");
      return;
    }

    try {
      const updatedFileName = `${newFileName.trim()}${extension}`;
      setIsEditing(false);
      await axios.put("/Project/UPDATE/RenameFile", {
        fileId: file.ProjectFileId,
        newName: updatedFileName,
      });
    } catch (error) {
      console.error("Errore durante la rinomina del file:", error);
    }
  };

  const downloadFile = async () => {
    try {
      const res = await axios.get("/Project/GET/DownloadProjectFileByPath", {
        params: { filePath: file.FilePath, fileName: file.FileName },
        responseType: "blob", // Importante per il download corretto
      });

      // Verifica se il file è un `.env`, altrimenti usa il nome originale
      const fileName = initialFileName.startsWith(".")
        ? ` ${initialFileName}`
        : initialFileName;

      // Crea un URL Blob per il file
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", fileName); // Imposta il nome corretto
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Rilascia l'oggetto Blob per liberare memoria
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Errore durante il download del file:", error);
    }
  };

  return (
    <>
      {variant === "default" && (
        <div className="col-span-1 border bg-gray-100 p-2 px-7 flex flex-row items-center rounded-xl justify-between">
          <div className="w-1/2 md:w-5/6 flex flex-row gap-3 items-center">
            <div className="flex items-center border rounded-xl h-12 w-12 p-2 bg-white">
              <img src={API_URL_IMG + fileIcon} alt={fileIcon} />
            </div>
            {isEditing ? (
              <div className="flex items-center">
                <input
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newFileName.trim()) {
                      handleRename();
                    }
                  }}
                  className="text-sm truncate w-3/4 border-b border-black focus:outline-none p-1 bg-transparent"
                />
                <span>{extension}</span>
              </div>
            ) : (
              <h4 className="text-sm truncate w-3/4">
                {newFileName + extension}
              </h4>
            )}
          </div>
          <div className="flex flex-row gap-3 items-center">
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
                  key="download"
                  startContent={<FileDownloadRoundedIcon />}
                  onClick={downloadFile} // Scarica il file
                >
                  Scarica file
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<BorderColorRoundedIcon />}
                  onClick={() => setIsEditing(true)} // Entra in modalità di modifica
                >
                  Rinomina file
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<DeleteRoundedIcon />}
                  onClick={() => DeleteFile(file)}
                >
                  Rimuovi file
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      )}

      {variant === "delete" && DeleteFile && (
        <div className="w-full border bg-gray-100 p-2 px-7 flex flex-row items-center rounded-xl justify-between">
          <div className="w-1/2 md:w-5/6 flex flex-row gap-3 items-center">
            <div className="border rounded-xl h-12 w-12 p-2 bg-white">
              <img src={API_URL_IMG + fileIcon} alt={fileIcon} />
            </div>
            <h4 className="text-sm truncate w-3/4">{file.file.name}</h4>
          </div>
          <div className="flex flex-row gap-3 items-center">
            <ConfirmRemoveFilePopover index={index} DeleteFile={DeleteFile} />
          </div>
        </div>
      )}
    </>
  );
}
