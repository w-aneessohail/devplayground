import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';

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

  // Convert WebSocket to proper rpc socket
  const socket = toSocket(ws);

  const pyrightPath = '"C:/Users/Anees Prince/AppData/Roaming/npm/pyright-langserver.cmd"';
  const serverProcess = spawn('cmd.exe', ['/c', pyrightPath, '--stdio'], { shell: true });

  console.log('Pyright started, wrapping with JSON-RPC');

  // Wrap stdout/stderr in JSON-RPC reader/writer
  const reader = new WebSocketMessageReader(socket);
  const writer = new WebSocketMessageWriter(socket);

  // Pipe Pyright process
  serverProcess.stdout.on('data', (data) => writer.write(data));
  serverProcess.stderr.on('data', (data) => console.error(`Pyright error: ${data.toString()}`));
  reader.listen((msg) => serverProcess.stdin.write(msg));

  ws.on('close', () => {
    console.log(`Connection closed: ${path}`);
    serverProcess.kill();
  });

  console.log('Python LSP ready for this connection.');
});

console.log('Backend ready. Connect frontend at ws://localhost:3000/python');
