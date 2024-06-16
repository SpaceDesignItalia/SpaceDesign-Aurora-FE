import { useState } from "react";
import { Button, Input } from "@nextui-org/react"; // Importa il componente Button
import SendRoundedIcon from "@mui/icons-material/SendRounded";

interface RichTextEditorProps {
  onSendMessage: (message: string) => void;
}

export default function ChatKeyboard({ onSendMessage }: RichTextEditorProps) {
  const [editorContent, setEditorContent] = useState<string>("");

  const handleSend = () => {
    onSendMessage(editorContent);
    setEditorContent("");
  };

  return (
    <div className="flex flex-row items-center gap-3">
      <Input
        variant="bordered"
        className="w-full"
        value={editorContent}
        onChange={(e) => setEditorContent(e.target.value)}
        placeholder="Messaggio"
      />
      <Button onClick={handleSend} color="primary" isIconOnly>
        <SendRoundedIcon />
      </Button>
    </div>
  );
}
