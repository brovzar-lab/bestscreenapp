import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScript } from '../hooks/useScript';
import { useEditorStore } from '../store/editorStore';
import { useUIStore } from '../store/uiStore';
import ScreenplayEditor from '../components/editor/ScreenplayEditor';
import FindReplaceBar from '../components/editor/FindReplaceBar';
import SceneNavigator from '../components/panels/SceneNavigator';
import BeatBoardView from '../components/panels/BeatBoardView';
import CharacterRegistry from '../components/panels/CharacterRegistry';
import VersionHistory from '../components/panels/VersionHistory';

export default function EditorScreen(): JSX.Element {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const { data: script, isLoading } = useScript(scriptId);
  const { setActiveScript, saveVersion, isDirty } = useEditorStore();
  const { sidebarOpen, mode } = useUIStore();
  const [findOpen, setFindOpen] = useState(false);

  useEffect(() => {
    if (script) setActiveScript(script);
  }, [script, setActiveScript]);

  // Auto-save version every 2 minutes when dirty
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => saveVersion(), 120_000);
    return () => clearTimeout(timer);
  }, [isDirty, saveVersion]);

  const openFindReplace = useCallback(() => setFindOpen(true), []);

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

  // Beat Board mode shows full-screen card view
  if (mode === 'cards') {
    return (
      <div className="h-full flex flex-col">
        {findOpen && <FindReplaceBar onClose={() => setFindOpen(false)} />}
        <BeatBoardView />
      </div>
    );
  }

  // Sidebar panel based on mode
  const SidebarPanel = mode === 'outline' ? (
    <div className="h-full flex flex-col overflow-hidden">
      <SceneNavigator />
      <div className="border-t border-brand-800">
        <CharacterRegistry />
      </div>
    </div>
  ) : (
    <div className="h-full flex flex-col overflow-hidden">
      <SceneNavigator />
      <div className="border-t border-brand-800 flex-1 overflow-hidden">
        <VersionHistory />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {findOpen && <FindReplaceBar onClose={() => setFindOpen(false)} />}
      <div className="flex flex-1 min-h-0">
        {sidebarOpen && (
          <aside className="w-56 bg-brand-900 border-r border-brand-800 overflow-hidden shrink-0">
            {SidebarPanel}
          </aside>
        )}
        <main className="flex-1 overflow-hidden">
          <ScreenplayEditor onOpenFindReplace={openFindReplace} />
        </main>
      </div>
    </div>
  );
}
