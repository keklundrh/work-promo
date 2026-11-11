import { useSyncExternalStore } from 'react'
import type { PromotionItem } from './types'
import { type StorageAdapter, detectStorage } from './storage'

let adapter: StorageAdapter | null = null
let user: string | null = null
let items: PromotionItem[] = []
let loaded = false
let bootPromise: Promise<void> | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function boot(): Promise<void> {
  if (!bootPromise) {
    bootPromise = (async () => {
      const found = await detectStorage()
      adapter = found.adapter
      user = found.user
      items = await adapter.listItems()
      loaded = true
      emit()
    })()
  }
  return bootPromise
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
  void boot()
  return { items: snapshot, loaded }
}

export async function getAdapter(): Promise<StorageAdapter> {
  await boot()
  return adapter!
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
