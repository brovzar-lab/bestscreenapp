import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'print';
type Mode = 'write' | 'outline' | 'cards';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  aiPanelOpen: boolean;
  zoom: number;
  mode: Mode;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setAiPanelOpen: (open: boolean) => void;
  toggleAiPanel: () => void;
  setZoom: (zoom: number) => void;
  setMode: (mode: Mode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      aiPanelOpen: false,
      zoom: 100,
      mode: 'write',
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
      toggleAiPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
      setZoom: (zoom) => set({ zoom }),
      setMode: (mode) => set({ mode }),
    }),
    { name: 'cutt-ui' },
  ),
);
