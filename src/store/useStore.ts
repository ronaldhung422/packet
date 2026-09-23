import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Place, AppState, Stats, SyncState, PlaceCollection, User } from '../types'
import { generatePairCode, saveToLocalStorage, loadFromLocalStorage } from '../utils/storage'
import { syncService } from '../services/sync.service'
import toast from 'react-hot-toast'

interface Store {
  // State
  places: Place[]
  collections: PlaceCollection[]
  currentUser: User
  appState: AppState
  syncState: SyncState
  stats: Stats
  
  // Actions
  initializeApp: () => void
  addPlace: (place: Omit<Place, 'id' | 'addedAt'>) => void
  updatePlace: (id: string, updates: Partial<Place>) => void
  deletePlace: (id: string) => void
  setCategory: (id: string, category: Place['category']) => void
  addMemory: (placeId: string, memoryText: string) => void
  pairWithPartner: (code: string) => Promise<boolean>
  generatePairCode: () => Promise<string>
  syncWithCloud: () => Promise<void>
  calculateStats: () => void
  resetApp: () => void
  
  // Collection Actions
  createCollection: (name: string, emoji: string) => void
  updateCollection: (id: string, updates: Partial<PlaceCollection>) => void
  deleteCollection: (id: string) => void
  addPlaceToCollection: (placeId: string, collectionId: string) => void
  removePlaceFromCollection: (placeId: string, collectionId: string) => void
  reorderCollections: (collectionIds: string[]) => void
  
  // User Actions
  setCurrentUser: (user: User) => void
  toggleLike: (placeId: string) => void
}

const initialAppState: AppState = {
  isPaired: false,
  pairCode: undefined,
  currentUser: undefined,
  partnerName: undefined,
  lastSync: new Date().toISOString(),
  offlineChanges: 0
}

const initialSyncState: SyncState = {
  isSyncing: false,
  lastSync: new Date().toISOString(),
  error: undefined,
  pendingChanges: 0
}

const createPlaceId = () => typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `place_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

const createCollectionId = () => typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `collection_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

// Get current user from localStorage or default to ronald
const getCurrentUser = (): User => {
  const stored = localStorage.getItem('packet_current_user')
  return (stored === 'kerry' ? 'kerry' : 'ronald') as User
}

// Default collections
const createDefaultCollections = (collectionId: string, user: User): PlaceCollection[] => [
  {
    id: createCollectionId(),
    collectionId,
    name: '全部',
    emoji: '📚',
    placeIds: [],
    displayOrder: 0,
    createdBy: user,
    createdAt: new Date().toISOString()
  },
  {
    id: createCollectionId(),
    collectionId,
    name: '想去',
    emoji: '✨',
    placeIds: [],
    displayOrder: 1,
    createdBy: user,
    createdAt: new Date().toISOString()
  },
  {
    id: createCollectionId(),
    collectionId,
    name: '去過',
    emoji: '✅',
    placeIds: [],
    displayOrder: 2,
    createdBy: user,
    createdAt: new Date().toISOString()
  },
  {
    id: createCollectionId(),
    collectionId,
    name: '最愛',
    emoji: '❤️',
    placeIds: [],
    displayOrder: 3,
    createdBy: user,
    createdAt: new Date().toISOString()
  }
]

const initialStats: Stats = {
  totalPlaces: 0,
  placesByCategory: {
    'want-to-try': 0,
    'been-there': 0,
    favorites: 0
  },
  placesByPerson: {
    ronald: 0,
    kerry: 0
  },
  recentAdditions: [],
  mostVisited: []
}

