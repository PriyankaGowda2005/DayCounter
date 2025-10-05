import { create } from 'zustand'
import { Event } from '@shared'

interface ExtensionState {
  events: Event[]
  isLoading: boolean
  error: string | null
  
  loadEvents: () => Promise<void>
  saveEvents: (events: Event[]) => Promise<void>
  addEvent: (event: Event) => Promise<void>
  updateEvent: (event: Event) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

export const useExtensionStore = create<ExtensionState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,

  loadEvents: async () => {
    try {
      set({ isLoading: true, error: null })
      
      const result = await chrome.storage.local.get(['events'])
      const events = result.events || []
      
      set({ events, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load events',
        isLoading: false 
      })
    }
  },

  saveEvents: async (events: Event[]) => {
    try {
      await chrome.storage.local.set({ events })
      set({ events })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save events'
      })
    }
  },

  addEvent: async (event: Event) => {
    const { events, saveEvents } = get()
    const updatedEvents = [...events, event]
    await saveEvents(updatedEvents)
  },

  updateEvent: async (event: Event) => {
    const { events, saveEvents } = get()
    const updatedEvents = events.map(e => e.id === event.id ? event : e)
    await saveEvents(updatedEvents)
  },

  deleteEvent: async (id: string) => {
    const { events, saveEvents } = get()
    const updatedEvents = events.filter(e => e.id !== id)
    await saveEvents(updatedEvents)
  },
}))
