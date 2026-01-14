import { useState } from "react";
import Editor from "../components/Editor";

export default function Playground() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your code here\n");
  const [output, setOutput] = useState("");

  // Safe stringify to handle objects and circular references
  const safeStringify = (value) => {
    try {
      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    } catch (err) {
      return "[Circular Object]";
    }
  };

  // Run the code
  const handleRun = (currentCode = code) => {
    try {
      let outputData = "";

      // Override console.log to capture outputs
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        outputData += args.map(safeStringify).join(" ") + "\n";
      };

      // eslint-disable-next-line no-eval
      const result = eval(currentCode);

      if (result !== undefined) {
        outputData += safeStringify(result) + "\n";
      }

      console.log = originalConsoleLog;

      setOutput(outputData || "No output");
    } catch (err) {
      setOutput(err.message);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          padding: "12px",
          background: "#1e1e1e",
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        DevPlayground
      </header>

      {/* Language Nav */}
      <nav
        style={{
          padding: "8px",
          background: "#2d2d2d",
          color: "#fff",
          display: "flex",
          gap: "12px",
        }}
      >
        <button
          style={{ color: language === "javascript" ? "#ff0000" : "#000" }}
          onClick={() => setLanguage("javascript")}
        >
          JavaScript
        </button>
        <button
          style={{ color: language === "typescript" ? "#ff0000" : "#000" }}
          onClick={() => setLanguage("typescript")}
        >
          TypeScript
        </button>

        <button
          style={{ marginLeft: "auto", background: "#ffd700", color: "#000" }}
          onClick={() => handleRun()}
        >
          Run
        </button>
      </nav>

      {/* Editor + Output */}
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ flex: 1, borderRight: "1px solid #555" }}>
          <Editor
            language={language}
            defaultValue={code}
            onCodeChange={setCode}
            onRun={handleRun}
          />
        </div>

        <div
          style={{
            flex: 1,
            background: "#1e1e1e",
            color: "#0f0",
            padding: "16px",
            overflowY: "auto",
            fontFamily: "monospace",
          }}
        >
          {output}
        </div>
      </div>
    </div>
  );
}
