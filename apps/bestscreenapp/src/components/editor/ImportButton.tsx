import { useRef } from 'react';
import toast from 'react-hot-toast';
import { useEditorStore } from '../../store/editorStore';
import { parseFountain } from '../../lib/fountain';

export default function ImportButton(): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setBlocks } = useEditorStore();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const blocks = parseFountain(text);
        if (!blocks.length) {
          toast.error('No content found in file');
          return;
        }
        setBlocks(blocks);
        toast.success(`Imported ${blocks.length} elements`);
      } catch {
        toast.error('Failed to parse file');
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    e.target.value = '';
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".fountain,.txt,.fdx"
        onChange={handleFile}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1 text-xs text-brand-300 hover:text-white px-2 py-1 rounded hover:bg-brand-700 transition-colors"
        title="Import screenplay file"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
        </svg>
        Import
      </button>
    </>
  );
}
