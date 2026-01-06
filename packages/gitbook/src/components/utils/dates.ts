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
