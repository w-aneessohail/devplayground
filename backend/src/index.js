import { WebSocketServer } from 'ws';
import { createRequire } from 'node:module';
import { createServerProcess, createWebSocketConnection, forward } from 'vscode-ws-jsonrpc/server';

const require = createRequire(import.meta.url);

// LSP configurations
const lspServers = {
  python: {
    command: process.execPath,
    args: [require.resolve('pyright/langserver.index.js'), '--stdio'],
    displayName: 'Pyright (Python)'
  },
  php: {
    command: 'cmd.exe',
    args: ['/c', 'C:\\Users\\Anees Prince\\AppData\\Roaming\\npm\\intelephense.cmd', '--stdio'],
    displayName: 'Intelephense (PHP)'
  },
  javascript: {
    command: 'cmd.exe',
    args: ['/c', 'C:\\Users\\Anees Prince\\AppData\\Roaming\\npm\\typescript-language-server.cmd', '--stdio'],
    displayName: 'TypeScript Language Server (JavaScript)'
  },
  typescript: {
    command: 'cmd.exe',
    args: ['/c', 'C:\\Users\\Anees Prince\\AppData\\Roaming\\npm\\typescript-language-server.cmd', '--stdio'],
    displayName: 'TypeScript Language Server (TypeScript)'
  },
  cpp: {
    command: 'clangd',
    args: [],  // FIXED: No --stdio needed on Windows
    displayName: 'Clangd (C++)'
  }
};

const wss = new WebSocketServer({ port: 3000 });
console.log('LSP backend running on ws://localhost:3000');

wss.on('connection', (ws, req) => {
  const path = req?.url || '/';
  console.log(`New connection: ${path}`);

  const language = path.slice(1).toLowerCase();

  if (!lspServers[language]) {
    console.log(`Rejecting unsupported language: ${language}`);
    ws.close(1008, `Unsupported language: ${language}`);
    return;
  }

  const lspConfig = lspServers[language];
  console.log(`Starting ${lspConfig.displayName} for language: ${language}`);

  let serverConnection = null;
  let socketConnection = null;

  try {
    const iws = {
      send: (content) => {
        if (ws.readyState === 1) ws.send(content);
      },
      onMessage: (cb) => ws.on('message', (data) => cb(typeof data === 'string' ? data : data.toString())),
      onError: (cb) => ws.on('error', cb),
      onClose: (cb) => ws.on('close', (code, reason) => cb(code ?? 1000, reason?.toString() ?? '')),
      dispose: () => ws.readyState !== 3 && ws.close()
    };

    socketConnection = createWebSocketConnection(iws);

    serverConnection = createServerProcess(
      lspConfig.displayName,
      lspConfig.command,
      lspConfig.args
    );

    if (!serverConnection) {
      console.error(`Failed to start ${lspConfig.displayName}`);
      ws.close(1011, `Failed to start ${lspConfig.displayName}`);
      return;
    }

    forward(socketConnection, serverConnection, (msg) => msg);

    socketConnection.onClose(() => serverConnection?.dispose());
    serverConnection.onClose(() => socketConnection?.dispose());

    console.log(`[${language.toUpperCase()}] ${lspConfig.displayName} ready`);
  } catch (error) {
    console.error(`[${language.toUpperCase()}] Setup error:`, error);
    serverConnection?.dispose();
    socketConnection?.dispose();
    ws.close(1011, 'Server error');
  }
});