import { useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import type { ScriptBlock, ElementType } from '../../types/screenplay';

const ELEMENT_STYLES: Record<ElementType, string> = {
  'scene-heading': 'uppercase font-bold tracking-wider text-stone-900 dark:text-brand-50',
  'action': 'text-stone-800 dark:text-brand-200',
  'character': 'uppercase font-semibold text-stone-900 dark:text-brand-50 pl-32',
  'parenthetical': 'italic text-stone-600 dark:text-brand-400 pl-24',
  'dialogue': 'text-stone-800 dark:text-brand-100 pl-16 pr-16',
  'transition': 'uppercase text-right text-stone-600 dark:text-brand-400 font-semibold',
  'shot': 'uppercase font-semibold text-stone-700 dark:text-brand-300',
  'general': 'text-stone-500 dark:text-brand-400 italic',
};

const ELEMENT_LABELS: Record<ElementType, string> = {
  'scene-heading': 'Scene Heading',
  'action': 'Action',
  'character': 'Character',
  'parenthetical': 'Parenthetical',
  'dialogue': 'Dialogue',
  'transition': 'Transition',
  'shot': 'Shot',
  'general': 'General',
};

interface Props {
  block: ScriptBlock;
  isActive: boolean;
  shouldFocus: boolean;
  onFocus: () => void;
  onChange: (text: string) => void;
  onEnter: () => void;
  onTab: (shift: boolean) => void;
  onBackspaceEmpty: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  innerRef?: (el: HTMLDivElement | null) => void;
}

export default function ScreenplayBlock({
  block,
  isActive,
  shouldFocus,
  onFocus,
  onChange,
  onEnter,
  onTab,
  onBackspaceEmpty,
  onArrowUp,
  onArrowDown,
  innerRef,
}: Props): JSX.Element {
  const divRef = useRef<HTMLDivElement>(null);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      (divRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      innerRef?.(el);
    },
    [innerRef],
  );

  // Sync content from props only when not focused (avoid cursor jump)
  useEffect(() => {
    const el = divRef.current;
    if (el && document.activeElement !== el) {
      if (el.textContent !== block.text) {
        el.textContent = block.text;
      }
    }
  }, [block.text]);

  // Focus when flagged
  useEffect(() => {
    if (!shouldFocus || !divRef.current) return;
    const el = divRef.current;
    el.focus();
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [shouldFocus]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onTab(e.shiftKey);
    } else if (e.key === 'Backspace') {
      const text = divRef.current?.textContent ?? '';
      if (!text) {
        e.preventDefault();
        onBackspaceEmpty();
      }
    } else if (e.key === 'ArrowUp') {
      const sel = window.getSelection();
      if (sel?.rangeCount) {
        const range = sel.getRangeAt(0);
        if (range.startOffset === 0 && range.collapsed) {
          e.preventDefault();
          onArrowUp();
        }
      }
    } else if (e.key === 'ArrowDown') {
      const sel = window.getSelection();
      if (sel?.rangeCount) {
        const range = sel.getRangeAt(0);
        const text = divRef.current?.textContent ?? '';
        if (range.endOffset >= text.length && range.collapsed) {
          e.preventDefault();
          onArrowDown();
        }
      }
    }
  }

  function handleInput(): void {
    onChange(divRef.current?.textContent ?? '');
  }

  return (
    <div className="relative group">
      {isActive && (
        <span className="absolute -left-28 top-0 text-xs text-stone-400 dark:text-brand-600 font-sans select-none hidden lg:block whitespace-nowrap">
          {ELEMENT_LABELS[block.type]}
        </span>
      )}
      <div
        ref={setRef}
        contentEditable
        suppressContentEditableWarning
        data-block-id={block.id}
        data-block-type={block.type}
        onFocus={onFocus}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`mb-3 leading-relaxed text-sm outline-none min-h-[1.4em] ${ELEMENT_STYLES[block.type]} ${
          isActive ? 'bg-stone-100/50 dark:bg-brand-800/20 -mx-2 px-2 rounded' : ''
        }`}
      />
    </div>
  );
}
