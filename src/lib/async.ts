import { waitUntil, getGlobalContext } from './waitUntil';

/**
 * Execute a function for each input in parallel and return the first result.
 * It is designed to support executing in a worker environment where async execution outside the request lifecycle is not allowed.
 * And also to support promise cancellation and optional result.
 *
 * Pattern 1: it waits for the first input to resolve with a non-null result.
 *   I1: |-----------------| (r1)
 *   I2: |---| (null)
 *   I3: |-------| (r3) <- The function will return r3.
 *
 * Pattern 2: it returns `null` if the timeout is reached.
 *   T:  |------------| (timeout) <- The function will return `null`.
 *   I1: |-----------------| (r1)
 *   I2: |--------------| (null)
 *   I3: |------------------| (r3)
 *
 * Pattern 3: it sends a signal to stop pending operations as soon as one resolves.
 *   I1: |-------x cancelled
 *   I2: |---| (null)
 *   I3: |-------| (r3) <- The function will return r3.
 *
 * Pattern 4: it starts the blockFallback function if the blockTimeout is reached before any input resolves.
 *   BT: |-----------------| (blockTimeout)
 *   F:                    |---| (fallback) <- The function will return the result of the fallback.
 *   I1: |---------------------x cancelled
 *   I2: |---------------------x cancelled
 *   I3: |---------------------x cancelled
 *
 * Pattern 5: it resolves with the first resolution even after fallback was started
 *   BT: |-----------------| (blockTimeout)
 *   F:                    |---x fallback cancelled
 *   I1: |---------------------| (r1) <- The function will return r1.
 *   I2: |-------------------| (null)
 *   I3: |---------------------x cancelled
 */
export async function race<I, R>(
    inputs: I[],
    execute: (input: I, options: { signal: AbortSignal }) => Promise<R | null>,
    options: {
        /**
         * Signal to cancel all operations.
         */
        signal?: AbortSignal;

        /**
         * Timeout in milliseconds before all operations are cancelled.
         */
        timeout?: number;

        /**
         * Timeout in milliseconds.
         * if the timeout is reached, the function will start calling the `blockFallback` function.
         */
        blockTimeout?: number;

        /**
         * Fallback to call when the timeout is reached.
         * If an input resolve before the timeout, the fallback will be ignored.
         * If an input resolve while the fallback is running, the fallback will be cancelled.
         */
        blockFallback?: (options: { signal: AbortSignal }) => Promise<R | null>;

        /**
         * If true, the `blockFallback` will be called if all inputs resolved with `null`.
         * @default false
         */
        fallbackOnNull?: boolean;
    } = {},
): Promise<R | null> {
    const { signal, timeout, blockTimeout, blockFallback, fallbackOnNull = false } = options;
    const result = await new Promise<R | null>((resolve, reject) => {
        let resolved = false;
        let pending = inputs.length;
        let timeoutId: NodeJS.Timeout | null = null;
        let blockFallbackStarted = false;
        let blockTimeoutId: NodeJS.Timeout | null = null;
        const abort = new AbortController();

        const done = () => {
            resolved = true;
            if (timeoutId) {
                clearTimeout(timeoutId!);
            }
            if (blockTimeoutId) {
                clearTimeout(blockTimeoutId);
            }
            abort.abort();
        };

        const rejectWith = (error: Error) => {
            if (!resolved) {
                done();
                reject(error);
            }
        };

        const resolveWith = (value: R | null) => {
            if (!resolved) {
                done();
                resolve(value);
            }
        };

        if (signal) {
            // If top function is cancelling, we should cancel all pending operations
            signal.addEventListener('abort', () => {
                resolveWith(null);
            });
        }

        const runFallback = () => {
            if (!blockFallback) {
                throw new Error('blockFallback is required');
            }

            if (blockFallbackStarted) {
                throw new Error('blockFallback already started');
            }

            if (blockTimeoutId) {
                clearTimeout(blockTimeoutId);
            }

            blockFallbackStarted = true;
            waitUntil(
                blockFallback({
                    signal: abort.signal,
                }).then(
                    (fallbackResult) => {
                        resolveWith(fallbackResult);
                    },
                    (error) => {
                        logIgnoredError('blockFallback failed with', error);

                        if (pending === 0 && fallbackOnNull) {
                            rejectWith(error);
                        } else {
                            resolveWith(null);
                        }
                    },
                ),
            );
        };

        if (timeout) {
            timeoutId = setTimeout(() => {
                resolveWith(null);
            }, timeout);
        }

        if (blockTimeout) {
            if (!blockFallback) {
                throw new Error('blockTimeout requires blockFallback');
            }

            blockTimeoutId = setTimeout(runFallback, blockTimeout);
        }

        inputs.forEach((input, inputIndex) => {
            waitUntil(
                execute(input, { signal: abort.signal })
                    .then(
                        (inputResult) => {
                            if (abort.signal.aborted) {
                                // Ignore input results if the blockFallback has started
                                return;
                            }

                            if (inputResult !== null) {
                                // Only resolve if we actually got a non-null result
                                resolveWith(inputResult);
                            }
                        },
                        (error) => {
                            // Ignore errors
                            logIgnoredError(`input ${inputIndex} failed with`, error);
                        },
                    )
                    .finally(() => {
                        pending -= 1;
                        if (pending === 0 && !resolved && !blockFallbackStarted) {
                            if (fallbackOnNull) {
                                runFallback();
                            } else {
                                resolveWith(null);
                            }
                        }
                    }),
            );
        });
    });

    // Since the cancellation of the signal will cause the promise to resolve to `null`,
    // we need to throw an error to indicate that the operation was cancelled.
    signal?.throwIfAborted();

    return result;
}

/**
 * Log and ignore an error.
 * It skips the error if it's an AbortError.
 */
function logIgnoredError(message: string, error: Error) {
    if (error.name === 'AbortError') {
        return;
    }

    console.error(message, error);
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

/**
 * Create a map of singleton operations in a safe way for Cloudflare worker
 */
export function singletonMap<Args extends any[], Result>(
    execute: (key: string, ...args: Args) => Promise<Result>,
): (key: string, ...args: Args) => Promise<Result> {
    const states = new WeakMap<object, Map<string, Promise<Result>>>();

    return async (key, ...args) => {
        const ctx = await getGlobalContext();
        let current = states.get(ctx);
        if (current) {
            const existing = current.get(key);
            if (existing) {
                return existing;
            }
        }

        if (!current) {
            current = new Map();
            states.set(ctx, current);
        }

        const promise = execute(key, ...args).finally(() => {
            current!.delete(key);
        });
        current.set(key, promise);

        return promise;
    };
}
