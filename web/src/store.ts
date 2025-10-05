import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import localforage from 'localforage'
import { Event, SyncAdapter } from '@shared'

// Configure localforage for IndexedDB storage
localforage.config({
  name: 'DayCounter',
  storeName: 'events',
})

// Local storage adapter
class LocalStorageAdapter implements SyncAdapter {
  async save(event: Event): Promise<void> {
    const events = await this.fetch()
    const existingIndex = events.findIndex(e => e.id === event.id)
    
    if (existingIndex >= 0) {
      events[existingIndex] = event
    } else {
      events.push(event)
    }
    
    await localforage.setItem('events', events)
  }

  async fetch(): Promise<Event[]> {
    const events = await localforage.getItem<Event[]>('events')
    return events || []
  }

  async delete(id: string): Promise<void> {
    const events = await this.fetch()
    const filteredEvents = events.filter(e => e.id !== id)
    await localforage.setItem('events', filteredEvents)
  }

  async clear(): Promise<void> {
    await localforage.clear()
  }
}

interface AppState {
  events: Event[]
  isLoading: boolean
  error: string | null
  syncAdapter: SyncAdapter
  
  // Actions
  addEvent: (event: Event) => Promise<void>
  updateEvent: (event: Event) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  loadEvents: () => Promise<void>
  clearAllEvents: () => Promise<void>
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      events: [],
      isLoading: false,
      error: null,
      syncAdapter: new LocalStorageAdapter(),

      addEvent: async (event: Event) => {
        try {
          set({ isLoading: true, error: null })
          await get().syncAdapter.save(event)
          const events = await get().syncAdapter.fetch()
          set({ events, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add event',
            isLoading: false 
          })
        }
      },

      updateEvent: async (event: Event) => {
        try {
          set({ isLoading: true, error: null })
          await get().syncAdapter.save(event)
          const events = await get().syncAdapter.fetch()
          set({ events, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update event',
            isLoading: false 
          })
        }
      },

      deleteEvent: async (id: string) => {
        try {
          set({ isLoading: true, error: null })
          await get().syncAdapter.delete(id)
          const events = await get().syncAdapter.fetch()
          set({ events, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete event',
            isLoading: false 
          })
        }
      },

      loadEvents: async () => {
        try {
          set({ isLoading: true, error: null })
          const events = await get().syncAdapter.fetch()
          set({ events, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load events',
            isLoading: false 
          })
        }
      },

      clearAllEvents: async () => {
        try {
          set({ isLoading: true, error: null })
          await get().syncAdapter.clear()
          set({ events: [], isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to clear events',
            isLoading: false 
          })
        }
      },

      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'daycounter-store',
      storage: createJSONStorage(() => localforage),
      partialize: (state) => ({ 
        // Only persist events, not loading states
        events: state.events 
      }),
    }
  )
)
