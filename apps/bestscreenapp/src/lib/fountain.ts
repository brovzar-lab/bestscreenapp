import type { ScriptBlock, ElementType } from '../types/screenplay';

const SCENE_HEADING_RE = /^(INT|EXT|INT\.\/EXT|I\/E|EST)[\.\s]/i;
const TRANSITION_RE = /^[A-Z\s]+TO:\s*$|^SMASH CUT TO:\s*$|^FADE OUT\.?\s*$|^FADE IN:\s*$/;
const CHARACTER_RE = /^[A-Z][A-Z\s\.\-']+(\s*\(.*\))?\s*$/;

export function parseFountain(text: string): ScriptBlock[] {
  const lines = text.split('\n');
  const blocks: ScriptBlock[] = [];
  let i = 0;
  let inDialogue = false;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    // Skip title page (everything before first blank line if it has key: value pairs)
    if (blocks.length === 0 && /^[A-Za-z ]+:\s*.+/.test(line)) {
      i++;
      continue;
    }

    if (line === '') {
      inDialogue = false;
      i++;
      continue;
    }

    // Forced scene heading
    if (line.startsWith('.') && !line.startsWith('..')) {
      blocks.push({ id: crypto.randomUUID(), type: 'scene-heading', text: line.slice(1).trim() });
      inDialogue = false;
      i++;
      continue;
    }

    if (SCENE_HEADING_RE.test(line)) {
      blocks.push({ id: crypto.randomUUID(), type: 'scene-heading', text: line });
      inDialogue = false;
      i++;
      continue;
    }

    if (TRANSITION_RE.test(line)) {
      blocks.push({ id: crypto.randomUUID(), type: 'transition', text: line });
      inDialogue = false;
      i++;
      continue;
    }

    // Parenthetical
    if (line.startsWith('(') && line.endsWith(')') && inDialogue) {
      blocks.push({ id: crypto.randomUUID(), type: 'parenthetical', text: line });
      i++;
      continue;
    }

    // Character name (all caps, followed by dialogue)
    const nextNonEmpty = lines.slice(i + 1).find((l) => l.trim() !== '');
    if (CHARACTER_RE.test(line) && nextNonEmpty && !SCENE_HEADING_RE.test(nextNonEmpty)) {
      blocks.push({ id: crypto.randomUUID(), type: 'character', text: line.trim() });
      inDialogue = true;
      i++;
      continue;
    }

    // Dialogue (line after character or parenthetical)
    if (inDialogue) {
      blocks.push({ id: crypto.randomUUID(), type: 'dialogue', text: line });
      i++;
      continue;
    }

    // Action
    blocks.push({ id: crypto.randomUUID(), type: 'action', text: line });
    i++;
  }

  return blocks.filter((b) => b.text.trim() !== '');
}

export function toFountain(blocks: ScriptBlock[], title: string, author: string): string {
  const titlePage = `Title: ${title}\nAuthor: ${author}\n\n`;

  const body = blocks
    .map((b) => {
      switch (b.type) {
        case 'scene-heading':
          return `\n${b.text}\n`;
        case 'character':
          return `\n${b.text}`;
        case 'parenthetical':
          return b.text;
        case 'dialogue':
          return `${b.text}\n`;
        case 'transition':
          return `\n${b.text}\n`;
        case 'action':
          return `\n${b.text}\n`;
        default:
          return b.text;
      }
    })
    .join('\n');

  return titlePage + body;
}

export function toPlainText(blocks: ScriptBlock[], title: string): string {
  const header = `${title.toUpperCase()}\n${'='.repeat(title.length)}\n\n`;
  const body = blocks.map((b) => b.text).join('\n');
  return header + body;
}
