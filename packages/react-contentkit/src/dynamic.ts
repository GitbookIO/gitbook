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

    // Only plain objects can hold a binding. Primitives, `null` and class instances such as
    // `Date` (which a webframe can post through a structured clone) must pass through untouched,
    // as the `Object.entries` walk below would flatten them.
    if (!isPlainObject(value)) {
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}
