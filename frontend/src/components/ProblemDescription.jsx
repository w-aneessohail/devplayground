export default function ProblemDescription() {
  return (
    <div className="h-full overflow-auto p-6 bg-gray-950/60 border-r border-gray-800">
      <h1 className="text-2xl font-bold mb-5 text-indigo-300">Two Sum</h1>
      
      <div className="space-y-4 text-gray-300">
        <p>
          Given an array of integers <code className="bg-gray-800 px-1 rounded">nums</code> and an integer <code className="bg-gray-800 px-1 rounded">target</code>, 
          return <strong>indices</strong> of the two numbers such that they add up to <code className="bg-gray-800 px-1 rounded">target</code>.
        </p>
        
        <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>

        <h3 className="text-lg font-semibold mt-6 text-indigo-200">Example 1:</h3>
        <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
{`Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`}
        </pre>
      </div>
    </div>
  )
}