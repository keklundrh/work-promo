import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Label,
  Spinner,
  Title,
} from '@patternfly/react-core'
import CopyIcon from '@patternfly/react-icons/dist/esm/icons/copy-icon'
import type { Generated, Tone } from '../types'
import { getAdapter } from '../store'

const TONES: Tone[] = ['serious', 'fun-quirky', 'concise']

interface LlmStatus {
  configured: boolean
  model: string
  reachable: boolean
}

function CopyBlock({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Card isCompact>
      <CardHeader
        actions={{
          actions: (
            <>
              {copied && <Label color="green">Copied</Label>}
              <Button
                variant="control"
                icon={<CopyIcon />}
                onClick={async () => {
                  await navigator.clipboard.writeText(text)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                Copy
              </Button>
            </>
          ),
        }}
      >
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{text}</pre>
      </CardBody>
    </Card>
  )
}

export default function GenerationPage() {
  const { id } = useParams()
  const [item, setItem] = useState<{ title: string; draft: unknown; generated?: Generated; updatedAt: string } | null>(null)
  const [missing, setMissing] = useState(false)
  const [status, setStatus] = useState<LlmStatus | null>(null)
  const [tone, setTone] = useState<Tone>('serious')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    void getAdapter()
      .then((a) => a.getItem(id))
      .then(async (it) => {
        if (cancelled) return
        if (it) {
          setItem(it)
          if (it.draft.basics.tone) setTone(it.draft.basics.tone)
        } else {
          setMissing(true)
        }
      })
    void fetch('/api/llm/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((s: LlmStatus | null) => {
        if (!cancelled && s) setStatus(s)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [id])

  const generate = useCallback(async () => {
    if (!id || busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/items/${id}/generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tone }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? `generation failed (${res.status})`)
      }
      const generated = (await res.json()) as Generated
      setItem((prev) => (prev ? { ...prev, generated } : prev))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }, [id, tone, busy])

  if (missing) {
    return (
      <Alert variant="warning" title="Item not found">
        <Link to="/">Back to the queue</Link>
      </Alert>
    )
  }
  if (!item) return <Spinner aria-label="Loading item" />

  const stale = item.generated ? item.generated.generatedAt < item.updatedAt : false

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to={`/items/${id}`}>← Editor</Link>
        <Title headingLevel="h1" size="xl">
          {item.title}
        </Title>
        {item.generated && (
          <Label color="blue">Generated {new Date(item.generated.generatedAt).toLocaleString()}</Label>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0', flexWrap: 'wrap' }}>
        <label htmlFor="gen-tone" style={{ fontWeight: 600 }}>
          Tone
        </label>
        <select id="gen-tone" value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
          {TONES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Button variant="primary" onClick={generate} isDisabled={busy}>
          {busy ? 'Generating…' : item.generated ? 'Regenerate' : 'Generate announcement'}
        </Button>
        {busy && <Spinner size="md" aria-label="Generating announcement" />}
      </div>

      {/* Model / URI / key visibility: live status per spec #3 */}
      {status &&
        (status.configured ? (
          status.reachable ? (
            <Alert variant="info" title={`Model: ${status.model} — reachable`} isInline />
          ) : (
            <Alert
              variant="warning"
              title={`Model ${status.model} is configured but unreachable`}
              isInline
            >
              Check LLM_BASE_URL / LLM_API_KEY and that the Qwen route is up.
            </Alert>
          )
        ) : (
          <Alert variant="warning" title="LLM not configured" isInline>
            Set the three env vars on the app container: <code>LLM_BASE_URL</code>,{' '}
            <code>LLM_API_KEY</code>, <code>LLM_MODEL</code>.
          </Alert>
        ))}

      {stale && item.generated && (
        <Alert variant="warning" title="Draft modified since this was generated" isInline>
          Regenerate to pick up the latest draft content.
        </Alert>
      )}

      {error && (
        <Alert variant="danger" title="Generation failed" isInline>
          {error} — adjust and retry.
        </Alert>
      )}

      {item.generated ? (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '2fr 1fr', marginTop: '1rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <CopyBlock title="Top-level post" text={item.generated.topLevelPost} />
            <CopyBlock title="Thread reply" text={item.generated.threadReply} />
          </div>
          <Card isCompact>
            <CardTitle>Gaps ({item.generated.gaps.length})</CardTitle>
            <CardBody>
              {item.generated.gaps.length === 0 ? (
                <p>No gaps flagged — review by eye before posting.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {item.generated.gaps.map((g, i) => (
                    <li key={i}>
                      <strong>{g.field}</strong>: {g.message}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      ) : (
        <Alert variant="info" title="No announcement generated yet" isInline>
          Pick a tone and press Generate. The draft is the only source of facts.
        </Alert>
      )}
    </>
  )
}
