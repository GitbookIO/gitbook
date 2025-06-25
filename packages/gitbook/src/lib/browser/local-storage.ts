import { checkIsSecurityError } from './security-error';

/**
 * Get an item from local storage safely.
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
    try {
        if (typeof localStorage !== 'undefined' && localStorage && 'getItem' in localStorage) {
            const stored = localStorage.getItem(key);
            return stored ? (JSON.parse(stored) as T) : defaultValue;
        }
        return defaultValue;
    } catch (error) {
        if (checkIsSecurityError(error)) {
            return defaultValue;
        }
        throw error;
    }
}

/**
 * Set an item in local storage safely.
 */
export function setLocalStorageItem(key: string, value: unknown) {
    try {
        if (typeof localStorage !== 'undefined' && localStorage && 'setItem' in localStorage) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    } catch (error) {
        if (checkIsSecurityError(error)) {
            return;
        }
        throw error;
    }
}
