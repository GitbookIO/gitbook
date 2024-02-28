import { ContentKitDynamicBinding } from '@gitbook/api';

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
    value: ContentKitDynamicBinding | T,
): T {
    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'undefined'
    ) {
        // Primitives
        return value;
    }

    if (Array.isArray(value)) {
        // @ts-ignore
        return value.map((v) => resolveDynamicBinding(localState, v));
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
