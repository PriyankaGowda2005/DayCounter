import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Event, calculateCountdown, formatTimeRemaining, eventIcons } from '@shared'
import { useMobileStore } from '../../store'

interface CountdownCardProps {
  event: Event
  onPress: () => void
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ event, onPress }) => {
  const countdown = calculateCountdown(event.targetAt, event.startAt)
  const icon = event.icon || eventIcons[event.category as keyof typeof eventIcons] || eventIcons.default

  const getStatusColor = () => {
    if (countdown.isOverdue) return '#EF4444'
    if (countdown.days <= 1) return '#F59E0B'
    return '#10B981'
  }

  const getStatusText = () => {
    if (countdown.isOverdue) return 'Overdue'
    return `${countdown.days}d left`
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.titleTextContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {event.title}
            </Text>
            {event.category && (
              <View style={[styles.categoryBadge, { backgroundColor: `${event.color}20` }]}>
                <Text style={[styles.categoryText, { color: event.color }]}>
                  {event.category}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {event.description && (
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.timeInfo}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.timeText}>
            {formatTimeRemaining(countdown)}
          </Text>
        </View>

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
            {Math.round(countdown.progress * 100)}%
          </Text>
        </View>
      </View>

      {event.tasks.length > 0 && (
        <View style={styles.tasksContainer}>
          <Text style={styles.tasksTitle}>
            Tasks ({event.tasks.filter(t => t.done).length}/{event.tasks.length})
          </Text>
          {event.tasks.slice(0, 2).map(task => (
            <View key={task.id} style={styles.taskItem}>
              <Ionicons 
                name={task.done ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={task.done ? "#10B981" : "#9CA3AF"} 
              />
              <Text style={[
                styles.taskText,
                task.done && styles.taskTextDone
              ]}>
                {task.text}
              </Text>
            </View>
          ))}
          {event.tasks.length > 2 && (
            <Text style={styles.moreTasks}>
              +{event.tasks.length - 2} more tasks
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  tasksContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tasksTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  moreTasks: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
})
