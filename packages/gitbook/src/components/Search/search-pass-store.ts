import ReactDOM from 'react-dom';

import type { SearchRecordResult, SearchSpaceResult } from '@gitbook/api';

import type { OrderedComputedResult, SearchSiteContentScope } from './search-types';
import { getEmbeddableLinker } from '@/lib/embeddable-linker';
import { createSiteLinker } from '@/lib/links';
import {
    type DirectSearchProps,
    computePublishedSearchResults,
    toSearchSiteContentBody,
} from '@/lib/search-results';

/** Request header on a search route call naming why the search did not go to the API. */
export const SEARCH_FALLBACK_HEADER = 'x-gitbook-search-fallback';

const PASS_REQUEST_TIMEOUT_MS = 3_000;
const EXPIRY_MARGIN_MS = 5_000;
const RATE_LIMIT_WAIT_MS = 2_000;
const DIRECT_SEARCH_TIMEOUT_MS = 5_000;

type SearchPassState =
    | { status: 'none'; reason?: string }
    | { status: 'ready'; token: string; expiresAt: number }
    | { status: 'route'; reason: string };

type DirectSearchOutcome =
    | { type: 'results'; results: OrderedComputedResult[] }
    | { type: 'route'; reason?: string };

export type SearchPassStore = ReturnType<typeof createSearchPassStore>;

/**
 * Hold a search pass from the site's search pass route in memory, and search the API with it.
 */
export function createSearchPassStore(directSearch: DirectSearchProps | undefined) {
    let state: SearchPassState = { status: 'none' };
    let pendingRequest: Promise<void> | null = null;

    const sendPassRequest = async () => {
        if (!directSearch) {
            return;
        }
        try {
            const response = await fetch(directSearch.passURL, {
                method: 'POST',
                signal: AbortSignal.timeout(PASS_REQUEST_TIMEOUT_MS),
            });
            if (!response.ok) {
                throw new Error(`Search pass request failed: ${response.status}`);
            }
            if (response.status !== 200) {
                return;
            }

            const { token, expiresIn } = (await response.json()) as {
                token?: unknown;
                expiresIn?: unknown;
            };
            if (
                state.status !== 'route' &&
                typeof token === 'string' &&
                typeof expiresIn === 'number'
            ) {
                state = { status: 'ready', token, expiresAt: Date.now() + expiresIn };
                ReactDOM.preconnect(directSearch.apiURL, { crossOrigin: 'anonymous' });
            }
        } catch (error) {
            if (state.status === 'none') {
                state = { status: 'none', reason: 'pass_request' };
            }
            throw error;
        }
    };

    const requestPass = () => {
        pendingRequest ??= sendPassRequest().finally(() => {
            pendingRequest = null;
        });
        return pendingRequest;
    };

    const dropPass = (token: string, reason: string): DirectSearchOutcome => {
        if (state.status === 'ready' && state.token === token) {
            state = { status: 'none', reason };
            void requestPass().catch(() => undefined);
        }
        return { type: 'route', reason };
    };

    const fallBack = (reason: string): DirectSearchOutcome => {
        state = { status: 'route', reason };
        return { type: 'route', reason };
    };

    const search = async (input: {
        query: string;
        scope: SearchSiteContentScope;
        signal: AbortSignal;
        asEmbeddable: boolean;
    }): Promise<DirectSearchOutcome> => {
        const { query, scope, signal, asEmbeddable } = input;
        if (!directSearch) {
            return { type: 'route' };
        }
        if (state.status === 'ready' && state.expiresAt - Date.now() <= EXPIRY_MARGIN_MS) {
            return dropPass(state.token, 'expired');
        }
        if (state.status !== 'ready') {
            return { type: 'route', reason: state.reason };
        }
        if (query.length <= 1) {
            return { type: 'results', results: [] };
        }

        const { token } = state;
        const { apiURL, organizationId, siteId } = directSearch;
        // A request dropped on the way to the API never settles, so it gets its own time limit.
        // The browser targets predate `AbortSignal.any`.
        const request = new AbortController();
        if (signal.aborted) {
            request.abort();
        }
        signal.addEventListener('abort', () => request.abort(), { once: true });
        const timeout = setTimeout(() => request.abort(), DIRECT_SEARCH_TIMEOUT_MS);
        let response: Response;
        try {
            response = await fetch(`${apiURL}/v1/orgs/${organizationId}/sites/${siteId}/search`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(toSearchSiteContentBody(query, scope)),
                credentials: 'omit',
                signal: request.signal,
            });
        } catch (error) {
            if (signal.aborted) {
                throw error;
            }
            return fallBack(request.signal.aborted ? 'timeout' : 'network');
        }

        if (response.status === 401) {
            return dropPass(token, '401');
        }
        if (response.status === 429) {
            fallBack('429');
            await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_WAIT_MS));
            signal.throwIfAborted();
            return { type: 'route', reason: '429' };
        }
        if (!response.ok) {
            return fallBack(String(response.status));
        }

        let results: OrderedComputedResult[] | null;
        try {
            const { items } = (await response.json()) as {
                items: (SearchSpaceResult | SearchRecordResult)[];
            };
            const linker = createSiteLinker(directSearch.linker);
            results = computePublishedSearchResults({
                asEmbeddable,
                linker: asEmbeddable ? getEmbeddableLinker(linker) : linker,
                searchResults: items,
                spaces: directSearch.spaces,
            });
        } catch (error) {
            if (signal.aborted) {
                throw error;
            }
            return fallBack(request.signal.aborted ? 'timeout' : 'invalid');
        } finally {
            clearTimeout(timeout);
        }

        return results ? { type: 'results', results } : fallBack('unknown_space');
    };

    return { requestPass, search };
}
