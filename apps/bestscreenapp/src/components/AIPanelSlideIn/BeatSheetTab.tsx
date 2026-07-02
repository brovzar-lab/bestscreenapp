import { useState } from 'react';
import { generateBeatSheet, type BeatSheetResult } from '../../lib/aiApi';
import { useEditorStore } from '../../store/editorStore';

const STRUCTURES = ['Save the Cat', '3-Act', 'TV Pilot', "Hero's Journey"] as const;

export default function BeatSheetTab(): JSX.Element {
  const [logline, setLogline] = useState('');
  const [structure, setStructure] = useState<string>(STRUCTURES[0]);
  const [result, setResult] = useState<BeatSheetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeBlockId, addBlock, updateBlock } = useEditorStore();

  const handleGenerate = async () => {
    if (!logline.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateBeatSheet(logline, structure);
      setResult(data);
    } catch {
      setError('Generation failed — check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const insertBeat = (beat: { name: string; description: string }) => {
    if (!activeBlockId) return;
    const headingId = addBlock(activeBlockId, 'scene-heading');
    updateBlock(headingId, { text: `INT. [LOCATION] - [TIME] (${beat.name.toUpperCase()})` });
    const actionId = addBlock(headingId, 'action');
    updateBlock(actionId, { text: beat.description });
  };

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
        Generate from logline
      </h3>

      <textarea
        value={logline}
        onChange={(e) => setLogline(e.target.value)}
        placeholder="A veteran astronaut discovers her crew has been replaced by imposters — and she's next."
        rows={3}
        className="w-full bg-brand-800 border border-brand-700 text-brand-200 text-xs rounded px-2 py-1.5 resize-none placeholder:text-brand-600 focus:outline-none focus:border-brand-500"
      />

      <select
        value={structure}
        onChange={(e) => setStructure(e.target.value)}
        className="w-full bg-brand-800 border border-brand-700 text-brand-200 text-xs rounded px-2 py-1"
      >
        {STRUCTURES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <button
        onClick={handleGenerate}
        disabled={loading || !logline.trim()}
        className="w-full py-1.5 px-3 bg-brand-700 hover:bg-brand-600 disabled:opacity-40 text-white text-xs rounded transition-colors"
      >
        {loading ? 'Generating…' : 'Generate beat sheet'}
      </button>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {result && (
        <div className="space-y-1">
          <p className="text-xs text-brand-500 mb-2">{result.structure} — {result.beats.length} beats</p>
          {result.beats.map((beat, i) => (
            <div
              key={i}
              className="p-2 bg-brand-800 rounded border border-brand-700 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-brand-300">{beat.name}</p>
                  <p className="text-xs text-brand-500 mt-0.5">{beat.description}</p>
                </div>
                <button
                  onClick={() => insertBeat(beat)}
                  title="Insert into script"
                  className="text-brand-600 hover:text-brand-300 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
