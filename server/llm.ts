/**
 * LLM client + prompt assembly. The API key stays server-side; the browser
 * only ever talks to our API.
 *
 * Prompt structure (spec: #3):
 *   system  = rules from content/AGENTS.md + output JSON contract
 *   user    = tone template + 2 few-shot examples + the structured draft
 * Output must parse as { topLevelPost, threadReply, gaps[] } or we fail the
 * request — malformed model output is surfaced as a retryable error.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DraftContent, Tone } from '../src/types.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const LLM_BASE_URL = process.env.LLM_BASE_URL ?? ''
const LLM_API_KEY = process.env.LLM_API_KEY ?? ''
const LLM_MODEL = process.env.LLM_MODEL ?? ''

// content/ is copied to the runtime image root; in dev it is two levels up.
function contentRoot(): string {
  const fromImage = path.join(__dirname, '..', 'content')
  if (fs.existsSync(fromImage)) return fromImage
  return path.join(__dirname, '..', '..', 'content')
}

export interface GenerationResult {
  topLevelPost: string
  threadReply: string
  gaps: { field: string; message: string }[]
}

export function llmConfigured(): boolean {
  return Boolean(LLM_BASE_URL && LLM_MODEL)
}

export async function llmStatus(): Promise<{ configured: boolean; model: string; reachable: boolean }> {
  if (!llmConfigured()) return { configured: false, model: LLM_MODEL, reachable: false }
  try {
    const res = await fetch(`${LLM_BASE_URL.replace(/\/$/, '')}/models`, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(5000),
    })
    return { configured: true, model: LLM_MODEL, reachable: res.ok }
  } catch {
    return { configured: true, model: LLM_MODEL, reachable: false }
  }
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'content-type': 'application/json' }
  if (LLM_API_KEY) h.authorization = `Bearer ${LLM_API_KEY}`
  return h
}

function readAsset(...parts: string[]): string {
  return fs.readFileSync(path.join(contentRoot(), ...parts), 'utf8')
}

/** Best-effort: few-shot examples are optional (content/examples/ is gitignored). */
function readExamples(files: string[]): string {
  const parts: string[] = []
  for (const f of files) {
    try {
      parts.push(`--- example: ${f} ---\n${readAsset(f)}`)
    } catch {
      // absent file (clean clone / in-cluster build): degrade to no examples
    }
  }
  return parts.join('\n\n')
}

const TONE_FILE: Record<Tone, string> = {
  serious: 'templates/serious.md',
  'fun-quirky': 'templates/fun-quirky.md',
  concise: 'templates/concise.md',
}

// Example shapes per tone, matching content/AGENTS.md's example index.
const FEW_SHOT: Record<Tone, string[]> = {
  serious: ['examples/002.md', 'examples/004.md'],
  'fun-quirky': ['examples/008.md', 'examples/005.md'],
  concise: ['examples/004.md', 'examples/002.md'],
}

/** Runtime guard for the JSONB draft read from Postgres (external data). */
export function isDraftContent(value: unknown): value is DraftContent {
  if (typeof value !== 'object' || value === null) return false
  const d = value as Record<string, unknown>
  return (
    'basics' in d && typeof d.basics === 'object' && d.basics !== null &&
    Array.isArray(d.links) &&
    Array.isArray(d.whyItMatters) &&
    Array.isArray(d.quotes) &&
    Array.isArray(d.resources) &&
    typeof d.cta === 'string' &&
    typeof d.contact === 'string' &&
    typeof d.notes === 'string'
  )
}

export function buildPrompt(tone: Tone, draft: DraftContent): { system: string; user: string } {
  const rules = readAsset('AGENTS.md')
  const template = readAsset(TONE_FILE[tone])
  const examples = readExamples(FEW_SHOT[tone])

  const system = [
    'You write internal product-promotion announcements for Slack.',
    'Follow these rules exactly:',
    rules,
    'Respond with ONLY a JSON object, no markdown fences, shaped:',
    '{"topLevelPost": string, "threadReply": string, "gaps": [{"field": string, "message": string}]}',
    'topLevelPost and threadReply are paste-ready Slack messages (mrkdwn, :emoji: codes).',
    'gaps lists facts the draft is missing (dates, links, quotes) — never invent them.',
    'If the draft is missing facts, do NOT refuse: still write both parts using the available facts, put TBD markers where facts are absent, and list every missing fact in gaps.',
  ].join('\n\n')

  const user = [
    `TONE: ${tone}`,
    `TEMPLATE (fill its structure):\n${template}`,
    `EXAMPLES of good output for this shape:\n${examples}`,
    `DRAFT (the only source of facts):\n${JSON.stringify(draft, null, 2)}`,
  ].join('\n\n')

  return { system, user }
}

export async function generateAnnouncement(tone: Tone, draft: DraftContent): Promise<GenerationResult> {
  if (!llmConfigured()) {
    throw Object.assign(new Error('LLM not configured: set LLM_BASE_URL, LLM_API_KEY, LLM_MODEL'), { status: 503 })
  }
  const { system, user } = buildPrompt(tone, draft)
  // Qwen3 still reasoned ~10K tokens despite the /no_think soft switch
  // (measured: 187s); chat_template_kwargs is the hard switch (measured: 4s).
  const systemNoThink = '/no_think\n\n' + system

  const res = await fetch(`${LLM_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: systemNoThink },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      chat_template_kwargs: { enable_thinking: false },
    }),
    signal: AbortSignal.timeout(300_000),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw Object.assign(new Error(`LLM request failed: ${res.status} ${body.slice(0, 200)}`), { status: 502 })
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const message = data.choices?.[0]?.message
  const raw = (message && typeof message === 'object' && 'content' in message ? message.content : undefined) ?? ''
  const reasoning = (message && typeof message === 'object' && 'reasoning_content' in message ? message.reasoning_content : undefined) ?? ''
  const content = typeof raw === 'string' && raw.trim() ? raw : typeof reasoning === 'string' ? reasoning : ''
  if (!content.trim()) throw Object.assign(new Error('LLM returned no content'), { status: 502 })

  return parseGeneration(content)
}

export function parseGeneration(content: string): GenerationResult {
  // Tolerate leaked <think…> blocks and ``` fences despite instructions.
  const stripped = content
    .replace(/<think[\s\S]*?<\/think>/gi, '')
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim()
  let parsed: unknown
  try {
    parsed = JSON.parse(stripped)
  } catch {
    throw Object.assign(new Error('LLM output was not valid JSON'), { status: 502 })
  }
  const { topLevelPost, threadReply, gaps } = parsed as Record<string, unknown>
  if (typeof topLevelPost !== 'string' || typeof threadReply !== 'string' || !Array.isArray(gaps)) {
    throw Object.assign(new Error('LLM output missing required fields'), { status: 502 })
  }
  const cleanGaps = (gaps as unknown[]).filter(
    (g): g is { field: string; message: string } =>
      typeof g === 'object' && g !== null &&
      typeof (g as { field?: unknown }).field === 'string' &&
      typeof (g as { message?: unknown }).message === 'string',
  )
  return { topLevelPost, threadReply, gaps: cleanGaps }
}
