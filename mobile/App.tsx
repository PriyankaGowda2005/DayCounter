import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Screens
import { HomeScreen } from './src/screens/HomeScreen'
import { EventDetailScreen } from './src/screens/EventDetailScreen'
import { CreateEventScreen } from './src/screens/CreateEventScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { NotificationService } from './src/services/NotificationService'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

function EventsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="EventsList" 
        component={HomeScreen}
        options={{ title: 'DayCounter' }}
      />
      <Stack.Screen 
        name="EventDetail" 
        component={EventDetailScreen}
        options={{ title: 'Event Details' }}
      />
      <Stack.Screen 
        name="CreateEvent" 
        component={CreateEventScreen}
        options={{ title: 'New Event' }}
      />
    </Stack.Navigator>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline'
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline'
          } else {
            iconName = 'help-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Events" component={EventsStack} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

export default function App() {
  React.useEffect(() => {
    // Initialize notification service
    NotificationService.initialize()
  }, [])

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  )
}
