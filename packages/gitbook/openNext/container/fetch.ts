/**
 * Next.js monkey-patches the global `fetch` with its own data cache. Cache traffic must not go
 * through it, or reading the cache would recurse back into the cache. The OpenNext server adapter
 * stashes the pristine `fetch` on `globalThis.internalFetch` before Next loads.
 */
export function internalFetch(
    input: Request | URL | string,
    init?: RequestInit
): Promise<Response> {
    const untouchedFetch = (globalThis as { internalFetch?: typeof fetch }).internalFetch ?? fetch;
    return untouchedFetch(input as RequestInfo, init);
}
