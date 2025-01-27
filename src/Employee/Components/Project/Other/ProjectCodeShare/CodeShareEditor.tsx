import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "@heroui/react";
import KeyboardBackspaceRoundedIcon from "@mui/icons-material/KeyboardBackspaceRounded";
import Editor from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../../../API/API";

const socket: Socket = io(API_WEBSOCKET_URL);

interface CodeShareTab {
  ProjectCodeShareId: number;
  ProjectCodeShareName: string;
  Code: string;
}

export default function CodeShareContainer({
  codeShare,
  setSelectedTab,
}: {
  codeShare: CodeShareTab;
  setSelectedTab: (tab: CodeShareTab | null) => void;
}) {
  const [code, setCode] = useState(codeShare.Code);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleEditorChange(value: string | undefined) {
    setCode(value || "");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      console.log("Saving code:", value);
      const response = await axios.post("Project/POST/UpdateProjectCode", {
        ProjectCodeShareId: codeShare.ProjectCodeShareId,
        ProjectCode: value,
      });

      if (response.status === 200) {
        socket.emit("share-code-update");
      }
    }, 2000);
  }

  async function fetchCode() {
    await axios
      .get("Project/GET/GetCodeShareCode", {
        params: {
          ProjectCodeShareId: codeShare.ProjectCodeShareId,
        },
      })
      .then((response) => {
        console.log("CodeShareContainer fetchCode response:", response.data);
        setCode(response.data.Code);
      });
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchCode();
    };
    fetchData();
  }, [codeShare]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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
          setSelectedTab(null);
        }}
      >
        <KeyboardBackspaceRoundedIcon sx={{ fontSize: 20 }} />
        Indietro
      </Button>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        value={code}
        defaultValue={code}
        onChange={handleEditorChange}
      />
    </div>
  );
}
