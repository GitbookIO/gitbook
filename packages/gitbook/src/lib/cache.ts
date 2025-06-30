import { identify } from 'object-identity';
import * as React from 'react';

/**
 * Equivalent to `React.cache` but with support for non-primitive arguments.
 * As `React.cache` only uses `Object.is` to compare arguments, it will not work with non-primitive arguments.
 */
export function cache<Args extends any[], Return>(fn: (...args: Args) => Return) {
    const cached = React.cache(fn);

    return (...args: Args) => {
        const toStableRef = getWithStableRef();
        const stableArgs = args.map((value) => {
            return toStableRef(value);
        }) as Args;
        return cached(...stableArgs);
    };
}

/**
 * To ensure memory is garbage collected between each request, we use a per-request cache to store the ref maps.
 */
const getWithStableRef = React.cache(withStableRef);

/**
 * Create a function that converts a value to a stable reference.
 */
export function withStableRef(): <T>(value: T) => T {
    const reverseIndex = new WeakMap<object, string>();
    const refIndex = new Map<string, object>();

    return <T>(value: T) => {
        if (isPrimitive(value)) {
            return value;
        }

        const objectValue = value as object;
        const index = reverseIndex.get(objectValue);
        if (index !== undefined) {
            return refIndex.get(index) as T;
        }

        const hash = identify(objectValue);
        reverseIndex.set(objectValue, hash);

        const existing = refIndex.get(hash);
        if (existing !== undefined) {
            return existing as T;
        }

        // first time we've seen this shape
        refIndex.set(hash, objectValue);
        return value;
    };
}

function isPrimitive(value: any): boolean {
    return value === null || typeof value !== 'object';
}
