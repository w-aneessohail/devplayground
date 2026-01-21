import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import ProblemDescription from '../components/ProblemDescription';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import useAxios from '../hooks/useAxios';
import { CURATED_LANGUAGES, DEFAULT_LANG } from '../utils/languageOptions';
import { getLanguagesApi, codeSubmissionApi, pollSubmitStatusApi } from '../api/codeRunner';

// Helper to get language info + real ID from fetched list
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

  // Fetch all languages
  const { data: languagesData, loading: langLoading, error: langError } = useAxios(
    getLanguagesApi().url,
    getLanguagesApi().method,
    null,
    [] 
  );

  useEffect(() => {
    if (languagesData) {
      setApiLanguages(languagesData);
      console.log('Languages loaded:', languagesData.length);
    }
    if (langError) {
      console.error('Languages fetch failed:', langError);
      setOutput('Failed to load languages – using defaults');
    }
  }, [languagesData, langError]);

  // Get selected language info
  const selectedLang = getLanguageInfo(selectedLanguageName, apiLanguages);

  // Reset code when language changes
  useEffect(() => {
    setCode(selectedLang.snippet);
    setOutput('');
  }, [selectedLanguageName, selectedLang.snippet]);

  const handleRun = () => {
    setIsRunning(true);
    setOutput('Submitting code...');

    // Submit code api call
    const submitConfig = codeSubmissionApi(code, selectedLang.judge0Id);
    const { data: submitData, loading: submitLoading, error: submitError } = useAxios(
      submitConfig.url,
      submitConfig.method,
      submitConfig.data,
      [code, selectedLang.judge0Id]  // re-submit if code/language changes
    );

    // Poll when token arrives
    useEffect(() => {
      if (!submitData?.token) return;

      let attempts = 0;
      const interval = setInterval(() => {
        if (attempts >= 30) {
          setOutput('Timeout: Execution took too long');
          setIsRunning(false);
          clearInterval(interval);
          return;
        }

        const pollConfig = pollSubmitStatusApi(submitData.token);
        const { data: resultData, error: pollError } = useAxios(
          pollConfig.url,
          pollConfig.method,
          null,
          [submitData.token, attempts]  // re-poll on attempt change
        );

        if (pollError) {
          setOutput(`Poll error: ${pollError}`);
          setIsRunning(false);
          clearInterval(interval);
          return;
        }

        if (resultData?.status?.id > 2) {
          let text = '';
          if (resultData.compile_output) text += `Compile:\n${resultData.compile_output.trim()}\n\n`;
          if (resultData.stdout) text += `Output:\n${resultData.stdout.trim()}`;
          if (resultData.stderr) text += `\nError:\n${resultData.stderr.trim()}`;
          if (resultData.message) text += `\nMessage:\n${resultData.message}`;
          setOutput(text || 'No output received');
          setIsRunning(false);
          clearInterval(interval);
        } else {
          setOutput(`Processing... (${attempts + 1}/30)`);
          attempts++;
        }
      }, 1500);

      return () => clearInterval(interval);
    }, [submitData?.token]);

    // Handle submit loading/error
    useEffect(() => {
      if (submitLoading) setOutput('Submitting...');
      if (submitError) {
        setOutput(`Submit error: ${submitError}`);
        setIsRunning(false);
      }
    }, [submitLoading, submitError]);
  };

  const handleReset = () => {
    setCode(selectedLang.snippet);
    setOutput('');
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
        languages={CURATED_LANGUAGES.map(lang => lang.name)}
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