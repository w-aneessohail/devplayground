import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Monaco worker setup for Vite
window.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId, label) {
    if (label === "json") {
      return new URL(
        "monaco-editor/esm/vs/language/json/json.worker.js",
        import.meta.url
      ).href;
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new URL(
        "monaco-editor/esm/vs/language/css/css.worker.js",
        import.meta.url
      ).href;
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new URL(
        "monaco-editor/esm/vs/language/html/html.worker.js",
        import.meta.url
      ).href;
    }
    if (label === "typescript" || label === "javascript") {
      return new URL(
        "monaco-editor/esm/vs/language/typescript/ts.worker.js",
        import.meta.url
      ).href;
    }
    return new URL(
      "monaco-editor/esm/vs/editor/editor.worker.js",
      import.meta.url
    ).href;
  }
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);