import { useRef } from "react";
import MonacoEditor from "@monaco-editor/react";

export default function Editor({ language, defaultValue, onCodeChange, onRun }) {
  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    // Ctrl+Enter shortcut
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => {
        const currentCode = editor.getValue(); // always get latest code
        onRun(currentCode);
      }
    );
  }

  return (
    <MonacoEditor
      height="100%"
      defaultLanguage={language}
      defaultValue={defaultValue}
      theme="vs-dark"
      options={{
        automaticLayout: true,
        fontSize: 16,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
      }}
      onChange={onCodeChange}
      onMount={handleEditorDidMount}
    />
  );
}
