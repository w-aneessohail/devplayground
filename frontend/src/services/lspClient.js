class LSPClient {
  constructor() {
    this.ws = null;
    this.messageId = 1;
    this.pendingRequests = new Map();
    this.diagnosticsCallback = null;
    this.initialized = false;
  }

  async connect(url) {
    return new Promise((resolve, reject) => {
      try {
        console.log("[LSP] Creating WebSocket to:", url);
        this.ws = new WebSocket(url);
        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = async () => {
          try {
            console.log("[LSP] WebSocket connected, initializing...");

            // Set up message listener
            this.ws.onmessage = (event) => {
              try {
                const message = JSON.parse(event.data);
                console.log("[LSP] Received message:", message.method || message.result);
                this.handleMessage(message);
              } catch (e) {
                console.error("[LSP] Error parsing message:", e);
              }
            };

            // Send initialize request
            await this.initialize();
            this.initialized = true;
            console.log("[LSP] LSP fully initialized");
            resolve();
          } catch (error) {
            console.error("[LSP] Initialization error:", error);
            reject(error);
          }
        };

        this.ws.onerror = (event) => {
          console.error("[LSP] WebSocket error");
          reject(new Error("WebSocket error"));
        };

        this.ws.onclose = () => {
          console.log("[LSP] WebSocket closed");
          this.initialized = false;
        };
      } catch (error) {
        console.error("[LSP] Connection error:", error);
        reject(error);
      }
    });
  }

  sendMessage(message) {
    if (!this.ws || this.ws.readyState !== 1) {
      console.warn("[LSP] WebSocket not ready, state:", this.ws?.readyState);
      return;
    }

    const json = JSON.stringify(message);
    console.log("[LSP] Sending message:", message.method);
    this.ws.send(json);
  }

  async sendRequest(method, params) {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      const message = {
        jsonrpc: "2.0",
        id,
        method,
        params,
      };

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout for ${method}`));
      }, 10000);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      try {
        this.sendMessage(message);
      } catch (error) {
        this.pendingRequests.delete(id);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  sendNotification(method, params) {
    const message = {
      jsonrpc: "2.0",
      method,
      params,
    };

    this.sendMessage(message);
  }

  handleMessage(message) {
    // Handle response
    if (message.id !== undefined) {
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(message.id);

        if (message.error) {
          console.error(
            `[LSP] Error for request ${message.id}:`,
            message.error
          );
          pending.reject(new Error(message.error.message));
        } else {
          console.log(`[LSP] Response for request ${message.id}`);
          pending.resolve(message.result);
        }
      }
    }

    // Handle notification
    if (message.method === "textDocument/publishDiagnostics") {
      console.log("[LSP] Diagnostics received");
      if (this.diagnosticsCallback) {
        this.diagnosticsCallback(message.params);
      }
    }
  }

  async initialize() {
    console.log("[LSP] Sending initialize request");
    const result = await this.sendRequest("initialize", {
      processId: null,
      rootPath: "/workspace",
      rootUri: "file:///workspace",
      capabilities: {
        textDocument: {
          synchronization: {
            didSave: true,
            change: 1, // Full document sync
          },
          diagnostic: {
            dynamicRegistration: true,
          },
        },
      },
    });

    console.log("[LSP] Initialize response received");

    // Send initialized notification
    this.sendNotification("initialized", {});

    return result;
  }

  openDocument(uri, languageId, text) {
    console.log("[LSP] Opening document:", uri);
    this.sendNotification("textDocument/didOpen", {
      textDocument: {
        uri,
        languageId,
        version: 1,
        text,
      },
    });
  }

  updateDocument(uri, text, version) {
    console.log("[LSP] Updating document, version:", version);
    this.sendNotification("textDocument/didChange", {
      textDocument: {
        uri,
        version,
      },
      contentChanges: [{ text }],
    });
  }

  closeDocument(uri) {
    console.log("[LSP] Closing document:", uri);
    this.sendNotification("textDocument/didClose", {
      textDocument: { uri },
    });
  }

  setDiagnosticsCallback(callback) {
    this.diagnosticsCallback = callback;
  }

  async disconnect() {
    try {
      if (this.initialized) {
        console.log("[LSP] Sending shutdown request");
        await this.sendRequest("shutdown", {});
      }
    } catch (error) {
      console.warn("[LSP] Shutdown error:", error.message);
    }

    if (this.ws && this.ws.readyState !== 3) {
      this.ws.close();
    }

    this.initialized = false;
    console.log("[LSP] Disconnected");
  }
}

export const lspClient = new LSPClient();
