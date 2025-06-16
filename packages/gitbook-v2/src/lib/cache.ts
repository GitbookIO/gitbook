import { identify } from 'object-identity';
import * as React from 'react';

/**
 * Equivalent to `React.cache` but with support for non-primitive arguments.
 * As `React.cache` only uses `Object.is` to compare arguments, it will not work with non-primitive arguments.
 */
export function cache<Args extends any[], Return>(fn: (...args: Args) => Return) {
    const toStableRef = withStableRef();
    const cached = React.cache(fn);

    return (...args: Args) => {
        const stableArgs = args.map((value) => {
            return toStableRef(value);
        }) as Args;
        return cached(...stableArgs);
    };
}

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
