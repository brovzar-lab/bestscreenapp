import { create } from 'zustand';
import type { Script, ScriptBlock } from '../types/screenplay';

interface EditorState {
  activeScript: Script | null;
  activeBlockId: string | null;
  isDirty: boolean;
  setActiveScript: (script: Script | null) => void;
  setActiveBlockId: (id: string | null) => void;
  updateBlock: (blockId: string, patch: Partial<ScriptBlock>) => void;
  markClean: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeScript: null,
  activeBlockId: null,
  isDirty: false,
  setActiveScript: (script) => set({ activeScript: script, isDirty: false }),
  setActiveBlockId: (id) => set({ activeBlockId: id }),
  updateBlock: (blockId, patch) =>
    set((s) => {
      if (!s.activeScript) return s;
      return {
        isDirty: true,
        activeScript: {
          ...s.activeScript,
          blocks: s.activeScript.blocks.map((b) =>
            b.id === blockId ? { ...b, ...patch } : b,
          ),
        },
      };
    }),
  markClean: () => set({ isDirty: false }),
}));
