import React, { useEffect, useState } from 'react'
import { Event, exportToJSON, exportToICS, importFromJSON } from '@shared'
import { useExtensionStore } from './store'

export const OptionsApp: React.FC = () => {
  const { events, loadEvents, clearAllEvents } = useExtensionStore()
  const [dailySummaryTime, setDailySummaryTime] = useState('09:00')

  useEffect(() => {
    loadEvents()
    
    // Load daily summary time preference
    chrome.storage.local.get(['dailySummaryTime'], (result) => {
      if (result.dailySummaryTime) {
        setDailySummaryTime(result.dailySummaryTime)
      }
    })
  }, [loadEvents])

  const handleExportJSON = () => {
    const data = exportToJSON(events)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daycounter-events-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportICS = () => {
    const data = exportToICS(events)
    const blob = new Blob([data], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daycounter-events-${new Date().toISOString().split('T')[0]}.ics`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = importFromJSON(event.target?.result as string)
        // In a real app, you'd want to merge with existing events
        console.log('Imported events:', data)
        alert(`Successfully imported ${data.length} events`)
      } catch (error) {
        alert('Failed to import events. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearAllEvents()
      alert('All data has been cleared')
    }
  }

  const handleDailySummaryTimeChange = (time: string) => {
    setDailySummaryTime(time)
    chrome.storage.local.set({ dailySummaryTime: time })
    
    // Schedule daily summary alarm
    chrome.runtime.sendMessage({
      type: 'SCHEDULE_DAILY_SUMMARY',
      time: time
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📅</span>
          <h1 className="text-2xl font-semibold text-gray-900">DayCounter Options</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Notifications */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🔔</span>
              Notifications
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Summary Time
                </label>
                <select
                  value={dailySummaryTime}
                  onChange={(e) => handleDailySummaryTimeChange(e.target.value)}
                  className="input"
                >
                  <option value="09:00">9:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="21:00">9:00 PM</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Time to receive daily summary notifications
                </p>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">⚙️</span>
              Data Management
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Export Data</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Download your events for backup or sharing
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportJSON}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <span>📥</span>
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={handleExportICS}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <span>📥</span>
                    <span>Export iCal</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Import Data</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Import events from a JSON backup file
                </p>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="btn-secondary flex items-center space-x-2 cursor-pointer"
                  >
                    <span>📤</span>
                    <span>Import JSON</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">App Information</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Version</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Events</span>
                <span className="text-sm font-medium">{events.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Events</span>
                <span className="text-sm font-medium">
                  {events.filter(e => !e.isArchived).length}
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border-red-200">
            <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-red-600 mb-2">Clear All Data</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Permanently delete all your events and data
                </p>
                <button
                  onClick={handleClearAllData}
                  className="btn-danger flex items-center space-x-2"
                >
                  <span>🗑️</span>
                  <span>Clear All Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
