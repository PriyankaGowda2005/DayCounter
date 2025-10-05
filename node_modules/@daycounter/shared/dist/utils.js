import { v4 as uuidv4 } from 'uuid';
export const generateId = () => uuidv4();
export const createEvent = (data) => {
    const now = new Date().toISOString();
    return {
        id: generateId(),
        title: '',
        description: '',
        createdAt: now,
        targetAt: now,
        tasks: [],
        reminders: [],
        color: '#3B82F6', // Default blue
        isArchived: false,
        notifyDailySummary: true,
        ...data,
    };
};
export const createTask = (text, date) => ({
    id: generateId(),
    text,
    done: false,
    date,
});
export const createReminder = (offsetMinutes, timeOfDay) => ({
    id: generateId(),
    offsetMinutesFromTarget: offsetMinutes,
    timeOfDay,
});
export const calculateCountdown = (targetDate, startDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const start = startDate ? new Date(startDate) : now;
    const totalDuration = target.getTime() - start.getTime();
    const remaining = target.getTime() - now.getTime();
    const isOverdue = remaining < 0;
    const totalSeconds = Math.abs(remaining) / 1000;
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const progress = totalDuration > 0 ? Math.max(0, Math.min(1, (totalDuration - remaining) / totalDuration)) : 0;
    return {
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        isOverdue,
        progress,
    };
};
export const formatTimeRemaining = (countdown) => {
    if (countdown.isOverdue) {
        return `Overdue by ${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`;
    }
    if (countdown.days > 0) {
        return `${countdown.days}d ${countdown.hours}h remaining`;
    }
    else if (countdown.hours > 0) {
        return `${countdown.hours}h ${countdown.minutes}m remaining`;
    }
    else {
        return `${countdown.minutes}m ${countdown.seconds}s remaining`;
    }
};
export const getUpcomingEvents = (events, limit = 3) => {
    const now = new Date();
    return events
        .filter(event => !event.isArchived && new Date(event.targetAt) > now)
        .sort((a, b) => new Date(a.targetAt).getTime() - new Date(b.targetAt).getTime())
        .slice(0, limit);
};
export const getTodaysEvents = (events) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return events.filter(event => {
        const eventDate = new Date(event.targetAt);
        return eventDate >= today && eventDate < tomorrow;
    });
};
export const exportToJSON = (events) => {
    return JSON.stringify(events, null, 2);
};
export const importFromJSON = (json) => {
    try {
        const data = JSON.parse(json);
        return Array.isArray(data) ? data : [];
    }
    catch (error) {
        throw new Error('Invalid JSON format');
    }
};
export const exportToICS = (events) => {
    const formatDate = (date) => {
        return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    let ics = 'BEGIN:VCALENDAR\n';
    ics += 'VERSION:2.0\n';
    ics += 'PRODID:-//DayCounter//Event Tracker//EN\n';
    events.forEach(event => {
        ics += 'BEGIN:VEVENT\n';
        ics += `UID:${event.id}@daycounter.app\n`;
        ics += `DTSTART:${formatDate(event.startAt || event.createdAt)}\n`;
        ics += `DTEND:${formatDate(event.targetAt)}\n`;
        ics += `SUMMARY:${event.title}\n`;
        if (event.description) {
            ics += `DESCRIPTION:${event.description}\n`;
        }
        ics += 'END:VEVENT\n';
    });
    ics += 'END:VCALENDAR\n';
    return ics;
};
export const parseICS = (icsContent) => {
    // Basic ICS parser - in production, use a proper library like ical.js
    const events = [];
    const lines = icsContent.split('\n');
    let currentEvent = null;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'BEGIN:VEVENT') {
            currentEvent = {};
        }
        else if (trimmed === 'END:VEVENT' && currentEvent) {
            if (currentEvent.title && currentEvent.targetAt) {
                events.push(createEvent(currentEvent));
            }
            currentEvent = null;
        }
        else if (currentEvent) {
            if (trimmed.startsWith('SUMMARY:')) {
                currentEvent.title = trimmed.substring(8);
            }
            else if (trimmed.startsWith('DESCRIPTION:')) {
                currentEvent.description = trimmed.substring(12);
            }
            else if (trimmed.startsWith('DTSTART:')) {
                const dateStr = trimmed.substring(8);
                currentEvent.startAt = parseICSDate(dateStr);
            }
            else if (trimmed.startsWith('DTEND:')) {
                const dateStr = trimmed.substring(6);
                currentEvent.targetAt = parseICSDate(dateStr);
            }
        }
    }
    return events;
};
const parseICSDate = (dateStr) => {
    // Convert ICS date format (YYYYMMDDTHHMMSSZ) to ISO string
    if (dateStr.length === 16) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = dateStr.substring(9, 11);
        const minute = dateStr.substring(11, 13);
        const second = dateStr.substring(13, 15);
        return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
    }
    return new Date().toISOString();
};
