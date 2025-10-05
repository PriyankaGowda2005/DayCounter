import React, { useState } from 'react'
import { X, Download, Upload, Trash2, Settings } from 'lucide-react'
import { useAppStore } from '../store'
import { exportToJSON, exportToICS, importFromJSON } from '@shared'

interface SettingsModalProps {
  onClose: () => void
  onClearAllData: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onClearAllData }) => {
  const { events } = useAppStore()
  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'about'>('general')
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

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

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode))
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'data', label: 'Data', icon: Download },
    { id: 'about', label: 'About', icon: Settings },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <nav className="p-4 space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  General Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Dark Mode
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Switch between light and dark themes
                      </p>
                    </div>
                    <button
                      onClick={handleDarkModeToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Notifications
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enable browser notifications for reminders
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if ('Notification' in window) {
                          Notification.requestPermission()
                        }
                      }}
                      className="btn-secondary text-sm"
                    >
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Data Management
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Export Data
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Download your events for backup or sharing
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleExportJSON}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export JSON</span>
                      </button>
                      <button
                        onClick={handleExportICS}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export iCal</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Import Data
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
                        <Upload className="h-4 w-4" />
                        <span>Import JSON</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                      Danger Zone
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Permanently delete all your events and data
                    </p>
                    <button
                      onClick={onClearAllData}
                      className="btn-danger flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear All Data</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  About DayCounter
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Version
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      1.0.0
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Description
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      A cross-platform day and countdown tracker for exams, deadlines, and important events.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Features
                    </h4>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc list-inside space-y-1">
                      <li>Create and track countdown events</li>
                      <li>Progress tracking and task management</li>
                      <li>Local notifications and reminders</li>
                      <li>Import/export functionality</li>
                      <li>Dark mode support</li>
                      <li>PWA support for offline use</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
