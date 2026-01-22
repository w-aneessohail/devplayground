export default function OutputPanel({ output }) {
  return (
    <div className="h-1/3 bg-gray-950 border-t border-gray-800 p-4 font-mono text-sm overflow-auto">
      {output ? (
        <pre className="whitespace-pre-wrap text-gray-200">{output}</pre>
      ) : (
        <div className="text-gray-500 italic">
          Run your code to see output here...
        </div>
      )}
    </div>
  )
}