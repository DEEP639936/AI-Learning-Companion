// Mentora AI — Portable AI Client
// ─────────────────────────────────────────────────────────────────────────────
// Supports ANY OpenAI-compatible API:
//   • Nvidia DeepSeek (nvidia://)     → integrate.api.nvidia.com/v1
//   • Groq (groq://)                  → api.groq.com/openai/v1
//   • OpenAI (openai:// or default)   → api.openai.com/v1
//   • Together AI, Azure, any custom  → set OPENAI_BASE_URL directly
//
// MULTIPLE API KEYS: Separate with commas in OPENAI_API_KEY
//   Example: OPENAI_API_KEY=nvapi-key1,nvapi-key2,nvapi-key3
//   The client rotates through keys automatically — if one hits rate limit,
//   it switches to the next one. This triples your free quota!
//
// On space-z.ai platform: auto-detects z-ai SDK/CLI (no API key needed)
// On Vercel/GitHub: uses OPENAI_API_KEY + OPENAI_BASE_URL
// ─────────────────────────────────────────────────────────────────────────────

import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execFileAsync = promisify(execFile);

// ─── Types ───────────────────────────────────────────────────────────────────

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIRequestOptions {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  system?: string;
}

// ─── API Key Rotation ────────────────────────────────────────────────────────
// Supports multiple API keys separated by commas
// Rotates through them automatically on rate-limit errors

class ApiKeyRotator {
  private keys: string[] = [];
  private currentIndex: number = 0;
  private failedKeys: Map<string, number> = new Map(); // key → retry-after timestamp

  constructor(rawKeys: string) {
    this.keys = rawKeys
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (this.keys.length > 1) {
      console.log(`[API Key Rotator] ${this.keys.length} API keys loaded — rotation enabled`);
    } else if (this.keys.length === 1) {
      console.log('[API Key Rotator] 1 API key loaded');
    }
  }

  get count(): number {
    return this.keys.length;
  }

  get hasKeys(): boolean {
    return this.keys.length > 0;
  }

  /** Get the current active API key */
  getCurrent(): string {
    // Clean up expired failures
    const now = Date.now();
    for (const [key, retryAfter] of this.failedKeys) {
      if (now >= retryAfter) {
        this.failedKeys.delete(key);
      }
    }

    // Find next available key (skip failed ones)
    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[this.currentIndex];
      if (!this.failedKeys.has(key)) {
        return key;
      }
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    }

    // All keys are rate-limited — use current anyway (best effort)
    return this.keys[this.currentIndex];
  }

  /** Mark current key as rate-limited and rotate to next */
  rotateAndRetry(retryAfterSeconds: number = 60): string {
    const currentKey = this.keys[this.currentIndex];
    this.failedKeys.set(currentKey, Date.now() + retryAfterSeconds * 1000);
    console.warn(`[API Key Rotator] Key #${this.currentIndex + 1} rate-limited, rotating...`);

    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return this.getCurrent();
  }

  /** Move to next key (called on success to distribute load evenly) */
  next(): void {
    if (this.keys.length > 1) {
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    }
  }
}

// ─── Backend Detection ───────────────────────────────────────────────────────

type AIBackend = 'openai-compatible' | 'zai-sdk' | 'zai-cli';

let keyRotator: ApiKeyRotator = new ApiKeyRotator('');

function detectBackend(): AIBackend {
  const rawKey = process.env.OPENAI_API_KEY || '';

  if (rawKey.trim() !== '') {
    keyRotator = new ApiKeyRotator(rawKey);
    const model = process.env.OPENAI_MODEL || 'deepseek-ai/deepseek-v4-pro';
    const baseUrl = resolveBaseUrl();
    console.log(`[AI Client] Using OpenAI-compatible backend → ${baseUrl} | Model: ${model} | Keys: ${keyRotator.count}`);
    return 'openai-compatible';
  }

  // Check if z-ai SDK config exists (this platform only)
  const configPaths = [
    path.join(process.cwd(), '.z-ai-config'),
    path.join(os.homedir(), '.z-ai-config'),
    '/etc/.z-ai-config',
  ];
  for (const p of configPaths) {
    try {
      if (fs.existsSync(p)) {
        const cfg = JSON.parse(fs.readFileSync(p, 'utf-8'));
        if (cfg.baseUrl && cfg.apiKey) {
          console.log('[AI Client] Using z-ai SDK backend (platform auto-detect, config:', p, ')');
          return 'zai-sdk';
        }
      }
    } catch { /* continue */ }
  }

  console.log('[AI Client] Using z-ai CLI backend (fallback)');
  return 'zai-cli';
}

