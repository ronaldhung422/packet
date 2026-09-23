import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Place, AppState, Stats, SyncState } from '../types'
import { generatePairCode, saveToLocalStorage, loadFromLocalStorage } from '../utils/storage'
import { syncService } from '../services/sync.service'
import toast from 'react-hot-toast'

interface Store {
  // State
  places: Place[]
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
}

const initialAppState: AppState = {
  isPaired: false,
  pairCode: undefined,
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

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      places: [],
      appState: initialAppState,
      syncState: initialSyncState,
      stats: initialStats,

      // Initialize app
      initializeApp: () => {
        // Load from localStorage
        const savedPlaces = loadFromLocalStorage<Place[]>('packet_places') || []
        const savedAppState = loadFromLocalStorage<AppState>('packet_app_state') || initialAppState
        
        set({
          places: savedPlaces,
          appState: savedAppState
        })
        
        // Calculate stats
        get().calculateStats()

        // If paired, start sync
        if (savedAppState.isPaired && savedAppState.pairCode) {
          void syncService.initialize(savedAppState.pairCode).then(() => get().syncWithCloud())
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

      // Pair with partner
      pairWithPartner: async (code) => {
        const isValidCode = code.startsWith('PACKET-') && code.length === 12
        
        if (!isValidCode) {
          toast.error('Invalid pair code')
          return false
        }

        const paired = await syncService.ensurePair(code)
        if (!paired) {
          toast.error('Could not create shared pair')
          return false
        }

        set((state) => ({
          appState: {
            ...state.appState,
            isPaired: true,
            pairCode: code,
            partnerName: state.appState.partnerName || 'kerry'
          }
        }))

        saveToLocalStorage('packet_app_state', get().appState)
        void syncService.initialize(code)
        
        toast.success('Paired successfully!')
        return true
      },

      // Generate pair code
      generatePairCode: async () => {
        const code = generatePairCode()
        
        const paired = await syncService.ensurePair(code)
        if (!paired) {
          toast.error('Could not create pair')
          return code
        }

        set((state) => ({
          appState: {
            ...state.appState,
            pairCode: code
          }
        }))

        saveToLocalStorage('packet_app_state', get().appState)
        return code
      },

      // Sync with cloud
      syncWithCloud: async () => {
        const { appState } = get()
        if (!appState.isPaired || !appState.pairCode) return

        set({ syncState: { ...get().syncState, isSyncing: true } })

        try {
          const places = await syncService.fullSync()
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
            ronald: places.filter(p => p.addedBy === 'ronald').length,
            kerry: places.filter(p => p.addedBy === 'kerry').length
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

      // Reset app (for testing)
      resetApp: () => {
        localStorage.removeItem('packet_places')
        localStorage.removeItem('packet_app_state')
        
        set({
          places: [],
          appState: initialAppState,
          syncState: initialSyncState,
          stats: initialStats
        })

        toast.success('App reset')
      }
    }),
    {
      name: 'packet-store',
      partialize: (state) => ({ 
        places: state.places,
        appState: state.appState 
      })
    }
  )
)