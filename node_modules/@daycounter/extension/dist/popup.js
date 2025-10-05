// Popup script for Chrome extension
document.addEventListener('DOMContentLoaded', () => {
  const popupRoot = document.getElementById('popup-root')
  
  if (!popupRoot) return
  
  // Main popup UI
  popupRoot.innerHTML = `
    <div class="popup-container">
      <div class="header">
        <h1>📅 DayCounter</h1>
        <button id="settings-btn">⚙️</button>
      </div>
      <div class="content">
        <div id="main-view">
          <div id="events-list">
            <p>Loading events...</p>
          </div>
          <div class="actions">
            <button id="add-event-btn">➕ Add Event</button>
            <button id="view-all-btn">📋 View All Events</button>
          </div>
        </div>
        
        <div id="add-event-view" style="display: none;">
          <div class="form-header">
            <button id="back-btn">← Back</button>
            <h2>Add New Event</h2>
          </div>
          <form id="event-form">
            <div class="form-group">
              <label for="event-title">Event Title</label>
              <input type="text" id="event-title" required placeholder="e.g., Birthday Party">
            </div>
            
            <div class="form-group">
              <label for="event-description">Description (optional)</label>
              <textarea id="event-description" placeholder="Add details about your event"></textarea>
            </div>
            
            <div class="form-group">
              <label for="event-date">Target Date</label>
              <input type="date" id="event-date" required>
            </div>
            
            <div class="form-group">
              <label for="event-time">Target Time</label>
              <input type="time" id="event-time" value="12:00">
            </div>
            
            <div class="form-group">
              <label for="event-category">Category</label>
              <select id="event-category">
                <option value="personal">👤 Personal</option>
                <option value="work">💼 Work</option>
                <option value="exam">📝 Exam</option>
                <option value="deadline">⏰ Deadline</option>
                <option value="hackathon">💻 Hackathon</option>
                <option value="assignment">📋 Assignment</option>
                <option value="default">📅 Other</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>
                <input type="checkbox" id="event-reminders"> Enable reminders
              </label>
            </div>
            
            <div class="form-actions">
              <button type="button" id="cancel-btn">Cancel</button>
              <button type="submit" id="save-btn">Save Event</button>
            </div>
          </form>
        </div>
        
        <div id="all-events-view" style="display: none;">
          <div class="form-header">
            <button id="back-from-all-btn">← Back</button>
            <h2>All Events</h2>
          </div>
          <div id="all-events-list">
            <p>Loading all events...</p>
          </div>
        </div>
      </div>
    </div>
  `
  
  // Add comprehensive styles
  const style = document.createElement('style')
  style.textContent = `
    .popup-container {
      width: 400px;
      height: 600px;
      font-family: system-ui, sans-serif;
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .header h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .content {
      height: calc(100% - 60px);
      overflow-y: auto;
    }
    .form-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .form-header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
    }
    button {
      padding: 10px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #f9fafb;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    button:hover {
      background: #f3f4f6;
    }
    #add-event-btn {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
    #add-event-btn:hover {
      background: #2563eb;
    }
    #back-btn, #back-from-all-btn {
      background: #6b7280;
      color: white;
      border-color: #6b7280;
      padding: 6px 12px;
      font-size: 12px;
    }
    #back-btn:hover, #back-from-all-btn:hover {
      background: #4b5563;
    }
    #event-form {
      padding: 16px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
      color: #374151;
    }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .form-group textarea {
      height: 60px;
      resize: vertical;
    }
    .form-group input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
    }
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
    .form-actions button {
      flex: 1;
    }
    #save-btn {
      background: #10b981;
      color: white;
      border-color: #10b981;
    }
    #save-btn:hover {
      background: #059669;
    }
    #cancel-btn {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
    }
    #cancel-btn:hover {
      background: #dc2626;
    }
    .event-item {
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 8px;
      background: white;
    }
    .event-item.overdue {
      border-color: #fecaca;
      background: #fef2f2;
    }
    .event-item.urgent {
      border-color: #fde68a;
      background: #fffbeb;
    }
    .event-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .event-title {
      font-weight: 500;
      font-size: 14px;
      margin: 0;
    }
    .event-days {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 12px;
    }
    .event-days.overdue {
      background: #fef2f2;
      color: #dc2626;
    }
    .event-days.urgent {
      background: #fef3c7;
      color: #d97706;
    }
    .event-days.normal {
      background: #f0fdf4;
      color: #16a34a;
    }
    .event-details {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .event-actions {
      display: flex;
      gap: 8px;
    }
    .event-actions button {
      padding: 4px 8px;
      font-size: 12px;
    }
    .delete-btn {
      background: #fef2f2;
      color: #dc2626;
      border-color: #fecaca;
    }
    .delete-btn:hover {
      background: #fee2e2;
    }
    .archive-btn {
      background: #f3f4f6;
      color: #6b7280;
      border-color: #d1d5db;
    }
    .archive-btn:hover {
      background: #e5e7eb;
    }
  `
  document.head.appendChild(style)
  
  // Event listeners
  setupEventListeners()
  
  // Load events
  loadEvents()
})

