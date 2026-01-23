import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { createServerProcessConnection } from 'monaco-languageclient/lib/server';

const wss = new WebSocketServer({ port: 3000 });
console.log('LSP backend starting on ws://localhost:3000');

wss.on('connection', (ws, req) => {
  const path = req.url;
  console.log(`New connection: ${path}`);

  if (path !== '/python') {
    ws.send(JSON.stringify({ error: 'Unsupported language' }));
    ws.close();
    return;
  }

  // Convert native WebSocket to a json-rpc socket
  const socket = toSocket(ws);

  // Spawn Pyright server
  const pyrightCmd = '"C:/Users/Anees Prince/AppData/Roaming/npm/pyright-langserver.cmd"';
  const serverProcess = spawn('cmd.exe', ['/c', pyrightCmd, '--stdio'], { shell: true });

  console.log('Pyright started via cmd.exe wrapper');

  // Wrap server stdin/stdout as reader/writer
  const reader = new WebSocketMessageReader(serverProcess.stdout);
  const writer = new WebSocketMessageWriter(serverProcess.stdin);

  // Bridge WebSocket <-> Pyright server
  socket.listen({
    onMessage: (msg) => writer.write(msg),
    onError: (err) => console.error('Socket error:', err),
    onClose: () => {
      console.log('WebSocket closed, killing Pyright');
      serverProcess.kill();
    },
  });

  reader.listen({
    onMessage: (msg) => socket.send(msg),
    onError: (err) => console.error('Reader error:', err),
    onClose: () => {
      console.log('Pyright process closed');
      ws.close();
    },
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Pyright error: ${data.toString()}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    serverProcess.kill();
  });
});

console.log('Ready. Connect on ws://localhost:3000/python');
