import { useSyncExternalStore } from 'react'
import type { PromotionItem } from './types'
import { storage } from './storage'

let items: PromotionItem[] = []
let loaded = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

async function refresh() {
  items = await storage.listItems()
  loaded = true
  emit()
}

export function useItems(): { items: PromotionItem[]; loaded: boolean } {
  const snapshot = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => loaded,
  )
  if (!loaded) void refresh()
  return { items, loaded: snapshot && loaded }
}

export async function upsertItem(item: PromotionItem) {
  await storage.saveItem(item)
  await refresh()
}

export async function removeItem(id: string) {
  await storage.deleteItem(id)
  await refresh()
}
