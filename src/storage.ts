import type { PromotionItem } from './types'

/**
 * Storage boundary for the app. The UI never talks to a backend directly.
 * v1 ships the in-browser implementation; Postgres lands behind this same
 * interface once the Storage decision in #2 is ticked.
 */
export interface StorageAdapter {
  listItems(): Promise<PromotionItem[]>
  getItem(id: string): Promise<PromotionItem | undefined>
  saveItem(item: PromotionItem): Promise<void>
  deleteItem(id: string): Promise<void>
}

const KEY = 'work-promo.items.v1'

/** In-browser persistence. Functional stand-in for the future Postgres adapter. */
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

export const storage: StorageAdapter = new LocalStorageAdapter()
