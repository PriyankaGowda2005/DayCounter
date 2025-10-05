# DayCounter Development Guide

This guide provides detailed information for developers working on the DayCounter project.

## 🏗️ Architecture Overview

DayCounter is built as a monorepo with shared code across three platforms:

```
DayCounter/
├── shared/           # Common utilities, types, and design tokens
├── web/              # React web application (PWA)
├── extension/        # Chrome Extension (Manifest V3)
├── mobile/           # React Native/Expo mobile app
└── scripts/          # Build and deployment automation
```

## 📁 Shared Package

The `shared` package contains:

- **Types**: Event, Task, Reminder interfaces
- **Utils**: Date calculations, countdown logic, import/export
- **Design Tokens**: Colors, spacing, typography, icons
- **Constants**: Event categories, reminder presets

### Key Utilities

```typescript
// Calculate countdown from target date
const countdown = calculateCountdown(targetDate, startDate?)

// Format time remaining for display
const formatted = formatTimeRemaining(countdown)

// Get upcoming events (sorted by date)
const upcoming = getUpcomingEvents(events, limit)

// Export/import functionality
const jsonData = exportToJSON(events)
const icsData = exportToICS(events)
```

## 🌐 Web Application

### Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Zustand** for state management
- **localForage** for IndexedDB storage
- **Vite PWA Plugin** for PWA features

### Key Components

#### App.tsx

Main application component with:

- Header with dark mode toggle
- Quick stats dashboard
- Upcoming events preview
- Full events list

#### CountdownCard.tsx

Displays individual event with:

- Countdown timer
- Progress bar
- Task completion status
- Category and color coding

#### EventForm.tsx

Modal for creating/editing events with:

- Basic event information
- Category and color selection
- Advanced options (notifications, custom icons)

#### SettingsModal.tsx

Settings panel with:

- Dark mode toggle
- Data export/import
- Notification preferences
- Clear all data option

### State Management

```typescript
// Zustand store with persistence
const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      events: [],
      isLoading: false,
      error: null,

      addEvent: async (event) => {
        /* ... */
      },
      updateEvent: async (event) => {
        /* ... */
      },
      deleteEvent: async (id) => {
        /* ... */
      },
    }),
    { name: "daycounter-store" }
  )
);
```

### PWA Features

- Service worker for offline functionality
- App manifest for installation
- Background sync capabilities
- Push notification support

## 🔌 Chrome Extension

### Manifest V3 Features

- Service worker for background tasks
- Popup interface for quick access
- Badge updates with countdown days
- Keyboard shortcuts
- Storage permissions

### Key Files

#### background.ts

Service worker handling:

- Alarm scheduling for notifications
- Notification creation and handling
- Storage change listeners
- Command handling

#### PopupApp.tsx

Main popup interface with:

- Upcoming events list (max 3)
- Quick actions
- Badge count updates
- Link to full web app

### Notification System

```typescript
// Schedule reminder for event
chrome.alarms.create(`reminder-${eventId}`, {
  when: reminderTime.getTime(),
});

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("reminder-")) {
    handleReminderAlarm(alarm);
  }
});
```

### Storage Strategy

- Uses `chrome.storage.local` for event data
- Syncs with web app via storage events
- Handles offline scenarios gracefully

## 📱 Mobile Application

### Tech Stack

- **React Native** with Expo
- **React Navigation 6** for navigation
- **SQLite** for persistent storage
- **Expo Notifications** for local notifications
- **Expo File System** for import/export

### Navigation Structure

```
MainTabs
├── EventsStack
│   ├── HomeScreen (Events List)
│   ├── EventDetailScreen
│   └── CreateEventScreen
└── SettingsScreen
```

### Key Screens

#### HomeScreen

- Events list with pull-to-refresh
- Empty state with call-to-action
- Quick add button
- Search and filter capabilities

#### EventDetailScreen

- Full event information
- Interactive task management
- Notification settings
- Archive/delete actions

#### CreateEventScreen

- Form with validation
- Category and color selection
- Advanced options
- Real-time preview

### Storage Implementation

```typescript
// SQLite database operations
const db = SQLite.openDatabase("daycounter.db");

// Initialize tables
db.transaction((tx) => {
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      -- ... other fields
    )
  `);
});

