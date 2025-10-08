import { checkIsSecurityError } from './security-error';

/**
 * Reusable function to read from any kind of Storage
 */
function readStorage<T>(storage: Storage | undefined, key: string, defaultValue: T): T {
    try {
        if (storage && 'getItem' in storage) {
            const stored = storage.getItem(key);
            return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
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
 * Reusable function to write to any kind of Storage
 */
function writeStorage(storage: Storage | undefined, key: string, value: unknown) {
    try {
        if (storage && 'setItem' in storage) {
            storage.setItem(key, JSON.stringify(value));
        }
    } catch (error) {
        if (checkIsSecurityError(error)) {
            return;
        }
        throw error;
    }
}

function removeStorage(storage: Storage | undefined, key: string) {
    try {
        if (storage && 'removeItem' in storage) {
            storage.removeItem(key);
        }
    } catch (error) {
        if (checkIsSecurityError(error)) {
            return;
        }
        throw error;
    }
}

/**
 * Get an item from local storage safely.
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
    return readStorage(
        typeof localStorage !== 'undefined' ? localStorage : undefined,
        key,
        defaultValue
    );
}

/**
 * Set an item in local storage safely.
 */
export function setLocalStorageItem(key: string, value: unknown) {
    writeStorage(typeof localStorage !== 'undefined' ? localStorage : undefined, key, value);
}

/**
 * Get an item from session storage safely.
 */
export function getSessionStorageItem<T>(key: string, defaultValue: T): T {
    return readStorage(
        typeof sessionStorage !== 'undefined' ? sessionStorage : undefined,
        key,
        defaultValue
    );
}

/**
 * Set an item in session storage safely.
 */
export function setSessionStorageItem(key: string, value: unknown) {
    writeStorage(typeof sessionStorage !== 'undefined' ? sessionStorage : undefined, key, value);
}

/**
 * Remove an item from session storage safely.
 */
export function removeSessionStorageItem(key: string) {
    removeStorage(typeof sessionStorage !== 'undefined' ? sessionStorage : undefined, key);
}
