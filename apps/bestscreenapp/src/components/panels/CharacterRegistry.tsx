import { useEditorStore } from '../../store/editorStore';
import type { ScriptBlock } from '../../types/screenplay';

interface CharacterStats {
  name: string;
  dialogueCount: number;
  sceneCount: number;
}

function extractCharacters(blocks: ScriptBlock[]): CharacterStats[] {
  const stats = new Map<string, CharacterStats>();
  let currentScene = '';
  let lastCharacter = '';

  for (const block of blocks) {
    if (block.type === 'scene-heading') {
      currentScene = block.id;
    } else if (block.type === 'character') {
      // Strip extensions like (V.O.), (O.S.)
      const name = block.text.replace(/\s*\(.*\)\s*$/, '').trim();
      lastCharacter = name;
      if (!stats.has(name)) {
        stats.set(name, { name, dialogueCount: 0, sceneCount: 0 });
      }
    } else if (block.type === 'dialogue' && lastCharacter) {
      const entry = stats.get(lastCharacter)!;
      entry.dialogueCount += 1;
      lastCharacter = '';
    } else if (block.type !== 'parenthetical') {
      lastCharacter = '';
    }
  }

  return Array.from(stats.values()).sort((a, b) => b.dialogueCount - a.dialogueCount);
}

export default function CharacterRegistry(): JSX.Element {
  const { activeScript } = useEditorStore();
  const blocks = activeScript?.blocks ?? [];
  const characters = extractCharacters(blocks);

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-3 py-2 text-xs font-semibold text-brand-500 uppercase tracking-wider border-b border-brand-800">
        Characters
      </div>
      {characters.length === 0 ? (
        <p className="px-3 py-4 text-xs text-brand-600 italic">
          No characters detected yet
        </p>
      ) : (
        <ul>
          {characters.map((char) => (
            <li
              key={char.name}
              className="flex items-center justify-between px-3 py-2 border-b border-brand-800/50 hover:bg-brand-800/50 transition-colors"
            >
              <span className="text-xs font-semibold text-brand-200 uppercase">
                {char.name}
              </span>
              <span className="text-xs text-brand-500">
                {char.dialogueCount}
                {char.dialogueCount === 1 ? ' line' : ' lines'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
