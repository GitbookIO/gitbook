/**
 * Wrap a function by preventing concurrent executions of the same function.
 * With a logic to work per-request in Cloudflare Workers.
 */
export function withoutConcurrentExecution<ArgsType extends any[], ReturnType>(
    getGlobalContext: () => object | null | undefined,
    wrapped: (...args: ArgsType) => Promise<ReturnType>
): (cacheKey: string, ...args: ArgsType) => Promise<ReturnType> {
    const globalPromiseCache = new WeakMap<object, Map<string, Promise<ReturnType>>>();

    return (key: string, ...args: ArgsType) => {
        const globalContext = getGlobalContext() ?? globalThis;

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
                const result = await wrapped(...args);
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
 * Wrap a function by passing it a cache key that is computed from the function arguments.
 */
export function withCacheKey<ArgsType extends any[], ReturnType>(
    wrapped: (cacheKey: string, ...args: ArgsType) => Promise<ReturnType>
): (...args: ArgsType) => Promise<ReturnType> {
    return (...args: ArgsType) => {
        const cacheKey = getCacheKey(args);
        return wrapped(cacheKey, ...args);
    };
}

/**
 * Compute a cache key from the function arguments.
 */
function getCacheKey(args: any[]) {
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
