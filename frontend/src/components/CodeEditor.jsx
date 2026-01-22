import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { MonacoLanguageClient } from 'monaco-languageclient';
import {
  WebSocketMessageReader,
  WebSocketMessageWriter
} from 'vscode-ws-jsonrpc';

export default function CodeEditor({ value, onChange, language }) {
  const editorRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    const lang = language?.toLowerCase();

    if (lang !== 'python') {
      clientRef.current?.stop();
      clientRef.current = null;
      return;
    }

    const startPythonLSP = async () => {
      try {
        console.log('[LSP] Starting Python LSP');

        const socket = new WebSocket('ws://localhost:3000/python');

        socket.onopen = () => {
          console.log('[LSP] WebSocket connected');

          const reader = new WebSocketMessageReader(socket);
          const writer = new WebSocketMessageWriter(socket);

          const client = new MonacoLanguageClient({
            name: 'Python Language Client',
            clientOptions: {
              documentSelector: ['python'],
              workspaceFolder: {
                uri: 'file:///workspace',
                name: 'workspace'
              }
            },
            connectionProvider: {
              get: async () => ({ reader, writer })
            }
          });

          client.start();
          clientRef.current = client;
        };

        socket.onerror = (err) => {
          console.error('[LSP] WebSocket error', err);
        };

        socket.onclose = () => {
          console.log('[LSP] WebSocket closed');
        };
      } catch (err) {
        console.error('[LSP] Failed to start Python LSP', err);
      }
    };

    startPythonLSP();

    return () => {
      clientRef.current?.stop();
      clientRef.current = null;
    };
  }, [language]);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={language || 'javascript'}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          renderValidationDecorations: 'on',
          lineNumbersMinChars: 3,
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          automaticLayout: true
        }}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
      />
    </div>
  );
}
