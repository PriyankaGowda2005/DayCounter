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
import { Event, calculateCountdown, formatTimeRemaining, eventIcons } from '@shared'
import { useMobileStore } from '../../store'
import { NotificationService } from '../../services/NotificationService'

export const EventDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { event: initialEvent } = route.params
  const { updateEvent, deleteEvent } = useMobileStore()
  const [event, setEvent] = useState<Event>(initialEvent)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    // Check notification permission
    NotificationService.getPermissionStatus().then(setNotificationsEnabled)
  }, [])

  const countdown = calculateCountdown(event.targetAt, event.startAt)
  const icon = event.icon || eventIcons[event.category as keyof typeof eventIcons] || eventIcons.default

  const handleToggleTask = async (taskId: string) => {
    const updatedTasks = event.tasks.map(task =>
      task.id === taskId ? { ...task, done: !task.done } : task
    )
    const updatedEvent = { ...event, tasks: updatedTasks }
    setEvent(updatedEvent)
    await updateEvent(updatedEvent)
  }

  const handleToggleArchive = async () => {
    const updatedEvent = { ...event, isArchived: !event.isArchived }
    setEvent(updatedEvent)
    await updateEvent(updatedEvent)
    navigation.goBack()
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteEvent(event.id)
            navigation.goBack()
          },
        },
      ]
    )
  }

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const granted = await NotificationService.requestPermission()
      if (granted) {
        setNotificationsEnabled(true)
        // Schedule notifications for this event
        await NotificationService.scheduleEventReminders(event)
      }
    } else {
      setNotificationsEnabled(false)
      await NotificationService.cancelEventReminders(event.id)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.icon}>{icon}</Text>
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>{event.title}</Text>
              {event.category && (
                <View style={[styles.categoryBadge, { backgroundColor: `${event.color}20` }]}>
                  <Text style={[styles.categoryText, { color: event.color }]}>
                    {event.category}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Countdown Display */}
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownTitle}>Time Remaining</Text>
          <Text style={styles.countdownText}>
            {formatTimeRemaining(countdown)}
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(countdown.progress * 100, 100)}%`,
                    backgroundColor: event.color 
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(countdown.progress * 100)}% Complete
            </Text>
          </View>
        </View>

        {/* Description */}
        {event.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}

        {/* Date Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Information</Text>
          <View style={styles.dateInfo}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Target Date</Text>
                <Text style={styles.dateValue}>
                  {new Date(event.targetAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
            
            {event.startAt && (
              <View style={styles.dateItem}>
                <Ionicons name="play-outline" size={20} color="#6B7280" />
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <Text style={styles.dateValue}>
                    {new Date(event.startAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Tasks */}
        {event.tasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Tasks ({event.tasks.filter(t => t.done).length}/{event.tasks.length})
            </Text>
            {event.tasks.map(task => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskItem}
                onPress={() => handleToggleTask(task.id)}
              >
                <Ionicons 
                  name={task.done ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={task.done ? "#10B981" : "#9CA3AF"} 
                />
                <Text style={[
                  styles.taskText,
                  task.done && styles.taskTextDone
                ]}>
                  {task.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Get reminded about this event
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
              <Text style={styles.settingLabel}>Daily Summary</Text>
              <Text style={styles.settingDescription}>
                Include in daily summary notifications
              </Text>
            </View>
            <Switch
              value={event.notifyDailySummary}
              onValueChange={(value) => {
                const updatedEvent = { ...event, notifyDailySummary: value }
                setEvent(updatedEvent)
                updateEvent(updatedEvent)
              }}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={event.notifyDailySummary ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.archiveButton]}
            onPress={handleToggleArchive}
          >
            <Ionicons 
              name={event.isArchived ? "archive" : "archive-outline"} 
              size={20} 
              color="#6B7280" 
            />
            <Text style={styles.archiveButtonText}>
              {event.isArchived ? 'Restore Event' : 'Archive Event'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete Event</Text>
          </TouchableOpacity>
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
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  countdownContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  countdownTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  dateInfo: {
    gap: 16,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  taskText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
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
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  archiveButton: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
  },
  archiveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: 'white',
    borderColor: '#FECACA',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    marginLeft: 8,
  },
})
