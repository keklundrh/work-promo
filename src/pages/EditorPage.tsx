import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ActionGroup,
  Alert,
  AlertGroup,
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextArea,
  TextInput,
  Title,
} from '@patternfly/react-core'
import { TrashIcon } from '@patternfly/react-icons/dist/esm/icons/trash-icon'
import type { DraftContent, LinkRow, PromotionItem, Tone } from '../types'
import type { GateGap } from '../model'
import { checkReadyGate } from '../model'
import { getAdapter, upsertItem } from '../store'
import { StatusLabel } from '../components/StatusLabel'

const FIELD_LABELS: Record<string, string> = {
  'basics.productName': 'Basics → Product / asset name',
  'basics.oneLineSummary': 'Basics → One-line summary',
  links: 'Links',
  cta: 'Call to action',
  contact: 'Contact',
  _tbd: 'TBD placeholders',
}

const TONES: Tone[] = ['serious', 'fun-quirky', 'concise']

function JumpLink({ field }: { field: string }) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault()
        document.getElementById(`field-${field.replace('.', '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        document.getElementById(`field-${field.replace('.', '-')}`)?.focus()
      }}
    >
      go to field
    </a>
  )
}

export default function EditorPage() {
  const { id } = useParams()
  const [item, setItem] = useState<PromotionItem | null>(null)
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [gateOpen, setGateOpen] = useState(false)
  const [gaps, setGaps] = useState<GateGap[]>([])
  const [promoteOpen, setPromoteOpen] = useState(false)
  const [slackUrl, setSlackUrl] = useState('')
  const [slackError, setSlackError] = useState('')
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    void getAdapter()
      .then((a) => a.getItem(id))
      .then((it: PromotionItem | undefined) => {
        if (!cancelled) {
          if (it) setItem(it)
          else setMissing(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])


  // Dirty-guard: warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  if (missing) {
    return (
      <Alert variant="warning" title="Item not found">
        <Link to="/">Back to the queue</Link>
      </Alert>
    )
  }
  if (!item) return <p>Loading…</p>

  function patchDraft(patch: Partial<DraftContent>) {
    if (!item) return
    setItem({ ...item, draft: { ...item.draft, ...patch } })
    setDirty(true)
  }


  async function handleSave(statusAfterSave?: PromotionItem['status']) {
    if (!item) return
    const toSave = { ...item, updatedAt: new Date().toISOString() }
    if (statusAfterSave) toSave.status = statusAfterSave
    await upsertItem(toSave)
    setItem(toSave)
    setDirty(false)
    setSavedAt(new Date().toLocaleTimeString())
  }

  function runGate() {
    if (!item) return
    const found = checkReadyGate(item)
    setGaps(found)
    setGateOpen(true)
  }

  async function confirmReady() {
    // Re-check at confirm time; only pass when zero gaps
    if (!item) return
    const found = checkReadyGate(item)
    if (found.length > 0) {
      setGaps(found)
      return
    }
    setGateOpen(false)
    await handleSave('ready')
  }

  function openPromote() {
    setSlackUrl(item?.slackUrl ?? '')
    setSlackError('')
    setPromoteOpen(true)
  }

  async function confirmPromote() {
    if (!item) return
    const url = slackUrl.trim()
    if (!/^https:\/\/(slack\.com|.*\.slack\.com)\/archives\/\w+\/p\d+$/.test(url)) {
      setSlackError('Enter a valid Slack message URL (https://…slack.com/archives/…/p…) or "ready" cannot become "done".')
      return
    }
    const done = { ...item, slackUrl: url, updatedAt: new Date().toISOString() }
    await upsertItem(done)
    setItem(done)
    setDirty(false)
    setSavedAt(new Date().toLocaleTimeString())
    setPromoteOpen(false)
  }

  function updateBasics(patch: Partial<DraftContent['basics']>) {
    if (!item) return
    patchDraft({ basics: { ...item.draft.basics, ...patch } })
  }

  function updateLinks(patch: LinkRow[]) {
    patchDraft({ links: patch })
  }

  function updateList(field: 'whyItMatters' | 'resources', values: string[]) {
    patchDraft({ [field]: values } as Partial<DraftContent>)
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/">← Queue</Link>
        <Title headingLevel="h1" size="xl">
          {item.title}
        </Title>
        <StatusLabel status={item.status} />
        {dirty ? (
          <span style={{ color: 'var(--pf-t--global--text--color--status--warning--default)' }}>● Unsaved changes</span>
        ) : savedAt ? (
          <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>✓ Saved {savedAt}</span>
        ) : null}
        <span style={{ flex: 1 }} />
        <Button variant="secondary" onClick={() => handleSave()} isDisabled={!dirty}>
          Save
        </Button>
        {item.status === 'ready' ? (
          <Button variant="primary" onClick={openPromote}>
            Promote (add Slack URL)
          </Button>
        ) : (
          <Button variant="primary" onClick={runGate}>
            Ready to promote
          </Button>
        )}
      </div>

      {gateOpen && (
        <AlertGroup style={{ marginTop: '1rem' }}>
          {gaps.length === 0 ? (
            <Alert
              variant="success"
              title="All checks pass"
              actionClose={
                <Button variant="primary" onClick={confirmReady}>
                  Confirm ready
                </Button>
              }
            >
              The draft meets the ready gate. Confirm to mark it <strong>Ready</strong>.
            </Alert>
          ) : (
            <Alert variant="danger" title={`${gaps.length} gap${gaps.length > 1 ? 's' : ''} before this can be ready`}>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {gaps.map((g, i) => (
                  <li key={i}>
                    {FIELD_LABELS[g.field] ?? g.field}: {g.message} <JumpLink field={g.field} />
                  </li>
                ))}
              </ul>
            </Alert>
          )}
        </AlertGroup>
      )}

      <Form style={{ marginTop: '1.5rem', maxWidth: '56rem' }}>
        <h3>Basics</h3>
        <FormGroup label="Product / asset name" isRequired fieldId="field-basics-productName">
          <TextInput
            id="field-basics-productName"
            value={item.draft.basics.productName}
            onChange={(_e, v) => updateBasics({ productName: v })}
          />
        </FormGroup>
        <FormGroup label="One-line summary" isRequired fieldId="field-basics-oneLineSummary">
          <TextInput
            id="field-basics-oneLineSummary"
            value={item.draft.basics.oneLineSummary}
            onChange={(_e, v) => updateBasics({ oneLineSummary: v })}
          />
        </FormGroup>
        <FormGroup label="Announcement date" fieldId="field-basics-announcementDate">
          <TextInput
            id="field-basics-announcementDate"
            type="date"
            value={item.draft.basics.announcementDate}
            onChange={(_e, v) => updateBasics({ announcementDate: v })}
          />
        </FormGroup>
        <FormGroup label="Audience" fieldId="field-basics-audience">
          <TextInput
            id="field-basics-audience"
            placeholder="e.g. Sales Specialists, AI BU, partners"
            value={item.draft.basics.audience}
            onChange={(_e, v) => updateBasics({ audience: v })}
          />
        </FormGroup>
        <FormGroup label="Tone" fieldId="field-basics-tone">
          <select
            id="field-basics-tone"
            value={item.draft.basics.tone}
            onChange={(e) => updateBasics({ tone: e.target.value as Tone })}
          >
            <option value="">— pick at generation time —</option>
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormGroup>

        <h3>Links</h3>
        {item.draft.links.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FormGroup label="Label" fieldId={`field-links-${i}-label`}>
              <TextInput
                id={`field-links-${i}-label`}
                value={l.label}
                onChange={(_e, v) => updateLinks(item.draft.links.map((x, j) => (j === i ? { ...x, label: v } : x)))}
              />
            </FormGroup>
            <FormGroup label="URL" fieldId={`field-links-${i}-url`}>
              <TextInput
                id={`field-links-${i}-url`}
                value={l.url}
                onChange={(_e, v) => updateLinks(item.draft.links.map((x, j) => (j === i ? { ...x, url: v } : x)))}
              />
            </FormGroup>
            <FormGroup label="Audience" fieldId={`field-links-${i}-audience`}>
              <select
                id={`field-links-${i}-audience`}
                value={l.audience}
                onChange={(e) =>
                  updateLinks(
                    item.draft.links.map((x, j) => (j === i ? { ...x, audience: e.target.value as LinkRow['audience'] } : x)),
                  )
                }
              >
                <option value="">—</option>
                <option value="customer-facing">customer-facing</option>
                <option value="internal">internal</option>
                <option value="partner">partner</option>
              </select>
            </FormGroup>
            <FormGroup label="Emoji" fieldId={`field-links-${i}-emoji`}>
              <TextInput
                id={`field-links-${i}-emoji`}
                placeholder=":rocket:"
                value={l.emoji}
                onChange={(_e, v) => updateLinks(item.draft.links.map((x, j) => (j === i ? { ...x, emoji: v } : x)))}
              />
            </FormGroup>
            <Button
              variant="plain"
              aria-label="Remove link"
              onClick={() => updateLinks(item.draft.links.filter((_, j) => j !== i))}
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
        <ActionGroup>
          <Button variant="link" onClick={() => updateLinks([...item.draft.links, { label: '', url: '', audience: '', emoji: '' }])}>
            + Add link
          </Button>
        </ActionGroup>

        <h3>Why it matters</h3>
        {item.draft.whyItMatters.map((w, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
            <TextArea
              aria-label={`Benefit ${i + 1}`}
              value={w}
              onChange={(_e, v) => updateList('whyItMatters', item.draft.whyItMatters.map((x, j) => (j === i ? v : x)))}
            />
            <Button
              variant="plain"
              aria-label="Remove benefit"
              onClick={() => updateList('whyItMatters', item.draft.whyItMatters.filter((_, j) => j !== i))}
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
        <ActionGroup>
          <Button variant="link" onClick={() => updateList('whyItMatters', [...item.draft.whyItMatters, ''])}>
            + Add benefit
          </Button>
        </ActionGroup>

        <h3>Quotes</h3>
        {item.draft.quotes.map((q, i) => (
          <div key={i} style={{ borderLeft: '3px solid var(--pf-t--global--border--color--default)', paddingLeft: '0.75rem' }}>
            <TextArea
              aria-label={`Quote ${i + 1}`}
              placeholder="Verbatim quote"
              value={q.text}
              onChange={(_e, v) =>
                patchDraft({ quotes: item.draft.quotes.map((x, j) => (j === i ? { ...x, text: v } : x)) })
              }
            />
            <TextInput
              aria-label={`Attribution ${i + 1}`}
              placeholder="— Name, Title"
              value={q.attribution}
              onChange={(_e, v) =>
                patchDraft({ quotes: item.draft.quotes.map((x, j) => (j === i ? { ...x, attribution: v } : x)) })
              }
            />
            <Button
              variant="plain"
              aria-label="Remove quote"
              onClick={() => patchDraft({ quotes: item.draft.quotes.filter((_, j) => j !== i) })}
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
        <ActionGroup>
          <Button variant="link" onClick={() => patchDraft({ quotes: [...item.draft.quotes, { text: '', attribution: '' }] })}>
            + Add quote
          </Button>
        </ActionGroup>

        <h3>Resources</h3>
        {item.draft.resources.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
            <TextInput
              aria-label={`Resource ${i + 1}`}
              value={r}
              onChange={(_e, v) => updateList('resources', item.draft.resources.map((x, j) => (j === i ? v : x)))}
            />
            <Button
              variant="plain"
              aria-label="Remove resource"
              onClick={() => updateList('resources', item.draft.resources.filter((_, j) => j !== i))}
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
        <ActionGroup>
          <Button variant="link" onClick={() => updateList('resources', [...item.draft.resources, ''])}>
            + Add resource
          </Button>
        </ActionGroup>

        <h3>Call to action</h3>
        <FormGroup fieldId="field-cta">
          <TextArea id="field-cta" value={item.draft.cta} onChange={(_e, v) => patchDraft({ cta: v })} />
        </FormGroup>

        <h3>Contact</h3>
        <FormGroup fieldId="field-contact">
          <TextInput id="field-contact" value={item.draft.contact} onChange={(_e, v) => patchDraft({ contact: v })} />
        </FormGroup>

        <h3>Notes for the AI</h3>
        <FormGroup fieldId="field-notes">
          <TextArea id="field-notes" value={item.draft.notes} onChange={(_e, v) => patchDraft({ notes: v })} />
        </FormGroup>
      </Form>

      <Modal isOpen={promoteOpen} onClose={() => setPromoteOpen(false)} variant="small">
        <ModalHeader title="Promote — link the Slack post" />
        <ModalBody>
          <FormGroup label="Slack post URL" isRequired fieldId="promote-slack-url">
            <TextInput id="promote-slack-url" value={slackUrl} onChange={(_e, v) => setSlackUrl(v)} />
          </FormGroup>
          {slackError && <Alert variant="danger" title={slackError} isInline />}
          <p style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
            Promoted items require the URL of the Slack posting to be considered done.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button key="promote" variant="primary" onClick={confirmPromote}>
            Finalize as Done
          </Button>
          <Button key="cancel" variant="link" onClick={() => setPromoteOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
