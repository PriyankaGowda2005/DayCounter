import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as SQLite from 'expo-sqlite'
import { Event } from '@shared'

// Initialize SQLite database
const db = SQLite.openDatabase('daycounter.db')

interface MobileState {
  events: Event[]
  isLoading: boolean
  error: string | null
  
  loadEvents: () => Promise<void>
  saveEvents: (events: Event[]) => Promise<void>
  addEvent: (event: Event) => Promise<void>
  updateEvent: (event: Event) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  clearAllEvents: () => Promise<void>
}

// Simple storage adapter for Zustand persistence
const mobileStorage = {
  getItem: (name: string) => {
    return new Promise<string | null>((resolve) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT value FROM storage WHERE key = ?',
          [name],
          (_, { rows }) => {
            resolve(rows.length > 0 ? rows.item(0).value : null)
          },
          () => resolve(null)
        )
      })
    })
  },
  setItem: (name: string, value: string) => {
    return new Promise<void>((resolve) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO storage (key, value) VALUES (?, ?)',
          [name, value],
          () => resolve(),
          () => resolve()
        )
      })
    })
  },
  removeItem: (name: string) => {
    return new Promise<void>((resolve) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM storage WHERE key = ?',
          [name],
          () => resolve(),
          () => resolve()
        )
      })
    })
  }
}

// Initialize database tables
const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        createdAt TEXT NOT NULL,
        startAt TEXT,
        targetAt TEXT NOT NULL,
        timezone TEXT,
        recurring TEXT,
        tasks TEXT,
        reminders TEXT,
        color TEXT NOT NULL,
        icon TEXT,
        category TEXT,
        isArchived INTEGER NOT NULL DEFAULT 0,
        notifyDailySummary INTEGER NOT NULL DEFAULT 1
      );`
    )
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS storage (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );`
    )
  })
}

// Initialize database on first load
initDatabase()

export const useMobileStore = create<MobileState>()(
  persist(
    (set, get) => ({
      events: [],
      isLoading: false,
      error: null,

      loadEvents: async () => {
        try {
          set({ isLoading: true, error: null })
          
          const events = await new Promise<Event[]>((resolve, reject) => {
            db.transaction(tx => {
              tx.executeSql(
                'SELECT * FROM events ORDER BY targetAt ASC',
                [],
                (_, { rows }) => {
                  const events: Event[] = rows._array.map(row => ({
                    id: row.id,
                    title: row.title,
                    description: row.description,
                    createdAt: row.createdAt,
                    startAt: row.startAt,
                    targetAt: row.targetAt,
                    timezone: row.timezone,
                    recurring: row.recurring ? JSON.parse(row.recurring) : undefined,
                    tasks: row.tasks ? JSON.parse(row.tasks) : [],
                    reminders: row.reminders ? JSON.parse(row.reminders) : [],
                    color: row.color,
                    icon: row.icon,
                    category: row.category,
                    isArchived: Boolean(row.isArchived),
                    notifyDailySummary: Boolean(row.notifyDailySummary),
                  }))
                  resolve(events)
                },
                (_, error) => {
                  reject(error)
                  return false
                }
              )
            })
          })
          
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
          // Clear existing events
          await new Promise<void>((resolve, reject) => {
            db.transaction(tx => {
              tx.executeSql(
                'DELETE FROM events',
                [],
                () => resolve(),
                (_, error) => {
                  reject(error)
                  return false
                }
              )
            })
          })

          // Insert new events
          for (const event of events) {
            await new Promise<void>((resolve, reject) => {
              db.transaction(tx => {
                tx.executeSql(
                  `INSERT INTO events (
                    id, title, description, createdAt, startAt, targetAt, timezone,
                    recurring, tasks, reminders, color, icon, category, isArchived, notifyDailySummary
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    event.id,
                    event.title,
                    event.description || null,
                    event.createdAt,
                    event.startAt || null,
                    event.targetAt,
                    event.timezone || null,
                    event.recurring ? JSON.stringify(event.recurring) : null,
                    JSON.stringify(event.tasks),
                    JSON.stringify(event.reminders),
                    event.color,
                    event.icon || null,
                    event.category || null,
                    event.isArchived ? 1 : 0,
                    event.notifyDailySummary ? 1 : 0,
                  ],
                  () => resolve(),
                  (_, error) => {
                    reject(error)
                    return false
                  }
                )
              })
            })
          }

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

      clearAllEvents: async () => {
        await new Promise<void>((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              'DELETE FROM events',
              [],
              () => resolve(),
              (_, error) => {
                reject(error)
                return false
              }
            )
          })
        })
        set({ events: [] })
      },
    }),
    {
      name: 'daycounter-mobile-store',
      storage: createJSONStorage(() => mobileStorage),
      partialize: (state) => ({ 
        // Only persist events, not loading states
        events: state.events 
      }),
    }
  )
)
