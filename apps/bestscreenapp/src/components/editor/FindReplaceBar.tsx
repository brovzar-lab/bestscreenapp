import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';

interface Props {
  onClose: () => void;
}

export default function FindReplaceBar({ onClose }: Props): JSX.Element {
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const findInputRef = useRef<HTMLInputElement>(null);
  const { activeScript, updateBlock } = useEditorStore();

  useEffect(() => {
    findInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!find || !activeScript) {
      clearHighlights();
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }
    const count = activeScript.blocks.reduce((acc, b) => {
      const matches = b.text.toLowerCase().split(find.toLowerCase()).length - 1;
      return acc + matches;
    }, 0);
    setMatchCount(count);
    setCurrentMatch(count > 0 ? 1 : 0);
  }, [find, activeScript]);

  function clearHighlights(): void {
    document.querySelectorAll('[data-block-id] mark').forEach((m) => {
      const parent = m.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(m.textContent ?? ''), m);
        (parent as Element).normalize();
      }
    });
  }

  function navigateMatch(direction: 'next' | 'prev'): void {
    if (!matchCount) return;
    setCurrentMatch((c) => {
      if (direction === 'next') return c >= matchCount ? 1 : c + 1;
      return c <= 1 ? matchCount : c - 1;
    });
    // Scroll to first block containing the match
    if (!activeScript || !find) return;
    const matchingBlock = activeScript.blocks.find((b) =>
      b.text.toLowerCase().includes(find.toLowerCase()),
    );
    if (matchingBlock) {
      document
        .querySelector(`[data-block-id="${matchingBlock.id}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function doReplace(): void {
    if (!activeScript || !find) return;
    const block = activeScript.blocks.find((b) =>
      b.text.toLowerCase().includes(find.toLowerCase()),
    );
    if (!block) return;
    const idx = block.text.toLowerCase().indexOf(find.toLowerCase());
    const newText =
      block.text.slice(0, idx) + replace + block.text.slice(idx + find.length);
    updateBlock(block.id, { text: newText });
    // Sync DOM
    const el = document.querySelector<HTMLDivElement>(
      `[data-block-id="${block.id}"]`,
    );
    if (el && document.activeElement !== el) {
      el.textContent = newText;
    }
  }

  function doReplaceAll(): void {
    if (!activeScript || !find) return;
    activeScript.blocks.forEach((block) => {
      if (!block.text.toLowerCase().includes(find.toLowerCase())) return;
      const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const newText = block.text.replace(regex, replace);
      updateBlock(block.id, { text: newText });
      const el = document.querySelector<HTMLDivElement>(
        `[data-block-id="${block.id}"]`,
      );
      if (el && document.activeElement !== el) {
        el.textContent = newText;
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') navigateMatch('next');
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-brand-800 border-b border-brand-700 text-xs">
      <input
        ref={findInputRef}
        type="text"
        placeholder="Find…"
        value={find}
        onChange={(e) => setFind(e.target.value)}
        onKeyDown={handleKeyDown}
        className="bg-brand-900 border border-brand-600 rounded px-2 py-1 text-brand-100 placeholder-brand-600 outline-none focus:border-brand-400 w-40"
      />
      <input
        type="text"
        placeholder="Replace…"
        value={replace}
        onChange={(e) => setReplace(e.target.value)}
        onKeyDown={handleKeyDown}
        className="bg-brand-900 border border-brand-600 rounded px-2 py-1 text-brand-100 placeholder-brand-600 outline-none focus:border-brand-400 w-40"
      />
      {matchCount > 0 && (
        <span className="text-brand-400 whitespace-nowrap">
          {currentMatch}/{matchCount}
        </span>
      )}
      <button
        onClick={() => navigateMatch('prev')}
        disabled={!matchCount}
        className="p-1 rounded hover:bg-brand-700 text-brand-300 disabled:opacity-40"
        title="Previous match"
      >
        ▲
      </button>
      <button
        onClick={() => navigateMatch('next')}
        disabled={!matchCount}
        className="p-1 rounded hover:bg-brand-700 text-brand-300 disabled:opacity-40"
        title="Next match"
      >
        ▼
      </button>
      <button
        onClick={doReplace}
        disabled={!matchCount}
        className="px-2 py-1 rounded hover:bg-brand-700 text-brand-300 disabled:opacity-40"
      >
        Replace
      </button>
      <button
        onClick={doReplaceAll}
        disabled={!matchCount}
        className="px-2 py-1 rounded hover:bg-brand-700 text-brand-300 disabled:opacity-40"
      >
        Replace All
      </button>
      <button
        onClick={onClose}
        className="ml-auto p-1 rounded hover:bg-brand-700 text-brand-400 hover:text-white"
        title="Close (Esc)"
      >
        ✕
      </button>
    </div>
  );
}
