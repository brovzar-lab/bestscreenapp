import { useEditorStore } from '../../store/editorStore';
import type { ScriptBlock } from '../../types/screenplay';

interface SceneGroup {
  heading: ScriptBlock;
  actionLines: ScriptBlock[];
  characters: string[];
}

function buildSceneGroups(blocks: ScriptBlock[]): SceneGroup[] {
  const groups: SceneGroup[] = [];
  let current: SceneGroup | null = null;

  for (const block of blocks) {
    if (block.type === 'scene-heading') {
      current = { heading: block, actionLines: [], characters: [] };
      groups.push(current);
    } else if (current) {
      if (block.type === 'action') {
        current.actionLines.push(block);
      } else if (block.type === 'character') {
        const name = block.text.replace(/\s*\(.*\)\s*$/, '').trim();
        if (!current.characters.includes(name)) {
          current.characters.push(name);
        }
      }
    }
  }

  return groups;
}

function IndexCard({ scene, index }: { scene: SceneGroup; index: number }): JSX.Element {
  function scrollToScene(): void {
    const el = document.querySelector<HTMLElement>(
      `[data-block-id="${scene.heading.id}"]`,
    );
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  }

  const synopsis = scene.actionLines[0]?.text ?? '';

  return (
    <div
      className="bg-white dark:bg-brand-800 border border-stone-200 dark:border-brand-700 rounded p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={scrollToScene}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-brand-500">{index + 1}</span>
        {scene.characters.length > 0 && (
          <span className="text-xs text-brand-400 truncate max-w-[60%]">
            {scene.characters.slice(0, 2).join(', ')}
            {scene.characters.length > 2 && ' +more'}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-stone-800 dark:text-brand-100 uppercase truncate mb-1">
        {scene.heading.text}
      </p>
      {synopsis && (
        <p className="text-xs text-stone-500 dark:text-brand-400 line-clamp-3 leading-relaxed">
          {synopsis}
        </p>
      )}
    </div>
  );
}

export default function BeatBoardView(): JSX.Element {
  const { activeScript } = useEditorStore();
  const blocks = activeScript?.blocks ?? [];
  const scenes = buildSceneGroups(blocks);

  if (!scenes.length) {
    return (
      <div className="flex items-center justify-center h-full text-stone-400 dark:text-brand-600 text-sm">
        No scenes yet. Add a scene heading in the editor.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4 bg-stone-50 dark:bg-brand-950">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {scenes.map((scene, idx) => (
          <IndexCard key={scene.heading.id} scene={scene} index={idx} />
        ))}
      </div>
    </div>
  );
}
