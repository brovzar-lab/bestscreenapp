import { isDemoMode } from '../lib/demo';
import { useUIStore } from '../store/uiStore';
import DemoBadge from './DemoBadge';

interface ToolbarProps {
  title: string;
  onSignOut: () => void;
}

export default function Toolbar({ title, onSignOut }: ToolbarProps): JSX.Element {
  const { zoom, setZoom, mode, setMode, toggleSidebar } = useUIStore();

  return (
    <header className="flex items-center justify-between h-12 px-4 bg-brand-900 text-white border-b border-brand-800 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded hover:bg-brand-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-sm font-medium truncate text-brand-100">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 text-xs text-brand-400">
          {(['write', 'outline', 'cards'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-1 rounded capitalize transition-colors ${
                mode === m
                  ? 'bg-brand-700 text-white'
                  : 'hover:bg-brand-800 text-brand-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1 ml-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-1 rounded hover:bg-brand-700 text-brand-300 text-xs"
          >
            −
          </button>
          <span className="text-xs text-brand-400 w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-1 rounded hover:bg-brand-700 text-brand-300 text-xs"
          >
            +
          </button>
        </div>

        {isDemoMode && <DemoBadge />}

        <button
          onClick={onSignOut}
          className="ml-2 text-xs text-brand-400 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