const BACKEND = detectBackend();

// ─── Base URL Resolution ─────────────────────────────────────────────────────
// Supports shorthand prefixes for popular providers:
//   nvidia:// → https://integrate.api.nvidia.com/v1
//   groq://   → https://api.groq.com/openai/v1
//   openai:// → https://api.openai.com/v1
//   Full URL  → used as-is

function resolveBaseUrl(): string {
  const raw = (process.env.OPENAI_BASE_URL || '').trim();

  if (!raw || raw === 'nvidia://') {
    return 'https://integrate.api.nvidia.com/v1';
  }
  if (raw === 'groq://') {
    return 'https://api.groq.com/openai/v1';
  }
  if (raw === 'openai://') {
    return 'https://api.openai.com/v1';
  }
  if (raw.startsWith('nvidia://')) {
    return raw.replace('nvidia://', 'https://integrate.api.nvidia.com/v1');
  }
  if (raw.startsWith('groq://')) {
    return raw.replace('groq://', 'https://api.groq.com/openai/v1');
  }

  return raw || 'https://integrate.api.nvidia.com/v1';
}

// ─── OpenAI-Compatible Backend ───────────────────────────────────────────────
// Works with: Nvidia DeepSeek, Groq, OpenAI, Together AI, Azure, etc.
// Supports automatic API key rotation for multiple keys.

async function openaiCompatibleChatCompletion({ messages, temperature = 0.7, maxTokens = 4096, system }: AIRequestOptions): Promise<string> {
  const model = process.env.OPENAI_MODEL || 'deepseek-ai/deepseek-v4-pro';
  const baseUrl = resolveBaseUrl();

  // Build messages array
  const apiMessages: Array<{ role: string; content: string }> = [];
  if (system) {
    apiMessages.push({ role: 'system', content: system });
  }
  for (const msg of messages) {
    apiMessages.push({ role: msg.role, content: msg.content });
  }

  // Try with key rotation (up to keyRotator.count + 1 attempts)
  const maxAttempts = keyRotator.count + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const apiKey = keyRotator.getCurrent();

    console.log(`[AI Client → ${baseUrl}] Model: ${model} | Key #${(keyRotator as any).currentIndex + 1}/${keyRotator.count} | Attempt: ${attempt}`);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      // Handle rate limiting — rotate key and retry
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '60');
        console.warn(`[AI Client] Rate limited (429). Retry-After: ${retryAfter}s`);

        if (keyRotator.count > 1) {
          keyRotator.rotateAndRetry(retryAfter);
          continue; // Try next key
        }
        // Only one key — wait and retry once
        await new Promise(resolve => setTimeout(resolve, Math.min(retryAfter * 1000, 10000)));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI Client] API error ${response.status}:`, errorText.substring(0, 300));
        throw new Error(`API error (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from AI API');
      }

      // Success — rotate to next key for load distribution
      keyRotator.next();

      console.log(`[AI Client] Response received, length: ${content.length}`);
      return content;
    } catch (error: any) {
      // If it's a network error (not rate limit), don't retry with different key
      if (error.message && !error.message.includes('429') && !error.message.includes('rate')) {
        throw error;
      }
      // Rate limit error — try next key
      if (attempt < maxAttempts) {
        keyRotator.rotateAndRetry(60);
        continue;
      }
      throw error;
    }
  }

  throw new Error('All API keys exhausted (rate limited). Please wait and try again.');
}

// ─── z-ai SDK Backend (HTTP API — platform only) ────────────────────────────

let zaiInstance: any = null;

async function getZaiInstance() {
  if (!zaiInstance) {
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    zaiInstance = await ZAI.create();
    console.log('[AI Client → z-ai SDK] Instance created');
  }
  return zaiInstance;
}

