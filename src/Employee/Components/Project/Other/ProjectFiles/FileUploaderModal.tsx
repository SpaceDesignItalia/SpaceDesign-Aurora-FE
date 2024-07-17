import axios from "axios";
import React, { useState, useRef } from "react";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalContent,
  Button,
  Checkbox,
} from "@nextui-org/react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";

const socket = io(API_WEBSOCKET_URL);

export default function FileUploaderModal({
  ProjectId,
  isOpen,
  isClosed,
}: {
  ProjectId: number;
  isOpen: boolean;
  isClosed: () => void;
}) {
  const [files, setFiles] = useState<{ file: File; forClient: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  socket.emit("join", ProjectId);

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

  const handleCheckboxChange = (index: number) => {
    setFiles((prevFiles) =>
      prevFiles.map((file, i) =>
        i === index ? { ...file, forClient: !file.forClient } : file
      )
    );
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach(({ file, forClient }) => {
        formData.append("files", file);
        formData.append("forClient", forClient.toString());
      });
      formData.append("ProjectId", ProjectId.toString());

      try {
        const res = await axios.post("/Project/POST/UploadFile", formData);
        if (res.status == 200) {
          isClosed();
        }
        setFiles([]);
        socket.emit("file-update", ProjectId);
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
            Aggiungi un nuovo file al progetto
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
            className="flex flex-row gap-2 border-2 border-dashed border-blue-500 p-4 rounded-lg cursor-pointer hover:bg-blue-50"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            ref={dropRef}
            onClick={() => fileInputRef.current?.click()} // Add this line
          >
            <FileUploadRoundedIcon className="text-blue-500" />
            <p className="text-blue-500">
              Clicca o trascina i file per caricarli
            </p>
          </div>
          {files.length > 0 && (
            <section className="mt-4 text-left">
              <h4 className="font-bold">File selezionati:</h4>
              <ul className="flex flex-col list-disc mt-3 gap-2">
                {files.map(({ file, forClient }, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Button
                      color="danger"
                      size="sm"
                      radius="sm"
                      onClick={() => handleRemoveFile(index)}
                      isIconOnly
                    >
                      <CloseRoundedIcon />
                    </Button>
                    <span>{file.name}</span>

                    <Checkbox
                      checked={forClient}
                      onChange={() => handleCheckboxChange(index)}
                    >
                      Visibile al cliente
                    </Checkbox>
                  </li>
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
