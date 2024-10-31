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
  const [newFileName, setNewFileName] = useState(
    initialFileName.replace(extension, "")
  );

  useEffect(() => {
    fetchFileIcon();
  }, [file, variant]);

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
      const updatedFileName = `${newFileName.trim()}${extension}`; // Combina il nuovo nome con l'estensione
      setIsEditing(false);
      await axios.post("/Project/POST/RenameFile", {
        filePath: file.FilePath,
        newName: updatedFileName,
      });
    } catch (error) {
      console.error("Errore durante la rinomina del file:", error);
    }
  };

  return (
    <>
      {variant === "default" && (
        <div className="col-span-1 border bg-gray-100 p-2 px-7 flex flex-row items-center rounded-xl justify-between">
          <div className="w-1/2 md:w-5/6 flex flex-row gap-3 items-center">
            <div className="border rounded-xl h-12 w-12 p-2 bg-white">
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
                <span>{extension}</span>{" "}
                {/* Mostra l'estensione come testo fisso */}
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
                  Rimuovi cartella
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
