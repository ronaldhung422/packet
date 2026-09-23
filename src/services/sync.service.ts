import { supabase, setupRealtimeSync, isSupabaseConfigured } from '../lib/supabase'
import { Place } from '../types'
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage'
import toast from 'react-hot-toast'

const LOCAL_CHANGES_KEY = 'packet_pending_changes'
const LAST_SYNC_KEY = 'packet_last_sync'

type SyncChange =
  | { type: 'create' | 'update'; place: Place; timestamp: string }
  | { type: 'delete'; place: { id: string }; timestamp: string }

export class SyncService {
  private pairCode: string | null = null
  private pendingChanges: SyncChange[] = loadFromLocalStorage<SyncChange[]>(LOCAL_CHANGES_KEY) || []
  private syncInProgress = false
  private realtimeChannel: ReturnType<typeof setupRealtimeSync> | null = null

  constructor() {
    window.addEventListener('online', () => {
      void this.trySync()
    })
  }

  async initialize(pairCode: string): Promise<void> {
    this.pairCode = pairCode
    if (!isSupabaseConfigured()) return

    if (!this.realtimeChannel) {
      this.realtimeChannel = setupRealtimeSync(pairCode, payload => this.handleRemoteChange(payload))
    }

    await this.fullSync()
    await this.trySync()
  }

  async ensurePair(pairCode: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true

    const { error } = await supabase.from('pairs').upsert(
      { pair_code: pairCode, is_active: true, last_sync: new Date().toISOString() },
      { onConflict: 'pair_code' }
    )

    if (error) {
      console.error('Pair setup failed:', error)
      return false
    }

    return true
  }

  queueChange(change: Omit<SyncChange, 'timestamp'>): void {
    this.pendingChanges.push({ ...change, timestamp: new Date().toISOString() } as SyncChange)
    saveToLocalStorage(LOCAL_CHANGES_KEY, this.pendingChanges)
    void this.trySync()
  }

  async trySync(): Promise<void> {
    if (!isSupabaseConfigured() || !navigator.onLine || !this.pairCode || this.syncInProgress || !this.pendingChanges.length) return

    this.syncInProgress = true
    const completed: SyncChange[] = []

    try {
      for (const change of this.pendingChanges) {
        if (change.type === 'delete') {
          const { error } = await supabase
            .from('places')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', change.place.id)
            .eq('pair_code', this.pairCode)
          if (error) throw error
        } else {
          const { error } = await supabase.from('places').upsert(this.toDatabase(change.place), { onConflict: 'id' })
          if (error) throw error
        }
        completed.push(change)
      }

      this.pendingChanges = this.pendingChanges.slice(completed.length)
      saveToLocalStorage(LOCAL_CHANGES_KEY, this.pendingChanges)
      saveToLocalStorage(LAST_SYNC_KEY, new Date().toISOString())
    } catch (error) {
      console.error('Sync failed:', error)
      if (completed.length) {
        this.pendingChanges = this.pendingChanges.slice(completed.length)
        saveToLocalStorage(LOCAL_CHANGES_KEY, this.pendingChanges)
      }
    } finally {
      this.syncInProgress = false
    }
  }

  async fullSync(): Promise<Place[] | null> {
    if (!isSupabaseConfigured() || !navigator.onLine || !this.pairCode) return null

    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('pair_code', this.pairCode)
      .is('deleted_at', null)
      .order('added_at', { ascending: false })

    if (error) {
      console.error('Full sync failed:', error)
      return null
    }

    const places = (data || []).map(row => this.fromDatabase(row))
    saveToLocalStorage('packet_places', places)
    saveToLocalStorage(LAST_SYNC_KEY, new Date().toISOString())
    document.dispatchEvent(new CustomEvent('places-updated', { detail: places }))
    return places
  }

  getStatus() {
    return {
      pendingChanges: this.pendingChanges.length,
      lastSync: loadFromLocalStorage<string>(LAST_SYNC_KEY),
      syncInProgress: this.syncInProgress
    }
  }

  cleanup(): void {
    if (this.realtimeChannel) {
      void supabase.removeChannel(this.realtimeChannel)
      this.realtimeChannel = null
    }
  }

  private handleRemoteChange(payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }): void {
    const current = loadFromLocalStorage<Place[]>('packet_places') || []
    const incoming = payload.eventType === 'DELETE' ? null : this.fromDatabase(payload.new)
    let next = current

    if (payload.eventType === 'INSERT' && incoming && !current.some(place => place.id === incoming.id)) {
      next = [...current, incoming]
    } else if (payload.eventType === 'UPDATE' && incoming) {
      next = current.some(place => place.id === incoming.id)
        ? current.map(place => place.id === incoming.id ? incoming : place)
        : [...current, incoming]
    } else if (payload.eventType === 'DELETE') {
      next = current.filter(place => place.id !== String(payload.old.id))
    }

    saveToLocalStorage('packet_places', next)
    document.dispatchEvent(new CustomEvent('places-updated', { detail: next }))
    if (payload.eventType !== 'UPDATE') toast.success('Shared places updated')
  }

  private toDatabase(place: Place) {
    return {
      id: place.id,
      pair_code: this.pairCode,
      name: place.name,
      description: place.description || null,
      link: place.link,
      extracted_from: place.extractedFrom || null,
      category: place.category,
      tags: place.tags,
      added_by: place.addedBy,
      added_at: place.addedAt,
      location: place.location || null,
      memories: place.memories,
      visited_at: place.visitedAt || null,
      rating: place.rating || null,
      notes: place.notes || null
    }
  }

  private fromDatabase(row: Record<string, any>): Place {
    return {
      id: String(row.id),
      name: row.name,
      description: row.description || undefined,
      link: row.link,
      extractedFrom: row.extracted_from || undefined,
      category: row.category,
      tags: row.tags || [],
      addedBy: row.added_by,
      addedAt: row.added_at,
      location: row.location || undefined,
      memories: row.memories || [],
      visitedAt: row.visited_at || undefined,
      rating: row.rating || undefined,
      notes: row.notes || undefined
    }
  }
}

export const syncService = new SyncService()
