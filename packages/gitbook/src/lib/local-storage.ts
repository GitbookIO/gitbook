/**
 * Get an item from local storage safely.
 */
export function getItem<T>(key: string, defaultValue: T): T {
    try {
        if (typeof localStorage !== 'undefined' && localStorage && 'getItem' in localStorage) {
            const stored = localStorage.getItem(key);
            return stored ? (JSON.parse(stored) as T) : defaultValue;
        }
        return defaultValue;
    } catch (error) {
        if (error instanceof Error && error.name === 'SecurityError') {
            return defaultValue;
        }
        throw error;
    }
}

/**
 * Set an item in local storage safely.
 */
export function setItem(key: string, value: unknown) {
    try {
        if (typeof localStorage !== 'undefined' && localStorage && 'setItem' in localStorage) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'SecurityError') {
            return;
        }
        throw error;
    }
}
