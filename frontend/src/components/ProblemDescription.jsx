export default function ProblemDescription({ testDescription, selectedTest, showWelcome }) {
  return (
    <div className="h-full overflow-auto p-6 bg-gray-950/60 border-r border-gray-800">
      {showWelcome || !selectedTest ? (
        <div className="space-y-4 text-gray-300 flex flex-col items-center justify-center h-full">
          <h1 className="text-3xl font-bold mb-5 text-indigo-300">Welcome to Code Playground</h1>
          <p className="text-gray-400 text-lg text-center max-w-md">
            Please select a test from the dropdown above to begin your coding challenge.
          </p>
          <div className="mt-8 p-6 bg-gray-900 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-3 text-indigo-200">How it works:</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Select a language and test from the dropdown</li>
              <li>• You'll have 5 seconds to prepare</li>
              <li>• Then 1 minute to complete the test</li>
              <li>• Run your code and check the output</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-5 text-indigo-300">{selectedTest.name}</h1>
          <div className="space-y-4 text-gray-300">
            <p>{testDescription || selectedTest.description}</p>
            <div className="mt-6 p-4 bg-gray-900 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-indigo-200">Expected Output:</h3>
              <code className="text-green-400">{selectedTest.expectedOutput}</code>
            </div>
          </div>
        </>
      )}
    </div>
  );
}