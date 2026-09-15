import type { ContentKitDynamicBinding } from '@gitbook/api';

/**
 * Get a value from the state.
 */
export function getStateStringValue(state: object, key: string): string | undefined {
    // @ts-ignore
    const value = state[key];
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number') {
        return `${value}`;
    }

    return undefined;
}

/**
 * Resolve a potential dynamic binding as a plain value.
 */
export function resolveDynamicBinding<T extends {}>(
    state: object,
    value: ContentKitDynamicBinding | T
): T {
    if (Array.isArray(value)) {
        // @ts-ignore
        return value.map((v) => resolveDynamicBinding(state, v));
    }

    // Only an object literal can hold a binding: `'$state' in value` throws on `null`, and the
    // entries walk below would flatten a class instance (a webframe can post a `Date`) to `{}`.
    const prototype =
        typeof value === 'object' && value !== null ? Object.getPrototypeOf(value) : undefined;
    if (prototype !== Object.prototype && prototype !== null) {
        // @ts-ignore
        return value;
    }

    if ('$state' in value && typeof value.$state === 'string') {
        // @ts-ignore
        return state[value.$state];
    }

    // Plain object
    const result = {};
    Object.entries(value).forEach(([key, keyValue]) => {
        // @ts-ignore
        result[key] = resolveDynamicBinding(state, keyValue);
    });

    // @ts-ignore
    return result;
}
