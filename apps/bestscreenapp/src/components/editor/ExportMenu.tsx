import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { toFountain, toPlainText } from '../../lib/fountain';

function downloadBlob(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function ExportMenu(): JSX.Element {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { activeScript } = useEditorStore();

  useEffect(() => {
    function onClickOutside(e: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  function exportFountain(): void {
    if (!activeScript) return;
    const text = toFountain(
      activeScript.blocks,
      activeScript.titlePage.title,
      activeScript.titlePage.author,
    );
    downloadBlob(
      `${slugify(activeScript.titlePage.title)}.fountain`,
      text,
      'text/plain',
    );
    setOpen(false);
  }

  function exportTxt(): void {
    if (!activeScript) return;
    const text = toPlainText(activeScript.blocks, activeScript.titlePage.title);
    downloadBlob(`${slugify(activeScript.titlePage.title)}.txt`, text, 'text/plain');
    setOpen(false);
  }

  function exportPDF(): void {
    setOpen(false);
    // Use browser print-to-PDF; print CSS in index.css hides the chrome
    window.print();
  }

  function exportFDX(): void {
    if (!activeScript) return;
    const typeMap: Record<string, string> = {
      'scene-heading': 'Scene Heading',
      action: 'Action',
      character: 'Character',
      parenthetical: 'Parenthetical',
      dialogue: 'Dialogue',
      transition: 'Transition',
      shot: 'Shot',
      general: 'General',
    };
    const paragraphs = activeScript.blocks
      .map(
        (b) =>
          `    <Paragraph Type="${typeMap[b.type] ?? 'Action'}"><Text>${b.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Text></Paragraph>`,
      )
      .join('\n');
    const fdx = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n<FinalDraft DocumentType="Script" Template="No" Version="1">\n  <Content>\n${paragraphs}\n  </Content>\n</FinalDraft>`;
    downloadBlob(
      `${slugify(activeScript.titlePage.title)}.fdx`,
      fdx,
      'application/xml',
    );
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-brand-300 hover:text-white px-2 py-1 rounded hover:bg-brand-700 transition-colors"
        title="Export script"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-brand-800 border border-brand-700 rounded shadow-xl z-50 py-1">
          {[
            { label: 'PDF (Print)', action: exportPDF },
            { label: 'Fountain (.fountain)', action: exportFountain },
            { label: 'Final Draft (.fdx)', action: exportFDX },
            { label: 'Plain Text (.txt)', action: exportTxt },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              disabled={!activeScript}
              className="w-full text-left px-3 py-2 text-xs text-brand-200 hover:bg-brand-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
