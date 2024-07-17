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
import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import { useParams } from "react-router-dom";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

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
  FilePath: string;
  FileName: string;
}

interface ModalData {
  ProjectId: number;
  open: boolean;
}

export default function FilesContainer({
  projectData,
}: {
  projectData: Project;
}) {
  const { ProjectId } = useParams();
  const [files, setFiles] = useState<File[]>([]);
  const [update, setUpdate] = useState<boolean>(false);
  const [modalUploadFile, setModalUploadFile] = useState<ModalData>({
    ProjectId: 0,
    open: false,
  });

  useEffect(() => {
    socket.on("file-update", () => {
      setUpdate((prev) => !prev);
    });
  }, []);

  useEffect(() => {
    socket.emit("join", ProjectId);
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

    fetchFiles();
  }, [ProjectId, update]);

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
      link.setAttribute("download", fileName); // Usa il nome del file fornito dal backend
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
      <FileUploaderModal
        ProjectId={projectData.ProjectId}
        isOpen={modalUploadFile.open}
        isClosed={() => setModalUploadFile({ ...modalUploadFile, open: false })}
      />
      <div className="flex flex-col gap-10 border border-gray-200 rounded-xl p-5">
        <div className="flex flex-row justify-between gap-5 items-center">
          <Input
            radius="sm"
            variant="bordered"
            startContent={<SearchOutlinedIcon />}
            className="md:w-1/3"
            placeholder="Cerca file per nome..."
          />
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
        </div>

        <div className="grid grid-cols-3 gap-4">
          {files.map((file, index) => (
            <Card radius="sm" key={index} className="col-span-1">
              <CardBody className="flex flex-row gap-5">
                <h4>{file.FileName}</h4>
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
                      aria-label="Remove"
                      aria-labelledby="Remove"
                      /* onClick={() =>
                        setModalDeleteData({
                          ...modalDeleteData,
                          open: true,
                          Project: project,
                        })
                      } */
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
          ))}
        </div>
      </div>
    </>
  );
}
