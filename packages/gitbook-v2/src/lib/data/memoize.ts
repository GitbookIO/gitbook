import { cache } from 'react';
import { getCloudflareContext } from './cloudflare';

// This is used to create a context specific to the current request.
// This version works both in cloudflare and in vercel.
const getRequestContext = cache(() => ({}));

const globalMapSymbol = Symbol('globalPromiseCache');

/**
 * Wrap a function by preventing concurrent executions of the same function.
 * With a logic to work per-request.
 * This is the one to use if you're using `use cache` in your function or any other caching mechanism (i.e. cacheTag) from Next.js.
 */
export function withoutConcurrentRequestExecution<ArgsType extends any[], ReturnType>(
    wrapped: (key: string, ...args: ArgsType) => Promise<ReturnType>
): (cacheKey: string, ...args: ArgsType) => Promise<ReturnType> {
    const globalPromiseCache = new WeakMap<object, Map<string, Promise<ReturnType>>>();

    return (key: string, ...args: ArgsType) => {
        const globalContext = getRequestContext();

        /**
         * Cache storage that is scoped to the current request when executed in Cloudflare Workers,
         * to avoid "Cannot perform I/O on behalf of a different request" errors.
         */
        const promiseCache =
            globalPromiseCache.get(globalContext) ?? new Map<string, Promise<ReturnType>>();
        globalPromiseCache.set(globalContext, promiseCache);

        const concurrent = promiseCache.get(key);
        if (concurrent) {
            return concurrent;
        }

        const promise = (async () => {
            try {
                const result = await wrapped(key, ...args);
                return result;
            } finally {
                promiseCache.delete(key);
            }
        })();

        promiseCache.set(key, promise);

        return promise;
    };
}

/**
 *
 * This function should not be used for a function that uses `use cache`.
 * It should only be used for functions inside a `use cache` and should under no circumstances contain any side effects or `cacheTag`
 *
 * @param cacheKey The cache key to use for the concurrent execution.
 * @param wrapped The function to wrap. It should return a Promise and have no arguments.
 * @returns A Promise that resolves to the result of the wrapped function.
 */
export function withoutConcurrentProcessExecution<ReturnType>(
    cacheKey: string,
    wrapped: () => Promise<ReturnType>
): Promise<ReturnType> {
    // If we are in cloudflare workers, we just want to execute the function to avoid concurrent I/O errors.
    const cfContext = getCloudflareContext();
    if (cfContext) {
        return wrapped();
    }
    const globalMapPromiseCache = getGlobalPromiseCache<ReturnType>();

    const concurrent = globalMapPromiseCache.get(cacheKey);
    if (concurrent) {
        return concurrent;
    }

    const promise = (async () => {
        try {
            const result = await wrapped();
            return result;
        } finally {
            globalMapPromiseCache.delete(cacheKey);
        }
    })();

    globalMapPromiseCache.set(cacheKey, promise);

    return promise;
}

/**
 * Wrap a function by passing it a cache key that is computed from the function arguments.
 */
export function withCacheKey<ArgsType extends any[], ReturnType>(
    wrapped: (cacheKey: string, ...args: ArgsType) => Promise<ReturnType>
): (...args: ArgsType) => Promise<ReturnType> {
    return (...args: ArgsType) => {
        const cacheKey = getCacheKey(args, wrapped.name);
        return wrapped(cacheKey, ...args);
    };
}

/**
 * Compute a cache key from the function arguments.
 * We need to use the function name and the arguments to ensure that
 * the cache key is unique for each function and its arguments.
 * This is useful to avoid cache collisions when using the same arguments
 * for different functions.
 */
function getCacheKey(args: any[], name: string) {
    return JSON.stringify({
        args: deepSortValue(args),
        name,
    });
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

/**
 *
 * @returns A global cache that is shared across all requests.
 * This cache is used to store promises that are being executed concurrently.
 */
export function getGlobalPromiseCache<ReturnType>(): Map<string, Promise<ReturnType>> {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const globalMapPromiseCache = (globalThis as any)[globalMapSymbol] as
        | Map<string, Promise<ReturnType>>
        | undefined;
    if (!globalMapPromiseCache) {
        const newCache = new Map<string, Promise<ReturnType>>();
        (globalThis as any)[globalMapSymbol] = newCache;
        return newCache;
    }
    return globalMapPromiseCache;
}
