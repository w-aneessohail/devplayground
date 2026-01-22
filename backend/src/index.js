import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

const wss = new WebSocketServer({ port: 3000 });

console.log('LSP backend starting on ws://localhost:3000');

wss.on('connection', (ws, req) => {
  const path = req.url;

  console.log(`New connection: ${path}`);

  let serverProcess;

  if (path === '/python') {
//     const pyrightLocalPath = './node_modules/.bin/pyright-langserver.cmd';
//   serverProcess = spawn(pyrightLocalPath, ['--stdio']);
    // const pyrightPath = 'C:/Users/Anees Prince/AppData/Roaming/npm/pyright-langserver.cmd';
    // serverProcess = spawn('cmd.exe', ['/c', 'pyright-langserver --stdio']);
    // serverProcess = spawn('npx', ['pyright-langserver', '--stdio']);
    // serverProcess = spawn(pyrightPath, ['--stdio']);
    // serverProcess = spawn('npx', ['pyright-langserver', '--stdio']);
    const pyrightCmd = '"C:/Users/Anees Prince/AppData/Roaming/npm/pyright-langserver.cmd"';
    serverProcess = spawn('cmd.exe', ['/c', pyrightCmd, '--stdio'], {
    shell: true,  // important for cmd.exe
  });
    console.log('Pyright started via cmd.exe wrapper with absolute path');
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