import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import ProblemDescription from '../components/ProblemDescription';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import { CURATED_LANGUAGES, DEFAULT_LANG } from '../utils/languageOptions';

// Helper to get curated language info + real ID from API list
const getLanguageInfo = (name, apiLanguages) => {
  const curated = CURATED_LANGUAGES.find(l => l.name === name) || CURATED_LANGUAGES[0];
  
  // Try to find matching real ID from Judge0 API
  const apiMatch = apiLanguages.find(l => 
    l.name.toLowerCase().includes(name.toLowerCase()) ||
    l.name.toLowerCase().includes(curated.monaco.toLowerCase())
  );

  return {
    ...curated,
    judge0Id: apiMatch ? apiMatch.id : (curated.judge0Id || 63), // fallback to curated/default
  };
};

export default function Playground() {
  const [code, setCode] = useState(getLanguageInfo(DEFAULT_LANG, []).snippet);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguageName, setSelectedLanguageName] = useState(DEFAULT_LANG);
  const [apiLanguages, setApiLanguages] = useState([]); // full list from Judge0

  // Fetch real languages from Judge0 once on mount
  useEffect(() => {
    fetch('https://ce.judge0.com/languages')
      .then(res => res.json())
      .then(data => {
        setApiLanguages(data);
        console.log('Judge0 languages loaded:', data.length, 'languages');
      })
      .catch(err => {
        console.error('Failed to fetch Judge0 languages:', err);
        // Continue with curated defaults
      });
  }, []);

  // Get current language info (curated + real ID)
  const selectedLang = getLanguageInfo(selectedLanguageName, apiLanguages);

  // Reset code when language changes
  useEffect(() => {
    setCode(selectedLang.snippet);
    setOutput('');
  }, [selectedLanguageName]);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Submitting code to Judge0...');

    try {
      const submitResponse = await fetch(
        'https://ce.judge0.com/submissions/?base64_encoded=false&wait=false',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_code: code,
            language_id: selectedLang.judge0Id,
            stdin: '',
          }),
        }
      );

      if (!submitResponse.ok) {
        throw new Error(`Submission failed: ${submitResponse.status} ${submitResponse.statusText}`);
      }

      const { token } = await submitResponse.json();

      let attempts = 0;
      while (attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const statusResponse = await fetch(
          `https://ce.judge0.com/submissions/${token}?base64_encoded=false`
        );

        if (!statusResponse.ok) {
          throw new Error(`Status check failed: ${statusResponse.status}`);
        }

        const data = await statusResponse.json();

        if (data.status?.id <= 2) {
          setOutput(`Processing... (${attempts + 1}/30)`);
          attempts++;
          continue;
        }

        let outputText = '';

        if (data.compile_output) {
          outputText += `Compilation output:\n${data.compile_output.trim()}\n\n`;
        }
        if (data.stdout) {
          outputText += `Output:\n${data.stdout.trim()}`;
        }
        if (data.stderr) {
          outputText += `\n\nError (stderr):\n${data.stderr.trim()}`;
        }
        if (data.message) {
          outputText += `\n\nMessage:\n${data.message}`;
        }

        setOutput(outputText || 'No output received');
        break;
      }

      if (attempts >= 30) {
        setOutput('Timeout: Execution took too long (over 45 seconds)');
      }
    } catch (err) {
      setOutput(`Error during execution:\n${err.message}\n\nTry again or check your code.`);
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(selectedLang.snippet);
    setOutput('');
  };

  return (
    <div className="h-screen flex flex-col">
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
              onChange={(value) => setCode(value || '')}
              language={selectedLang.monaco}
            />
          </div>
          <OutputPanel output={output} />
        </div>
      </div>
    </div>
  );
}