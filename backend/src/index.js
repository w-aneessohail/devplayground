import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

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

  const pyrightCmd = '"C:/Users/Anees Prince/AppData/Roaming/npm/pyright-langserver.cmd"';
  const serverProcess = spawn('cmd.exe', ['/c', pyrightCmd, '--stdio'], { shell: true });

  // pipe WebSocket messages to Pyright
  ws.on('message', (msg) => serverProcess.stdin.write(msg));
  serverProcess.stdout.on('data', (data) => ws.send(data));
  serverProcess.stderr.on('data', (data) => console.error(`Pyright error: ${data.toString()}`));

  ws.on('close', () => {
    console.log(`Connection closed: ${path}`);
    serverProcess.kill();
  });

  console.log('Python LSP ready for this connection.');
});

console.log('Backend ready. Connect frontend at ws://localhost:3000/python');
