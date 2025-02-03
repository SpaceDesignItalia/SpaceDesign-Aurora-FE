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
} from "@heroui/react";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import FileCard from "./FileCard";
import { useParams, useNavigate } from "react-router-dom";

const socket = io(API_WEBSOCKET_URL);

export default function FileUploaderModal({
  ProjectId,
  isOpen,
  isClosed,
  FolderId,
}: {
  ProjectId: number;
  isOpen: boolean;
  isClosed: () => void;
  FolderId: number;
}) {
  const { UniqueCode, Action } = useParams();
  const navigate = useNavigate();
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
      formData.append("FolderId", FolderId.toString());

      try {
        const res = await axios.post("/Project/POST/UploadFile", formData);
        if (res.status == 200) {
          isClosed();
        }
        setFiles([]);
        socket.emit("file-update", ProjectId);
      } catch (error) {
        console.error(error);
      } finally {
        if (Action) {
          navigate(`/projects/${UniqueCode}`);
        }
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
      scrollBehavior="outside"
      placement="center"
      backdrop="blur"
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-medium">
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
            className="rounded-xl bg-white text-gray-500 font-medium text-base w-full h-52 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto font-[sans-serif]"
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
              <h4 className="font-medium">File selezionati</h4>
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
