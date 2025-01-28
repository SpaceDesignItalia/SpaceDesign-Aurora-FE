import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "@heroui/react";
import KeyboardBackspaceRoundedIcon from "@mui/icons-material/KeyboardBackspaceRounded";
import Editor from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
import { toPng } from "html-to-image"; // Importa la libreria per gli screenshot
import "monaco-editor/min/vs/editor/editor.main.css"; // Importa lo stile di Monaco localmente

const socket: Socket = io(API_WEBSOCKET_URL);

interface CodeShareTab {
  ProjectCodeShareId: number;
  ProjectCodeShareName: string;
  Code: string;
  ImageURL: string;
}

export default function CodeShareContainer({
  codeShare,
  setSelectedTab,
}: {
  codeShare: CodeShareTab;
  setSelectedTab: (tab: CodeShareTab | null) => void;
}) {
  const [code, setCode] = useState(codeShare.Code);
  const [loggedStafferId, setloggedStafferId] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<HTMLDivElement>(null); // Ref per l'elemento dell'editor

  function handleEditorChange(value: string | undefined) {
    setCode(value || "");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      const response = await axios.post(
        "Project/POST/UpdateProjectCode",
        {
          ProjectCodeShareId: codeShare.ProjectCodeShareId,
          ProjectCode: value,
        },
        {
          maxContentLength: 100000000,
          maxBodyLength: 1000000000,
        }
      );

      if (response.status === 200) {
        captureScreenshot(); // Cattura lo screenshot dopo l'update
      }
    }, 0);
  }

  async function captureScreenshot() {
    if (editorRef.current) {
      try {
        // Sovrascrivi console.error per silenziare gli errori
        const originalConsoleError = console.error;
        console.error = () => {}; // No-op (nessuna operazione)

        const dataUrl = await toPng(editorRef.current, {
          cacheBust: true,
          filter: (node) => {
            // Ignora nodi <style> e <link> per evitare errori
            if (
              node instanceof HTMLStyleElement ||
              node instanceof HTMLLinkElement
            ) {
              return false;
            }
            return true;
          },
        });

        // Ripristina console.error dopo aver catturato lo screenshot
        console.error = originalConsoleError;

        // Salva lo screenshot come immagine
        const blob = dataURLToBlob(dataUrl);
        const formData = new FormData();
        formData.append("file", blob, "screenshot.png");
        formData.append(
          "ProjectCodeShareId",
          codeShare.ProjectCodeShareId.toString()
        );

        const res = await axios.post(
          "Project/POST/UploadCodeShareScreenshot",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (res.status === 200) {
          socket.emit("share-code-update");
        }
      } catch (error) {
        console.error("Errore nel catturare lo screenshot:", error);
      }
    }
  }

  function dataURLToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  async function fetchCode() {
    await axios
      .get("Project/GET/GetCodeShareCode", {
        params: {
          ProjectCodeShareId: codeShare.ProjectCodeShareId,
        },
      })
      .then((response) => {
        setCode(response.data.Code);
      });
  }

  async function fetchSessionData() {
    await axios
      .get("/Authentication/GET/GetSessionData", { withCredentials: true })
      .then(async (res) => {
        setloggedStafferId(res.data.StafferId);

        socket.emit(
          "join-code-share",
          codeShare.ProjectCodeShareId,
          res.data.StafferId
        );
      });
  }

  function handleGoBack() {
    socket.emit(
      "leave-code-share",
      codeShare.ProjectCodeShareId,
      loggedStafferId
    );
    setSelectedTab(null);
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchCode();
    };
    fetchData();
    fetchSessionData();
  }, [codeShare]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    socket.on("share-code-update", () => {
      fetchCode();
    });
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <Button
        className="w-24"
        color="primary"
        radius="full"
        size="sm"
        variant="bordered"
        onPress={() => {
          handleGoBack();
        }}
      >
        <KeyboardBackspaceRoundedIcon sx={{ fontSize: 20 }} />
        Indietro
      </Button>
      <div ref={editorRef}>
        <Editor
          height="90vh"
          defaultLanguage="javascript"
          value={code}
          defaultValue={code}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
}
