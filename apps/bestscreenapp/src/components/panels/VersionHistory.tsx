import { useEditorStore } from '../../store/editorStore';

export default function VersionHistory(): JSX.Element {
  const { savedVersions, setBlocks } = useEditorStore();

  function restoreVersion(idx: number): void {
    const version = savedVersions[idx];
    if (!version) return;
    setBlocks(version.blocks.map((b) => ({ ...b })));
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-3 py-2 text-xs font-semibold text-brand-500 uppercase tracking-wider border-b border-brand-800">
        Version History
      </div>
      {savedVersions.length === 0 ? (
        <p className="px-3 py-4 text-xs text-brand-600 italic">
          No saved versions. Versions are saved automatically.
        </p>
      ) : (
        <ul>
          {[...savedVersions].reverse().map((v, reverseIdx) => {
            const idx = savedVersions.length - 1 - reverseIdx;
            return (
              <li key={idx} className="border-b border-brand-800/50">
                <button
                  onClick={() => restoreVersion(idx)}
                  className="w-full text-left px-3 py-2 hover:bg-brand-800/50 transition-colors"
                >
                  <div className="text-xs text-brand-200">{v.label}</div>
                  <div className="text-xs text-brand-600 mt-0.5">
                    {v.savedAt.toLocaleTimeString()} · {v.blocks.length} blocks
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
