import type { PromotionItem } from './types'

/**
 * Storage boundary for the app. The UI never talks to a backend directly.
 * Two implementations ship: HttpStorageAdapter (Postgres via the thin API,
 * per the Storage decision in #2) and LocalStorageAdapter (in-browser,
 * offline fallback). Selection is runtime: /api/whoami answering means the
 * backend is present.
 */
export interface StorageAdapter {
  listItems(): Promise<PromotionItem[]>
  getItem(id: string): Promise<PromotionItem | undefined>
  saveItem(item: PromotionItem): Promise<void>
  deleteItem(id: string): Promise<void>
}

const KEY = 'work-promo.items.v1'

/** In-browser persistence. Functional stand-in when no API backend is reachable. */
export class LocalStorageAdapter implements StorageAdapter {
  async listItems(): Promise<PromotionItem[]> {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const items = JSON.parse(raw) as PromotionItem[]
    if (!Array.isArray(items)) return []
    return items
  }

  async getItem(id: string): Promise<PromotionItem | undefined> {
    const items = await this.listItems()
    return items.find((i) => i.id === id)
  }

  async saveItem(item: PromotionItem): Promise<void> {
    const items = await this.listItems()
    const idx = items.findIndex((i) => i.id === item.id)
    if (idx >= 0) items[idx] = item
    else items.push(item)
    localStorage.setItem(KEY, JSON.stringify(items))
  }

  async deleteItem(id: string): Promise<void> {
    const items = await this.listItems()
    localStorage.setItem(KEY, JSON.stringify(items.filter((i) => i.id !== id)))
  }
}

/** Postgres-backed storage through the thin API in server/index.ts. */
export class HttpStorageAdapter implements StorageAdapter {
  async listItems(): Promise<PromotionItem[]> {
    const res = await fetch('/api/items')
    if (!res.ok) throw new Error(`list failed: ${res.status}`)
    return (await res.json()) as PromotionItem[]
  }

  async getItem(id: string): Promise<PromotionItem | undefined> {
    const res = await fetch(`/api/items/${id}`)
    if (res.status === 404) return undefined
    if (!res.ok) throw new Error(`get failed: ${res.status}`)
    return (await res.json()) as PromotionItem
  }

  async saveItem(item: PromotionItem): Promise<void> {
    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(item),
    })
    if (!res.ok) throw new Error(`save failed: ${res.status}`)
  }

  async deleteItem(id: string): Promise<void> {
    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) throw new Error(`delete failed: ${res.status}`)
  }
}

/** Runtime adapter selection: use the API when the backend answers, else local. */
export async function detectStorage(): Promise<{ adapter: StorageAdapter; user: string | null }> {
  try {
    const res = await fetch('/api/whoami')
    if (res.ok) {
      const { user } = (await res.json()) as { user: string }
      return { adapter: new HttpStorageAdapter(), user }
    }
  } catch {
    // fall through to local
  }
  return { adapter: new LocalStorageAdapter(), user: null }
}
