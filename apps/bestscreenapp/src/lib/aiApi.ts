import { isDemoMode } from './demo';

const AI_API_URL = import.meta.env.VITE_AI_API_URL ?? '';

export interface SuggestNextResult {
  text: string;
  tone: string;
  pages: number;
}

export interface BeatSheetResult {
  structure: string;
  beats: { name: string; description: string; page: number }[];
}

export interface VoiceCheckResult {
  character: string;
  profile: { adjectives: string[]; phrases: string[] };
  flags: { blockId: string; line: string; reason: string; suggestion: string }[];
}

// ── Demo data ──────────────────────────────────────────────────────────────────

const DEMO_SUGGESTIONS: SuggestNextResult[] = [
  { text: "Mara steps forward, weapon still raised. Cole doesn't flinch — he's known she was coming.", tone: 'tense', pages: 0.5 },
  { text: 'She lowers the gun slowly. Something in his eyes — not fear. Relief.', tone: 'quiet', pages: 0.5 },
  { text: 'The equipment behind him sparks. Overhead, the antenna goes dark for the first time in six years.', tone: 'dramatic', pages: 0.5 },
];

const DEMO_COVERAGE = `**Overall**
A taut, efficient thriller with a strong hook. The mystery of Cole's survival creates immediate stakes and the tone is admirably controlled.

**Strengths**
- Strong visual economy throughout
- Clear protagonist with a defined professional wound
- Mystery established cleanly before the first act ends

**Areas to Develop**
- Cole's motivation for staying connected needs sharpening
- The Director's complicity is revealed too early — push it to Act Two
- Mara's personal stakes beyond the professional

**Premise**
Original and specific. The relay tower detail grounds the sci-fi in something tactile.

**Structure**
Act One ends cleanly with a reversal. The second act needs more defined obstacles before the government facility reveal.

**Characters**
Mara reads as a capable professional. One more specific personal detail would anchor her.

**Dialogue**
Clean and purposeful. Watch the government scenes — they trend toward the explanatory.

**Pacing**
The intercut structure works. The "SMASH CUT TO BLACK" can feel like a shortcut — earn it.

**Ending**
The final image lands. "RUN." is the right last word.`;

const DEMO_BEAT_SHEET: BeatSheetResult = {
  structure: 'Save the Cat',
  beats: [
    { name: 'Opening Image', description: 'The empty desert — a world of silence and forgotten signals.', page: 1 },
    { name: 'Theme Stated', description: "Some signals never stop transmitting. Some people can't let go.", page: 2 },
    { name: 'Set-Up', description: "Mara's world: a skeptical investigator who trusts only what she can verify.", page: 3 },
    { name: 'Catalyst', description: 'Tower Seven is broadcasting. Cole Vance is supposed to be dead.', page: 10 },
    { name: 'Debate', description: 'Does she go? She goes.', page: 12 },
    { name: 'Break into Two', description: 'She enters the relay tower.', page: 15 },
  ],
};

const DEMO_VOICE_CHECK: VoiceCheckResult = {
  character: 'MARA',
  profile: {
    adjectives: ['measured', 'direct', 'skeptical'],
    phrases: ["what she can verify", "shouldn't be possible", "I need"],
  },
  flags: [],
};

// ── Streaming helper ───────────────────────────────────────────────────────────

async function streamPost(
  endpoint: string,
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const res = await fetch(`${AI_API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Id': 'web-user' },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) throw new Error(`API error: ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of dec.decode(value, { stream: true }).split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const d = line.slice(6);
      if (d === '[DONE]') return;
      try { onChunk((JSON.parse(d) as { delta: string }).delta); } catch { /* ignore */ }
    }
  }
}

async function jsonPost<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${AI_API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Id': 'web-user' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

async function fakeStream(text: string, onChunk: (c: string) => void): Promise<void> {
  for (const word of text.split(' ')) {
    onChunk(word + ' ');
    await new Promise<void>((r) => setTimeout(r, 18));
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function suggestNext(scriptText: string, cursorContext: string): Promise<SuggestNextResult[]> {
  if (isDemoMode) return DEMO_SUGGESTIONS;
  return jsonPost<SuggestNextResult[]>('/api/ai/suggest-next', { scriptText, cursorContext });
}

export async function rewriteSelection(
  selectedText: string,
  tone: string,
  onChunk: (c: string) => void,
): Promise<void> {
  if (isDemoMode) {
    await fakeStream(`Option 1:\n${selectedText.slice(0, 60)}...\n\nOption 2:\n${selectedText.slice(0, 40)}...`, onChunk);
    return;
  }
  return streamPost('/api/ai/rewrite', { selectedText, tone }, onChunk);
}

export async function generateCoverage(scriptText: string, onChunk: (c: string) => void): Promise<void> {
  if (isDemoMode) return fakeStream(DEMO_COVERAGE, onChunk);
  return streamPost('/api/ai/coverage', { scriptText }, onChunk);
}

export async function generateBeatSheet(logline: string, structure: string): Promise<BeatSheetResult> {
  if (isDemoMode) return { ...DEMO_BEAT_SHEET, structure };
  return jsonPost<BeatSheetResult>('/api/ai/beat-sheet', { logline, structure });
}

export async function voiceCheck(scriptText: string, character: string): Promise<VoiceCheckResult> {
  if (isDemoMode) return { ...DEMO_VOICE_CHECK, character };
  return jsonPost<VoiceCheckResult>('/api/ai/voice-check', { scriptText, character });
}

export async function analyzePacing(scriptText: string, onChunk: (c: string) => void): Promise<void> {
  if (isDemoMode) {
    return fakeStream(
      '## Act One\nEfficient setup with clean escalation. Scene durations average 2.5 pages.\n\n## Act Two\nPacing dips in the government facility scenes — runs long relative to information value.\n\n## Act Three\nEfficient. Resolution is appropriately brief for the genre.',
      onChunk,
    );
  }
  return streamPost('/api/ai/pacing', { scriptText }, onChunk);
}
