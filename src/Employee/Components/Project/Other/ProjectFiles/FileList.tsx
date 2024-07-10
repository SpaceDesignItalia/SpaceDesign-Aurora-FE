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

  if (loading) return <p>⏳ Loading files...</p>;
  if (error) return <p>❌ {error}</p>;
  if (files.length === 0) return <p>No files available for this project.</p>;

  return (
    <div>
      <h3>Files for Project {ProjectId}</h3>
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <a
              href={API_URL_IMG + `/uploads/projectFiles/${file.FilePath}`}
              download
            >
              {file.FilePath.split("/").pop()}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
