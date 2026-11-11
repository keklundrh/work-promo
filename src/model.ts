import type { DraftContent, PromotionItem } from './types'

export function emptyDraft(): DraftContent {
  return {
    basics: { productName: '', oneLineSummary: '', announcementDate: '', audience: '', tone: '' },
    links: [],
    whyItMatters: [],
    quotes: [],
    resources: [],
    cta: '',
    contact: '',
    notes: '',
  }
}

export function newItem(title: string, targetDate: string, owner: string): PromotionItem {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title,
    status: 'pending',
    owner,
    targetDate,
    createdAt: now,
    updatedAt: now,
    slackUrl: '',
    draft: emptyDraft(),
  }
}

/** Ready-gate validation per #2: zero TBDs, primary link, CTA, contact. */
export interface GateGap {
  field: string
  message: string
}

export function checkReadyGate(item: PromotionItem): GateGap[] {
  const gaps: GateGap[] = []
  const d = item.draft

  if (!d.basics.productName.trim()) gaps.push({ field: 'basics.productName', message: 'Product / asset name is empty' })
  if (!d.basics.oneLineSummary.trim()) gaps.push({ field: 'basics.oneLineSummary', message: 'One-line summary is empty' })
  if (/\btbd\b/i.test(JSON.stringify(d))) gaps.push({ field: '_tbd', message: 'Draft still contains TBD placeholders' })

  const primary = d.links.find((l) => l.audience === 'customer-facing' && l.url.trim())
  if (!primary) gaps.push({ field: 'links', message: 'No customer-facing link (the primary link must be customer-facing)' })
  else {
    const noLabel = d.links.filter((l) => l.url.trim() && !l.label.trim())
    if (noLabel.length > 0) gaps.push({ field: 'links', message: 'Every link needs a label' })
  }

  if (!d.cta.trim()) gaps.push({ field: 'cta', message: 'Call to action is empty' })
  if (!d.contact.trim()) gaps.push({ field: 'contact', message: 'Contact is empty' })

  return gaps
}

