// Background service worker for Chrome extension
import { Event, calculateCountdown } from '@shared'

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('DayCounter extension installed')
  
  // Request notification permission
  chrome.notifications.getPermissionLevel((level) => {
    if (level === 'denied') {
      console.log('Notifications denied by user')
    }
  })
})

// Handle alarm events for notifications
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('reminder-')) {
    handleReminderAlarm(alarm)
  } else if (alarm.name === 'daily-summary') {
    handleDailySummaryAlarm()
  }
})

// Handle reminder notifications
async function handleReminderAlarm(alarm: chrome.alarms.Alarm) {
  try {
    const eventId = alarm.name.replace('reminder-', '')
    const result = await chrome.storage.local.get(['events'])
    const events: Event[] = result.events || []
    
    const event = events.find(e => e.id === eventId)
    if (!event) return

    const countdown = calculateCountdown(event.targetAt, event.startAt)
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'DayCounter Reminder',
      message: `${event.title} - ${countdown.isOverdue ? 'Overdue!' : `${countdown.days} days remaining`}`,
      buttons: [
        { title: 'View Details' }
      ]
    })
  } catch (error) {
    console.error('Error handling reminder alarm:', error)
  }
}

// Handle daily summary notifications
async function handleDailySummaryAlarm() {
  try {
    const result = await chrome.storage.local.get(['events', 'dailySummaryTime'])
    const events: Event[] = result.events || []
    const dailySummaryTime = result.dailySummaryTime || '09:00'
    
    const today = new Date()
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.targetAt)
      return eventDate.toDateString() === today.toDateString() && !event.isArchived
    })
    
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.targetAt)
      return eventDate > today && !event.isArchived
    }).slice(0, 3)

    if (todayEvents.length > 0 || upcomingEvents.length > 0) {
      let message = ''
      
      if (todayEvents.length > 0) {
        message += `Today: ${todayEvents.length} event${todayEvents.length > 1 ? 's' : ''}`
      }
      
      if (upcomingEvents.length > 0) {
        if (message) message += '\n'
        message += `Upcoming: ${upcomingEvents.map(e => e.title).join(', ')}`
      }

      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'DayCounter Daily Summary',
        message: message,
        buttons: [
          { title: 'View All Events' }
        ]
      })
    }
  } catch (error) {
    console.error('Error handling daily summary alarm:', error)
  }
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.tabs.create({ url: 'https://daycounter.app' })
})

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  chrome.tabs.create({ url: 'https://daycounter.app' })
})

// Schedule reminders for events
export async function scheduleEventReminders(event: Event) {
  try {
    // Clear existing alarms for this event
    const alarms = await chrome.alarms.getAll()
    alarms.forEach(alarm => {
      if (alarm.name.startsWith(`reminder-${event.id}`)) {
        chrome.alarms.clear(alarm.name)
      }
    })

    // Schedule new reminders
    for (const reminder of event.reminders) {
      const reminderTime = new Date(event.targetAt)
      reminderTime.setMinutes(reminderTime.getMinutes() + reminder.offsetMinutesFromTarget)
      
      if (reminderTime > new Date()) {
        chrome.alarms.create(`reminder-${event.id}-${reminder.id}`, {
          when: reminderTime.getTime()
        })
      }
    }
  } catch (error) {
    console.error('Error scheduling reminders:', error)
  }
}

// Schedule daily summary
export async function scheduleDailySummary(time: string) {
  try {
    // Clear existing daily summary alarm
    chrome.alarms.clear('daily-summary')
    
    // Parse time (format: "HH:MM")
    const [hours, minutes] = time.split(':').map(Number)
    
    // Calculate next occurrence
    const now = new Date()
    const nextSummary = new Date()
    nextSummary.setHours(hours, minutes, 0, 0)
    
    // If time has passed today, schedule for tomorrow
    if (nextSummary <= now) {
      nextSummary.setDate(nextSummary.getDate() + 1)
    }
    
    chrome.alarms.create('daily-summary', {
      when: nextSummary.getTime(),
      periodInMinutes: 24 * 60 // Repeat daily
    })
    
    // Save the time preference
    await chrome.storage.local.set({ dailySummaryTime: time })
  } catch (error) {
    console.error('Error scheduling daily summary:', error)
  }
}

// Listen for storage changes to update alarms
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.events) {
    const events: Event[] = changes.events.newValue || []
    
    // Schedule reminders for all events
    events.forEach(event => {
      if (!event.isArchived) {
        scheduleEventReminders(event)
      }
    })
  }
})

// Handle commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-popup') {
    chrome.action.openPopup()
  }
})
