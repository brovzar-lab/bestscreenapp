import { create } from 'zustand';
import type { Script, ScriptBlock, ElementType } from '../types/screenplay';

interface SavedVersion {
  savedAt: Date;
  blocks: ScriptBlock[];
  label: string;
}

interface EditorState {
  activeScript: Script | null;
  activeBlockId: string | null;
  isDirty: boolean;
  savedVersions: SavedVersion[];
  setActiveScript: (script: Script | null) => void;
  setActiveBlockId: (id: string | null) => void;
  updateBlock: (blockId: string, patch: Partial<ScriptBlock>) => void;
  addBlock: (afterId: string, type: ElementType) => string;
  deleteBlock: (blockId: string) => void;
  setBlocks: (blocks: ScriptBlock[]) => void;
  saveVersion: (label?: string) => void;
  markClean: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  activeScript: null,
  activeBlockId: null,
  isDirty: false,
  savedVersions: [],

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

  addBlock: (afterId, type) => {
    const newId = crypto.randomUUID();
    set((s) => {
      if (!s.activeScript) return s;
      const idx = s.activeScript.blocks.findIndex((b) => b.id === afterId);
      const newBlock: ScriptBlock = { id: newId, type, text: '' };
      const blocks = [...s.activeScript.blocks];
      blocks.splice(idx + 1, 0, newBlock);
      return {
        isDirty: true,
        activeBlockId: newId,
        activeScript: { ...s.activeScript, blocks },
      };
    });
    return newId;
  },

  deleteBlock: (blockId) =>
    set((s) => {
      if (!s.activeScript) return s;
      const blocks = s.activeScript.blocks;
      const idx = blocks.findIndex((b) => b.id === blockId);
      if (idx < 0) return s;
      const newBlocks = blocks.filter((b) => b.id !== blockId);
      const prevId = idx > 0 ? blocks[idx - 1].id : (newBlocks[0]?.id ?? null);
      return {
        isDirty: true,
        activeBlockId: prevId,
        activeScript: { ...s.activeScript, blocks: newBlocks },
      };
    }),

  setBlocks: (blocks) =>
    set((s) => {
      if (!s.activeScript) return s;
      return {
        isDirty: true,
        activeScript: { ...s.activeScript, blocks },
      };
    }),

  saveVersion: (label) => {
    const { activeScript, savedVersions } = get();
    if (!activeScript) return;
    const version: SavedVersion = {
      savedAt: new Date(),
      blocks: activeScript.blocks.map((b) => ({ ...b })),
      label: label ?? `Draft ${savedVersions.length + 1}`,
    };
    set({ savedVersions: [...savedVersions, version].slice(-20) });
  },

  markClean: () => set({ isDirty: false }),
}));
