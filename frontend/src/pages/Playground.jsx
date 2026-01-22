import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import ProblemDescription from '../components/ProblemDescription';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import useAxios from '../hooks/useAxios';
import { CURATED_LANGUAGES, DEFAULT_LANG } from '../utils/languageOptions';
import { getLanguagesApi, codeSubmissionApi, pollSubmitStatusApi } from '../api/codeRunner';

// Helper to get language info + real ID
const getLanguageInfo = (name, apiLanguages) => {
  const curated = CURATED_LANGUAGES.find(l => l.name === name) || CURATED_LANGUAGES[0];
  const apiMatch = apiLanguages.find(l => l.name.toLowerCase().includes(name.toLowerCase()));
  return {
    ...curated,
    judge0Id: apiMatch ? apiMatch.id : 63,
  };
};

export default function Playground() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguageName, setSelectedLanguageName] = useState(DEFAULT_LANG);
  const [apiLanguages, setApiLanguages] = useState([]);

  const [shouldSubmit, setShouldSubmit] = useState(false);
  const [pollToken, setPollToken] = useState(null);
  const [pollTick, setPollTick] = useState(0);

  // Fetch languages (once on mount)
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

  useEffect(() => {
    setCode(selectedLang.snippet);
    setOutput('');
  }, [selectedLanguageName, selectedLang.snippet]);

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
      setShouldSubmit(false); // reset trigger
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

  // Handle result
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

    if (!resultData?.status) return; // ignore null/empty

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
    setPollToken(null); // stop polling
  }, [resultData, submitError, pollError]);

  // Show "Submitting..." only when actually submitting
  useEffect(() => {
    if (submitLoading && isRunning) setOutput('Submitting...');
  }, [submitLoading, isRunning]);

  const handleRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput('Submitting...');
    setShouldSubmit(true);
  };

  const handleReset = () => {
    setCode(selectedLang.snippet);
    setOutput('');
    setIsRunning(false);
    setShouldSubmit(false);
    setPollToken(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      <Header />
      <Navbar
        onRun={handleRun}
        onReset={handleReset}
        isRunning={isRunning}
        selectedLanguage={selectedLanguageName}
        setSelectedLanguage={setSelectedLanguageName}
        languages={CURATED_LANGUAGES.map(l => l.name)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-gray-800">
          <ProblemDescription />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={selectedLang.monaco}
            />
          </div>
          <OutputPanel output={output} />
        </div>
      </div>
    </div>
  );
}