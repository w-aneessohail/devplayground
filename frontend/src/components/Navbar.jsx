export default function Navbar({
  onRun,
  onReset,
  isRunning,
  selectedLanguage,
  setSelectedLanguage,
  languages,
}) {
  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 p-2 px-4 flex items-center justify-between">
      <select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm cursor-pointer border border-gray-700"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <div className="flex gap-3">
        <button onClick={onReset} className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm">
          Reset
        </button>
        <button
          onClick={onRun}
          disabled={isRunning}
          className={`px-6 py-1.5 rounded text-sm font-medium ${
            isRunning ? 'bg-green-800 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
          }`}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      </div>
    </nav>
  );
}