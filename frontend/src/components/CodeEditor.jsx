import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { lspClient } from "../services/lspClient";
import * as monaco from "monaco-editor";

// Language mapping for LSP and file extensions
const LANGUAGE_CONFIG = {
  python: { lsp: "python", ext: ".py", uri: "file:///workspace/main.py" },
  javascript: { lsp: "javascript", ext: ".js", uri: "file:///workspace/main.js" },
  typescript: { lsp: "typescript", ext: ".ts", uri: "file:///workspace/main.ts" },
  php: { lsp: "php", ext: ".php", uri: "file:///workspace/main.php" },
  cpp: { lsp: "cpp", ext: ".cpp", uri: "file:///workspace/main.cpp" },
  java: { lsp: "java", ext: ".java", uri: "file:///workspace/Main.java" },
};

export default function CodeEditor({ value, onChange, language }) {
  const editorRef = useRef(null);
  const documentVersionRef = useRef(1);
  const [diagnostics, setDiagnostics] = useState([]);
  const lspStateRef = useRef({
    initialized: false,
    initializing: false,
    connected: false,
    currentLanguage: null,
  });
  const updateTimeoutRef = useRef(null);

  // Set up diagnostics callback once
  useEffect(() => {
    const handleDiagnostics = (params) => {
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

    return () => {
      lspClient.setDiagnosticsCallback(null);
    };
  }, []);

  // Connect/disconnect LSP based on language
  useEffect(() => {
    const lang = (language || "javascript").toLowerCase();
    const config = LANGUAGE_CONFIG[lang];

    // If language is not supported, just return
    if (!config) {
      console.warn("[LSP] Language not supported:", lang);
      return;
    }

    const manageLSPConnection = async () => {
      // If switching languages, disconnect first
      if (
        lspStateRef.current.currentLanguage &&
        lspStateRef.current.currentLanguage !== lang &&
        (lspStateRef.current.initialized || lspStateRef.current.connected)
      ) {
        try {
          console.log(`[LSP] Switching from ${lspStateRef.current.currentLanguage} to ${lang}, disconnecting...`);
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

      // Already connected to this language
      if (lspStateRef.current.currentLanguage === lang && lspStateRef.current.initialized) {
        return;
      }

      // Already initializing
      if (lspStateRef.current.initializing) {
        return;
      }

      lspStateRef.current.initializing = true;
      lspStateRef.current.currentLanguage = lang;

      try {
        const wsUrl = `ws://localhost:3000/${config.lsp}`;
        console.log(`[LSP] Connecting to ${lang} LSP at ${wsUrl}...`);
        await lspClient.connect(wsUrl, lang);
        lspStateRef.current.connected = true;

        console.log(`[LSP] Opening document for ${lang}...`);
        await lspClient.openDocument(config.uri, config.lsp, value || "");
        lspStateRef.current.initialized = true;

        console.log(`[LSP] ${lang.toUpperCase()} LSP fully initialized`);
      } catch (error) {
        console.error(`[LSP] Failed to initialize ${lang}:`, error);
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
    const lang = (language || "javascript").toLowerCase();
    const config = LANGUAGE_CONFIG[lang];

    if (!config || !lspStateRef.current.initialized) {
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
        await lspClient.updateDocument(
          config.uri,
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

  const lang = (language || "javascript").toLowerCase();
  const config = LANGUAGE_CONFIG[lang];
  const docUri = config?.uri || "file:///workspace/main.txt";

  return (
    <div className="h-full w-full">
      <Editor
        onMount={(editor) => {
          editorRef.current = editor;
        }}
        height="100%"
        language={lang}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        path={docUri}
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
