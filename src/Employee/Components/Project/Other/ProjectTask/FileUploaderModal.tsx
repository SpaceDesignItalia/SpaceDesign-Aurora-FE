import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import axios from "axios";
import React, { useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import FileCard from "../ProjectFiles/FileCard";

const socket = io(API_WEBSOCKET_URL);

export default function FileUploaderModal({
  TaskId,
  isOpen,
  isClosed,
  setFileUpdate,
}: {
  TaskId: number;
  isOpen: boolean;
  isClosed: () => void;
  setFileUpdate: (update: boolean) => void;
}) {
  const [files, setFiles] = useState<{ file: File; forClient: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        forClient: false,
      }));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        file,
        forClient: false,
      }));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach(({ file }) => {
        formData.append("files", file);
      });
      formData.append("TaskId", TaskId.toString());

      try {
        const res = await axios.post("/Project/POST/UploadTaskFile", formData);
        if (res.status == 200) {
          isClosed();
        }
        setFiles([]);
        setFileUpdate(true);
        socket.emit("file-update", TaskId);
      } catch (error) {
        console.error(error);
      }
    }
  };

  function closeModal() {
    setFiles([]);
    isClosed();
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={isClosed}
      size="2xl"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold">
            Aggiungi un nuovo file alla Task
          </h3>
        </ModalHeader>
        <ModalBody>
          <input
            name="file"
            id="file"
            type="file"
            multiple
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />

          <div
            className="rounded-xl bg-white text-gray-500 font-semibold text-base w-full h-52 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto font-[sans-serif]"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            ref={dropRef}
            onClick={() => fileInputRef.current?.click()} // Add this line
          >
            <CloudUploadRoundedIcon />
            <p className="text-xs font-medium text-gray-400 mt-2">
              Clicca o trascina i file per caricarli
            </p>
          </div>
          {files.length > 0 && (
            <section className="mt-4 text-left">
              <h4 className="font-semibold">File selezionati</h4>
              <ul className="flex flex-col list-disc mt-3 gap-2">
                {files.map((file, index) => (
                  <FileCard
                    file={file}
                    variant="delete"
                    DeleteFile={handleRemoveFile}
                    index={index}
                    key={index}
                  />
                ))}
              </ul>
            </section>
          )}
        </ModalBody>
        <ModalFooter className="flex sm:flex-row flex-col">
          {files.length > 0 && (
            <Button color="primary" radius="sm" onClick={handleUpload}>
              Carica document{files.length > 1 ? "i" : "o"}
            </Button>
          )}
          <Button variant="light" onClick={closeModal} radius="sm">
            Annulla
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
