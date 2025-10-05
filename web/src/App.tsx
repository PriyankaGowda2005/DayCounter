import { useEffect, useState } from 'react'
import { Plus, Calendar, Clock, Settings, Moon, Sun } from 'lucide-react'
import { useAppStore } from './store'
import { EventList } from './components/EventList'
import { EventForm } from './components/EventForm'
import { CountdownCard } from './components/CountdownCard'
import { SettingsModal } from './components/SettingsModal'
import { createEvent } from '@shared'

function App() {
  const { events, loadEvents, isLoading, error } = useAppStore()
  const [showEventForm, setShowEventForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  const handleAddEvent = () => {
    setShowEventForm(true)
  }

  const handleCloseEventForm = () => {
    setShowEventForm(false)
  }

  const upcomingEvents = events
    .filter(event => !event.isArchived && new Date(event.targetAt) > new Date())
    .sort((a, b) => new Date(a.targetAt).getTime() - new Date(b.targetAt).getTime())
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-light-gradient dark:bg-dark-gradient transition-all duration-1000 animate-gradient-shift">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b border-primary-300 dark:border-primary-700 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 animate-fade-in-left">
              <div className="p-3 bg-accent-600 rounded-lg shadow-netflix-lg animate-pulse-glow">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text text-shadow-lg animate-fade-in-up">
                DayCounter
              </h1>
            </div>

            <div className="flex items-center space-x-3 animate-fade-in-right">
              <button
                onClick={toggleDarkMode}
                className="btn-ghost p-3 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-all duration-200 hover:scale-105"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="btn-ghost p-3 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-all duration-200 hover:scale-105"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>

              <button
                onClick={handleAddEvent}
                className="btn-netflix flex items-center space-x-2 animate-bounce-in"
              >
                <Plus className="h-4 w-4" />
                <span className="font-semibold">Add Event</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card p-6 floating-animation hover-lift animate-fade-in-up">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-info-600 rounded-lg shadow-netflix-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wide">
                    Total Events
                  </p>
                  <p className="text-3xl font-bold text-primary-900 dark:text-primary-50 text-shadow-lg animate-scale-in">
                    {events.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 floating-animation-delayed hover-lift animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-success-600 rounded-lg shadow-netflix-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wide">
                    Upcoming
                  </p>
                  <p className="text-3xl font-bold text-primary-900 dark:text-primary-50 text-shadow-lg animate-scale-in">
                    {upcomingEvents.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 floating-animation hover-lift animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-warning-600 rounded-lg shadow-netflix-lg">
                    <div className="h-6 w-6 flex items-center justify-center">
                      <span className="text-white text-sm font-bold countdown-pulse">
                        {events.filter(e => !e.isArchived && new Date(e.targetAt) <= new Date()).length}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wide">
                    Overdue
                  </p>
                  <p className="text-3xl font-bold text-primary-900 dark:text-primary-50 text-shadow-lg animate-scale-in">
                    {events.filter(e => !e.isArchived && new Date(e.targetAt) <= new Date()).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="mb-12 animate-fade-in-up">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-success-600 rounded-lg shadow-netflix-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-50 gradient-text-success text-shadow-lg animate-fade-in-up">
                  Upcoming Events
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event, index) => (
                  <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CountdownCard event={event} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Events */}
          <div className="animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-info-600 rounded-lg shadow-netflix-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-50 gradient-text-info text-shadow-lg animate-fade-in-up">
                All Events
              </h2>
            </div>
            <EventList events={events} isLoading={isLoading} />
          </div>
      </main>

      {/* Modals */}
      {showEventForm && (
        <EventForm
          onClose={handleCloseEventForm}
          onSubmit={(eventData) => {
            const event = createEvent(eventData)
            useAppStore.getState().addEvent(event)
            handleCloseEventForm()
          }}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onClearAllData={() => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
              useAppStore.getState().clearAllEvents()
              setShowSettings(false)
            }
          }}
        />
      )}
    </div>
  )
}

export default App
