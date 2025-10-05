import React, { useEffect, useState } from 'react'
import { Event, getUpcomingEvents, calculateCountdown, formatTimeRemaining, eventIcons } from '@shared'
import { useExtensionStore } from './store'

export const PopupApp: React.FC = () => {
  const { events, loadEvents, isLoading } = useExtensionStore()
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  useEffect(() => {
    if (events.length > 0) {
      const upcoming = getUpcomingEvents(events, 3)
      setUpcomingEvents(upcoming)
      
      // Update badge with days until closest event
      if (upcoming.length > 0) {
        const closestEvent = upcoming[0]
        const countdown = calculateCountdown(closestEvent.targetAt, closestEvent.startAt)
        chrome.action.setBadgeText({ text: countdown.days.toString() })
        chrome.action.setBadgeBackgroundColor({ color: '#3B82F6' })
      } else {
        chrome.action.setBadgeText({ text: '' })
      }
    } else {
      chrome.action.setBadgeText({ text: '' })
    }
  }, [events])

  const openWebApp = () => {
    chrome.tabs.create({ url: 'https://daycounter.app' })
  }

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📅</span>
          <h1 className="text-lg font-semibold text-gray-900">DayCounter</h1>
        </div>
        <button
          onClick={openOptions}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ⚙️
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {upcomingEvents.length === 0 ? (
          <div className="p-4 text-center">
            <span className="text-4xl">📅</span>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No upcoming events</h3>
            <p className="text-xs text-gray-500 mb-4">
              Create your first countdown event to get started.
            </p>
            <button
              onClick={openWebApp}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <span>➕</span>
              <span>Add Event</span>
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              Upcoming Events ({upcomingEvents.length})
            </h2>
            
            {upcomingEvents.map(event => (
              <EventItem key={event.id} event={event} />
            ))}

            <div className="pt-3 border-t border-gray-200">
              <button
                onClick={openWebApp}
                className="btn-secondary w-full flex items-center justify-center space-x-2"
              >
                <span>🔗</span>
                <span>Open Full App</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{events.length} total events</span>
          <button
            onClick={openWebApp}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Manage Events
          </button>
        </div>
      </div>
    </div>
  )
}

interface EventItemProps {
  event: Event
}

const EventItem: React.FC<EventItemProps> = ({ event }) => {
  const countdown = calculateCountdown(event.targetAt, event.startAt)
  const icon = event.icon || eventIcons[event.category as keyof typeof eventIcons] || eventIcons.default

  return (
    <div className="countdown-item">
      <div className="flex items-start space-x-3">
        <span className="text-lg">{icon}</span>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {event.title}
          </h3>
          
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs">🕐</span>
            <span className="text-xs text-gray-500">
              {formatTimeRemaining(countdown)}
            </span>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(countdown.progress * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(countdown.progress * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          countdown.isOverdue 
            ? 'bg-red-100 text-red-800'
            : countdown.days <= 1
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {countdown.isOverdue ? 'Overdue' : `${countdown.days}d`}
        </div>
      </div>
    </div>
  )
}
