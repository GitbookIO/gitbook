import { waitUntil, getGlobalContext } from './waitUntil';

/**
 * Execute a function for each input in parallel and return the first result.
 * It is designed to support executing in a worker environment where async execution outside the request lifecycle is not allowed.
 * And also to support promise cancellation and optional result.
 */
export async function race<I, R>(
    inputs: I[],
    execute: (input: I, options: { signal: AbortSignal }) => Promise<R | null>,
    options: {
        timeout?: number;
    } = {},
): Promise<R | null> {
    const { timeout } = options;

    const abort = new AbortController();
    const pendingReads: Array<Promise<void>> = [];

    // Read from the cache backends and return the first result
    const result = await new Promise<R | null>((resolve, reject) => {
        let resolved = false;
        let pending = inputs.length;
        let timeoutId: NodeJS.Timeout | null = null;

        const respondWith = (value: R | null) => {
            if (!resolved) {
                resolved = true;
                if (timeoutId) {
                    clearTimeout(timeoutId!);
                }
                resolve(value);
                abort.abort();
            }
        };

        inputs.forEach((input) => {
            pendingReads.push(
                execute(input, { signal: abort.signal })
                    .then(
                        (inputResult) => {
                            if (inputResult !== null) {
                                respondWith(inputResult);
                            }
                        },
                        (error) => {
                            // Ignore errors
                        },
                    )
                    .finally(() => {
                        pending -= 1;
                        if (pending === 0 && !resolved) {
                            resolve(null);
                        }
                    }),
            );
        });

        if (timeout) {
            timeoutId = setTimeout(() => {
                respondWith(null);
            }, timeout);
        }
    });

    // Wait for all reads to finish after responding to the request
    // We need this to avoid async execution outside the request lifecycle in Cloudflare
    await waitUntil(Promise.all(pendingReads));

    return result;
}

const UndefinedSymbol = Symbol('Undefined');

/**
 * Wrap a singleton operation in a safe way for Cloudflare worker
 * where I/O cannot be performed on behalf of a different request.
 */
export function singleton<R>(execute: () => Promise<R>): () => Promise<R> {
    let cachedResult: R | typeof UndefinedSymbol = UndefinedSymbol;
    const states = new WeakMap<object, Promise<R>>();

    return async () => {
        if (cachedResult !== UndefinedSymbol) {
            // Result is actually shared between requests
            return cachedResult;
        }

        // Promises are not shared between requests in Cloudflare Workers
        const ctx = await getGlobalContext();
        const current = states.get(ctx);
        if (current) {
            return current;
        }

        const promise = execute();
        states.set(ctx, promise);

        const result = await promise;
        cachedResult = result;
        return result;
    };
}
