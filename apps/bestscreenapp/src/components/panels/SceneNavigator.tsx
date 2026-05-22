import { useEditorStore } from '../../store/editorStore';

export default function SceneNavigator(): JSX.Element {
  const { activeScript, setActiveBlockId } = useEditorStore();

  const scenes = (activeScript?.blocks ?? []).filter(
    (b) => b.type === 'scene-heading',
  );

  function scrollToScene(blockId: string): void {
    setActiveBlockId(blockId);
    const el = document.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-3 py-2 text-xs font-semibold text-brand-500 uppercase tracking-wider border-b border-brand-800">
        Scenes
      </div>
      {scenes.length === 0 ? (
        <p className="px-3 py-4 text-xs text-brand-600 italic">No scenes yet</p>
      ) : (
        <ul>
          {scenes.map((block, idx) => (
            <li key={block.id}>
              <button
                onClick={() => scrollToScene(block.id)}
                className="w-full text-left px-3 py-2 text-xs text-brand-300 hover:bg-brand-800 hover:text-white transition-colors border-b border-brand-800/50"
              >
                <span className="text-brand-600 mr-2">{idx + 1}.</span>
                {block.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
