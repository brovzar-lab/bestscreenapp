import { useUIStore } from '../store/uiStore';
import DemoBadge from './DemoBadge';
import ExportMenu from './editor/ExportMenu';
import ImportButton from './editor/ImportButton';

interface ToolbarProps {
  title: string;
  isDemo?: boolean;
  isEditor?: boolean;
  onSignOut: () => void;
}

export default function Toolbar({ title, isDemo, isEditor, onSignOut }: ToolbarProps): JSX.Element {
  const { zoom, setZoom, mode, setMode, toggleSidebar, theme, setTheme } = useUIStore();
  const isDark = theme === 'dark';

  function toggleDarkMode(): void {
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <header className="flex items-center justify-between h-12 px-4 bg-brand-900 text-white border-b border-brand-800 shrink-0 print:hidden">
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
              {m === 'cards' ? 'Beat Board' : m}
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

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded hover:bg-brand-700 text-brand-300 hover:text-white transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {isEditor && (
          <>
            <ImportButton />
            <ExportMenu />
          </>
        )}

        {isDemo && <DemoBadge />}

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
