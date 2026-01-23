import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { MonacoLanguageClient } from "monaco-languageclient";
import {
  WebSocketMessageReader,
  WebSocketMessageWriter,
} from "vscode-ws-jsonrpc";

export default function CodeEditor({ value, onChange, language }) {
  const editorRef = useRef(null);
  const clientRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const lang = language?.toLowerCase();

    // Cleanup if not Python
    if (lang !== "python") {
      if (clientRef.current) {
        clientRef.current.stop();
        clientRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    console.log("[LSP] Starting Python LSP");

    const socket = new WebSocket("ws://localhost:3000/python");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("[LSP] WebSocket connected");

      const reader = new WebSocketMessageReader(socket);
      const writer = new WebSocketMessageWriter(socket);

      const client = new MonacoLanguageClient({
        name: "Python Language Client",
        clientOptions: {
          documentSelector: ["python"],
          workspaceFolder: {
            uri: "file:///workspace",
            name: "workspace",
          },
        },
        connectionProvider: {
          get: async () => ({ reader, writer }),
        },
      });

      client.start();
      clientRef.current = client;
    };

    socket.onerror = (err) => {
      console.error("[LSP] WebSocket error", err);
    };

    socket.onclose = () => {
      console.log("[LSP] WebSocket closed");
      if (clientRef.current) {
        clientRef.current.stop();
        clientRef.current = null;
      }
    };

    return () => {
      if (clientRef.current) {
        clientRef.current.stop();
        clientRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [language]);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={language || "javascript"}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          renderValidationDecorations: "on",
          lineNumbersMinChars: 3,
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
      />
    </div>
  );
}
