import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Button,
  Select,
  SelectItem,
  Avatar,
  Autocomplete,
  AutocompleteItem,
  AvatarGroup,
} from "@heroui/react";
import KeyboardBackspaceRoundedIcon from "@mui/icons-material/KeyboardBackspaceRounded";
import Editor from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { API_URL_IMG, API_WEBSOCKET_URL } from "../../../../../API/API";
import { toPng } from "html-to-image"; // Importa la libreria per gli screenshot
import "monaco-editor/min/vs/editor/editor.main.css"; // Importa lo stile di Monaco localmente
import { Spinner } from "@heroui/react";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const socket: Socket = io(API_WEBSOCKET_URL);

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
  const [onlineCodeShareUsers, setOnlineCodeShareUsers] = useState<Employee[]>(
    []
  );

  const programmingLanguages = [
    { label: "JavaScript", value: "javascript" },
    { label: "TypeScript", value: "typescript" },
    { label: "HTML", value: "html" },
    { label: "CSS", value: "css" },
    { label: "SCSS", value: "scss" },
    { label: "Python", value: "python" },
    { label: "Java", value: "java" },
    { label: "C#", value: "csharp" },
    { label: "C++", value: "cpp" },
    { label: "C", value: "c" },
    { label: "Ruby", value: "ruby" },
    { label: "PHP", value: "php" },
    { label: "Swift", value: "swift" },
    { label: "Kotlin", value: "kotlin" },
    { label: "Go", value: "go" },
    { label: "Rust", value: "rust" },
    { label: "SQL", value: "sql" },
    { label: "Shell", value: "shell" },
    { label: "Markdown", value: "markdown" },
    { label: "JSON", value: "json" },
    { label: "XML", value: "xml" },
    { label: "YAML", value: "yaml" },
    { label: "GraphQL", value: "graphql" },
    { label: "R", value: "r" },
    { label: "Dart", value: "dart" },
    { label: "Scala", value: "scala" },
    { label: "Haskell", value: "haskell" },
    { label: "Lua", value: "lua" },
    { label: "MATLAB", value: "matlab" },
    { label: "Perl", value: "perl" },
  ];

  const fontSizeOptions = [
    { label: "Piccolo", value: 12 },
    { label: "Normale", value: 14 },
    { label: "Grande", value: 16 },
  ];

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

  const handleLanguageChange = (key: string | null) => {
    setLanguage(key || "javascript"); // Se key è null, usa 'javascript' come fallback
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center mb-4 p-3 bg-background rounded-xl border-2">
        <div className="flex items-center gap-4">
          <Button
            color="primary"
            radius="full"
            variant="bordered"
            startContent={<KeyboardBackspaceRoundedIcon />}
            onClick={() => handleGoBack()}
          >
            Indietro
          </Button>
          <h2 className="text-xl font-semibold">
            {codeShare.ProjectCodeShareName}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Editor Controls */}
          <div className="flex items-center gap-2">
            <Autocomplete
              variant="bordered"
              size="sm"
              radius="full"
              label="Linguaggio"
              placeholder="Seleziona linguaggio"
              defaultSelectedKey={language}
              onSelectionChange={(key) => handleLanguageChange(key as string)}
            >
              {programmingLanguages.map((lang) => (
                <AutocompleteItem key={lang.value} value={lang.value}>
                  {lang.label}
                </AutocompleteItem>
              ))}
            </Autocomplete>

            <Select
              variant="bordered"
              label="Dimensione testo"
              selectedKeys={[fontSize.toString()]}
              onSelectionChange={(key) => setFontSize(Number(key))}
              radius="full"
              size="sm"
            >
              {fontSizeOptions.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </Select>

            <Button
              size="sm"
              radius="full"
              color="primary"
              isIconOnly
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              startContent={
                theme === "light" ? (
                  <DarkModeIcon sx={{ fontSize: 15 }} className="text-white" />
                ) : (
                  <LightModeIcon sx={{ fontSize: 15 }} className="text-white" />
                )
              }
            />
          </div>

          {/* Connected Users */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-foreground-500">
              Utenti connessi:
            </span>
            <div className="flex">
              <AvatarGroup max={3} isBordered size="sm">
                {onlineCodeShareUsers.map(
                  (user) =>
                    user.codeShareId === codeShare.ProjectCodeShareId && (
                      <Avatar
                        size="sm"
                        key={user.EmployeeId}
                        src={
                          user.EmployeeImageUrl &&
                          API_URL_IMG + "/profileIcons/" + user.EmployeeImageUrl
                        }
                      />
                    )
                )}
              </AvatarGroup>
            </div>
          </div>
        </div>
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