let placesEventListenerRegistered = false

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      places: [],
      collections: [],
      currentUser: getCurrentUser(),
      appState: initialAppState,
      syncState: initialSyncState,
      stats: initialStats,

      // Initialize app
      initializeApp: () => {
        const savedPlaces = loadFromLocalStorage<Place[]>('packet_places') || []
        const savedCollections = loadFromLocalStorage<PlaceCollection[]>('packet_collections')
        const savedAppState = loadFromLocalStorage<AppState>('packet_app_state') || initialAppState
        const currentUser = getCurrentUser()

        // Create default collections if none exist
        let collections = savedCollections
        if (!collections || collections.length === 0) {
          collections = createDefaultCollections('local', currentUser)
          saveToLocalStorage('packet_collections', collections)
        }

        set({ places: savedPlaces, collections, currentUser, appState: savedAppState })

        if (!placesEventListenerRegistered) {
          document.addEventListener('places-updated', event => {
            const syncedPlaces = (event as CustomEvent<Place[]>).detail
            const status = syncService.getStatus()
            useStore.setState(state => ({ places: syncedPlaces,
              syncState: { ...state.syncState, error: undefined, pendingChanges: status.pendingChanges, lastSync: status.lastSync || state.syncState.lastSync },
              appState: { ...state.appState, offlineChanges: status.pendingChanges, lastSync: status.lastSync || state.appState.lastSync }
            }))
            useStore.getState().calculateStats()
          })
          document.addEventListener('sync-error', event => {
            useStore.setState(state => ({ syncState: { ...state.syncState, error: (event as CustomEvent<string>).detail } }))
          })
          placesEventListenerRegistered = true
        }

        get().calculateStats()

        if (savedAppState.isPaired && savedAppState.pairCode && /^[a-f0-9]{32}$/i.test(savedAppState.pairCode)) {
          void syncService.initialize(savedAppState.pairCode).catch(error => {
            set({ syncState: { ...get().syncState, isSyncing: false, error: error.message || '同步失敗' } })
          })
        }
      },

      // Add a new place
      addPlace: (place) => {
        const newPlace: Place = {
          ...place,
          id: createPlaceId(),
          addedAt: new Date().toISOString()
        }

        set((state) => {
          const newPlaces = [...state.places, newPlace]
          saveToLocalStorage('packet_places', newPlaces)
          
          return {
            places: newPlaces,
            appState: {
              ...state.appState,
              offlineChanges: state.appState.offlineChanges + 1
            }
          }
        })

        get().calculateStats()
        syncService.queueChange({ type: 'create', place: newPlace })
        toast.success(`Added ${newPlace.name}`)
      },

      // Update a place
      updatePlace: (id, updates) => {
        set((state) => {
          const newPlaces = state.places.map(place => 
            place.id === id ? { ...place, ...updates } : place
          )
          saveToLocalStorage('packet_places', newPlaces)
          
          return {
            places: newPlaces,
            appState: {
              ...state.appState,
              offlineChanges: state.appState.offlineChanges + 1
            }
          }
        })

        get().calculateStats()
        const updatedPlace = get().places.find(place => place.id === id)
        if (updatedPlace) syncService.queueChange({ type: 'update', place: updatedPlace })
        toast.success('Place updated')
      },

      // Delete a place
      deletePlace: (id) => {
        set((state) => {
          const newPlaces = state.places.filter(place => place.id !== id)
          saveToLocalStorage('packet_places', newPlaces)
          
          return {
            places: newPlaces,
            appState: {
              ...state.appState,
              offlineChanges: state.appState.offlineChanges + 1
            }
          }
        })

        get().calculateStats()
        syncService.queueChange({ type: 'delete', place: { id } })
        toast.success('Place deleted')
      },

      // Set category for a place
      setCategory: (id, category) => {
        set((state) => {
          const newPlaces = state.places.map(place => 
            place.id === id ? { ...place, category } : place
          )
          saveToLocalStorage('packet_places', newPlaces)
          
          return {
            places: newPlaces,
            appState: {
              ...state.appState,
              offlineChanges: state.appState.offlineChanges + 1
            }
          }
        })

        get().calculateStats()
        const updatedPlace = get().places.find(place => place.id === id)
        if (updatedPlace) syncService.queueChange({ type: 'update', place: updatedPlace })
        toast.success('Category updated')
      },

      // Add memory to a place
      addMemory: (placeId, memoryText) => {
        const memory = {
          id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: memoryText,
          date: new Date().toISOString()
        }

        set((state) => {
          const newPlaces = state.places.map(place => 
            place.id === placeId 
              ? { ...place, memories: [...place.memories, memory] }
              : place
          )
          saveToLocalStorage('packet_places', newPlaces)
          
          return {
            places: newPlaces,
            appState: {
              ...state.appState,
              offlineChanges: state.appState.offlineChanges + 1
            }
          }
        })

        get().calculateStats()
        const updatedPlace = get().places.find(place => place.id === placeId)
        if (updatedPlace) syncService.queueChange({ type: 'update', place: updatedPlace })
        toast.success('Memory added')
      },

      pairWithPartner: async (code) => {
        try {
          if (!/^[a-f0-9]{32}$/i.test(code.trim())) throw new Error('請輸入新的 32 碼邀請碼 / Enter a new 32-character invitation')
          const invite = await syncService.connect(code)
          set(state => ({ appState: { ...state.appState, isPaired: true, pairCode: invite } }))
          saveToLocalStorage('packet_app_state', get().appState)
          await get().syncWithCloud()
          return true
        } catch (error) {
          toast.error(error instanceof Error ? error.message : '配對失敗 / Pairing failed')
          return false
        }
      },

      generatePairCode: async () => {
        const code = await syncService.connect()
        set(state => ({ appState: { ...state.appState, isPaired: true, pairCode: code } }))
        saveToLocalStorage('packet_app_state', get().appState)
        await get().syncWithCloud()
        return code
      },

      // Sync with cloud
      syncWithCloud: async () => {
        const { appState } = get()
        if (!appState.isPaired || !appState.pairCode) return

        set({ syncState: { ...get().syncState, isSyncing: true } })

        try {
          const places = await syncService.fullSync()
          if (!places) {
            set({ syncState: { ...get().syncState, isSyncing: false } })
            return
          }
          if (places) {
            set({ places })
            get().calculateStats()
          }
          
          set({
            syncState: {
              isSyncing: false,
              lastSync: new Date().toISOString(),
              error: undefined,
              pendingChanges: syncService.getStatus().pendingChanges
            },
            appState: {
              ...appState,
              offlineChanges: 0,
              lastSync: new Date().toISOString()
            }
          })
        } catch (error) {
          set({
            syncState: {
              ...get().syncState,
              isSyncing: false,
              error: 'Sync failed'
            }
          })
        }
      },

      // Calculate statistics
      calculateStats: () => {
        const { places } = get()
        
        const stats: Stats = {
          totalPlaces: places.length,
          placesByCategory: {
            'want-to-try': places.filter(p => p.category === 'want-to-try').length,
            'been-there': places.filter(p => p.category === 'been-there').length,
            favorites: places.filter(p => p.category === 'favorites').length
          },
          placesByPerson: {
            ronald: places.filter(p => p.discoveredBy === 'ronald').length,
            kerry: places.filter(p => p.discoveredBy === 'kerry').length
          },
          recentAdditions: [...places]
            .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
            .slice(0, 5),
          mostVisited: places
            .filter(p => p.visitedAt)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5)
        }

        set({ stats })
      },

      // Collection Actions
      createCollection: (name, emoji) => {
        const { currentUser, collections, appState } = get()
        
        const newCollection: PlaceCollection = {
          id: createCollectionId(),
          collectionId: appState.pairCode || 'local',
          name,
          emoji,
          placeIds: [],
          displayOrder: collections.length,
          createdBy: currentUser,
          createdAt: new Date().toISOString()
        }

        set(state => {
          const newCollections = [...state.collections, newCollection]
          saveToLocalStorage('packet_collections', newCollections)
          return { collections: newCollections }
        })

        toast.success(`Created collection: ${name}`)
      },

      updateCollection: (id, updates) => {
        set(state => {
          const newCollections = state.collections.map(col =>
            col.id === id ? { ...col, ...updates, updatedAt: new Date().toISOString() } : col
          )
          saveToLocalStorage('packet_collections', newCollections)
          return { collections: newCollections }
        })

        toast.success('Collection updated')
      },

      deleteCollection: (id) => {
        const collection = get().collections.find(c => c.id === id)
        if (!collection) return

        // Remove collection from all places
        set(state => {
          const newPlaces = state.places.map(place => ({
            ...place,
            collectionIds: place.collectionIds.filter(cid => cid !== id)
          }))
          const newCollections = state.collections.filter(col => col.id !== id)
          
          saveToLocalStorage('packet_places', newPlaces)
          saveToLocalStorage('packet_collections', newCollections)
          
          return { places: newPlaces, collections: newCollections }
        })

        toast.success(`Deleted collection: ${collection.name}`)
      },

      addPlaceToCollection: (placeId, collectionId) => {
        set(state => {
          // Update place's collectionIds
          const newPlaces = state.places.map(place =>
            place.id === placeId && !place.collectionIds.includes(collectionId)
              ? { ...place, collectionIds: [...place.collectionIds, collectionId] }
              : place
          )

          // Update collection's placeIds
          const newCollections = state.collections.map(col =>
            col.id === collectionId && !col.placeIds.includes(placeId)
              ? { ...col, placeIds: [...col.placeIds, placeId], updatedAt: new Date().toISOString() }
              : col
          )

          saveToLocalStorage('packet_places', newPlaces)
          saveToLocalStorage('packet_collections', newCollections)

          return { places: newPlaces, collections: newCollections }
        })

        const place = get().places.find(p => p.id === placeId)
        const collection = get().collections.find(c => c.id === collectionId)
        if (place && collection) {
          toast.success(`Added ${place.name} to ${collection.name}`)
        }
      },

      removePlaceFromCollection: (placeId, collectionId) => {
        set(state => {
          // Update place's collectionIds
          const newPlaces = state.places.map(place =>
            place.id === placeId
              ? { ...place, collectionIds: place.collectionIds.filter(cid => cid !== collectionId) }
              : place
          )

          // Update collection's placeIds
          const newCollections = state.collections.map(col =>
            col.id === collectionId
              ? { ...col, placeIds: col.placeIds.filter(pid => pid !== placeId), updatedAt: new Date().toISOString() }
              : col
          )

          saveToLocalStorage('packet_places', newPlaces)
          saveToLocalStorage('packet_collections', newCollections)

          return { places: newPlaces, collections: newCollections }
        })

        toast.success('Removed from collection')
      },

      reorderCollections: (collectionIds) => {
        set(state => {
          const newCollections = state.collections.map(col => {
            const newOrder = collectionIds.indexOf(col.id)
            return newOrder >= 0 ? { ...col, displayOrder: newOrder } : col
          }).sort((a, b) => a.displayOrder - b.displayOrder)

          saveToLocalStorage('packet_collections', newCollections)
          return { collections: newCollections }
        })
      },

      // User Actions
      setCurrentUser: (user) => {
        localStorage.setItem('packet_current_user', user)
        set({ currentUser: user })
        toast.success(`Switched to ${user === 'ronald' ? 'Ronald 👨' : 'Kerry 👩'}`)
      },

      toggleLike: (placeId) => {
        const { currentUser } = get()
        
        set(state => {
          const newPlaces = state.places.map(place => {
            if (place.id !== placeId) return place
            
            const likedBy = place.likedBy || []
            const isLiked = likedBy.includes(currentUser)
            
            return {
              ...place,
              likedBy: isLiked
                ? likedBy.filter(u => u !== currentUser)
                : [...likedBy, currentUser]
            }
          })

          saveToLocalStorage('packet_places', newPlaces)
          
          return {
            places: newPlaces,
            appState: {
              ...state.appState,
              offlineChanges: state.appState.offlineChanges + 1
            }
          }
        })

        const updatedPlace = get().places.find(p => p.id === placeId)
        if (updatedPlace) {
          syncService.queueChange({ type: 'update', place: updatedPlace })
          const isLiked = updatedPlace.likedBy?.includes(currentUser)
          if (isLiked) {
            toast.success('❤️')
          }
        }
      },

      // Reset app (for testing)
      resetApp: () => {
        syncService.cleanup()
        localStorage.removeItem('packet_places')
        localStorage.removeItem('packet_collections')
        localStorage.removeItem('packet_app_state')
        localStorage.removeItem('packet_current_user')
        
        const currentUser = getCurrentUser()
        const defaultCollections = createDefaultCollections('local', currentUser)
        
        set({
          places: [],
          collections: defaultCollections,
          currentUser,
          appState: initialAppState,
          syncState: initialSyncState,
          stats: initialStats
        })

        saveToLocalStorage('packet_collections', defaultCollections)
        toast.success('App reset')
      }
    }),
    {
      name: 'packet-store',
      partialize: (state) => ({ 
        places: state.places,
        collections: state.collections,
        currentUser: state.currentUser,
        appState: state.appState 
      })
    }
  )
)