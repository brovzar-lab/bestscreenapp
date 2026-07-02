import { useState } from 'react';
import { suggestNext, rewriteSelection, type SuggestNextResult } from '../../lib/aiApi';
import { useEditorStore } from '../../store/editorStore';

interface Props {
  scriptText: string;
}

const TONES = ['More intense', 'Funnier', 'More poetic', 'Shorter', 'Longer'] as const;

export default function CowriteTab({ scriptText }: Props): JSX.Element {
  const [suggestions, setSuggestions] = useState<SuggestNextResult[]>([]);
  const [rewriteOutput, setRewriteOutput] = useState('');
  const [tone, setTone] = useState<string>(TONES[0]);
  const [loading, setLoading] = useState<'suggest' | 'rewrite' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { activeScript, activeBlockId, addBlock, updateBlock } = useEditorStore();

  const activeBlock = activeScript?.blocks.find((b) => b.id === activeBlockId);

  const handleSuggest = async () => {
    setLoading('suggest');
    setError(null);
    setSuggestions([]);
    try {
      const results = await suggestNext(scriptText, activeBlock?.text ?? '');
      setSuggestions(results);
    } catch {
      setError('Generation failed — check your connection.');
    } finally {
      setLoading(null);
    }
  };

  const insertSuggestion = (text: string) => {
    if (!activeBlockId) return;
    const newId = addBlock(activeBlockId, 'action');
    updateBlock(newId, { text });
    setSuggestions([]);
  };

  const handleRewrite = async () => {
    if (!activeBlock?.text) return;
    setLoading('rewrite');
    setError(null);
    setRewriteOutput('');
    try {
      await rewriteSelection(activeBlock.text, tone, (chunk) =>
        setRewriteOutput((prev) => prev + chunk),
      );
    } catch {
      setError('Rewrite failed — check your connection.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-3 space-y-5">
      {/* What happens next */}
      <section>
        <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
          What happens next?
        </h3>
        <button
          onClick={handleSuggest}
          disabled={loading !== null}
          className="w-full py-1.5 px-3 bg-brand-700 hover:bg-brand-600 disabled:opacity-40 text-white text-xs rounded transition-colors"
        >
          {loading === 'suggest' ? 'Thinking…' : 'Generate 3 continuations'}
        </button>
        {suggestions.length > 0 && (
          <div className="mt-2 space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => insertSuggestion(s.text)}
                className="w-full text-left p-2 bg-brand-800 hover:bg-brand-700 rounded text-xs text-brand-200 transition-colors border border-brand-700 hover:border-brand-500"
              >
                <div className="flex gap-2 mb-1 text-brand-500">
                  <span className="capitalize">{s.tone}</span>
                  <span>·</span>
                  <span>{s.pages}p</span>
                </div>
                <p>{s.text}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Rewrite selection */}
      <section>
        <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
          Rewrite active block
        </h3>
        {activeBlock?.text ? (
          <p className="text-xs text-brand-600 mb-2 italic truncate">"{activeBlock.text.slice(0, 60)}…"</p>
        ) : (
          <p className="text-xs text-brand-600 mb-2">Click a block in the editor to select it.</p>
        )}
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full mb-2 bg-brand-800 border border-brand-700 text-brand-200 text-xs rounded px-2 py-1"
        >
          {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          onClick={handleRewrite}
          disabled={loading !== null || !activeBlock?.text}
          className="w-full py-1.5 px-3 bg-brand-700 hover:bg-brand-600 disabled:opacity-40 text-white text-xs rounded transition-colors"
        >
          {loading === 'rewrite' ? 'Rewriting…' : 'Generate 2 rewrites'}
        </button>
        {rewriteOutput && (
          <pre className="mt-2 text-xs text-brand-200 bg-brand-800 rounded p-2 whitespace-pre-wrap font-sans">
            {rewriteOutput}
          </pre>
        )}
      </section>

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