// CRUD operations
const saveEvent = async (event: Event) => {
  await new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO events (...) VALUES (?, ?, ...)",
        [event.id, event.title /* ... */],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
```

### Notification Service

```typescript
class NotificationService {
  static async scheduleEventReminders(event: Event) {
    for (const reminder of event.reminders) {
      const reminderTime = new Date(event.targetAt);
      reminderTime.setMinutes(
        reminderTime.getMinutes() + reminder.offsetMinutesFromTarget
      );

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "DayCounter Reminder",
          body: `${event.title} - ${countdown.days} days remaining`,
        },
        trigger: { date: reminderTime },
      });
    }
  }
}
```

## 🔄 Data Flow

### Event Lifecycle

1. **Create**: User fills form → Validation → Store in local storage
2. **Update**: User modifies event → Validation → Update storage
3. **Delete**: User confirms deletion → Remove from storage
4. **Sync**: Storage changes trigger UI updates

### Cross-Platform Sync

- Web app uses IndexedDB
- Extension uses chrome.storage.local
- Mobile uses SQLite
- Future: Cloud sync adapter

## 🧪 Testing Strategy

### Unit Tests

- Shared utilities (date calculations, formatting)
- Store actions and reducers
- Component logic

### Integration Tests

- Data persistence across platforms
- Notification scheduling
- Import/export functionality

### E2E Tests

- Complete user journeys
- Cross-platform workflows
- Offline scenarios

## 🚀 Build Process

### Development Builds

```bash
# Web app
npm run dev:web

# Chrome extension
npm run dev:extension

# Mobile app
npm run dev:mobile
```

### Production Builds

```bash
# All platforms
npm run build

# Individual platforms
npm run build:web
npm run build:extension
npm run build:mobile
```

### Build Artifacts

- **Web**: Static files in `web/dist/`
- **Extension**: Packed extension in `extension/dist/`
- **Mobile**: Expo build artifacts

## 🔧 Configuration

### Environment Variables

```bash
# Web app
VITE_API_URL=https://api.daycounter.app
VITE_FIREBASE_CONFIG=...

# Mobile app
EXPO_PUBLIC_API_URL=https://api.daycounter.app
```

### Platform-Specific Configs

#### Web (vite.config.ts)

```typescript
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        /* PWA manifest */
      },
    }),
  ],
});
```

#### Extension (vite.config.ts)

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: "src/popup.html",
        background: "src/background.ts",
      },
    },
  },
});
```

#### Mobile (app.json)

```json
{
  "expo": {
    "name": "DayCounter",
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png"
        }
      ]
    ]
  }
}
```

## 🐛 Debugging

### Web App

- Browser DevTools
- React DevTools extension
- PWA debugging tools

### Chrome Extension

- Extension DevTools
- Service worker debugging
- Storage inspection

### Mobile App

- Expo DevTools
- React Native Debugger
- Device logs

## 📊 Performance Considerations

### Web App

- Code splitting with React.lazy
- Image optimization
- Service worker caching
- Bundle size optimization

### Chrome Extension

- Minimal popup bundle size
- Efficient background processing
- Storage quota management

### Mobile App

- SQLite query optimization
- Image caching
- Memory management
- Battery usage optimization

## 🔒 Security

### Data Protection

- Local-first approach
- Encrypted storage options
- Secure import/export
- Privacy controls

### Platform Security

- Content Security Policy (web)
- Extension permissions (Chrome)
- App permissions (mobile)

## 📈 Monitoring & Analytics

### Error Tracking

- Sentry integration
- Platform-specific error handling
- User feedback collection

### Performance Monitoring

- Core Web Vitals (web)
- Extension performance metrics
- Mobile app performance

## 🚀 Deployment

### Web App

- Static hosting (Vercel, Netlify)
- CDN distribution
- PWA deployment

### Chrome Extension

- Chrome Web Store submission
- Unpacked extension distribution
- Update mechanisms

### Mobile App

- Google Play Store
- APK distribution
- OTA updates via Expo

## 🔮 Future Architecture

### Micro-Frontend Approach

- Independent platform teams
- Shared component library
- API-first design

### Cloud Integration

- Real-time sync
- Multi-device support
- Team collaboration features

### Advanced Features

- AI-powered suggestions
- Calendar integration
- Third-party app connections
