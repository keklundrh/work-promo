import { useSyncExternalStore } from 'react'
import type { PromotionItem } from './types'
import { type StorageAdapter, detectStorage } from './storage'

let adapter: StorageAdapter | null = null
let user: string | null = null
let items: PromotionItem[] = []
let loaded = false
let bootStarted = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

async function boot() {
  bootStarted = true
  const found = await detectStorage()
  adapter = found.adapter
  user = found.user
  items = await adapter.listItems()
  loaded = true
  emit()
}

export function currentUser(): string | null {
  return user
}

export function useItems(): { items: PromotionItem[]; loaded: boolean } {
  const snapshot = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => items,
  )
  if (!bootStarted) void boot()
  return { items: snapshot, loaded }
}

export async function getAdapter(): Promise<StorageAdapter> {
  if (!bootStarted) await boot()
  while (!adapter) await new Promise((r) => setTimeout(r, 20))
  return adapter
}

export async function upsertItem(item: PromotionItem) {
  const a = await getAdapter()
  await a.saveItem(item)
  items = await a.listItems()
  emit()
}

export async function removeItem(id: string) {
  const a = await getAdapter()
  await a.deleteItem(id)
  items = await a.listItems()
  emit()
}
