/**
 * Thin API backend: storage adapter over Postgres + identity from the
 * OpenShift OAuth proxy. Serves the built SPA in production.
 *
 * Auth model (decided in #2): the proxy authenticates and injects the user
 * header; the API trusts it and does no account management. Owner fields are
 * stamped server-side from that header.
 */
import express from 'express'
import pg from 'pg'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateAnnouncement, llmStatus } from './llm.ts'
import type { DraftContent, Tone } from '../src/types.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PGHOST = process.env.PGHOST ?? 'localhost'
const PGPORT = Number(process.env.PGPORT ?? 5432)
const PGDATABASE = process.env.PGDATABASE ?? 'workpromo'
const PGUSER = process.env.PGUSER ?? 'workpromo'
const PGPASSWORD = process.env.PGPASSWORD ?? 'workpromo'
const PORT = Number(process.env.PORT ?? 8080)
// Header the OAuth proxy sets. Configurable so local runs can fake it.
const USER_HEADER = process.env.USER_HEADER ?? 'x-forwarded-user'

const pool = new pg.Pool({ host: PGHOST, port: PGPORT, database: PGDATABASE, user: PGUSER, password: PGPASSWORD })

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS promotion_items (
      id UUID PRIMARY KEY,
      doc JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
}

const app = express()
app.use(express.json({ limit: '2mb' }))

const LOCAL_USER = process.env.LOCAL_USER ?? ''

function currentUser(req: express.Request): string {
  const header = req.header(USER_HEADER)
  if (header) return header
  // Local/compose runs have no OAuth proxy; LOCAL_USER names the dev user.
  // Never set it in-cluster — without the header the proxy path must 401.
  if (LOCAL_USER) return LOCAL_USER
  const err = new Error('unauthenticated') as Error & { status?: number }
  err.status = 401
  throw err
}

const api = express.Router()

api.get('/whoami', (req, res) => {
  res.json({ user: currentUser(req) })
})

api.get('/items', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT doc FROM promotion_items ORDER BY doc->>\'updatedAt\' DESC')
    res.json(rows.map((r) => r.doc))
  } catch (e) {
    next(e)
  }
})

api.get('/items/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT doc FROM promotion_items WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'not found' })
    res.json(rows[0].doc)
  } catch (e) {
    next(e)
  }
})
api.get('/llm/status', async (_req, res, next) => {
  try {
    res.json(await llmStatus())
  } catch (e) {
    next(e)
  }
})

api.post('/items/:id/generate', async (req, res, next) => {
  try {
    currentUser(req)
    const { rows } = await pool.query('SELECT doc FROM promotion_items WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'not found' })
    const item = rows[0].doc
    if (typeof item !== 'object' || item === null || !('draft' in item)) {
      return res.status(400).json({ error: 'item has no draft' })
    }
    const draft: unknown = item.draft
    if (typeof draft !== 'object' || draft === null) {
      return res.status(400).json({ error: 'item has no draft' })
    }

    // Tone: request body overrides the draft's stored tone; default serious.
    let tone: Tone = 'serious'
    const requested = req.body ?? {}
    if ('tone' in requested && typeof requested.tone === 'string') {
      if (requested.tone === 'fun-quirky' || requested.tone === 'concise' || requested.tone === 'serious') {
        tone = requested.tone
      }
    } else if (
      'basics' in draft &&
      typeof draft.basics === 'object' &&
      draft.basics !== null &&
      'tone' in draft.basics &&
      typeof draft.basics.tone === 'string'
    ) {
      const stored = draft.basics.tone
      if (stored === 'fun-quirky' || stored === 'concise') tone = stored
    }

    const result = await generateAnnouncement(tone, draft as DraftContent)
    const generatedAt = new Date().toISOString()
    const updated = { ...item, generated: { ...result, tone, generatedAt }, updatedAt: generatedAt }
    await pool.query(
      `INSERT INTO promotion_items (id, doc) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET doc = $2, updated_at = now()`,
      [req.params.id, JSON.stringify(updated)],
    )
    res.json(updated.generated)
  } catch (e) {
    next(e)
  }
})

api.put('/items/:id', async (req, res, next) => {
  try {
    const user = currentUser(req)
    const doc = req.body
    if (!doc || doc.id !== req.params.id) return res.status(400).json({ error: 'id mismatch' })
    // Server stamps owner from the proxy identity, never the client.
    doc.owner = user
    await pool.query(
      `INSERT INTO promotion_items (id, doc) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET doc = $2, updated_at = now()`,
      [doc.id, JSON.stringify(doc)],
    )
    res.json(doc)
  } catch (e) {
    next(e)
  }
})

api.delete('/items/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM promotion_items WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (e) {
    next(e)
  }
})

app.use('/api', api)

// Express 5: named wildcards only; serve the SPA for everything else
const dist = path.join(__dirname, '..', 'public')
app.use(express.static(dist))
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'))
})

app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err.status ?? 500).json({ error: err.message })
})

await migrate()
app.listen(PORT, () => {
  console.log(`work-promo API listening on :${PORT} (user header: ${USER_HEADER})`)
})
