import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScript } from '../hooks/useScript';
import { useEditorStore } from '../store/editorStore';
import { useUIStore } from '../store/uiStore';
import type { ScriptBlock } from '../types/screenplay';

const ELEMENT_CLASSES: Record<string, string> = {
  'scene-heading': 'uppercase font-bold text-white tracking-wider',
  action: 'text-brand-200',
  character: 'uppercase font-semibold text-white pl-32',
  parenthetical: 'italic text-brand-400 pl-24',
  dialogue: 'text-brand-100 pl-16 pr-16',
  transition: 'uppercase text-right text-brand-400 font-semibold',
  shot: 'uppercase font-semibold text-brand-300',
  general: 'text-brand-400 italic',
};

function BlockView({ block }: { block: ScriptBlock }): JSX.Element {
  return (
    <div className={`mb-3 leading-relaxed text-sm ${ELEMENT_CLASSES[block.type] ?? ''}`}>
      {block.text}
    </div>
  );
}

export default function EditorScreen(): JSX.Element {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const { data: script, isLoading } = useScript(scriptId);
  const { setActiveScript } = useEditorStore();
  const zoom = useUIStore((s) => s.zoom);

  useEffect(() => {
    if (script) setActiveScript(script);
  }, [script, setActiveScript]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-brand-500">
        Loading script…
      </div>
    );
  }

  if (!script) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-brand-500">
        <p>Script not found.</p>
        <button
          onClick={() => navigate('/')}
          className="text-sm underline hover:text-white transition-colors"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-brand-950 flex justify-center py-8 px-4">
      <div
        className="bg-paper w-full max-w-2xl rounded shadow-2xl p-12 font-mono text-sm"
        style={{ fontSize: `${zoom / 100}em` }}
      >
        <div className="text-center mb-10 font-bold text-brand-900 text-base tracking-widest uppercase">
          {script.titlePage.title}
        </div>
        {script.blocks.map((block) => (
          <BlockView key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
