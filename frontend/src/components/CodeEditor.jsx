'use client';

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { lspClient } from "../services/lspClient";
import * as monaco from "monaco-editor";

const DOC_URI = "file:///workspace/main.py";

export default function CodeEditor({ value, onChange, language }) {
  const editorRef = useRef(null);
  const documentVersionRef = useRef(1);
  const [diagnostics, setDiagnostics] = useState([]);
  const lspStateRef = useRef({
    initialized: false,
    initializing: false,
    connected: false,
  });
  const updateTimeoutRef = useRef(null);

  // Set up diagnostics callback once
  useEffect(() => {
    const handleDiagnostics = (params) => {
      console.log("[LSP] Diagnostics received:", params.diagnostics?.length || 0, "items");

      if (editorRef.current && params?.diagnostics) {
        const model = editorRef.current.getModel();
        if (model) {
          const markers = params.diagnostics.map((diag) => {
            // Map LSP severity: 1=Error, 2=Warning, 3=Information, 4=Hint
            // Monaco severity: 8=Error, 4=Warning, 2=Info, 1=Hint
            const severityMap = { 1: 8, 2: 4, 3: 2, 4: 1 };
            return {
              severity: severityMap[diag.severity] || 1,
              message: diag.message,
              startLineNumber: Math.max(1, diag.range?.start?.line + 1 || 1),
              startColumn: Math.max(1, diag.range?.start?.character + 1 || 1),
              endLineNumber: Math.max(1, diag.range?.end?.line + 1 || 1),
              endColumn: Math.max(1, diag.range?.end?.character + 1 || 1),
            };
          });

          console.log("[LSP] Setting", markers.length, "markers");
          monaco.editor.setModelMarkers(model, "lsp", markers);
          setDiagnostics(params.diagnostics);
        }
      } else {
        // Clear markers if no diagnostics
        if (editorRef.current) {
          const model = editorRef.current.getModel();
          if (model) {
            monaco.editor.setModelMarkers(model, "lsp", []);
          }
        }
      }
    };

    lspClient.setDiagnosticsCallback(handleDiagnostics);

    // Cleanup callback on unmount
    return () => {
      lspClient.setDiagnosticsCallback(null);
    };
  }, []);

  // Connect/disconnect LSP based on language
  useEffect(() => {
    const lang = (language || "").toLowerCase();

    const manageLSPConnection = async () => {
      // Disconnect if not Python
      if (lang !== "python") {
        if (lspStateRef.current.initialized || lspStateRef.current.connected) {
          try {
            console.log("[LSP] Switching away from Python, disconnecting...");
            await lspClient.disconnect();
            lspStateRef.current.initialized = false;
            lspStateRef.current.connected = false;

            // Clear markers
            if (editorRef.current) {
              const model = editorRef.current.getModel();
              if (model) {
                monaco.editor.setModelMarkers(model, "lsp", []);
              }
            }
          } catch (error) {
            console.error("[LSP] Error disconnecting:", error);
          }
        }
        return;
      }

      // Connect to Python LSP
      if (
        lspStateRef.current.initialized ||
        lspStateRef.current.initializing
      ) {
        return; // Already connected or connecting
      }

      lspStateRef.current.initializing = true;

      try {
        console.log("[LSP] Connecting to Python LSP...");
        await lspClient.connect("ws://localhost:3000/python");
        lspStateRef.current.connected = true;

        console.log("[LSP] Opening document...");
        await lspClient.openDocument(DOC_URI, "python", value || "");
        lspStateRef.current.initialized = true;

        console.log("[LSP] Python LSP fully initialized");
      } catch (error) {
        console.error("[LSP] Failed to initialize:", error);
        lspStateRef.current.connected = false;
        lspStateRef.current.initialized = false;
      } finally {
        lspStateRef.current.initializing = false;
      }
    };

    manageLSPConnection();

    // Cleanup on unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [language]);

  // Sync code changes to LSP (debounced)
  useEffect(() => {
    const lang = (language || "").toLowerCase();
    if (lang !== "python" || !lspStateRef.current.initialized) {
      return;
    }

    // Clear any pending update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce updates by 500ms
    updateTimeoutRef.current = setTimeout(async () => {
      try {
        documentVersionRef.current++;
        console.log(
          "[LSP] Updating document, version:",
          documentVersionRef.current
        );
        await lspClient.updateDocument(
          DOC_URI,
          value || "",
          documentVersionRef.current
        );
      } catch (error) {
        console.error("[LSP] Error updating document:", error);
      }
    }, 500);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [value, language]);

  const path =
    (language || "").toLowerCase() === "python"
      ? DOC_URI
      : "file:///workspace/main.txt";

  return (
    <div className="h-full w-full">
      <Editor
        onMount={(editor) => {
          editorRef.current = editor;
        }}
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
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
        }}
      />
    </div>
  );
}
