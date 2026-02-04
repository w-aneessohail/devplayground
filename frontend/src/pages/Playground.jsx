import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import ProblemDescription from '../components/ProblemDescription';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import TestResultModal from '../components/TestResultModal';
import useAxios from '../hooks/useAxios';
import { CURATED_LANGUAGES, DEFAULT_LANG } from '../utils/languageOptions';
import { getLanguagesApi, codeSubmissionApi, pollSubmitStatusApi } from '../api/codeRunner';
import { getTestsForLanguage, getTest, TEST_IDS } from '../utils/testCases';

// Helper to get language info + real ID
const getLanguageInfo = (name, apiLanguages) => {
  const curated = CURATED_LANGUAGES.find(l => l.name === name) || CURATED_LANGUAGES[0];
  const apiMatch = apiLanguages.find(l => l.name.toLowerCase().includes(name.toLowerCase()));
  return {
    ...curated,
    judge0Id: apiMatch ? apiMatch.id : 63,
  };
};

// Timer constants
const TIMER_DURATION = 60;

// localStorage keys
const STORAGE_KEYS = {
  timer: 'test_timer',
  timerStart: 'test_timer_start',
  selectedTest: 'selected_test',
  selectedLanguage: 'selected_language',
  userCode: 'user_code',
};

export default function Playground() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguageName, setSelectedLanguageName] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.selectedLanguage) || DEFAULT_LANG;
  });
  const [selectedTestId, setSelectedTestId] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.selectedTest) || null;
  });
  const [apiLanguages, setApiLanguages] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, isSuccess: false, message: '', details: '' });
  const [showTestStartModal, setShowTestStartModal] = useState(false);
  const [isOutputWrong, setIsOutputWrong] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    const savedTest = localStorage.getItem(STORAGE_KEYS.selectedTest);
    const savedTimerStart = localStorage.getItem(STORAGE_KEYS.timerStart);
    return !(savedTest && savedTimerStart);
  });

  const [shouldSubmit, setShouldSubmit] = useState(false);
  const [pollToken, setPollToken] = useState(null);
  const [pollTick, setPollTick] = useState(0);

  const timerIntervalRef = useRef(null);
  const isInitializingRef = useRef(true);

  // Fetch languages
  const { data: languagesData } = useAxios(
    getLanguagesApi().url,
    getLanguagesApi().method,
    null,
    []
  );

  useEffect(() => {
    if (languagesData) setApiLanguages(languagesData);
  }, [languagesData]);

  const selectedLang = getLanguageInfo(selectedLanguageName, apiLanguages);
  const tests = Object.values(getTestsForLanguage(selectedLanguageName));
  const selectedTest = selectedTestId ? getTest(selectedLanguageName, selectedTestId) : null;

  useEffect(() => {
    const savedTimerStart = localStorage.getItem(STORAGE_KEYS.timerStart);
    const savedTestId = localStorage.getItem(STORAGE_KEYS.selectedTest);
    const savedCode = localStorage.getItem(STORAGE_KEYS.userCode);

    isInitializingRef.current = true;
    setShowTestStartModal(false);

    if (!savedTimerStart || !savedTestId) {
      setShowWelcome(true);
      isInitializingRef.current = false;
      return;
    }

    setSelectedTestId(savedTestId);
    setShowWelcome(false);

    if (savedCode) {
      setCode(savedCode);
    } else {
      const test = getTest(selectedLanguageName, savedTestId);
      if (test) {
        setCode(test.code);
      }
    }

    const elapsed = Math.floor((Date.now() - Number(savedTimerStart)) / 1000);
    const remaining = Math.max(0, TIMER_DURATION - elapsed);

    if (remaining <= 0) {
      localStorage.removeItem(STORAGE_KEYS.timer);
      localStorage.removeItem(STORAGE_KEYS.timerStart);
      localStorage.removeItem(STORAGE_KEYS.userCode);
      setTimeRemaining(0);
      setModalState({
        isOpen: true,
        isSuccess: false,
        message: 'Time exceeded! Test failed.',
        details: 'You did not complete the test within the time limit.',
      });
      isInitializingRef.current = false;
      return;
    }

    setTimeRemaining(remaining);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          localStorage.removeItem(STORAGE_KEYS.timer);
          localStorage.removeItem(STORAGE_KEYS.timerStart);
          localStorage.removeItem(STORAGE_KEYS.userCode);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      isInitializingRef.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    if (selectedTestId && !showWelcome) {
      localStorage.setItem(STORAGE_KEYS.selectedTest, selectedTestId);
      const test = getTest(selectedLanguageName, selectedTestId);
      if (test) {
        const savedTimerStart = localStorage.getItem(STORAGE_KEYS.timerStart);
        const isRefreshing = isInitializingRef.current || savedTimerStart;

        if (!isRefreshing) {
          setCode(test.code);
          localStorage.removeItem(STORAGE_KEYS.userCode);
          setOutput('');
          setIsOutputWrong(false);
          setShowTestStartModal(true);
        }
      }
    } else if (showWelcome) {
      const savedTimerStart = localStorage.getItem(STORAGE_KEYS.timerStart);
      if (!savedTimerStart) {
        setCode('');
        setOutput('');
        setTimeRemaining(null);
        localStorage.removeItem(STORAGE_KEYS.timer);
        localStorage.removeItem(STORAGE_KEYS.timerStart);
        localStorage.removeItem(STORAGE_KEYS.selectedTest);
        localStorage.removeItem(STORAGE_KEYS.userCode);
      }
    }
  }, [selectedTestId, selectedLanguageName, showWelcome]);

  useEffect(() => {
    if (selectedTestId && timeRemaining !== null && timeRemaining > 0) {
      localStorage.setItem(STORAGE_KEYS.userCode, code);
    }
  }, [code, selectedTestId, timeRemaining]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.selectedLanguage, selectedLanguageName);
  }, [selectedLanguageName]);

  useEffect(() => {
    if (selectedTestId) {
      const test = getTest(selectedLanguageName, selectedTestId);
      if (!test) {
        setSelectedTestId(null);
        localStorage.removeItem(STORAGE_KEYS.selectedTest);
      }
    }
  }, [selectedLanguageName]);

  // Submit code
  const submitConfig = shouldSubmit ? codeSubmissionApi(code, selectedLang.judge0Id) : null;

  const {
    data: submitData,
    loading: submitLoading,
    error: submitError,
  } = useAxios(
    submitConfig?.url,
    submitConfig?.method,
    submitConfig?.data,
    [shouldSubmit, code, selectedLang.judge0Id]
  );

  useEffect(() => {
    if (submitData?.token) {
      setPollToken(submitData.token);
      setPollTick(0);
      setShouldSubmit(false);
    }
  }, [submitData?.token]);

  // Polling tick (rerun every 1.5s)
  useEffect(() => {
    if (!pollToken) return;

    const interval = setInterval(() => {
      setPollTick(t => t + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, [pollToken]);

  // Poll status
  const pollConfig = pollToken ? pollSubmitStatusApi(pollToken) : null;
  const {
    data: resultData,
    error: pollError,
  } = useAxios(
    pollConfig?.url,
    pollConfig?.method,
    null,
    [pollToken, pollTick]
  );

  // Handle result and validate test
  useEffect(() => {
    if (submitError) {
      setOutput(`Submit error: ${submitError}`);
      setIsRunning(false);
      setPollToken(null);
      return;
    }

    if (pollError) {
      setOutput(`Poll error: ${pollError}`);
      setIsRunning(false);
      setPollToken(null);
      return;
    }

    if (!resultData?.status) return;

    // Still processing
    if (resultData.status.id <= 2) {
      setOutput(`Running...`);
      return;
    }

    // Finished
    let text = '';

    if (resultData.compile_output)
      text += `Compile:\n${resultData.compile_output.trim()}\n\n`;

    if (resultData.stdout)
      text += `Output:\n${resultData.stdout.trim()}`;

    if (resultData.stderr)
      text += `\nError:\n${resultData.stderr.trim()}`;

    if (resultData.message)
      text += `\nMessage:\n${resultData.message}`;

    setOutput(text || 'No output received');
    setIsRunning(false);
    setPollToken(null);

    if (selectedTest && resultData.stdout && timeRemaining !== null && timeRemaining > 0) {
      const outputText = resultData.stdout.trim().split('\n').pop().trim();
      const expectedOutput = selectedTest.expectedOutput.trim();

      const normalizedOutput = outputText.replace(/\s+/g, ' ').trim();
      const normalizedExpected = expectedOutput.replace(/\s+/g, ' ').trim();
      
      if (normalizedOutput === normalizedExpected) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        localStorage.removeItem(STORAGE_KEYS.timer);
        localStorage.removeItem(STORAGE_KEYS.timerStart);
        localStorage.removeItem(STORAGE_KEYS.userCode);
        setTimeRemaining(null);
        setIsOutputWrong(false);
        
        setModalState({
          isOpen: true,
          isSuccess: true,
          message: 'Congratulations! Test passed successfully.',
          details: `Your output "${normalizedOutput}" matches the expected output "${normalizedExpected}".`
        });
      } else {
        setIsOutputWrong(true);
      }
    }
  }, [resultData, submitError, pollError, selectedTest, selectedLanguageName, selectedTestId, timeRemaining]);
  useEffect(() => {
    if (submitLoading && isRunning) setOutput('Submitting...');
  }, [submitLoading, isRunning]);

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    const startTime = Date.now();
    localStorage.setItem(STORAGE_KEYS.timerStart, startTime.toString());
    localStorage.setItem(STORAGE_KEYS.timer, TIMER_DURATION.toString());
    setTimeRemaining(TIMER_DURATION);
    
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          localStorage.removeItem(STORAGE_KEYS.timer);
          localStorage.removeItem(STORAGE_KEYS.timerStart);
          setModalState({
            isOpen: true,
            isSuccess: false,
            message: 'Time exceeded! Test failed.',
            details: 'You did not complete the test within the time limit.'
          });
          return 0;
        }
        const newTime = prev - 1;
        localStorage.setItem(STORAGE_KEYS.timer, newTime.toString());
        return newTime;
      });
    }, 1000);
  };

  const handleRun = () => {
    if (isRunning) return;
    
    if (!selectedTestId || showWelcome) {
      setModalState({
        isOpen: true,
        isSuccess: false,
        message: 'No test selected',
        details: 'Please select a test from the dropdown before running your code.'
      });
      return;
    }

    if (timeRemaining === null) {
      setModalState({
        isOpen: true,
        isSuccess: false,
        message: 'Timer not started',
        details: 'Please close the test start modal to begin the timer.'
      });
      return;
    }

    if (timeRemaining <= 0) {
      setModalState({
        isOpen: true,
        isSuccess: false,
        message: 'Time exceeded! Test failed.',
        details: 'You did not complete the test within the time limit.'
      });
      return;
    }

    setIsRunning(true);
    setOutput('Submitting...');
    setIsOutputWrong(false);
    setShouldSubmit(true);
  };

  const handleReset = () => {
    if (selectedTest) {
      setCode(selectedTest.code);
    } else {
      setCode('');
    }
    setOutput('');
    setIsRunning(false);
    setShouldSubmit(false);
    setPollToken(null);
  };

  const handleTestChange = (testId) => {
    if (testId) {
      setSelectedTestId(testId);
      setShowWelcome(false);
    } else {
      setSelectedTestId(null);
      setShowWelcome(true);
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguageName(lang);
    setSelectedTestId(null);
    localStorage.removeItem(STORAGE_KEYS.selectedTest);
    localStorage.removeItem(STORAGE_KEYS.userCode);
  };

  const closeTestStartModal = () => {
    setShowTestStartModal(false);
    const savedTimerStart = localStorage.getItem(STORAGE_KEYS.timerStart);
    if (!savedTimerStart) {
      startTimer();
    }
  };

  const closeModal = () => {
    const wasSuccess = modalState.isSuccess;
    const wasTimeExceeded = modalState.message.includes('Time exceeded');
    
    setModalState({ isOpen: false, isSuccess: false, message: '', details: '' });
    
    if (wasSuccess || wasTimeExceeded) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      localStorage.removeItem(STORAGE_KEYS.timer);
      localStorage.removeItem(STORAGE_KEYS.timerStart);
      localStorage.removeItem(STORAGE_KEYS.selectedTest);
      localStorage.removeItem(STORAGE_KEYS.userCode);
      setSelectedTestId(null);
      setTimeRemaining(null);
      setShowWelcome(true);
      setCode('');
      setOutput('');
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      <Header />
      <Navbar
        onRun={handleRun}
        onReset={handleReset}
        isRunning={isRunning}
        selectedLanguage={selectedLanguageName}
        setSelectedLanguage={handleLanguageChange}
        languages={CURATED_LANGUAGES.map(l => l.name)}
        selectedTest={selectedTestId}
        setSelectedTest={handleTestChange}
        tests={tests}
        timeRemaining={timeRemaining}
        showWelcome={showWelcome}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-gray-800">
          <ProblemDescription 
            testDescription={selectedTest?.description}
            selectedTest={selectedTest}
            showWelcome={showWelcome}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={selectedLang.monaco}
            />
          </div>
          <OutputPanel output={output} isOutputWrong={isOutputWrong} />
        </div>
      </div>

      <TestResultModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        isSuccess={modalState.isSuccess}
        message={modalState.message}
        details={modalState.details}
      />

      {/* Test Start Modal */}
      {showTestStartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-blue-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">⏱️</div>
              <h2 className="text-2xl font-bold text-blue-400">
                Test Starting
              </h2>
            </div>
            
            <p className="text-gray-300 mb-4">
              Test is starting and it will be ended in 1 minute.
            </p>
            
            <div className="bg-gray-900 p-3 rounded mb-4">
              <p className="text-sm text-gray-400">
                You have 1 minute to complete the test. The timer will start when you close this modal.
              </p>
            </div>
            
            <button
              onClick={closeTestStartModal}
              className="w-full py-2 rounded font-medium bg-blue-600 hover:bg-blue-500 text-white"
            >
              Start Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
