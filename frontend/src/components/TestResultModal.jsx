'use client';

export default function TestResultModal({ 
  isOpen, 
  onClose, 
  isSuccess, 
  message, 
  details 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border-2 ${
        isSuccess ? 'border-green-500' : 'border-red-500'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          {isSuccess ? (
            <div className="text-4xl">✅</div>
          ) : (
            <div className="text-4xl">❌</div>
          )}
          <h2 className={`text-2xl font-bold ${
            isSuccess ? 'text-green-400' : 'text-red-400'
          }`}>
            {isSuccess ? 'Success!' : 'Failed'}
          </h2>
        </div>
        
        <p className="text-gray-300 mb-4">{message}</p>
        
        {details && (
          <div className="bg-gray-900 p-3 rounded mb-4">
            <p className="text-sm text-gray-400">{details}</p>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-2 rounded font-medium text-white ${
              isSuccess 
                ? 'bg-green-600 hover:bg-green-500' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            {isSuccess ? 'Continue' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