async function zaiSdkChatCompletion({ messages, temperature = 0.7, maxTokens = 4096, system }: AIRequestOptions): Promise<string> {
  const zai = await getZaiInstance();

  const apiMessages: Array<{ role: string; content: string }> = [];
  if (system) {
    apiMessages.push({ role: 'system', content: system });
  }
  for (const msg of messages) {
    apiMessages.push({ role: msg.role, content: msg.content });
  }

  console.log('[AI Client → z-ai SDK] Sending request, messages:', apiMessages.length);

  const response = await zai.chat.completions.create({
    messages: apiMessages,
    stream: false,
    thinking: { type: 'disabled' },
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from z-ai SDK');
  }

  console.log('[AI Client → z-ai SDK] Response received, length:', content.length);
  return content;
}

// ─── z-ai CLI Backend (fallback, platform only) ─────────────────────────────

function resolveZaiBinary(): string {
  const candidates = [
    '/usr/local/bin/z-ai',
    path.join(process.cwd(), 'node_modules', '.bin', 'z-ai-web-dev-sdk'),
    path.join(process.cwd(), 'node_modules', '.bin', 'z-ai'),
    path.join(process.cwd(), 'node_modules', 'z-ai-web-dev-sdk', 'dist', 'cli.js'),
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch { /* continue */ }
  }
  return 'z-ai';
}

const ZAI_BINARY = resolveZaiBinary();

async function zaiCliChatCompletion({ messages, temperature = 0.7, maxTokens = 4096, system }: AIRequestOptions): Promise<string> {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const userPrompt = lastUserMessage?.content || messages[messages.length - 1].content;

  const recentMessages = messages.slice(-6);
  let contextPrompt = userPrompt;
  if (recentMessages.length > 1) {
    const context = recentMessages.slice(0, -1)
      .map(m => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`)
      .join('\n');
    contextPrompt = `Previous conversation context:\n${context}\n\nStudent's current question: ${userPrompt}`;
  }

  const args: string[] = ['chat', '--prompt', contextPrompt];
  if (system) args.push('--system', system);

  console.log('[AI Client → z-ai CLI] Calling:', ZAI_BINARY);

  const { stdout, stderr } = await execFileAsync(ZAI_BINARY, args, {
    encoding: 'utf-8',
    timeout: 90000,
    maxBuffer: 2 * 1024 * 1024,
    cwd: process.cwd(),
    env: { ...process.env },
  });

  if (stderr && stderr.trim()) {
    console.warn('[AI Client → z-ai CLI] stderr:', stderr.trim().substring(0, 200));
  }

  const jsonMatch = stdout.match(/\{[\s\S]*"choices"[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No valid JSON response from z-ai CLI');

  const response = JSON.parse(jsonMatch[0]);
  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from z-ai CLI');

  console.log('[AI Client → z-ai CLI] Response, length:', content.length);
  return content;
}

// ─── Unified Export ──────────────────────────────────────────────────────────

/**
 * Send messages to the AI backend.
 * Priority: OpenAI-compatible (if API key set) → z-ai SDK → z-ai CLI
 */
export async function chatCompletion(options: AIRequestOptions): Promise<string> {
  if (BACKEND === 'openai-compatible') {
    return openaiCompatibleChatCompletion(options);
  }
  if (BACKEND === 'zai-sdk') {
    try {
      return await zaiSdkChatCompletion(options);
    } catch (sdkError: any) {
      console.warn('[AI Client] z-ai SDK failed, falling back to CLI:', sdkError.message);
      try {
        return await zaiCliChatCompletion(options);
      } catch (cliError: any) {
        throw new Error('All AI backends failed. SDK: ' + sdkError.message + ' | CLI: ' + cliError.message);
      }
    }
  }
  return zaiCliChatCompletion(options);
}

/**
 * Check which AI backend is currently active.
 */
export function getAIBackend(): { name: string; isAvailable: boolean; keyCount?: number } {
  if (BACKEND === 'openai-compatible') {
    const baseUrl = resolveBaseUrl();
    const model = process.env.OPENAI_MODEL || 'deepseek-ai/deepseek-v4-pro';
    return { name: `OpenAI-compatible (${baseUrl}, model: ${model})`, isAvailable: true, keyCount: keyRotator.count };
  }
  if (BACKEND === 'zai-sdk') {
    return { name: 'z-ai SDK (HTTP API)', isAvailable: true };
  }
  return { name: 'z-ai CLI', isAvailable: fs.existsSync(ZAI_BINARY === 'z-ai' ? '/usr/local/bin/z-ai' : ZAI_BINARY) };
}
