import { type ReactNode } from 'react';
import { useUIStore } from '../store/uiStore';
import Toolbar from './Toolbar';

interface LayoutProps {
  title: string;
  isDemo?: boolean;
  isEditor?: boolean;
  sidebar?: ReactNode;
  children: ReactNode;
  onSignOut: () => void;
}

export default function Layout({ title, isDemo, isEditor, sidebar, children, onSignOut }: LayoutProps): JSX.Element {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="flex flex-col h-screen bg-brand-950 overflow-hidden">
      <Toolbar title={title} isDemo={isDemo} isEditor={isEditor} onSignOut={onSignOut} />
      <div className="flex flex-1 min-h-0">
        {sidebar && sidebarOpen && (
          <aside className="w-56 bg-brand-900 border-r border-brand-800 overflow-y-auto shrink-0">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
