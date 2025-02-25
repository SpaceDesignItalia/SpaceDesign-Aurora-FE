import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { toPng } from "html-to-image"; // Importa la libreria per gli screenshot
import "monaco-editor/min/vs/editor/editor.main.css"; // Importa lo stile di Monaco localmente
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";
const socket: Socket = io(API_WEBSOCKET_URL);
import { Spinner } from "@heroui/react";

interface CodeShareTab {
  ProjectCodeShareId: number;
  ProjectCodeShareName: string;
  Code: string;
  ImageURL: string;
}

// Aggiungi questa interfaccia per gli utenti connessi
interface ConnectedUser {
  socketId: string;
  codeShareId: number;
  userId: number;
}

interface Employee {
  EmployeeId: number;
  EmployeeName: string;
  EmployeeSurname: string;
  EmplyeeEmail: string;
  EmployeePhone: string;
  EmployeeImageUrl: string;
  codeShareId: number;
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
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("javascript");
  const [fontSize, setFontSize] = useState(14);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setOnlineCodeShareUsers] = useState<Employee[]>([]);

  // Move these state updates into a useEffect
  useEffect(() => {
    setFontSize(14);
    setTheme("light");
    setLanguage("javascript");
  }, []); // Empty dependency array to run only once

  async function handleEditorChange(value: string | undefined) {
    setCode(value || "");

    // Emetti l'evento di digitazione
    socket.emit("user-typing", codeShare.ProjectCodeShareId, loggedStafferId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(
        "user-stopped-typing",
        codeShare.ProjectCodeShareId,
        loggedStafferId
      );
    }, 1000);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      try {
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
          await captureScreenshot();
        }
      } finally {
        setIsLoading(false);
      }
    }, 800);
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

  async function fetchOnlineUsers(users: ConnectedUser[]) {
    setOnlineCodeShareUsers([]);
    for (const user of users) {
      const response = await axios.get("Staffer/GET/GetStafferById", {
        params: {
          EmployeeId: user.userId,
        },
      });

      setOnlineCodeShareUsers((prevUsers) => {
        // Check if user already exists by EmployeeId
        if (!prevUsers.find((u) => u.EmployeeId === response.data.EmployeeId)) {
          return [
            ...prevUsers,
            {
              ...response.data,
              codeShareId: user.codeShareId,
            },
          ];
        }
        return prevUsers;
      });
    }
  }

  async function fetchCode() {
    try {
      const response = await axios.get("Project/GET/GetCodeShareCode", {
        params: {
          ProjectCodeShareId: codeShare.ProjectCodeShareId,
        },
      });
      setCode(response.data.Code);
    } catch (error) {
      console.error("Errore nel recupero del codice:", error);
    }
  }

  async function fetchSessionData() {
    try {
      const res = await axios.get("/Authentication/GET/GetSessionData", {
        withCredentials: true,
      });
      setloggedStafferId(res.data.StafferId);
      socket.emit(
        "join-code-share",
        codeShare.ProjectCodeShareId,
        res.data.StafferId
      );
    } catch (error) {
      console.error("Errore nel recupero dei dati di sessione:", error);
    }
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
    fetchSessionData();
    const fetchData = async () => {
      await fetchCode();
    };
    fetchData();
  }, [codeShare]);

  // Add new useEffect for handling connectedUsers updates
  useEffect(() => {
    if (connectedUsers.length > 0) {
      fetchOnlineUsers(connectedUsers);
    }
  }, [connectedUsers]);

  useEffect(() => {
    socket.on("share-code-update", () => {
      fetchCode();
    });

    socket.on("get-users-on-code-share", (users: ConnectedUser[]) => {
      setConnectedUsers(users);
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
        <Icon icon="solar:alt-arrow-left-linear" fontSize={20} />
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

      <div className="relative flex-1 rounded-xl overflow-hidden border-2">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Spinner size="lg" color="primary" />
          </div>
        )}

        {/* Editor */}
        <div ref={editorRef} className="h-full">
          <Editor
            height="100%"
            language={language}
            value={code}
            defaultValue={code}
            onChange={handleEditorChange}
            theme={theme === "light" ? "light" : "vs-dark"}
            options={{
              minimap: { enabled: false },
              fontSize: fontSize,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              formatOnPaste: true,
              formatOnType: true,
              padding: { top: 16, bottom: 16 },
              suggest: {
                showWords: true,
                showSnippets: true,
                showUsers: true,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