function setupEventListeners() {
  // Main view buttons
  document.getElementById('add-event-btn').addEventListener('click', () => {
    showAddEventView()
  })
  
  document.getElementById('view-all-btn').addEventListener('click', () => {
    showAllEventsView()
  })
  
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage()
  })
  
  // Add event view
  document.getElementById('back-btn').addEventListener('click', () => {
    showMainView()
  })
  
  document.getElementById('cancel-btn').addEventListener('click', () => {
    showMainView()
  })
  
  document.getElementById('event-form').addEventListener('submit', handleEventSubmit)
  
  // All events view
  document.getElementById('back-from-all-btn').addEventListener('click', () => {
    showMainView()
  })
  
  // Set default date to today
  const today = new Date().toISOString().split('T')[0]
  document.getElementById('event-date').value = today
}

function showMainView() {
  document.getElementById('main-view').style.display = 'block'
  document.getElementById('add-event-view').style.display = 'none'
  document.getElementById('all-events-view').style.display = 'none'
  loadEvents()
}

function showAddEventView() {
  document.getElementById('main-view').style.display = 'none'
  document.getElementById('add-event-view').style.display = 'block'
  document.getElementById('all-events-view').style.display = 'none'
  
  // Reset form
  document.getElementById('event-form').reset()
  const today = new Date().toISOString().split('T')[0]
  document.getElementById('event-date').value = today
  document.getElementById('event-time').value = '12:00'
}

function showAllEventsView() {
  document.getElementById('main-view').style.display = 'none'
  document.getElementById('add-event-view').style.display = 'none'
  document.getElementById('all-events-view').style.display = 'block'
  loadAllEvents()
}

async function handleEventSubmit(e) {
  e.preventDefault()
  
  const title = document.getElementById('event-title').value
  const description = document.getElementById('event-description').value
  const date = document.getElementById('event-date').value
  const time = document.getElementById('event-time').value
  const category = document.getElementById('event-category').value
  const reminders = document.getElementById('event-reminders').checked
  
  if (!title || !date) {
    alert('Please fill in all required fields')
    return
  }
  
  const targetAt = new Date(`${date}T${time}`).toISOString()
  const startAt = new Date().toISOString()
  
  const newEvent = {
    id: Date.now().toString(),
    title,
    description,
    targetAt,
    startAt,
    category,
    reminders: reminders ? [
      { id: '1', offsetMinutesFromTarget: -60, enabled: true },
      { id: '2', offsetMinutesFromTarget: -1440, enabled: true }
    ] : [],
    isArchived: false,
    createdAt: new Date().toISOString()
  }
  
  try {
    const result = await chrome.storage.local.get(['events'])
    const events = result.events || []
    events.push(newEvent)
    
    await chrome.storage.local.set({ events })
    
    // Show success message
    alert('Event created successfully!')
    
    // Return to main view
    showMainView()
  } catch (error) {
    console.error('Error saving event:', error)
    alert('Failed to save event')
  }
}

