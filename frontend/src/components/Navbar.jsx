export default function Navbar({
  onRun,
  onReset,
  isRunning,
  selectedLanguage,
  setSelectedLanguage,
  languages,
  selectedTest,
  setSelectedTest,
  tests,
  timeRemaining,
  showWelcome,
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 p-2 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
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

        <select
          value={selectedTest || ''}
          onChange={(e) => setSelectedTest(e.target.value || null)}
          className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm cursor-pointer border border-gray-700 min-w-[120px]"
          disabled={timeRemaining !== null && timeRemaining > 0}
        >
          <option value="">Select Test</option>
          {tests.map((test) => (
            <option key={test.id} value={test.id}>
              {test.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        {timeRemaining !== null && timeRemaining > 0 && (
          <div className={`px-3 py-1.5 rounded text-sm font-mono ${
            timeRemaining <= 10 ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'
          }`}>
            Time: {formatTime(timeRemaining)}
          </div>
        )}
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