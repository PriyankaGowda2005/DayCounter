import React from 'react'
import { Event, calculateCountdown, formatTimeRemaining, eventIcons } from '@shared'
import { Calendar, Clock, CheckCircle2, Circle } from 'lucide-react'

interface CountdownCardProps {
  event: Event
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ event }) => {
  const countdown = calculateCountdown(event.targetAt, event.startAt)
  const icon = eventIcons[event.category as keyof typeof eventIcons] || eventIcons.default
  
  return (
    <div className="countdown-card group hover-lift animate-fade-in-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-accent-600 rounded-lg shadow-netflix-lg group-hover:shadow-netflix-xl transition-all duration-300">
            <span className="text-xl">{icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 text-shadow-lg animate-fade-in-up">
              {event.title}
            </h3>
            {event.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-200 shadow-netflix animate-scale-in">
                {event.category}
              </span>
            )}
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-netflix animate-bounce-in ${
          countdown.isOverdue
            ? 'bg-accent-600 text-white'
            : countdown.days <= 1
            ? 'bg-warning-600 text-white'
            : 'bg-success-600 text-white'
        }`}>
          {countdown.isOverdue ? 'Overdue' : `${countdown.days}d left`}
        </div>
      </div>

      {event.description && (
        <p className="text-primary-700 dark:text-primary-300 text-sm mb-4 line-clamp-2 leading-relaxed animate-fade-in-up">
          {event.description}
        </p>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-3 text-sm text-primary-500 dark:text-primary-400 animate-slide-in-left">
          <Calendar className="h-4 w-4 text-info-500" />
          <span className="font-medium">
            {new Date(event.targetAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-sm text-primary-500 dark:text-primary-400 animate-slide-in-right">
          <Clock className="h-4 w-4 text-success-500" />
          <span className="font-medium">{formatTimeRemaining(countdown)}</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 animate-fade-in-up">
          <div className="flex justify-between text-xs text-primary-500 dark:text-primary-400">
            <span className="font-semibold">Progress</span>
            <span className="font-bold text-accent-600">{Math.round(countdown.progress * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill shimmer-effect"
              style={{ width: `${Math.min(countdown.progress * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Tasks */}
        {event.tasks.length > 0 && (
          <div className="space-y-2 animate-fade-in-up">
            <h4 className="text-sm font-bold text-primary-700 dark:text-primary-300">
              Tasks ({event.tasks.filter(t => t.done).length}/{event.tasks.length})
            </h4>
            <div className="space-y-1">
              {event.tasks.slice(0, 3).map((task, index) => (
                <div key={task.id} className="flex items-center space-x-2 text-sm animate-slide-in-left" style={{ animationDelay: `${index * 0.1}s` }}>
                  {task.done ? (
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-primary-400" />
                  )}
                  <span className={`${task.done ? 'line-through text-primary-500' : 'text-primary-700 dark:text-primary-300'} font-medium`}>
                    {task.text}
                  </span>
                </div>
              ))}
              {event.tasks.length > 3 && (
                <p className="text-xs text-primary-500 font-semibold animate-fade-in-up">
                  +{event.tasks.length - 3} more tasks
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
