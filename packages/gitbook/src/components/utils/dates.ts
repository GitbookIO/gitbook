/**
 * Format date as MM/DD/YYYY (e.g., "05/11/2025")
 */
export function formatNumericDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

/**
 * Format date as "Month Day, Year" (e.g., "November 5, 2025")
 */
export function formatDateFull(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

/**
 * Format date as "Nov. 5 2025"
 */
export function formatDateShort(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

/**
 * Format date with weekday (e.g., "Monday, Nov 5, 2025").
 */
export function formatDateWeekday(date: Date, locale: string): string {
    return date.toLocaleDateString(locale, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format date with time (e.g., "Nov 5, 2025, 3:30 PM").
 */
export function formatDateTime(date: Date, locale: string): string {
    return date.toLocaleString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const RELATIVE_THRESHOLDS: Array<[number, number, Intl.RelativeTimeFormatUnit]> = [
    [HOUR, MINUTE, 'minute'],
    [DAY, HOUR, 'hour'],
    [MONTH, DAY, 'day'],
    [YEAR, MONTH, 'month'],
];

/**
 * Format a millisecond diff as a human-readable relative time string (e.g., "3 days ago").
 */
export function formatRelative(locale: string, diffMs: number): string {
    if (typeof Intl === 'undefined' || typeof Intl.RelativeTimeFormat === 'undefined') {
        return `${Math.floor(diffMs / DAY)} days ago`;
    }

    const rtf = new Intl.RelativeTimeFormat(locale, { style: 'long' });

    for (const [threshold, divisor, unit] of RELATIVE_THRESHOLDS) {
        if (diffMs < threshold) {
            return rtf.format(-Math.floor(diffMs / divisor), unit);
        }
    }

    return rtf.format(-Math.floor(diffMs / YEAR), 'year');
}
