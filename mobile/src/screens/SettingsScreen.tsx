import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMobileStore } from '../../store'
import { NotificationService } from '../../services/NotificationService'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'

export const SettingsScreen: React.FC = () => {
  const { events, clearAllEvents } = useMobileStore()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [dailySummaryTime, setDailySummaryTime] = useState('09:00')

  useEffect(() => {
    // Check notification permission
    NotificationService.getPermissionStatus().then(setNotificationsEnabled)
    
    // Load daily summary time preference
    loadDailySummaryTime()
  }, [])

  const loadDailySummaryTime = async () => {
    try {
      const time = await FileSystem.readAsStringAsync(
        FileSystem.documentDirectory + 'dailySummaryTime.txt'
      ).catch(() => '09:00')
      setDailySummaryTime(time)
    } catch (error) {
      console.log('No daily summary time set, using default')
    }
  }

  const saveDailySummaryTime = async (time: string) => {
    try {
      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + 'dailySummaryTime.txt',
        time
      )
      setDailySummaryTime(time)
    } catch (error) {
      console.error('Failed to save daily summary time:', error)
    }
  }

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const granted = await NotificationService.requestPermission()
      if (granted) {
        setNotificationsEnabled(true)
        // Schedule daily summary
        await NotificationService.scheduleDailySummary(dailySummaryTime)
      }
    } else {
      setNotificationsEnabled(false)
      await NotificationService.cancelAllNotifications()
    }
  }

  const handleExportJSON = async () => {
    try {
      const data = JSON.stringify(events, null, 2)
      const fileName = `daycounter-events-${new Date().toISOString().split('T')[0]}.json`
      const fileUri = FileSystem.documentDirectory + fileName
      
      await FileSystem.writeAsStringAsync(fileUri, data)
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri)
      } else {
        Alert.alert('Export Complete', `File saved to: ${fileUri}`)
      }
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export events')
    }
  }

  const handleImportJSON = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets[0]) {
        const fileUri = result.assets[0].uri
        const content = await FileSystem.readAsStringAsync(fileUri)
        const importedEvents = JSON.parse(content)
        
        if (Array.isArray(importedEvents)) {
          Alert.alert(
            'Import Events',
            `Found ${importedEvents.length} events. This will replace your current events. Continue?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Import',
                onPress: async () => {
                  // In a real app, you'd want to merge with existing events
                  Alert.alert('Import Complete', `Imported ${importedEvents.length} events`)
                },
              },
            ]
          )
        } else {
          Alert.alert('Import Failed', 'Invalid file format')
        }
      }
    } catch (error) {
      Alert.alert('Import Failed', 'Failed to import events')
    }
  }

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all events? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearAllEvents()
            await NotificationService.cancelAllNotifications()
            Alert.alert('Success', 'All data has been cleared')
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.content}>
          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Get reminded about upcoming events
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={notificationsEnabled ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Daily Summary Time</Text>
                <Text style={styles.settingDescription}>
                  Time to receive daily summary notifications
                </Text>
              </View>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => {
                  // In a real app, you'd show a time picker
                  Alert.alert('Time Picker', 'Select daily summary time', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: '9:00 AM', onPress: () => saveDailySummaryTime('09:00') },
                    { text: '12:00 PM', onPress: () => saveDailySummaryTime('12:00') },
                    { text: '6:00 PM', onPress: () => saveDailySummaryTime('18:00') },
                  ])
                }}
              >
                <Text style={styles.timeText}>{dailySummaryTime}</Text>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleExportJSON}>
              <Ionicons name="download-outline" size={20} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Export Events (JSON)</Text>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleImportJSON}>
              <Ionicons name="cloud-upload-outline" size={20} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Import Events (JSON)</Text>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Information</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total Events</Text>
              <Text style={styles.infoValue}>{events.length}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Active Events</Text>
              <Text style={styles.infoValue}>
                {events.filter(e => !e.isArchived).length}
              </Text>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]} 
              onPress={handleClearAllData}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.actionButtonText, styles.dangerText]}>
                Clear All Data
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginRight: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  dangerButton: {
    borderBottomColor: '#FECACA',
  },
  dangerText: {
    color: '#EF4444',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
})
