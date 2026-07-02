import { useState } from 'react';
import { voiceCheck, type VoiceCheckResult } from '../../lib/aiApi';

interface Props {
  scriptText: string;
  characters: string[];
}

export default function VoiceCheckTab({ scriptText, characters }: Props): JSX.Element {
  const [character, setCharacter] = useState('');
  const [customChar, setCustomChar] = useState('');
  const [result, setResult] = useState<VoiceCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetChar = character === '__custom__' ? customChar : character;

  const handleCheck = async () => {
    if (!targetChar.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await voiceCheck(scriptText, targetChar);
      setResult(data);
    } catch {
      setError('Check failed — verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
        Character voice analysis
      </h3>

      {characters.length > 0 ? (
        <select
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
          className="w-full bg-brand-800 border border-brand-700 text-brand-200 text-xs rounded px-2 py-1"
        >
          <option value="">Select character…</option>
          {characters.map((c) => <option key={c} value={c}>{c}</option>)}
          <option value="__custom__">Other…</option>
        </select>
      ) : (
        <p className="text-xs text-brand-600">No characters detected yet. Open a script to check voices.</p>
      )}

      {character === '__custom__' && (
        <input
          value={customChar}
          onChange={(e) => setCustomChar(e.target.value.toUpperCase())}
          placeholder="CHARACTER NAME"
          className="w-full bg-brand-800 border border-brand-700 text-brand-200 text-xs rounded px-2 py-1 placeholder:text-brand-600 focus:outline-none focus:border-brand-500"
        />
      )}

      <button
        onClick={handleCheck}
        disabled={loading || !targetChar.trim()}
        className="w-full py-1.5 px-3 bg-brand-700 hover:bg-brand-600 disabled:opacity-40 text-white text-xs rounded transition-colors"
      >
        {loading ? 'Analyzing…' : `Check ${targetChar || 'character'}`}
      </button>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {result && (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-brand-300 mb-1">{result.character}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {result.profile.adjectives.map((a) => (
                <span key={a} className="px-1.5 py-0.5 bg-brand-800 text-brand-400 text-xs rounded">
                  {a}
                </span>
              ))}
            </div>
            <div className="space-y-0.5">
              {result.profile.phrases.map((p) => (
                <p key={p} className="text-xs text-brand-500 italic">"{p}"</p>
              ))}
            </div>
          </div>

          {result.flags.length === 0 ? (
            <p className="text-xs text-green-500">No inconsistencies found. Voice is consistent.</p>
          ) : (
            <div>
              <p className="text-xs font-semibold text-amber-400 mb-2">
                {result.flags.length} inconsistenc{result.flags.length === 1 ? 'y' : 'ies'} flagged
              </p>
              <div className="space-y-2">
                {result.flags.map((flag, i) => (
                  <div key={i} className="p-2 bg-amber-900/20 border border-amber-800/40 rounded text-xs">
                    <p className="text-brand-300 italic mb-1">"{flag.line}"</p>
                    <p className="text-brand-500">{flag.reason}</p>
                    {flag.suggestion && (
                      <p className="text-brand-400 mt-1">→ {flag.suggestion}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
