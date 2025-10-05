// Popup script for Chrome extension
document.addEventListener('DOMContentLoaded', () => {
  const popupRoot = document.getElementById('popup-root')
  
  if (!popupRoot) return
  
  // Main popup UI
  popupRoot.innerHTML = `
    <div class="popup-container">
      <div class="header">
        <h1>📅 DayCounter</h1>
        <button id="settings-btn" class="settings-btn">⚙️</button>
      </div>
      <div class="content">
        <div id="main-view" class="view-transition">
          <div id="events-list">
            <div class="loading">
              <div class="spinner"></div>
            </div>
          </div>
          <div class="actions">
            <button id="add-event-btn" class="btn btn-primary">➕ Add Event</button>
            <button id="view-all-btn" class="btn btn-secondary">📋 View All Events</button>
          </div>
        </div>
        
        <div id="add-event-view" style="display: none;" class="view-transition">
          <div class="form-header">
            <button id="back-btn" class="back-btn">← Back</button>
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
              <label class="checkbox-label">
                <input type="checkbox" id="event-reminders"> Enable reminders
              </label>
            </div>
            
            <div class="form-actions">
              <button type="button" id="cancel-btn" class="btn btn-danger">Cancel</button>
              <button type="submit" id="save-btn" class="btn btn-success">Save Event</button>
            </div>
          </form>
        </div>
        
        <div id="all-events-view" style="display: none;" class="view-transition">
          <div class="form-header">
            <button id="back-from-all-btn" class="back-btn">← Back</button>
            <h2>All Events</h2>
          </div>
          <div id="all-events-list">
            <div class="loading">
              <div class="spinner"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
  
  // Add Netflix-inspired dark theme styles
  const style = document.createElement('style')
  style.textContent = `
    * {
      box-sizing: border-box;
    }
    
    .popup-container {
      width: 420px;
      height: 650px;
      font-family: 'Netflix Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #141414;
      color: #ffffff;
      overflow: hidden;
      position: relative;
    }
    
    .popup-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(229, 9, 20, 0.05) 0%, rgba(0, 0, 0, 0.1) 100%);
      pointer-events: none;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: rgba(20, 20, 20, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      z-index: 10;
    }
    
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #e50914;
      text-shadow: 0 0 10px rgba(229, 9, 20, 0.3);
    }
    
    .settings-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 16px;
      color: #ffffff;
    }
    
    .settings-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
      border-color: #e50914;
    }
    
    .content {
      height: calc(100% - 80px);
      overflow-y: auto;
      background: #141414;
      position: relative;
      z-index: 5;
    }
    
    .form-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      background: rgba(20, 20, 20, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      z-index: 10;
    }
    
    .form-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
    }
    
    .back-btn {
      background: #e50914;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(229, 9, 20, 0.3);
    }
    
    .back-btn:hover {
      background: #f40612;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4);
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 24px;
    }
    
    .btn {
      padding: 14px 20px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .btn-primary {
      background: #e50914;
      color: white;
      box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4);
    }
    
    .btn-primary:hover {
      background: #f40612;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(229, 9, 20, 0.6);
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    
    #event-form {
      padding: 24px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #ffffff;
    }
    
    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      font-size: 14px;
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      transition: all 0.3s ease;
      font-family: inherit;
    }
    
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      outline: none;
      border-color: #e50914;
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.2);
    }
    
    .form-group input::placeholder, .form-group textarea::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    
    .form-group textarea {
      height: 80px;
      resize: vertical;
    }
    
    .form-group input[type="checkbox"] {
      width: auto;
      margin-right: 12px;
      transform: scale(1.2);
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: 500;
      color: #ffffff;
    }
    
    .form-actions {
      display: flex;
      gap: 16px;
      margin-top: 32px;
    }
    
    .form-actions .btn {
      flex: 1;
    }
    
    .btn-success {
      background: #00d4aa;
      color: white;
      box-shadow: 0 4px 15px rgba(0, 212, 170, 0.4);
    }
    
    .btn-success:hover {
      background: #00b894;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 212, 170, 0.6);
    }
    
    .btn-danger {
      background: #e50914;
      color: white;
      box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4);
    }
    
    .btn-danger:hover {
      background: #f40612;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(229, 9, 20, 0.6);
    }
    
    .event-item {
      padding: 20px;
      border: none;
      border-radius: 12px;
      margin-bottom: 12px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      border-left: 4px solid #e50914;
    }
    
    .event-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
      background: rgba(255, 255, 255, 0.08);
    }
    
    .event-item.overdue {
      background: rgba(229, 9, 20, 0.1);
      border-left-color: #e50914;
    }
    
    .event-item.urgent {
      background: rgba(255, 193, 7, 0.1);
      border-left-color: #ffc107;
    }
    
    .event-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    
    .event-title {
      font-weight: 600;
      font-size: 16px;
      margin: 0;
      color: #ffffff;
    }
    
    .event-days {
      font-size: 13px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .event-days.overdue {
      background: #e50914;
      color: white;
    }
    
    .event-days.urgent {
      background: #ffc107;
      color: #000000;
    }
    
    .event-days.normal {
      background: #00d4aa;
      color: white;
    }
    
    .event-details {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .event-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    
    .event-actions .btn {
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .archive-btn {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .archive-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .delete-btn {
      background: #e50914;
      color: white;
      border: none;
    }
    
    .delete-btn:hover {
      background: #f40612;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 24px;
    }
    
    .empty-state-icon {
      font-size: 64px;
      margin-bottom: 20px;
      opacity: 0.7;
    }
    
    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
    }
    
    .empty-state p {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      line-height: 1.5;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 16px;
      padding: 0 24px;
      padding-top: 24px;
    }
    
    .events-container {
      padding: 0 24px 24px;
    }
    
    /* Scrollbar styling */
    .content::-webkit-scrollbar {
      width: 6px;
    }
    
    .content::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .content::-webkit-scrollbar-thumb {
      background: rgba(229, 9, 20, 0.5);
      border-radius: 3px;
    }
    
    .content::-webkit-scrollbar-thumb:hover {
      background: rgba(229, 9, 20, 0.7);
    }
    
    /* Animation for view transitions */
    .view-transition {
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    /* Loading animation */
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
    }
    
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(229, 9, 20, 0.3);
      border-top: 3px solid #e50914;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <h3>No upcoming events</h3>
          <p>Create your first countdown event to get started.</p>
        </div>
      `
    } else {
      const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.targetAt)
        return eventDate > new Date() && !event.isArchived
      }).slice(0, 3)
      
      if (upcomingEvents.length === 0) {
        eventsList.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <h3>No upcoming events</h3>
            <p>All events are completed or archived.</p>
          </div>
        `
      } else {
        eventsList.innerHTML = `
          <div class="section-title">Upcoming Events (${upcomingEvents.length})</div>
          <div class="events-container">
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
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <h3>No events yet</h3>
          <p>Create your first countdown event to get started.</p>
        </div>
      `
    } else {
      // Sort events by date
      const sortedEvents = events.sort((a, b) => new Date(a.targetAt) - new Date(b.targetAt))
      
      allEventsList.innerHTML = `
        <div class="section-title">All Events (${events.length})</div>
        <div class="events-container">
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
                  ${!isArchived ? `<button class="btn archive-btn" onclick="archiveEvent('${event.id}')">Archive</button>` : ''}
                  <button class="btn delete-btn" onclick="deleteEvent('${event.id}')">Delete</button>
                </div>
              </div>
            `
          }).join('')}
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