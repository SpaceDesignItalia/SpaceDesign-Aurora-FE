import axios from "axios";
import React, { useState, useRef } from "react";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";

const socket = io(API_WEBSOCKET_URL);

export default function FileUploader({
  ProjectId,
  access,
}: {
  ProjectId: number;
  access: boolean;
}) {
  const [files, setFiles] = useState<{ file: File; forClient: boolean }[]>([]);
  const [status, setStatus] = useState<
    "initial" | "uploading" | "success" | "fail"
  >("initial");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  socket.emit("join", ProjectId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setStatus("initial");
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        forClient: false,
      }));
      setFiles(newFiles);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      setStatus("initial");
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        file,
        forClient: false,
      }));
      setFiles(newFiles);
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

  const handleUpload = async () => {
    if (files.length > 0) {
      setStatus("uploading");

      const formData = new FormData();
      files.forEach(({ file, forClient }) => {
        formData.append("files", file);
        formData.append("forClient", forClient.toString());
      });
      formData.append("ProjectId", ProjectId.toString());

      try {
        await axios.post("/Project/POST/UploadFile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setStatus("success");
        setFiles([]);
        socket.emit("file-update", ProjectId);
      } catch (error) {
        console.error(error);
        setStatus("fail");
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded-lg shadow-lg">
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
        className="border-2 border-dashed border-blue-500 p-4 rounded-lg cursor-pointer hover:bg-blue-50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        ref={dropRef}
        onClick={() => fileInputRef.current?.click()} // Add this line
      >
        <p className="text-blue-500">
          Drag & Drop files here or click to select files
        </p>
      </div>
      {files.length > 0 && (
        <section className="mt-4 text-left">
          <h4 className="font-bold">File details:</h4>
          <ul className="list-disc ml-5">
            {files.map(({ file, forClient }, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span>{file.name}</span>
                {access && (
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={forClient}
                      onChange={() => handleCheckboxChange(index)}
                    />
                    <span>Only for client</span>
                  </label>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {files.length > 0 && (
        <button
          onClick={handleUpload}
          className="mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Upload files
        </button>
      )}
      <Result status={status} />
    </div>
  );
}

const Result = ({ status }: { status: string }) => {
  if (status === "success") {
    return (
      <p className="mt-4 text-green-500">✅ Files uploaded successfully!</p>
    );
  } else if (status === "fail") {
    return <p className="mt-4 text-red-500">❌ File upload failed!</p>;
  } else if (status === "uploading") {
    return (
      <p className="mt-4 text-yellow-500">⏳ Uploading selected files...</p>
    );
  } else {
    return null;
  }
};
