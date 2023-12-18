import parseCacheControl from 'parse-cache-control';

import { CacheResult } from './cache';

/**
 * Options to pass to the `fetch` call to disable the Next data-cache when wrapped in `cache()`.
 */
export const noCacheFetchOptions: Partial<RequestInit> = {
    // Cloudflare doesn't support the `cache` directive before next-on-pages patches the fetch function
    // https://github.com/cloudflare/workerd/issues/698
    // cache: 'no-store',
    next: { revalidate: 0 },
};

/**
 * Parse an HTTP response into a cache entry.
 */
export function parseCacheResponse(response: Response): {
    ttl: number;
    tags: string[];
} {
    const ageHeader = response.headers.get('age');
    const age = ageHeader ? parseInt(ageHeader, 10) : 0;

    const cacheControlHeader = response.headers.get('cache-control');
    const cacheControl = cacheControlHeader ? parseCacheControl(cacheControlHeader) : null;
    const cacheTagHeader =
        response.headers.get('x-gitbook-cache-tag') ?? response.headers.get('cache-tag');

    const entry = {
        ttl: 60 * 60 * 24,
        tags: cacheTagHeader ? cacheTagHeader.split(',').map((tag) => tag.trim()) : [],
    };

    if (cacheControl && cacheControl['max-age']) {
        entry.ttl = Math.max(0, cacheControl['max-age'] - age - 60);
    }

    return entry;
}

/**
 * Cache an HTTP response.
 */
export function cacheResponse<Result, DefaultData = Result>(
    response: Response & { data: Result },
    defaultEntry: Partial<CacheResult<DefaultData>> = {},
): CacheResult<DefaultData extends Result ? Result : DefaultData> {
    const parsed = parseCacheResponse(response);

    return {
        ttl: defaultEntry.ttl ?? parsed.ttl,
        tags: [...(defaultEntry.tags ?? []), ...parsed.tags],
        // @ts-ignore
        data: defaultEntry.data ?? response.data,
    };
}
