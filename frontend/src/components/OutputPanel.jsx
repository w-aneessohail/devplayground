export default function OutputPanel({ output, isOutputWrong }) {
  return (
    <div className="h-1/3 bg-gray-950 border-t border-gray-800 flex flex-col">
      <div className="flex-1 p-4 font-mono text-sm overflow-auto">
        {output ? (
          <pre className="whitespace-pre-wrap text-gray-200">{output}</pre>
        ) : (
          <div className="text-gray-500 italic">
            Run your code to see output here...
          </div>
        )}
      </div>
      {isOutputWrong && (
        <div className="px-4 py-2 bg-gray-900 border-t border-red-500">
          <p className="text-red-500 font-semibold text-sm">
            ⚠️ Expected output is wrong. Try again!
          </p>
        </div>
      )}
    </div>
  )
}