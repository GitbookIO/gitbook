import pMemoize from 'p-memoize';
import { getCloudflareContext } from './cloudflare';

const requestWeakCache = new WeakMap<object, WeakMap<any, any>>();

/**
 * We wrap cache calls in a p-memoize function to avoid
 * executing the function multiple times when doing concurrent calls.
 *
 * Hopefully one day this can be done directly by 'use cache'.
 */
export function memoize<F extends (...args: any[]) => any>(f: F): F {
    // @ts-ignore
    const globalMemoized: F = (...args) => {
        const globalContext = getCloudflareContext()?.cf ?? globalThis;

        /**
         * Cache storage that is scoped to the current request when executed in Cloudflare Workers,
         * to avoid "Cannot perform I/O on behalf of a different request" errors.
         */
        const requestCache = requestWeakCache.get(globalContext) ?? new WeakMap<any, any>();
        const cached = requestCache.get(f) as F | undefined;
        if (cached) {
            return cached(...args);
        }

        const memoized = pMemoize(f, {
            cacheKey: (args) => {
                return JSON.stringify(deepSortValue(args));
            },
        });

        requestCache.set(f, memoized);
        requestWeakCache.set(globalContext, requestCache);

        return memoized(...args);
    };

    return globalMemoized;
}

export function getCacheKey(args: any[]) {
    return JSON.stringify(deepSortValue(args));
}

function deepSortValue(value: unknown): unknown {
    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null ||
        value === undefined
    ) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(deepSortValue);
    }

    if (value && typeof value === 'object') {
        return Object.entries(value)
            .map(([key, subValue]) => {
                return [key, deepSortValue(subValue)] as const;
            })
            .sort((a, b) => {
                return a[0].localeCompare(b[0]);
            });
    }

    return value;
}
