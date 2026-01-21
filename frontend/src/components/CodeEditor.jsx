import Editor from '@monaco-editor/react'

export default function CodeEditor({ value, onChange }) {
  return (
    <div className="h-full">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          renderValidationDecorations: "off",
          lineNumbersMinChars: 3,
          padding: { top: 16 },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  )
}