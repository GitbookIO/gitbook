import { waitUntil } from './waitUntil';

/**
 * Execute a function for each input in parallel and return the first result.
 * It is designed to support executing in a worker environment where async execution outside the request lifecycle is not allowed.
 * And also to support promise cancellation and optional result.
 */
export async function race<I, R>(
    inputs: I[],
    execute: (input: I, options: { signal: AbortSignal }) => Promise<R | null>,
): Promise<R | null> {
    const abort = new AbortController();
    const pendingReads: Array<Promise<void>> = [];

    // Read from the cache backends and return the first result
    const result = await new Promise<R | null>((resolve, reject) => {
        let resolved = false;
        let pending = inputs.length;

        inputs.forEach((input) => {
            pendingReads.push(
                execute(input, { signal: abort.signal })
                    .then(
                        (inputResult) => {
                            if (!resolved && inputResult !== null) {
                                resolved = true;
                                resolve(inputResult);
                                abort.abort();
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
    });

    // Wait for all reads to finish after responding to the request
    // We need this to avoid async execution outside the request lifecycle in Cloudflare
    await waitUntil(Promise.all(pendingReads));

    return result;
}
