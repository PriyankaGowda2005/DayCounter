import React from 'react'
import { Event, calculateCountdown, formatTimeRemaining, eventIcons } from '@shared'
import { Calendar, Clock, Trash2, Archive, ArchiveRestore } from 'lucide-react'
import { useAppStore } from '../store'

interface EventListProps {
  events: Event[]
  isLoading: boolean
}

export const EventList: React.FC<EventListProps> = ({ events, isLoading }) => {
  const { updateEvent, deleteEvent } = useAppStore()

  const handleToggleArchive = async (event: Event) => {
    await updateEvent({ ...event, isArchived: !event.isArchived })
  }

  const handleDelete = async (event: Event) => {
    if (confirm(`Are you sure you want to delete "${event.title}"? This cannot be undone.`)) {
      await deleteEvent(event.id)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <div className="p-6 bg-accent-600 rounded-xl shadow-netflix-xl mx-auto w-fit mb-6">
          <Calendar className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-xl font-bold text-primary-900 dark:text-primary-50 mb-3 text-shadow-lg animate-fade-in-up">
          No events yet
        </h3>
        <p className="text-primary-500 dark:text-primary-400 text-lg font-medium animate-fade-in-up">
          Get started by creating your first countdown event.
        </p>
      </div>
    )
  }

  const activeEvents = events.filter(e => !e.isArchived)
  const archivedEvents = events.filter(e => e.isArchived)

  return (
    <div className="space-y-6">
      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Active Events ({activeEvents.length})
          </h3>
          <div className="space-y-4">
            {activeEvents
              .sort((a, b) => new Date(a.targetAt).getTime() - new Date(b.targetAt).getTime())
              .map(event => (
                <EventListItem
                  key={event.id}
                  event={event}
                  onToggleArchive={handleToggleArchive}
                  onDelete={handleDelete}
                />
              ))}
          </div>
        </div>
      )}

      {/* Archived Events */}
      {archivedEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Archived Events ({archivedEvents.length})
          </h3>
          <div className="space-y-4">
            {archivedEvents
              .sort((a, b) => new Date(b.targetAt).getTime() - new Date(a.targetAt).getTime())
              .map(event => (
                <EventListItem
                  key={event.id}
                  event={event}
                  onToggleArchive={handleToggleArchive}
                  onDelete={handleDelete}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface EventListItemProps {
  event: Event
  onToggleArchive: (event: Event) => void
  onDelete: (event: Event) => void
}

const EventListItem: React.FC<EventListItemProps> = ({ event, onToggleArchive, onDelete }) => {
  const countdown = calculateCountdown(event.targetAt, event.startAt)
  const icon = event.icon || eventIcons[event.category as keyof typeof eventIcons] || eventIcons.default

  return (
    <div className={`card p-6 group hover-lift transition-all duration-300 animate-fade-in-up ${event.isArchived ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="p-3 bg-accent-600 rounded-lg shadow-netflix-lg group-hover:shadow-netflix-xl transition-all duration-300">
            <span className="text-xl">{icon}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <h4 className="text-lg font-bold text-primary-900 dark:text-primary-50 truncate text-shadow-lg animate-fade-in-up">
                {event.title}
              </h4>
              {event.category && (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-netflix animate-scale-in"
                  style={{
                    backgroundColor: `${event.color}20`,
                    color: event.color
                  }}
                >
                  {event.category}
                </span>
              )}
            </div>

            {event.description && (
              <p className="text-primary-700 dark:text-primary-300 text-sm mb-4 line-clamp-2 leading-relaxed animate-fade-in-up">
                {event.description}
              </p>
            )}

            <div className="flex items-center space-x-6 text-sm text-primary-500 dark:text-primary-400 mb-4">
              <div className="flex items-center space-x-2 animate-slide-in-left">
                <Calendar className="h-4 w-4 text-info-500" />
                <span className="font-medium">
                  {new Date(event.targetAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center space-x-2 animate-slide-in-right">
                <Clock className="h-4 w-4 text-success-500" />
                <span className="font-medium">{formatTimeRemaining(countdown)}</span>
              </div>

              {event.tasks.length > 0 && (
                <div className="flex items-center space-x-2 animate-fade-in-up">
                  <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-700 px-2 py-1 rounded-full shadow-netflix">
                    {event.tasks.filter(t => t.done).length}/{event.tasks.length} tasks
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="animate-fade-in-up">
              <div className="flex justify-between text-xs text-primary-500 dark:text-primary-400 mb-2">
                <span className="font-semibold">Progress</span>
                <span className="font-bold text-accent-600">{Math.round(countdown.progress * 100)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill shimmer-effect"
                  style={{
                    width: `${Math.min(countdown.progress * 100, 100)}%`,
                    backgroundColor: event.color
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onToggleArchive(event)}
            className="p-3 text-primary-400 hover:text-info-600 dark:hover:text-info-400 hover:bg-info-50 dark:hover:bg-info-900/20 rounded-lg transition-all duration-200 hover:scale-105 animate-fade-in-up"
            title={event.isArchived ? 'Restore event' : 'Archive event'}
          >
            {event.isArchived ? (
              <ArchiveRestore className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => onDelete(event)}
            className="p-3 text-primary-400 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded-lg transition-all duration-200 hover:scale-105 animate-fade-in-up"
            title="Delete event"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
