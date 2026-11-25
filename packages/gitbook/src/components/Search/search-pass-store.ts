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
// The longest shared rate limit window of the search API.
const RATE_LIMIT_MAX_WAIT_MS = 60_000;
const DIRECT_SEARCH_TIMEOUT_MS = 5_000;
// Which limit answered a 429: `caller` is the pass's own, `capacity` a saturated index.
const RATE_LIMIT_SCOPE_HEADER = 'x-ratelimit-scope';

type SearchPassState =
    | { status: 'none'; reason?: string }
    | { status: 'ready'; token: string; expiresAt: number; replacesRejectedPass: boolean }
    | { status: 'route'; reason: string; cooldownUntil: number };

type DirectSearchOutcome =
    | { type: 'results'; results: OrderedComputedResult[] }
    | { type: 'route'; reason?: string };

type SearchTransport = { type: 'api'; url: string } | { type: 'proxy'; url: string };

type SearchAttempt =
    | { type: 'success'; body: string }
    | { type: 'http'; response: Response }
    | { type: 'failure'; reason: 'network' | 'timeout' };

export type SearchPassStore = ReturnType<typeof createSearchPassStore>;

/**
 * Hold a search pass from the site's search pass route in memory, and search the API with it.
 */
export function createSearchPassStore(directSearch: DirectSearchProps | undefined) {
    let state: SearchPassState = { status: 'none' };
    let proxy: Extract<SearchTransport, { type: 'proxy' }> | undefined;
    let pendingRequest: Promise<void> | null = null;

    const sendPassRequest = async () => {
        if (!directSearch || state.status === 'route') {
            return;
        }
        // The held pass may belong to a session that has since ended, so it waits for the reply.
        if (state.status === 'ready') {
            state = state.replacesRejectedPass
                ? { status: 'none', reason: '401' }
                : { status: 'none' };
        }
        const request = new AbortController();
        const timeout = setTimeout(() => request.abort(), PASS_REQUEST_TIMEOUT_MS);
        try {
            const response = await fetch(directSearch.passURL, {
                method: 'POST',
                signal: request.signal,
            });
            const { token, expiresIn } =
                response.status === 200
                    ? ((await response.json()) as { token?: unknown; expiresIn?: unknown })
                    : {};
            // A search may have moved the page to the route while this request was in flight.
            const current = state as SearchPassState;
            if (
                current.status !== 'route' &&
                typeof token === 'string' &&
                typeof expiresIn === 'number'
            ) {
                state = {
                    status: 'ready',
                    token,
                    expiresAt: Date.now() + expiresIn,
                    replacesRejectedPass:
                        (current.status === 'none' && current.reason === '401') ||
                        (current.status === 'ready' && current.replacesRejectedPass),
                };
                ReactDOM.preconnect(directSearch.apiURL, { crossOrigin: 'anonymous' });
            } else if (current.status === 'ready') {
                state = { status: 'none' };
            }
            if (!response.ok) {
                throw new Error(`Search pass request failed: ${response.status}`);
            }
        } catch (error) {
            const current = state as SearchPassState;
            // Keep the 401 so a later replacement pass is still refused only once.
            if (
                current.status === 'ready' ||
                (current.status === 'none' && current.reason !== '401')
            ) {
                state = { status: 'none', reason: 'pass_request' };
            }
            throw error;
        } finally {
            clearTimeout(timeout);
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
        } else if (state.status === 'none' && reason === '401') {
            // The pass was suspended for a pending request: its reply must still see the rejection.
            state = { status: 'none', reason };
        }
        return { type: 'route', reason };
    };

    const fallBack = (reason: string): DirectSearchOutcome => {
        state = { status: 'route', reason, cooldownUntil: 0 };
        return { type: 'route', reason };
    };

    const search = async (input: {
        query: string;
        searchId?: string;
        scope: SearchSiteContentScope;
        signal: AbortSignal;
        asEmbeddable: boolean;
    }): Promise<DirectSearchOutcome> => {
        const { query, searchId, scope, signal, asEmbeddable } = input;
        if (!directSearch) {
            return { type: 'route' };
        }
        if (state.status === 'ready' && state.expiresAt - Date.now() <= EXPIRY_MARGIN_MS) {
            return dropPass(state.token, 'expired');
        }
        if (state.status === 'route') {
            return waitForCooldown(state, signal);
        }
        if (state.status !== 'ready') {
            return { type: 'route', reason: state.reason === '401' ? undefined : state.reason };
        }
        if (query.length <= 1) {
            return { type: 'results', results: [] };
        }

        let pass = state;
        const { apiURL, organizationId, siteId, proxyURL } = directSearch;
        const transport: SearchTransport = proxy ?? {
            type: 'api',
            url: `${apiURL}/v1/orgs/${organizationId}/sites/${siteId}/search`,
        };
        const body = JSON.stringify(toSearchSiteContentBody(query, scope, searchId));
        let attempt = await sendSearch(transport, pass.token, body, signal);

        if (attempt.type === 'failure' && transport.type === 'api' && proxyURL) {
            const current = state as SearchPassState;
            if (current.status === 'route') {
                return waitForCooldown(current, signal);
            }
            proxy = { type: 'proxy', url: proxyURL };
            if (current.status !== 'ready') {
                return { type: 'route', reason: attempt.reason };
            }
            if (current.expiresAt - Date.now() <= EXPIRY_MARGIN_MS) {
                return dropPass(current.token, 'expired');
            }
            pass = current;
            attempt = await sendSearch(proxy, pass.token, body, signal);
        }

        if (attempt.type === 'failure') {
            const current = state as SearchPassState;
            if (current.status === 'route') {
                return waitForCooldown(current, signal);
            }
            return fallBack(attempt.reason);
        }
        if (attempt.type === 'http') {
            const { response } = attempt;
            if (response.status === 401) {
                if (pass.replacesRejectedPass) {
                    return fallBack('401');
                }
                return dropPass(pass.token, '401');
            }
            if (response.status === 429) {
                state = {
                    status: 'route',
                    reason: '429',
                    cooldownUntil: Date.now() + getRateLimitWaitMs(response),
                };
                return waitForCooldown(state, signal);
            }
            return fallBack(String(response.status));
        }

        try {
            const { items } = JSON.parse(attempt.body) as {
                items: (SearchSpaceResult | SearchRecordResult)[];
            };
            let linker = createSiteLinker(directSearch.linker);
            if (asEmbeddable) {
                linker = getEmbeddableLinker(linker);
            }
            const results = computePublishedSearchResults({
                asEmbeddable,
                linker,
                searchResults: items,
                spaces: directSearch.spaces,
            });
            if (!results) {
                return { type: 'route', reason: 'unknown_space' };
            }
            return { type: 'results', results };
        } catch {
            return fallBack('invalid');
        }
    };

    return { requestPass, search };
}

