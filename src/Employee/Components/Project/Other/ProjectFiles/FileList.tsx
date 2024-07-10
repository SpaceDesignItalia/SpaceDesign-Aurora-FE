import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL_IMG, API_WEBSOCKET_URL } from "../../../../../API/API";
import { io } from "socket.io-client";

const socket = io(API_WEBSOCKET_URL);

interface File {
  FilePath: string;
}

interface FileListProps {
  ProjectId: number;
}

const FileList: React.FC<FileListProps> = ({ ProjectId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [update, setUpdate] = useState<boolean>(false);

  useEffect(() => {
    socket.on("file-update", () => {
      setUpdate(!update);
    });
  });

  useEffect(() => {
    console.log("ProjectId", ProjectId);
    socket.emit("join", ProjectId);
    const fetchFiles = async () => {
      try {
        const response = await axios.get("/Project/GET/GetFilesByProjectId", {
          params: { ProjectId: ProjectId },
        });
        setFiles(response.data);
        console.log(response.data);
      } catch (err) {
        setError("Error fetching files");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [ProjectId, update]);

  if (loading) return <p className="text-center">⏳ Loading files...</p>;
  if (error) return <p className="text-center text-red-500">❌ {error}</p>;
  if (files.length === 0)
    return <p className="text-center">No files available for this project.</p>;

  return (
    <div className="max-w-lg mx-auto p-4 border rounded-lg shadow-lg mt-6">
      <h3 className="text-lg font-bold mb-4">Files for Project {ProjectId}</h3>
      <ul className="list-disc ml-5">
        {files.map((file, index) => (
          <li key={index} className="flex justify-between items-center py-2">
            <span>{file.FilePath.split("/").pop()}</span>
            <a
              href={API_URL_IMG + `/uploads/projectFiles/${file.FilePath}`}
              download
              className="py-1 px-3 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
