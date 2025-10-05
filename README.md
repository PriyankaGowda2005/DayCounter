# DayCounter - Cross-platform Day/Countdown Tracker

A polished product that lets users create & track countdown events (exams, hackathons, deadlines) across multiple platforms.

## 🚀 Features

- **Create Events**: Title, description, dates, recurring events, categories, colors
- **Countdown Tracking**: Days remaining, progress bars, daily tasks
- **Notifications**: Local push notifications with customizable reminders
- **Cross-Platform**: Web app, Chrome extension, Android APK
- **Import/Export**: JSON and iCalendar (.ics) support
- **Offline-First**: Local storage with optional cloud sync
- **PWA Support**: Install as a web app on any device

## 📱 Platforms

| Platform                | Status     | Description                                  |
| ----------------------- | ---------- | -------------------------------------------- |
| 🌐 **Web App**          | ✅ Complete | React + PWA with offline support             |
| 🔌 **Chrome Extension** | ✅ Complete | Manifest V3 with popup and notifications     |
| 📱 **Android App**      | ✅ Complete | React Native + Expo with local notifications |

## 🏗️ Project Structure

```
DayCounter/
├── web/                 # React web app (PWA)
├── extension/          # Chrome Extension (Manifest V3)
├── mobile/             # React Native/Expo Android app
├── shared/             # Shared utilities, models, UI tokens
├── scripts/            # Build and deployment scripts
└── docs/               # Documentation and guides
```

## 🛠️ Tech Stack

### Web App

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + Custom Design System
- **State**: Zustand + Persistence
- **Storage**: IndexedDB (localForage)
- **PWA**: Vite PWA Plugin + Service Worker

### Chrome Extension

- **Framework**: React + TypeScript + Vite
- **Manifest**: V3 (Service Worker)
- **Storage**: chrome.storage.local
- **Notifications**: Chrome Notifications API + Alarms API

### Mobile App

- **Framework**: React Native + Expo
- **Navigation**: React Navigation 6
- **Storage**: SQLite (expo-sqlite)
- **Notifications**: expo-notifications
- **File System**: expo-file-system + expo-sharing

### Shared

- **Language**: TypeScript
- **Utilities**: Date handling, countdown calculations, import/export
- **Design Tokens**: Colors, spacing, typography, icons

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- For Android: Expo CLI (`npm install -g @expo/cli`)

### 1. Clone and Install

```bash
git clone https://github.com/PriyankaGowda2005/DayCounter---Cross-platform-Day-Countdown-Tracker.git
cd DayCounter---Cross-platform-Day-Countdown-Tracker
npm install
```

### 2. Development Setup

#### Web App

```bash
npm run dev:web
# Opens at http://localhost:5173
```

#### Chrome Extension

```bash
npm run dev:extension
# Builds to extension/dist/
# Load as unpacked extension in Chrome
```

#### Mobile App

```bash
npm run dev:mobile
# Starts Expo development server
# Scan QR code with Expo Go app
```

### 3. Building for Production

#### Build All Platforms

```bash
npm run build
# Creates dist/ directory with all builds
```

#### Individual Builds

```bash
npm run build:web      # Web app
npm run build:extension # Chrome extension
npm run build:mobile   # Mobile app
```

## 📦 Installation & Deployment

### Web App Deployment

1. Build the web app: `npm run build:web`
2. Deploy `web/dist/` to your hosting provider:
   - **Vercel**: `vercel --prod`
   - **Netlify**: Drag `web/dist/` to Netlify
   - **GitHub Pages**: Use GitHub Actions workflow

### Chrome Extension Installation

1. Build the extension: `npm run build:extension`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select `extension/dist/`
5. The extension will appear in your browser toolbar

### Android APK Build

1. Install Expo CLI: `npm install -g @expo/cli`
2. Navigate to mobile directory: `cd mobile`
3. Build APK: `expo build:android`
4. Download the APK from Expo dashboard

## 🔧 Development

### Adding New Features

1. **Shared Logic**: Add utilities to `shared/src/`
2. **Web Components**: Add to `web/src/components/`
3. **Extension Features**: Add to `extension/src/`
4. **Mobile Screens**: Add to `mobile/src/screens/`

### Data Model

```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  startAt?: string;
  targetAt: string;
  timezone?: string;
  recurring?: {
    freq: "daily" | "weekly" | "monthly";
    until?: string;
  };
  tasks: Task[];
  reminders: Reminder[];
  color: string;
  icon?: string;
  category?: string;
  isArchived: boolean;
  notifyDailySummary: boolean;
}
```

### Notification System

Each platform implements notifications differently:

- **Web**: Browser Notifications API
- **Extension**: Chrome Notifications + Alarms API
- **Mobile**: Expo Notifications + Local Scheduling

### Sync Adapter Interface

```typescript
interface SyncAdapter {
  save(event: Event): Promise<void>;
  fetch(): Promise<Event[]>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}
```

Currently implements local storage. Cloud sync can be added by implementing this interface.

## 🧪 Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:web      # Web app tests
npm run test:mobile   # Mobile app tests
```

### Test Coverage

- Unit tests for shared utilities
- Component tests for React components
- Integration tests for data flow
- E2E tests for critical user journeys

## 📋 Development Milestones

- [x] Project scaffolding and shared utilities
- [x] Web app with event CRUD and countdown UI
- [x] Chrome extension with popup and notifications
- [x] Mobile app with local notifications
- [x] Import/export functionality
- [x] Sync adapter interface
- [x] Build scripts and CI/CD
- [x] Documentation and testing

## 🔮 Future Enhancements

### Phase 2 Features

- [ ] Cloud sync (Firebase/PostgreSQL)
- [ ] User authentication
- [ ] Team collaboration
- [ ] Advanced recurring patterns
- [ ] Native Android widgets
- [ ] iOS app support

### Phase 3 Features

- [ ] Web push notifications
- [ ] Calendar integration
- [ ] Email reminders
- [ ] Analytics dashboard
- [ ] API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow the existing code style
- Test on all platforms

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Expo](https://expo.dev/) - Mobile development platform
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Vite](https://vitejs.dev/) - Build tool

## 📞 Support

- 📧 Email: support@daycounter.app
- 🐛 Issues: [GitHub Issues](https://github.com/PriyankaGowda2005/DayCounter---Cross-platform-Day-Countdown-Tracker/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/PriyankaGowda2005/DayCounter---Cross-platform-Day-Countdown-Tracker/discussions)

---

**Made with ❤️ for students, professionals, and anyone who needs to track important deadlines.**
