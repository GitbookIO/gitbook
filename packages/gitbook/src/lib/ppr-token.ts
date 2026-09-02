import 'server-only';
import type { PPRCacheScope } from '@/lib/cache-tags';
import { DataFetcherError } from '@/lib/data/errors';
import { GITBOOK_EXCHANGE_TOKEN_URL } from '@/lib/env';
import { serverCache } from '@/lib/server-context';
import { trace } from '@/lib/tracing';

/**
 * Scope of the claims to keep in the exchanged token. `full` merges every scope into one object,
 * for callers that resolve them all at once and cannot present a different token per scope.
 */
export type PPRTokenScope = 'site' | 'revision' | 'page' | 'full';

/** Each PPR cache scope resolves exactly one claims bucket, so it maps to one exchange scope. */
export const PPR_TOKEN_SCOPE: Record<PPRCacheScope, PPRTokenScope> = {
    header: 'site',
    toc: 'revision',
    body: 'page',
};

/**
 * Exchange the revalidation token carried by a PPR request for a content API token whose claims are
 * narrowed to `scope`. The API only understands the latter, and narrowing is what lets components
 * sharing a scope share a cache entry: the token is part of their cache key.
 *
 * Memoized on the server context, so the cache fills reuse the exchanges of the route entries, but
 * never persisted — an exchanged token is a credential.
 */
export const exchangePPRToken = serverCache(
    async (token: string, scope: PPRTokenScope): Promise<string> => {
        return trace(`exchangePPRToken(${scope})`, async () => {
            const response = await fetchExchangedToken(token, scope);

            if (!response.ok) {
                throw new DataFetcherError(
                    `Token exchange for scope "${scope}" responded with ${response.status}`,
                    502
                );
            }

            const { token: exchanged } = (await response.json()) as { token?: unknown };
            if (typeof exchanged !== 'string' || !exchanged) {
                throw new DataFetcherError(
                    `Token exchange for scope "${scope}" returned no token`,
                    502
                );
            }

            return exchanged;
        });
    }
);

async function fetchExchangedToken(token: string, scope: PPRTokenScope): Promise<Response> {
    try {
        return await fetch(GITBOOK_EXCHANGE_TOKEN_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ token, scope }),
            cache: 'no-store',
        });
    } catch (error) {
        // Surface a transport failure the same way as a rejection, so callers only handle one type.
        throw new DataFetcherError(
            `Token exchange for scope "${scope}" failed: ${error instanceof Error ? error.message : String(error)}`,
            502
        );
    }
}
