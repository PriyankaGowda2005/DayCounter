// Design tokens for consistent UI across platforms
export const colors = {
    // Primary colors
    primary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
    },
    // Event category colors
    categories: {
        exam: '#EF4444', // Red
        hackathon: '#8B5CF6', // Purple
        assignment: '#F59E0B', // Amber
        deadline: '#10B981', // Emerald
        personal: '#06B6D4', // Cyan
        work: '#6366F1', // Indigo
        default: '#3B82F6', // Blue
    },
    // Status colors
    status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
    },
    // Neutral colors
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },
    // Dark mode colors
    dark: {
        bg: '#0F172A',
        surface: '#1E293B',
        border: '#334155',
        text: '#F1F5F9',
        muted: '#94A3B8',
    },
};
export const spacing = {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
};
export const borderRadius = {
    sm: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    full: '9999px',
};
export const shadows = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};
export const typography = {
    fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
        xs: '0.75rem', // 12px
        sm: '0.875rem', // 14px
        base: '1rem', // 16px
        lg: '1.125rem', // 18px
        xl: '1.25rem', // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
    },
    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
};
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};
// Icon mappings for different event types
export const eventIcons = {
    exam: '📝',
    hackathon: '💻',
    assignment: '📋',
    deadline: '⏰',
    personal: '👤',
    work: '💼',
    default: '📅',
};
// Default reminder presets
export const reminderPresets = [
    { label: '1 hour before', offsetMinutes: -60 },
    { label: '1 day before', offsetMinutes: -1440 },
    { label: '3 days before', offsetMinutes: -4320 },
    { label: '1 week before', offsetMinutes: -10080 },
];
