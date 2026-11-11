/** A single promotion item tracked through the queue. */
export interface PromotionItem {
  id: string
  title: string
  status: ItemStatus
  owner: string
  /** Target posting date, ISO yyyy-mm-dd or empty. */
  targetDate: string
  createdAt: string
  updatedAt: string
  /** Slack post URL, required to leave `ready` (finalize). */
  slackUrl: string
  draft: DraftContent
}

export type ItemStatus = 'pending' | 'draft' | 'ready' | 'done'

/** Mirrors content/drafts/00-draft-template.md section for section. */
export interface DraftContent {
  basics: { productName: string; oneLineSummary: string; announcementDate: string; audience: string; tone: Tone | '' }
  links: LinkRow[]
  whyItMatters: string[]
  quotes: { text: string; attribution: string }[]
  resources: string[]
  cta: string
  contact: string
  notes: string
}

export type Tone = 'serious' | 'fun-quirky' | 'concise'

export interface LinkRow {
  label: string
  url: string
  audience: 'customer-facing' | 'internal' | 'partner' | ''
  emoji: string
}
