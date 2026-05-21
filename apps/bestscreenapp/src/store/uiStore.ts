import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'print';
type Mode = 'write' | 'outline' | 'cards';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  zoom: number;
  mode: Mode;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setZoom: (zoom: number) => void;
  setMode: (mode: Mode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      zoom: 100,
      mode: 'write',
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setZoom: (zoom) => set({ zoom }),
      setMode: (mode) => set({ mode }),
    }),
    { name: 'cutt-ui' },
  ),
);
