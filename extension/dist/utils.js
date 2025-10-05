// Utility functions for Chrome extension

// Calculate countdown between two dates
function calculateCountdown(targetDate, startDate) {
  const target = new Date(targetDate)
  const start = new Date(startDate)
  const now = new Date()
  
  const diffTime = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const totalTime = target.getTime() - start.getTime()
  const elapsedTime = now.getTime() - start.getTime()
  const progress = Math.max(0, Math.min(1, elapsedTime / totalTime))
  
  return {
    days: diffDays,
    isOverdue: diffDays < 0,
    progress: progress
  }
}

// Format countdown text
function formatCountdown(countdown) {
  if (countdown.isOverdue) {
    return 'Overdue!'
  } else if (countdown.days === 0) {
    return 'Today'
  } else if (countdown.days === 1) {
    return 'Tomorrow'
  } else {
    return `${countdown.days} days remaining`
  }
}

// Get upcoming events
function getUpcomingEvents(events, limit = 3) {
  const now = new Date()
  return events
    .filter(event => {
      const eventDate = new Date(event.targetAt)
      return eventDate > now && !event.isArchived
    })
    .sort((a, b) => new Date(a.targetAt) - new Date(b.targetAt))
    .slice(0, limit)
}

// Export events to JSON
function exportEventsToJSON(events) {
  return JSON.stringify(events, null, 2)
}

// Export events to iCal format
function exportEventsToICal(events) {
  let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DayCounter//EN\n'
  
  events.forEach(event => {
    const startDate = new Date(event.startAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const endDate = new Date(event.targetAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    
    icalContent += `BEGIN:VEVENT\n`
    icalContent += `DTSTART:${startDate}\n`
    icalContent += `DTEND:${endDate}\n`
    icalContent += `SUMMARY:${event.title}\n`
    icalContent += `DESCRIPTION:${event.description || ''}\n`
    icalContent += `END:VEVENT\n`
  })
  
  icalContent += 'END:VCALENDAR'
  return icalContent
}

// Import events from JSON
function importEventsFromJSON(jsonString) {
  try {
    const events = JSON.parse(jsonString)
    if (Array.isArray(events)) {
      return events
    } else {
      throw new Error('Invalid format')
    }
  } catch (error) {
    throw new Error('Failed to parse JSON')
  }
}