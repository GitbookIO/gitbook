import 'server-only';
import { workAsyncStorage } from 'next/dist/server/app-render/work-async-storage.external';
import { identify } from 'object-identity';

/**
 * Request-scoped values that survive the `'use cache'` boundary.
 *
 * Next runs a cached function in a clean `AsyncLocalStorage` snapshot: the request store and React's
 * per-request cache are gone inside it, and the arguments are the only thing left. The one object it
 * restores is the `WorkStore` of the request, so anything keyed on it is visible both to the route
 * entries and to the cache fills they trigger, without being part of a cache key.
 */
const stores = new WeakMap<object, Map<string, unknown>>();

let cachedFunctions = 0;

/**
 * Store of the current request, or undefined outside a Next render (tests, scripts).
 */
function getServerContextStore(): Map<string, unknown> | undefined {
    const workStore = workAsyncStorage.getStore();
    if (!workStore) {
        return undefined;
    }

    let store = stores.get(workStore);
    if (!store) {
        store = new Map();
        stores.set(workStore, store);
    }
    return store;
}

/**
 * Declare a value provided once per request. `provide` keeps the first value, so callers that may run
 * in any order (a layout, a page, their metadata) can all provide it.
 */
export function createServerContextValue<T>(name: string) {
    const key = `value:${name}`;

    return {
        provide(value: T): void {
            const store = getServerContextStore();
            if (store && !store.has(key)) {
                store.set(key, value);
            }
        },
        read(): T | undefined {
            return getServerContextStore()?.get(key) as T | undefined;
        },
    };
}

/**
 * Equivalent to `cache` from `@/lib/cache`, but memoized on the server context: a call made inside a
 * cache fill reuses the result of the same call made by the layout. Outside a request it is inert.
 */
export function serverCache<Args extends any[], Return>(
    fn: (...args: Args) => Return
): (...args: Args) => Return {
    // `identify` hashes a function by its source, which two distinct functions can share.
    const prefix = `cache:${cachedFunctions++}:`;

    return (...args: Args) => {
        const store = getServerContextStore();
        if (!store) {
            return fn(...args);
        }

        const key = prefix + identify(args);
        if (store.has(key)) {
            return store.get(key) as Return;
        }

        const result = fn(...args);
        store.set(key, result);
        return result;
    };
}
