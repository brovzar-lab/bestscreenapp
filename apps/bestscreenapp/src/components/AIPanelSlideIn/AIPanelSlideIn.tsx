import { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useEditorStore } from '../../store/editorStore';
import CowriteTab from './CowriteTab';
import CoverageTab from './CoverageTab';
import BeatSheetTab from './BeatSheetTab';
import VoiceCheckTab from './VoiceCheckTab';

type Tab = 'cowrite' | 'coverage' | 'beat-sheet' | 'voice-check';

const TABS: { id: Tab; label: string }[] = [
  { id: 'cowrite', label: 'Co-write' },
  { id: 'coverage', label: 'Coverage' },
  { id: 'beat-sheet', label: 'Beat Sheet' },
  { id: 'voice-check', label: 'Voice' },
];

export default function AIPanelSlideIn(): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('cowrite');
  const { aiPanelOpen, setAiPanelOpen } = useUIStore();
  const { activeScript } = useEditorStore();

  if (!aiPanelOpen) return <></>;

  const scriptText = activeScript?.blocks.map((b) => b.text).join('\n') ?? '';
  const characters = [
    ...new Set(
      activeScript?.blocks.filter((b) => b.type === 'character').map((b) => b.text.trim()) ?? [],
    ),
  ];

  return (
    <aside className="w-[300px] bg-brand-900 border-l border-brand-800 flex flex-col shrink-0 h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-brand-800 shrink-0">
        <span className="text-xs font-semibold text-brand-300 tracking-wide uppercase">
          ✦ AI Co-pilot
        </span>
        <button
          onClick={() => setAiPanelOpen(false)}
          className="text-brand-500 hover:text-white text-xl leading-none transition-colors"
          aria-label="Close AI panel"
        >
          ×
        </button>
      </div>

      <div className="flex border-b border-brand-800 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-brand-400 -mb-px'
                : 'text-brand-500 hover:text-brand-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'cowrite' && <CowriteTab scriptText={scriptText} />}
        {activeTab === 'coverage' && <CoverageTab scriptText={scriptText} />}
        {activeTab === 'beat-sheet' && <BeatSheetTab />}
        {activeTab === 'voice-check' && (
          <VoiceCheckTab scriptText={scriptText} characters={characters} />
        )}
      </div>
    </aside>
  );
}
