import { WebSocketServer } from 'ws';
import { createRequire } from 'node:module';
import { createServerProcess, createWebSocketConnection, forward } from 'vscode-ws-jsonrpc/server';

const require = createRequire(import.meta.url);

// Robust: run Pyright language server via Node (avoids .cmd spawning issues on Windows)
const pyrightServerEntry = require.resolve('pyright/langserver.index.js');

const wss = new WebSocketServer({ port: 3000 });
console.log('LSP backend starting on ws://localhost:3000');

wss.on('connection', (ws, req) => {
  const path = req?.url || '/';
  console.log(`[LSP Server] New connection: ${path}`);

  if (path !== '/python') {
    console.log('[LSP Server] Rejecting unsupported language:', path);
    ws.close(1008, 'Unsupported language');
    return;
  }

  let serverConnection = null;
  let socketConnection = null;

  try {
    // IMPORTANT:
    // vscode-ws-jsonrpc expects an IWebSocket: { send, onMessage, onError, onClose, dispose }
    // Node "ws" does not provide onMessage(), so we adapt it.
    const iws = {
      send: (content) => {
        try {
          if (ws.readyState === 1) { // OPEN
            ws.send(content);
          }
        } catch (e) {
          console.error('[LSP Server] Error sending message:', e.message);
        }
      },

      onMessage: (cb) => {
        ws.on('message', (data) => {
          try {
            // ws gives Buffer sometimes; reader expects JSON string
            const message = typeof data === 'string' ? data : data.toString();
            cb(message);
          } catch (e) {
            console.error('[LSP Server] Error processing message:', e.message);
          }
        });
      },

      onError: (cb) => {
        ws.on('error', (err) => {
          console.error('[LSP Server] WebSocket error:', err.message);
          cb(err);
        });
      },

      onClose: (cb) => {
        ws.on('close', (code, reason) => {
          console.log('[LSP Server] WebSocket closed:', code, reason?.toString());
          cb(code ?? 1000, reason?.toString() ?? '');
        });
      },

      dispose: () => {
        try {
          if (ws.readyState !== 3) { // Not already CLOSED
            ws.close();
          }
        } catch (e) {
          console.error('[LSP Server] Error disposing WebSocket:', e.message);
        }
      }
    };

    // WebSocket <-> JSON-RPC connection
    socketConnection = createWebSocketConnection(iws);
    console.log('[LSP Server] Socket connection created');

    // Start Pyright LSP over stdio
    serverConnection = createServerProcess(
      'Pyright',
      process.execPath,
      [pyrightServerEntry, '--stdio']
    );

    if (!serverConnection) {
      console.error('[LSP Server] Failed to create Pyright server process');
      ws.close(1011, 'Failed to start Pyright server');
      return;
    }

    console.log('[LSP Server] Pyright server process created');

    // Forward messages both ways (socket <-> server)
    forward(socketConnection, serverConnection, (message) => message);

    socketConnection.onClose(() => {
      console.log('[LSP Server] Socket connection closed, disposing server');
      try {
        serverConnection?.dispose();
      } catch (e) {
        console.error('[LSP Server] Error disposing server connection:', e.message);
      }
    });

    serverConnection.onClose(() => {
      console.log('[LSP Server] Server connection closed, disposing socket');
      try {
        socketConnection?.dispose();
      } catch (e) {
        console.error('[LSP Server] Error disposing socket connection:', e.message);
      }
    });

    console.log('[LSP Server] Python LSP ready (Pyright)');
  } catch (error) {
    console.error('[LSP Server] Error setting up connection:', error);
    try {
      serverConnection?.dispose();
    } catch {}
    try {
      socketConnection?.dispose();
    } catch {}
    ws.close(1011, 'Server error');
  }
});