async function loadEvents() {
  try {
    const result = await chrome.storage.local.get(['events'])
    const events = result.events || []
    
    const eventsList = document.getElementById('events-list')
    
    if (events.length === 0) {
      eventsList.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">No upcoming events</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Create your first countdown event to get started.</p>
        </div>
      `
    } else {
      const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.targetAt)
        return eventDate > new Date() && !event.isArchived
      }).slice(0, 3)
      
      if (upcomingEvents.length === 0) {
        eventsList.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">No upcoming events</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">All events are completed or archived.</p>
          </div>
        `
      } else {
        eventsList.innerHTML = `
          <h2 style="font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 12px;">
            Upcoming Events (${upcomingEvents.length})
          </h2>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${upcomingEvents.map(event => {
              const countdown = calculateCountdown(event.targetAt, event.startAt)
              const icon = getCategoryIcon(event.category)
              return `
                <div class="event-item ${countdown.isOverdue ? 'overdue' : countdown.days <= 1 ? 'urgent' : ''}">
                  <div class="event-header">
                    <h3 class="event-title">${icon} ${event.title}</h3>
                    <div class="event-days ${countdown.isOverdue ? 'overdue' : countdown.days <= 1 ? 'urgent' : 'normal'}">
                      ${countdown.isOverdue ? 'Overdue' : `${countdown.days}d`}
                    </div>
                  </div>
                  <div class="event-details">
                    🕐 ${formatCountdown(countdown)}
                  </div>
                  ${event.description ? `<div class="event-details">${event.description}</div>` : ''}
                </div>
              `
            }).join('')}
          </div>
        `
      }
    }
  } catch (error) {
    console.error('Error loading events:', error)
    document.getElementById('events-list').innerHTML = `
      <div style="text-align: center; padding: 20px; color: #dc2626;">
        <p>Error loading events</p>
      </div>
    `
  }
}

async function loadAllEvents() {
  try {
    const result = await chrome.storage.local.get(['events'])
    const events = result.events || []
    
    const allEventsList = document.getElementById('all-events-list')
    
    if (events.length === 0) {
      allEventsList.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">No events yet</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Create your first countdown event to get started.</p>
        </div>
      `
    } else {
      // Sort events by date
      const sortedEvents = events.sort((a, b) => new Date(a.targetAt) - new Date(b.targetAt))
      
      allEventsList.innerHTML = `
        <div style="padding: 16px;">
          <h2 style="font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 12px;">
            All Events (${events.length})
          </h2>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${sortedEvents.map(event => {
              const countdown = calculateCountdown(event.targetAt, event.startAt)
              const icon = getCategoryIcon(event.category)
              const isArchived = event.isArchived
              
              return `
                <div class="event-item ${isArchived ? 'opacity-50' : ''} ${countdown.isOverdue ? 'overdue' : countdown.days <= 1 ? 'urgent' : ''}">
                  <div class="event-header">
                    <h3 class="event-title">${icon} ${event.title} ${isArchived ? '(Archived)' : ''}</h3>
                    <div class="event-days ${countdown.isOverdue ? 'overdue' : countdown.days <= 1 ? 'urgent' : 'normal'}">
                      ${countdown.isOverdue ? 'Overdue' : `${countdown.days}d`}
                    </div>
                  </div>
                  <div class="event-details">
                    🕐 ${formatCountdown(countdown)}
                  </div>
                  ${event.description ? `<div class="event-details">${event.description}</div>` : ''}
                  <div class="event-actions">
                    ${!isArchived ? `<button class="archive-btn" onclick="archiveEvent('${event.id}')">Archive</button>` : ''}
                    <button class="delete-btn" onclick="deleteEvent('${event.id}')">Delete</button>
                  </div>
                </div>
              `
            }).join('')}
          </div>
        </div>
      `
    }
  } catch (error) {
    console.error('Error loading all events:', error)
    document.getElementById('all-events-list').innerHTML = `
      <div style="text-align: center; padding: 20px; color: #dc2626;">
        <p>Error loading events</p>
      </div>
    `
  }
}

function getCategoryIcon(category) {
  const icons = {
    personal: '👤',
    work: '💼',
    exam: '📝',
    deadline: '⏰',
    hackathon: '💻',
    assignment: '📋',
    default: '📅'
  }
  return icons[category] || icons.default
}

function calculateCountdown(targetDate, startDate) {
  const target = new Date(targetDate)
  const start = new Date(startDate)
  const now = new Date()
  
  const diffTime = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return {
    days: diffDays,
    isOverdue: diffDays < 0
  }
}

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

// Global functions for event actions
window.archiveEvent = async function(eventId) {
  try {
    const result = await chrome.storage.local.get(['events'])
    const events = result.events || []
    
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return { ...event, isArchived: true }
      }
      return event
    })
    
    await chrome.storage.local.set({ events: updatedEvents })
    loadAllEvents() // Refresh the view
  } catch (error) {
    console.error('Error archiving event:', error)
    alert('Failed to archive event')
  }
}

window.deleteEvent = async function(eventId) {
  if (confirm('Are you sure you want to delete this event? This cannot be undone.')) {
    try {
      const result = await chrome.storage.local.get(['events'])
      const events = result.events || []
      
      const updatedEvents = events.filter(event => event.id !== eventId)
      
      await chrome.storage.local.set({ events: updatedEvents })
      loadAllEvents() // Refresh the view
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event')
    }
  }
}