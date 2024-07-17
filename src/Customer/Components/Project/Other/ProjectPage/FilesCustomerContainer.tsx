import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Card, CardBody, CardFooter, Input } from "@nextui-org/react";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import { useParams } from "react-router-dom";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

const socket = io(API_WEBSOCKET_URL);

interface File {
  ProjectFileId: number;
  FileName: string;
  FilePath: string;
  ForClient: boolean;
  ProjectId: number;
}

export default function FilesCustomerContainer() {
  const { ProjectId } = useParams();
  const [files, setFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
      const response = await axios.get(
        "/Project/GET/GetFilesByProjectIdForCustomer",
        {
          params: { ProjectId: ProjectId },
        }
      );
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
        .get("/Project/GET/SearchFilesByProjectIdAndNameForCustomer", {
          params: { ProjectId: ProjectId, FileName: searchQuery },
        })
        .then((res) => {
          console.log(res.data);
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

  return (
    <>
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
        </div>

        <div className="grid grid-cols-4 gap-4">
          {files.length > 0 ? (
            files.map((file, index) => (
              <Card radius="sm" key={index} className="col-span-1">
                <CardBody className="flex flex-row gap-5">
                  <div className="w-full">
                    <h4>{file.FileName}</h4>
                  </div>
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
