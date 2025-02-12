import axios from "axios";
import ConfirmDeleteFileModal from "./ConfirmDeleteFileModal";
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { API_URL_IMG } from "../../../../../API/API";
import { Icon } from "@iconify/react";
interface File {
  TaskFileId: number;
  FileName: string;
  FilePath: string;
  TaskId: number;
}

interface FileCardProps {
  file: File;
  DeleteFile: (FileData: File) => void;
}

export default function FileCard({ file, DeleteFile }: FileCardProps) {
  const [fileIcon, setFileIcon] = useState<string>("");

  useEffect(() => {
    fetchFileIcon();
  }, []);

  async function fetchFileIcon() {
    try {
      const res = await axios.get(`/Fileicon/GET/GetFileIconByExtension`, {
        params: { fileName: file.FileName },
      });

      if (res.status === 200) {
        setFileIcon(res.data);
      }
    } catch (error) {
      console.error("Estrazione dell'icona fallita");
    }
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
    <div className="w-full border bg-gray-100 p-2 px-7 flex flex-row items-center rounded-xl justify-between">
      <div className="w-1/2 md:w-5/6 flex flex-row gap-3 items-center">
        <div className="border rounded-xl h-12 w-12 p-2 bg-white">
          <img src={API_URL_IMG + fileIcon} alt={fileIcon} />
        </div>
        <h4 className="text-sm truncate w-3/4">{file.FileName}</h4>
      </div>

      <div className="flex flex-row gap-3 items-center">
        <Button
          color="primary"
          variant="light"
          radius="full"
          size="sm"
          startContent={<Icon icon="solar:download-linear" fontSize={22} />}
          onClick={() => downloadFile(file.FilePath, file.FileName)}
          fullWidth
          isIconOnly
        />
        <ConfirmDeleteFileModal FileData={file} DeleteFile={DeleteFile} />
      </div>
    </div>
  );
}
