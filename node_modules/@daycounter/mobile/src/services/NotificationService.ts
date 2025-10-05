import * as Notifications from 'expo-notifications'
import { Event, calculateCountdown } from '@shared'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export class NotificationService {
  static async initialize() {
    // Request permissions on app start
    await this.requestPermission()
  }

  static async requestPermission(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync()
    return status === 'granted'
  }

  static async getPermissionStatus(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync()
    return status === 'granted'
  }

  static async scheduleEventReminders(event: Event) {
    try {
      // Cancel existing notifications for this event
      await this.cancelEventReminders(event.id)

      // Schedule new reminders
      for (const reminder of event.reminders) {
        const reminderTime = new Date(event.targetAt)
        reminderTime.setMinutes(reminderTime.getMinutes() + reminder.offsetMinutesFromTarget)
        
        if (reminderTime > new Date()) {
          const countdown = calculateCountdown(event.targetAt, event.startAt)
          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'DayCounter Reminder',
              body: `${event.title} - ${countdown.isOverdue ? 'Overdue!' : `${countdown.days} days remaining`}`,
              data: { eventId: event.id, type: 'reminder' },
            },
            trigger: {
              date: reminderTime,
            },
          })
        }
      }
    } catch (error) {
      console.error('Error scheduling reminders:', error)
    }
  }

  static async scheduleDailySummary(time: string) {
    try {
      // Cancel existing daily summary
      await this.cancelDailySummary()

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

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'DayCounter Daily Summary',
          body: 'Check your upcoming events and tasks for today',
          data: { type: 'daily-summary' },
        },
        trigger: {
          date: nextSummary,
          repeats: true,
        },
      })
    } catch (error) {
      console.error('Error scheduling daily summary:', error)
    }
  }

  static async cancelEventReminders(eventId: string) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync()
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.eventId === eventId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier)
        }
      }
    } catch (error) {
      console.error('Error canceling event reminders:', error)
    }
  }

  static async cancelDailySummary() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync()
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === 'daily-summary') {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier)
        }
      }
    } catch (error) {
      console.error('Error canceling daily summary:', error)
    }
  }

  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync()
    } catch (error) {
      console.error('Error canceling all notifications:', error)
    }
  }

  static async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync()
    } catch (error) {
      console.error('Error getting scheduled notifications:', error)
      return []
    }
  }

  // Test notification (for debugging)
  static async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from DayCounter',
          data: { type: 'test' },
        },
        trigger: {
          seconds: 2,
        },
      })
    } catch (error) {
      console.error('Error sending test notification:', error)
    }
  }
}
