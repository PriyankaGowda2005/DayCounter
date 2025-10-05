import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Event, createEvent, eventIcons, reminderPresets } from '@shared'
import { useMobileStore } from '../../store'
import { NotificationService } from '../../services/NotificationService'

export const CreateEventScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { addEvent } = useMobileStore()
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    targetAt: new Date().toISOString().slice(0, 16),
    startAt: '',
    category: '',
    color: '#3B82F6',
    icon: '',
    notifyDailySummary: true,
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = async () => {
    if (!formData.title || !formData.targetAt) {
      Alert.alert('Error', 'Please fill in the required fields')
      return
    }

    try {
      const event = createEvent(formData)
      await addEvent(event)
      
      // Schedule notifications if permission granted
      const hasPermission = await NotificationService.getPermissionStatus()
      if (hasPermission) {
        await NotificationService.scheduleEventReminders(event)
      }
      
      navigation.goBack()
    } catch (error) {
      Alert.alert('Error', 'Failed to create event')
    }
  }

  const handleInputChange = (field: keyof Event, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#6366F1'
  ]

  const categories = ['exam', 'hackathon', 'assignment', 'deadline', 'personal', 'work']

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Event</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                placeholder="e.g., Final Exam, Project Deadline"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                placeholder="Add details about this event..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Target Date & Time *</Text>
              <TextInput
                style={styles.input}
                value={formData.targetAt}
                onChangeText={(text) => handleInputChange('targetAt', text)}
                placeholder="YYYY-MM-DDTHH:MM"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Date & Time (optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.startAt}
                onChangeText={(text) => handleInputChange('startAt', text)}
                placeholder="YYYY-MM-DDTHH:MM"
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    formData.category === category && styles.categoryButtonSelected
                  ]}
                  onPress={() => handleInputChange('category', category)}
                >
                  <Text style={styles.categoryIcon}>
                    {eventIcons[category as keyof typeof eventIcons]}
                  </Text>
                  <Text style={[
                    styles.categoryText,
                    formData.category === category && styles.categoryTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color Theme</Text>
            <View style={styles.colorGrid}>
              {colors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    formData.color === color && styles.colorButtonSelected
                  ]}
                  onPress={() => handleInputChange('color', color)}
                />
              ))}
            </View>
          </View>

          {/* Advanced Options */}
          <TouchableOpacity
            style={styles.advancedToggle}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Text style={styles.advancedToggleText}>
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Text>
            <Ionicons 
              name={showAdvanced ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#3B82F6" 
            />
          </TouchableOpacity>

          {showAdvanced && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Advanced Options</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Daily Summary</Text>
                  <Text style={styles.settingDescription}>
                    Include in daily summary notifications
                  </Text>
                </View>
                <Switch
                  value={formData.notifyDailySummary}
                  onValueChange={(value) => handleInputChange('notifyDailySummary', value)}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor={formData.notifyDailySummary ? '#FFFFFF' : '#F3F4F6'}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Custom Icon (emoji)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.icon}
                  onChangeText={(text) => handleInputChange('icon', text)}
                  placeholder="🎯"
                  maxLength={2}
                />
              </View>
            </View>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: '30%',
  },
  categoryButtonSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryTextSelected: {
    color: '#3B82F6',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#111827',
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  advancedToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
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
})
