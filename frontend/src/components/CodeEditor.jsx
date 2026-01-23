import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
} from "monaco-languageclient";
import { listen } from "vscode-ws-jsonrpc";

export default function CodeEditor({ value, onChange, language }) {
  const editorRef = useRef(null);
  const clientRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const lang = language?.toLowerCase();

    // Stop LSP if not Python
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

    listen({
      webSocket: socket,
      onConnection: (connection) => {
        console.log("[LSP] WebSocket connected");

        const client = new MonacoLanguageClient({
          name: "Python Language Client",
          clientOptions: {
            documentSelector: ["python"],
            workspaceFolder: {
              uri: "file:///workspace",
              name: "workspace",
            },
            errorHandler: {
              error: () => ErrorAction.Continue,
              closed: () => CloseAction.Restart,
            },
          },
          connectionProvider: {
            get: async () => connection,
          },
        });

        client.start();
        clientRef.current = client;

        connection.onClose(() => {
          console.log("[LSP] Connection closed");
          client.stop();
          clientRef.current = null;
        });
      },
    });

    socket.onerror = (err) => {
      console.error("[LSP] WebSocket error", err);
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
