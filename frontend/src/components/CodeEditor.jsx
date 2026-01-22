import Editor from '@monaco-editor/react'
import { useEffect, useRef } from 'react';
import { MonacoLanguageClient } from 'monaco-languageclient';

export default function CodeEditor({ value, onChange, language }) {
  const editorRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    // Only enable LSP for Python (add more languages later)
    if (language !== 'python') {
      // Stop LSP if switching away
      if (clientRef.current) {
        clientRef.current.stop();
        clientRef.current = null;
      }
      return;
    }

    const startLSP = async () => {
      const client = new MonacoLanguageClient({
        name: 'Python LSP Client',
        clientOptions: {
          // Only activate for Python files
          documentSelector: ['python'],
          // Dummy workspace (playground has no real folder)
          workspaceFolder: { uri: 'file:///playground', name: 'playground' },
        },
        // Connect to your backend WebSocket
        connectionProvider: {
          get: () => {
            return new Promise((resolve, reject) => {
              const socket = new WebSocket('ws://localhost:3000/python');

              socket.onopen = () => {
                console.log('LSP WebSocket connected to backend!');
                resolve({
                  reader: socket,
                  writer: socket,
                });
              };

              socket.onerror = (err) => {
                console.error('LSP WebSocket error:', err);
                reject(err);
              };

              socket.onclose = () => console.log('LSP WebSocket closed');
            });
          },
        },
      });

      // Start the LSP client
      client.start();
      clientRef.current = client;

      // Optional: wait for ready
      await client.onReady();
      console.log('Python LSP client ready!');
    };

    startLSP().catch(err => console.error('LSP client failed to start:', err));

    // Cleanup on unmount or language change
    return () => {
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
        defaultLanguage={language || 'javascript'}
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
        }}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
      />
    </div>
  )
}