import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import Anthropic from '@anthropic-ai/sdk';
import { PROMPTS } from './prompts.js';

const app = express();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });

const allowedOrigin = process.env.ALLOWED_ORIGIN ?? 'https://bestscreenapp.vercel.app';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '2mb' }));

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => (req.headers['x-user-id'] as string | undefined) ?? req.ip ?? 'anon',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/ai', aiLimiter);

function sseStart(res: express.Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
}

function sseChunk(res: express.Response, delta: string): void {
  res.write(`data: ${JSON.stringify({ delta })}\n\n`);
}

function sseDone(res: express.Response): void {
  res.write('data: [DONE]\n\n');
  res.end();
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/ai/suggest-next', async (req, res) => {
  const { scriptText, cursorContext } = req.body as { scriptText: string; cursorContext: string };
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: PROMPTS.suggestNext,
      messages: [{ role: 'user', content: `Script:\n${scriptText}\n\nAt cursor: ${cursorContext}` }],
    });
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '[]';
    res.json(JSON.parse(text));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI error' });
  }
});

app.post('/api/ai/rewrite', async (req, res) => {
  const { selectedText, tone } = req.body as { selectedText: string; tone: string };
  sseStart(res);
  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: PROMPTS.rewrite,
      messages: [{ role: 'user', content: `Tone: ${tone}\n\nOriginal:\n${selectedText}` }],
    });
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        sseChunk(res, chunk.delta.text);
      }
    }
  } catch (err) {
    console.error(err);
  }
  sseDone(res);
});

app.post('/api/ai/coverage', async (req, res) => {
  const { scriptText } = req.body as { scriptText: string };
  sseStart(res);
  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: PROMPTS.coverage,
      messages: [{ role: 'user', content: scriptText }],
    });
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        sseChunk(res, chunk.delta.text);
      }
    }
  } catch (err) {
    console.error(err);
  }
  sseDone(res);
});

app.post('/api/ai/beat-sheet', async (req, res) => {
  const { logline, structure } = req.body as { logline: string; structure: string };
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: PROMPTS.beatSheet,
      messages: [{ role: 'user', content: `Structure: ${structure}\n\nLogline: ${logline}` }],
    });
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    res.json(JSON.parse(text));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI error' });
  }
});

app.post('/api/ai/voice-check', async (req, res) => {
  const { scriptText, character } = req.body as { scriptText: string; character: string };
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: PROMPTS.voiceCheck,
      messages: [{ role: 'user', content: `Character: ${character}\n\nScript:\n${scriptText}` }],
    });
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    res.json(JSON.parse(text));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI error' });
  }
});

app.post('/api/ai/pacing', async (req, res) => {
  const { scriptText } = req.body as { scriptText: string };
  sseStart(res);
  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: PROMPTS.pacing,
      messages: [{ role: 'user', content: scriptText }],
    });
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        sseChunk(res, chunk.delta.text);
      }
    }
  } catch (err) {
    console.error(err);
  }
  sseDone(res);
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`bestscreenapp-api on :${PORT}`));
