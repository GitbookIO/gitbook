/**
 * Generate a random ID.
 */
export function generateRandomId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${crypto.randomUUID()}R`;
    }

    // Fallback for old browsers
    return `${Math.random().toString(36).substring(2)}R`;
}