async function sendSearch(
    transport: SearchTransport,
    token: string,
    body: string,
    signal: AbortSignal
): Promise<SearchAttempt> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let mode: RequestMode | undefined;
    if (transport.type === 'proxy') {
        mode = 'same-origin';
        headers['x-gitbook-search-pass'] = token;
    } else {
        headers.Authorization = `Bearer ${token}`;
    }

    const request = new AbortController();
    const abort = () => request.abort();
    if (signal.aborted) {
        abort();
    }
    signal.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(abort, DIRECT_SEARCH_TIMEOUT_MS);
    try {
        const response = await fetch(transport.url, {
            method: 'POST',
            headers,
            body,
            credentials: 'omit',
            mode,
            signal: request.signal,
        });
        if (!response.ok) {
            return { type: 'http', response };
        }
        return { type: 'success', body: await response.text() };
    } catch (error) {
        if (signal.aborted) {
            throw error;
        }
        if (request.signal.aborted) {
            return { type: 'failure', reason: 'timeout' };
        }
        return { type: 'failure', reason: 'network' };
    } finally {
        clearTimeout(timeout);
        signal.removeEventListener('abort', abort);
    }
}

/**
 * Hold a search until a short rate limit cooldown ends, then send it to the route.
 * During a longer cooldown the search fails at once, as the route would.
 */
async function waitForCooldown(
    route: Extract<SearchPassState, { status: 'route' }>,
    signal: AbortSignal
): Promise<DirectSearchOutcome> {
    const waitMs = route.cooldownUntil - Date.now();
    if (waitMs > RATE_LIMIT_WAIT_MS) {
        throw new Error('Search is rate limited');
    }
    if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        if (signal.aborted) {
            throw new DOMException('Search aborted', 'AbortError');
        }
    }
    return { type: 'route', reason: route.reason };
}

/**
 * How long to hold searches after a 429: until the API's rate limit resets, when it says so.
 */
function getRateLimitWaitMs(response: Response): number {
    switch (response.headers.get(RATE_LIMIT_SCOPE_HEADER)) {
        // The route does not use the pass, and an unnamed limit may come from an older API.
        case null:
        case 'caller':
        case 'capacity':
            return RATE_LIMIT_WAIT_MS;
        default: {
            const resetSeconds = Number(response.headers.get('x-ratelimit-reset'));
            if (!resetSeconds) {
                return RATE_LIMIT_WAIT_MS;
            }
            return Math.min(Math.max(resetSeconds * 1000 - Date.now(), 0), RATE_LIMIT_MAX_WAIT_MS);
        }
    }
}
