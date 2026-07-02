import { useState } from 'react';
import { generateCoverage, analyzePacing } from '../../lib/aiApi';

interface Props {
  scriptText: string;
}

type Mode = 'coverage' | 'pacing';

export default function CoverageTab({ scriptText }: Props): JSX.Element {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('coverage');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setOutput('');
    try {
      const fn = mode === 'coverage' ? generateCoverage : analyzePacing;
      await fn(scriptText, (chunk) => setOutput((prev) => prev + chunk));
    } catch {
      setError('Generation failed — check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderOutput = () => {
    if (!output) return null;
    return (
      <div className="mt-3 text-xs text-brand-200 space-y-2">
        {output.split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <p key={i} className="font-semibold text-brand-300 mt-3 first:mt-0">
                {line.replace(/\*\*/g, '')}
              </p>
            );
          }
          if (line.startsWith('## ')) {
            return <p key={i} className="font-semibold text-brand-300 mt-3">{line.slice(3)}</p>;
          }
          if (line.startsWith('- ')) {
            return <p key={i} className="pl-2 text-brand-300">• {line.slice(2)}</p>;
          }
          return line ? <p key={i}>{line}</p> : null;
        })}
      </div>
    );
  };

  return (
    <div className="p-3">
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMode('coverage')}
          className={`flex-1 py-1.5 text-xs rounded transition-colors ${
            mode === 'coverage'
              ? 'bg-brand-600 text-white'
              : 'bg-brand-800 text-brand-400 hover:text-brand-200'
          }`}
        >
          Script Notes
        </button>
        <button
          onClick={() => setMode('pacing')}
          className={`flex-1 py-1.5 text-xs rounded transition-colors ${
            mode === 'pacing'
              ? 'bg-brand-600 text-white'
              : 'bg-brand-800 text-brand-400 hover:text-brand-200'
          }`}
        >
          Pacing
        </button>
      </div>

      <p className="text-xs text-brand-500 mb-3">
        {mode === 'coverage'
          ? 'Development exec perspective on your full script.'
          : 'Act-by-act pacing and structure analysis.'}
      </p>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-1.5 px-3 bg-brand-700 hover:bg-brand-600 disabled:opacity-40 text-white text-xs rounded transition-colors"
      >
        {loading ? 'Analyzing…' : mode === 'coverage' ? 'Generate script notes' : 'Analyze pacing'}
      </button>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      {renderOutput()}
    </div>
  );
}
