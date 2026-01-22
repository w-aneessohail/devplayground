// src/components/CodeEditor.jsx
import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { createConnection } from 'vscode-languageserver-protocol';

// Critical: Initialize VS Code services (must be done once, outside component)
import { init as initServices } from 'monaco-languageclient';
initServices(); // This fixes "Default api is not ready yet"

export default function CodeEditor({ value, onChange, language }) {
  const editorRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    const langLower = language?.toLowerCase() || '';
    console.log('CodeEditor received language:', langLower);

    if (langLower !== 'python') {
      console.log('Not Python — skipping LSP');
      if (clientRef.current) {
        clientRef.current.stop();
        clientRef.current = null;
      }
      return;
    }

    console.log('Starting Python LSP connection...');

    const startLSP = async () => {
      try {
        const client = new MonacoLanguageClient({
          name: 'Python LSP Client',
          clientOptions: {
            documentSelector: ['python'],
            workspaceFolder: { uri: 'file:///playground', name: 'playground' },
            diagnosticCollectionName: 'python-diagnostics',
          },
          connectionProvider: {
            get: async () => {
              return new Promise((resolve, reject) => {
                const socket = new WebSocket('ws://localhost:3000/python');

                socket.onopen = () => {
                  console.log('LSP WebSocket connected to backend!');
                  resolve(createConnection(socket, socket));
                };

                socket.onerror = (err) => {
                  console.error('LSP WebSocket error:', err);
                  reject(err);
                };

                socket.onclose = () => {
                  console.log('LSP WebSocket closed');
                };
              });
            },
          },
        });

        // Start client
        client.start();
        clientRef.current = client;

        // Wait for ready
        await client.onReady();
        console.log('Python LSP client ready!');
      } catch (err) {
        console.error('LSP client failed to start:', err);
      }
    };

    startLSP();

    // Cleanup
    return () => {
      console.log('Cleaning up LSP client');
      if (clientRef.current) {
        clientRef.current.stop();
        clientRef.current = null;
      }
    };
  }, [language]);

  return (
    <div className="h-full">
      <Editor
        height="100%"
        language={language || 'javascript'}  // ← use prop directly (Monaco handles it)
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
        }}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
      />
    </div>
  );
}