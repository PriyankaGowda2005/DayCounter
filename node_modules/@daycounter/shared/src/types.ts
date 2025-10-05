export interface Event {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  startAt?: string;
  targetAt: string;
  timezone?: string;
  recurring?: {
    freq: 'daily' | 'weekly' | 'monthly';
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

export interface Task {
  id: string;
  text: string;
  done: boolean;
  date: string;
}

export interface Reminder {
  id: string;
  offsetMinutesFromTarget: number;
  timeOfDay?: string;
}

export interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isOverdue: boolean;
  progress: number; // 0-1
}

export interface SyncAdapter {
  save(event: Event): Promise<void>;
  fetch(): Promise<Event[]>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}

export interface NotificationService {
  scheduleReminder(event: Event, reminder: Reminder): Promise<void>;
  scheduleDailySummary(time: string): Promise<void>;
  cancelReminder(id: string): Promise<void>;
  requestPermission(): Promise<boolean>;
}
