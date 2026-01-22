import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

const wss = new WebSocketServer({ port: 3000 });

console.log('LSP backend starting on ws://localhost:3000');

wss.on('connection', (ws, req) => {
  const path = req.url;

  console.log(`New connection: ${path}`);

  let serverProcess;

  if (path === '/python') {
    serverProcess = spawn('pyright-langserver', ['--stdio']);
    console.log('Pyright (Python) started');
  } else {
    ws.send(JSON.stringify({ error: 'Unsupported language' }));
    ws.close();
    return;
  }

  ws.on('message', (message) => {
    serverProcess.stdin.write(message);
  });

  serverProcess.stdout.on('data', (data) => {
    ws.send(data);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Pyright error: ${data.toString()}`);
  });

  ws.on('close', () => {
    console.log(`Connection closed: ${path}`);
    serverProcess.kill();
  });
});

console.log('Ready. Connect on ws://localhost:3000/python');