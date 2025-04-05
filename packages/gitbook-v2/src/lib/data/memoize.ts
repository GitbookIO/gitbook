import { getCloudflareContext } from './cloudflare';

/**
 * Wrap cache calls to avoid duplicated executions of the same function during concurrent calls.
 * The implementation is based on `p-memoize` but is adapted to work per-request in Cloudflare Workers.
 */
export function memoize<ArgsType extends any[], ReturnType>(
    wrapped: (cacheKey: string, ...args: ArgsType) => Promise<ReturnType>
): (...args: ArgsType) => Promise<ReturnType> {
    const globalCache = new WeakMap<object, Map<string, ReturnType>>();
    const globalPromiseCache = new WeakMap<object, Map<string, Promise<ReturnType>>>();

    return (...args: ArgsType) => {
        const globalContext = getCloudflareContext()?.cf ?? globalThis;

        /**
         * Cache storage that is scoped to the current request when executed in Cloudflare Workers,
         * to avoid "Cannot perform I/O on behalf of a different request" errors.
         */
        const cache = globalCache.get(globalContext) ?? new Map<string, ReturnType>();
        globalCache.set(globalContext, cache);

        const promiseCache =
            globalPromiseCache.get(globalContext) ?? new Map<string, Promise<ReturnType>>();
        globalPromiseCache.set(globalContext, promiseCache);

        const key = getCacheKey(args);

        if (cache.has(key)) {
            const result = cache.get(key);
            return Promise.resolve(result as ReturnType);
        }

        const concurrent = promiseCache.get(key);
        if (concurrent) {
            return concurrent;
        }

        const promise = (async () => {
            try {
                const result = await wrapped(key, ...args);
                cache.set(key, result);

                return result;
            } finally {
                promiseCache.delete(key);
            }
        })();

        promiseCache.set(key, promise);

        return promise;
    };
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
