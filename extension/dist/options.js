// Options script for Chrome extension
document.addEventListener('DOMContentLoaded', () => {
  const optionsRoot = document.getElementById('options-root')
  
  if (!optionsRoot) return
  
  // Simple options UI
  optionsRoot.innerHTML = `
    <div class="options-container">
      <div class="header">
        <h1>📅 DayCounter Options</h1>
      </div>
      <div class="content">
        <div class="section">
          <h2>🔔 Notifications</h2>
          <div class="setting">
            <label for="daily-summary-time">Daily Summary Time</label>
            <select id="daily-summary-time">
              <option value="09:00">9:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="18:00">6:00 PM</option>
              <option value="21:00">9:00 PM</option>
            </select>
            <p>Time to receive daily summary notifications</p>
          </div>
        </div>
        
        <div class="section">
          <h2>⚙️ Data Management</h2>
          <div class="setting">
            <h3>Export Data</h3>
            <p>Download your events for backup or sharing</p>
            <div class="buttons">
              <button id="export-json-btn">📥 Export JSON</button>
              <button id="export-ical-btn">📥 Export iCal</button>
            </div>
          </div>
          
          <div class="setting">
            <h3>Import Data</h3>
            <p>Import events from a JSON backup file</p>
            <div class="buttons">
              <input type="file" id="import-file" accept=".json" style="display: none;">
              <label for="import-file" class="file-label">📤 Import JSON</label>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>App Information</h2>
          <div class="info">
            <div class="info-row">
              <span>Version</span>
              <span>1.0.0</span>
            </div>
            <div class="info-row">
              <span>Total Events</span>
              <span id="total-events">0</span>
            </div>
            <div class="info-row">
              <span>Active Events</span>
              <span id="active-events">0</span>
            </div>
          </div>
        </div>
        
        <div class="section danger">
          <h2>Danger Zone</h2>
          <div class="setting">
            <h3>Clear All Data</h3>
            <p>Permanently delete all your events and data</p>
            <button id="clear-data-btn" class="danger-btn">🗑️ Clear All Data</button>
          </div>
        </div>
      </div>
    </div>
  `
  
  // Add styles
  const style = document.createElement('style')
  style.textContent = `
    .options-container {
      width: 600px;
      height: 400px;
      font-family: system-ui, sans-serif;
    }
    .header {
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 24px;
      overflow-y: auto;
      height: calc(100% - 80px);
    }
    .section {
      margin-bottom: 32px;
      padding: 24px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .section.danger {
      border-color: #fecaca;
    }
    .section h2 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
    }
    .setting {
      margin-bottom: 16px;
    }
    .setting h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 500;
    }
    .setting p {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #6b7280;
    }
    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
    }
    .buttons {
      display: flex;
      gap: 12px;
    }
    button {
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #f9fafb;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background: #f3f4f6;
    }
    .file-label {
      display: inline-block;
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #f9fafb;
      cursor: pointer;
      font-size: 14px;
    }
    .file-label:hover {
      background: #f3f4f6;
    }
    .danger-btn {
      background: #fef2f2;
      color: #dc2626;
      border-color: #fecaca;
    }
    .danger-btn:hover {
      background: #fee2e2;
    }
    .info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }
    .info-row span:first-child {
      color: #6b7280;
    }
    .info-row span:last-child {
      font-weight: 500;
    }
  `
  document.head.appendChild(style)
  
  // Load current settings
  loadSettings()
  
  // Event listeners
  document.getElementById('daily-summary-time').addEventListener('change', (e) => {
    const time = e.target.value
    chrome.storage.local.set({ dailySummaryTime: time })
    chrome.runtime.sendMessage({ type: 'SCHEDULE_DAILY_SUMMARY', time: time })
  })
  
  document.getElementById('export-json-btn').addEventListener('click', exportJSON)
  document.getElementById('export-ical-btn').addEventListener('click', exportICal)
  document.getElementById('import-file').addEventListener('change', importJSON)
  document.getElementById('clear-data-btn').addEventListener('click', clearAllData)
})

async function loadSettings() {
  try {
    // Load daily summary time
    const result = await chrome.storage.local.get(['dailySummaryTime', 'events'])
    const dailySummaryTime = result.dailySummaryTime || '09:00'
    const events = result.events || []
    
    document.getElementById('daily-summary-time').value = dailySummaryTime
    document.getElementById('total-events').textContent = events.length
    document.getElementById('active-events').textContent = events.filter(e => !e.isArchived).length
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

async function exportJSON() {
  try {
    const result = await chrome.storage.local.get(['events'])
    const events = result.events || []
    
    const dataStr = JSON.stringify(events, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `daycounter-events-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting JSON:', error)
    alert('Failed to export data')
  }
}

async function exportICal() {
  try {
    const result = await chrome.storage.local.get(['events'])
    const events = result.events || []
    
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
    
    const dataBlob = new Blob([icalContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `daycounter-events-${new Date().toISOString().split('T')[0]}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting iCal:', error)
    alert('Failed to export data')
  }
}

function importJSON(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target.result
      const events = JSON.parse(content)
      
      if (Array.isArray(events)) {
        await chrome.storage.local.set({ events: events })
        alert(`Successfully imported ${events.length} events`)
        loadSettings() // Refresh the UI
      } else {
        throw new Error('Invalid format')
      }
    } catch (error) {
      console.error('Error importing JSON:', error)
      alert('Failed to import events. Please check the file format.')
    }
  }
  reader.readAsText(file)
}

async function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    try {
      await chrome.storage.local.clear()
      alert('All data has been cleared')
      loadSettings() // Refresh the UI
    } catch (error) {
      console.error('Error clearing data:', error)
      alert('Failed to clear data')
    }
  }
}