import { useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import ScreenplayBlock from './ScreenplayBlock';
import type { ElementType } from '../../types/screenplay';

const TAB_CYCLE: ElementType[] = [
  'scene-heading',
  'action',
  'character',
  'parenthetical',
  'dialogue',
  'transition',
  'shot',
  'general',
];

function nextBlockType(current: ElementType): ElementType {
  const map: Record<ElementType, ElementType> = {
    'scene-heading': 'action',
    'action': 'action',
    'character': 'dialogue',
    'parenthetical': 'dialogue',
    'dialogue': 'action',
    'transition': 'scene-heading',
    'shot': 'action',
    'general': 'general',
  };
  return map[current];
}

function tabCycleType(current: ElementType, shift: boolean): ElementType {
  const idx = TAB_CYCLE.indexOf(current);
  if (shift) {
    return TAB_CYCLE[(idx - 1 + TAB_CYCLE.length) % TAB_CYCLE.length];
  }
  return TAB_CYCLE[(idx + 1) % TAB_CYCLE.length];
}

interface Props {
  onOpenFindReplace: () => void;
}

export default function ScreenplayEditor({ onOpenFindReplace }: Props): JSX.Element {
  const {
    activeScript,
    activeBlockId,
    setActiveBlockId,
    updateBlock,
    addBlock,
    deleteBlock,
  } = useEditorStore();
  const zoom = useUIStore((s) => s.zoom);

  // Map block id -> DOM element for navigation
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  // Track which block should receive focus on next render
  const focusTargetId = useRef<string | null>(null);

  const blocks = activeScript?.blocks ?? [];

  const handleFocus = useCallback(
    (id: string) => {
      setActiveBlockId(id);
      focusTargetId.current = null;
    },
    [setActiveBlockId],
  );

  const handleChange = useCallback(
    (id: string, text: string) => {
      updateBlock(id, { text });
    },
    [updateBlock],
  );

  const handleEnter = useCallback(
    (blockId: string) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;
      const newType = nextBlockType(block.type);
      const newId = addBlock(blockId, newType);
      focusTargetId.current = newId;
    },
    [blocks, addBlock],
  );

  const handleTab = useCallback(
    (blockId: string, shift: boolean) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;
      const newType = tabCycleType(block.type, shift);
      updateBlock(blockId, { type: newType });
    },
    [blocks, updateBlock],
  );

  const handleBackspaceEmpty = useCallback(
    (blockId: string) => {
      if (blocks.length <= 1) return;
      const idx = blocks.findIndex((b) => b.id === blockId);
      const prevId = idx > 0 ? blocks[idx - 1].id : blocks[1]?.id;
      focusTargetId.current = prevId ?? null;
      deleteBlock(blockId);
    },
    [blocks, deleteBlock],
  );

  const moveFocus = useCallback(
    (blockId: string, direction: 'up' | 'down') => {
      const idx = blocks.findIndex((b) => b.id === blockId);
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const target = blocks[targetIdx];
      if (!target) return;
      focusTargetId.current = target.id;
      setActiveBlockId(target.id);
      // Directly focus the DOM element for immediate response
      const el = blockRefs.current.get(target.id);
      if (el) {
        el.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(direction === 'up');
        sel?.removeAllRanges();
        sel?.addRange(range);
        focusTargetId.current = null;
      }
    },
    [blocks, setActiveBlockId],
  );

  // Global Cmd+F handler
  function handleWrapperKeyDown(e: KeyboardEvent<HTMLDivElement>): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault();
      onOpenFindReplace();
    }
  }

  const setBlockRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      blockRefs.current.set(id, el);
    } else {
      blockRefs.current.delete(id);
    }
  }, []);

  if (!activeScript) {
    return (
      <div className="flex items-center justify-center h-full text-stone-400 dark:text-brand-500">
        No script loaded.
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-auto bg-brand-950 flex justify-center py-8 px-4"
      onKeyDown={handleWrapperKeyDown}
    >
      <div
        className="bg-paper dark:bg-brand-900 w-full max-w-2xl rounded shadow-2xl p-12 font-mono text-sm relative"
        style={{ fontSize: `${zoom / 100}em` }}
      >
        <div className="text-center mb-10 font-bold text-stone-900 dark:text-brand-50 text-base tracking-widest uppercase">
          {activeScript.titlePage.title}
        </div>
        <div className="pl-28">
          {blocks.map((block) => (
            <ScreenplayBlock
              key={block.id}
              block={block}
              isActive={block.id === activeBlockId}
              shouldFocus={block.id === focusTargetId.current}
              onFocus={() => handleFocus(block.id)}
              onChange={(text) => handleChange(block.id, text)}
              onEnter={() => handleEnter(block.id)}
              onTab={(shift) => handleTab(block.id, shift)}
              onBackspaceEmpty={() => handleBackspaceEmpty(block.id)}
              onArrowUp={() => moveFocus(block.id, 'up')}
              onArrowDown={() => moveFocus(block.id, 'down')}
              innerRef={(el) => setBlockRef(block.id, el)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
