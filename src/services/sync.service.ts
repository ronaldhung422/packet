import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Place, PlaceCollection } from '../types'
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage'

type PlaceChange = { type: 'create' | 'update'; place: Place } | { type: 'delete'; place: { id: string } }
type CollectionChange = { type: 'create' | 'update'; collection: PlaceCollection } | { type: 'delete'; collection: { id: string } }
type Change = PlaceChange | CollectionChange
type Pending = Change & { operationId: string }
const QUEUE_KEY = 'packet_pending_changes'

export class SyncService {
  private collectionId: string | null = null
  private pending = (loadFromLocalStorage<Pending[]>(QUEUE_KEY) || []).map(change => ({
    ...change, operationId: change.operationId || crypto.randomUUID()
  }))
  private running: Promise<Place[] | null> | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private error: string | undefined

  constructor() {
    window.addEventListener('online', () => this.backgroundSync())
    window.addEventListener('focus', () => this.backgroundSync())
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.backgroundSync()
    })
  }

  isCloudConfigured() { return isSupabaseConfigured() }

  private async authenticate() {
    if (!isSupabaseConfigured()) throw new Error('雲端尚未設定 / Cloud is not configured')
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (!data.session) {
      const result = await supabase.auth.signInAnonymously()
      if (result.error) throw result.error
    }
  }

  async connect(code?: string): Promise<string> {
    await this.authenticate()
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user.id
    const priorUser = loadFromLocalStorage<string>('packet_sync_user')
    if (priorUser && userId && priorUser !== userId) {
      await supabase.auth.signOut()
      const result = await supabase.auth.signInAnonymously()
      if (result.error) throw result.error
    }
    const { data, error } = await supabase.rpc('packet_connect', { p_code: code?.trim().toLowerCase() || null })
    if (error) throw error
    const collection = data?.[0]
    if (!collection) throw new Error('無法開啟共享收藏 / Could not open collection')
    const previous = loadFromLocalStorage<string>('packet_collection_id')
    if (previous && previous !== collection.collection_id) {
      throw new Error('此裝置已連結其他收藏 / Device already linked to another collection')
    }
    this.collectionId = collection.collection_id
    saveToLocalStorage('packet_collection_id', this.collectionId)
    const { data: activeSession } = await supabase.auth.getSession()
    if (activeSession.session?.user.id) saveToLocalStorage('packet_sync_user', activeSession.session.user.id)
    if (!loadFromLocalStorage<boolean>(`packet_seeded_${this.collectionId}`)) {
      const local = loadFromLocalStorage<Place[]>('packet_places') || []
      const seeds: Pending[] = local.map(place => ({ type: 'create', place, operationId: crypto.randomUUID() }))
      this.pending = [...seeds, ...this.pending]
      this.persistQueue()
      saveToLocalStorage(`packet_seeded_${this.collectionId}`, true)
    }
    if (!this.timer) this.timer = setInterval(() => {
      if (!document.hidden) this.backgroundSync()
    }, 15000)
    return collection.invite_code
  }

  async initialize(code: string): Promise<void> {
    await this.connect(code)
    await this.fullSync()
  }

  queueChange(change: Change): void {
    this.pending.push({ ...change, operationId: crypto.randomUUID() })
    this.persistQueue()
    this.backgroundSync()
  }

  private persistQueue() { saveToLocalStorage(QUEUE_KEY, this.pending) }

  private backgroundSync() {
    void this.fullSync().catch(() => { /* retry on focus/reconnect */ })
  }

  fullSync(): Promise<Place[] | null> {
    if (this.running) return this.running
    if (!this.collectionId || !navigator.onLine) return Promise.resolve(null)
    this.running = this.exchange().catch(error => {
      this.error = error instanceof Error ? error.message : String(error.message || error)
      document.dispatchEvent(new CustomEvent('sync-error', { detail: this.error }))
      throw error
    }).finally(() => { this.running = null })
    return this.running
  }

  private async exchange(): Promise<Place[]> {
    while (this.pending.length) {
      const batch = this.pending.slice(0, 100)
      const { error } = await supabase.rpc('packet_apply', { p_collection: this.collectionId, p_changes: batch })
      if (error) throw error
      this.pending.splice(0, batch.length)
      this.persistQueue()
    }
    
    // Sync places
    const { data, error } = await supabase.from('packet_records').select('id,data,deleted').eq('collection_id', this.collectionId)
    if (error) throw error
    const merged = new Map<string, Place>()
    for (const row of data || []) {
      if (!row.deleted && row.data) merged.set(row.id, row.data as Place)
    }
    for (const change of this.pending) {
      if ('place' in change) {
        if (change.type === 'delete') merged.delete(change.place.id)
        else merged.set(change.place.id, change.place)
      }
    }
    const places = [...merged.values()]
    saveToLocalStorage('packet_places', places)
    
    // Sync collections
    const { data: collectionsData, error: collectionsError } = await supabase
      .from('packet_place_collections')
      .select('*')
      .eq('collection_id', this.collectionId)
    
    if (!collectionsError && collectionsData) {
      const collections: PlaceCollection[] = collectionsData.map(row => ({
        id: row.id,
        collectionId: row.collection_id,
        name: row.name,
        emoji: row.emoji,
        placeIds: [], // Will be computed from places
        displayOrder: row.display_order,
        createdBy: row.created_by as 'ronald' | 'kerry',
        createdAt: row.created_at,
        coverImage: row.cover_image
      }))
      saveToLocalStorage('packet_collections', collections)
      document.dispatchEvent(new CustomEvent('collections-updated', { detail: collections }))
    }
    
    saveToLocalStorage('packet_last_sync', new Date().toISOString())
    this.error = undefined
    document.dispatchEvent(new CustomEvent('places-updated', { detail: places }))
    return places
  }

  getStatus() {
    return {
      pendingChanges: this.pending.length,
      lastSync: loadFromLocalStorage<string>('packet_last_sync'),
      syncInProgress: Boolean(this.running),
      error: this.error
    }
  }

  cleanup(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    this.collectionId = null
  }
}

export const syncService = new SyncService()
