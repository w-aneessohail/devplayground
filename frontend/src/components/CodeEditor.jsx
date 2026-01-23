import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { MonacoLanguageClient } from "monaco-languageclient";
import {
  toSocket,
  WebSocketMessageReader,
  WebSocketMessageWriter,
} from "vscode-ws-jsonrpc";

export default function CodeEditor({ value, onChange, language }) {
  const clientRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const lang = (language || "").toLowerCase();

    // Stop LSP if not Python
    if (lang !== "python") {
      if (clientRef.current) {
        try {
          clientRef.current.stop();
        } catch (e) {
          console.log("[LSP] Error stopping client:", e.message);
        }
        clientRef.current = null;
      }

      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (e) {
          console.log("[LSP] Error closing socket:", e.message);
        }
        socketRef.current = null;
      }
      return;
    }

    console.log("[LSP] Starting Python LSP...");

    // Create WebSocket connection
    const ws = new WebSocket("ws://localhost:3000/python");
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[LSP] WebSocket connected");

      try {
        // Create JSON-RPC transports
        const rpcSocket = toSocket(ws);
        const reader = new WebSocketMessageReader(rpcSocket);
        const writer = new WebSocketMessageWriter(rpcSocket);

        // Create and start client
        const client = new MonacoLanguageClient({
          name: "Python Language Client",
          clientOptions: {
            documentSelector: ["python"],
            errorHandler: {
              error: () => ({ action: 1 }), // Continue
              closed: () => ({ action: 2 }), // Restart
            },
          },
          connectionProvider: {
            get: async () => ({ reader, writer }),
          },
        });

        clientRef.current = client;

        // Start client
        client.start();
        console.log("[LSP] Python LSP client started successfully");
      } catch (error) {
        console.error("[LSP] Error creating client:", error);
        ws.close();
      }
    };

    ws.onerror = (err) => {
      console.error("[LSP] WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("[LSP] Connection closed");
      if (clientRef.current) {
        try {
          clientRef.current.stop();
        } catch (e) {
          console.log("[LSP] Error stopping client on close:", e.message);
        }
        clientRef.current = null;
      }
    };

    // Cleanup on unmount or language change
    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.stop();
        } catch (e) {
          console.log("[LSP] Error during cleanup:", e.message);
        }
        clientRef.current = null;
      }

      if (socketRef.current && socketRef.current.readyState !== 3) {
        try {
          socketRef.current.close();
        } catch (e) {
          console.log("[LSP] Error closing socket during cleanup:", e.message);
        }
      }
      socketRef.current = null;
    };
  }, [language]);

  // Give Monaco a stable "file" URI for Python (helps LSP like Pyright)
  const path =
    (language || "").toLowerCase() === "python"
      ? "file:///workspace/main.py"
      : "file:///workspace/main.txt";

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={language || "javascript"}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        path={path}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbersMinChars: 3,
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
