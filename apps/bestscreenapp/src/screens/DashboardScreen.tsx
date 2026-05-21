import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useScripts, useCreateScript } from '../hooks/useScript';
import { isDemoMode } from '../lib/demo';
import type { AppUser } from '../hooks/useAuth';
import type { Script } from '../types/screenplay';

interface DashboardScreenProps {
  user: AppUser;
}

function ScriptCard({ script, onClick }: { script: Script; onClick: () => void }): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="text-left w-full bg-brand-900 border border-brand-800 rounded-xl p-5 hover:border-brand-600 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-brand-200 transition-colors">
            {script.title}
          </h3>
          <p className="text-xs text-brand-500 mt-1">
            {script.blocks.length} element{script.blocks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <span className="text-2xl shrink-0">📄</span>
      </div>
      <p className="text-xs text-brand-600 mt-3">
        Updated {new Date(script.updatedAt).toLocaleDateString()}
      </p>
    </button>
  );
}

export default function DashboardScreen({ user }: DashboardScreenProps): JSX.Element {
  const navigate = useNavigate();
  const { data: scripts, isLoading } = useScripts(user.uid);
  const createScript = useCreateScript(user.uid);
  const [newTitle, setNewTitle] = useState('');
  const [showNew, setShowNew] = useState(false);

  async function handleCreate(): Promise<void> {
    const title = newTitle.trim() || 'Untitled Script';
    if (isDemoMode) {
      toast('Demo mode — not saved');
      navigate('/editor/demo-script-001');
      return;
    }
    const id = await createScript.mutateAsync(title);
    setNewTitle('');
    setShowNew(false);
    navigate(`/editor/${id}`);
  }

  return (
    <div className="min-h-full bg-brand-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Scripts</h1>
            <p className="text-sm text-brand-500 mt-0.5">
              {isDemoMode ? 'Demo mode — changes are not saved' : `Signed in as ${user.displayName ?? user.email}`}
            </p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-white text-brand-900 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-brand-100 transition-colors"
          >
            <span className="text-lg">+</span> New Script
          </button>
        </div>

        {showNew && (
          <div className="bg-brand-900 border border-brand-700 rounded-xl p-4 mb-6 flex gap-3">
            <input
              autoFocus
              className="flex-1 bg-brand-800 border border-brand-600 rounded-lg px-3 py-2 text-sm text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Script title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setShowNew(false);
              }}
            />
            <button
              onClick={handleCreate}
              disabled={createScript.isPending}
              className="bg-white text-brand-900 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-brand-100 disabled:opacity-50 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="text-brand-500 hover:text-white px-2 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-brand-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : scripts && scripts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scripts.map((s) => (
              <ScriptCard
                key={s.id}
                script={s}
                onClick={() => navigate(`/editor/${s.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-brand-600">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-lg font-medium text-brand-400">No scripts yet</p>
            <p className="text-sm mt-1">Create your first script to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
