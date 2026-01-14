import Editor from "../components/Editor";

export default function Playground() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "12px", background: "#1e1e1e", color: "#fff" }}>
        <h3>DevPlayground</h3>
      </header>

      {/* Language Nav */}
      <nav style={{ padding: "8px", background: "#2d2d2d", color: "#fff" }}>
        JavaScript | TypeScript
      </nav>

      {/* Editor Area */}
      <div style={{ flex: 1 }}>
        <Editor />
      </div>
    </div>
  );
}
