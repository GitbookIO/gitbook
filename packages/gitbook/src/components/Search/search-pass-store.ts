import ReactDOM from 'react-dom';

import type { SearchRecordResult, SearchSpaceResult } from '@gitbook/api';

import {
    type SearchFallbackReason,
    type SearchPassStatusOutcome,
    classifySearchPassStatus,
    isSearchPassEndpoint,
    readSearchPassFields,
} from '@/lib/search-pass';
import type { DirectSearchProps } from '@/lib/search-results';

const EXPIRY_MARGIN_MS = 5_000;
const MIN_USABLE_LIFETIME_MS = 15_000;
const REFRESH_BEFORE_EXPIRY_MS = 60_000;
const MIN_REFRESH_DELAY_MS = 10_000;
const RATE_LIMIT_BACK_OFF_MS = 2_000;
const WARM_UP_TIMEOUT_MS = 3_000;
const UNKNOWN_SPACE_LIMIT = 2;

type SearchPass = {
    token: string;
    endpoint: string;
    /** Expiry on the browser's clock, in milliseconds. */
    expiresAt: number;
};

type SearchPassState =
    | { status: 'none' }
    | { status: 'ready'; pass: SearchPass }
    | { status: 'route'; reason: SearchFallbackReason };

export interface SearchPassStore {
    /** The site the pass is for, or undefined when the page cannot search the API directly. */
    readonly target: DirectSearchProps | undefined;
    /** Send the site's search warm-up and keep the search pass of its reply. */
    warmUp(): Promise<void>;
    /** Refresh the pass before it expires while search is open. */
    setOpen(open: boolean): void;
    /** The pass to search with now, or null to use the search route. */
    getPass(): SearchPass | null;
    /** Use the search route for the rest of the store's life. */
    fallBack(reason: SearchFallbackReason): void;
    /** Send one search to the route because a result's space is unknown, and fall back on repeats. */
    rerouteUnknownSpace(): void;
    /** The reason to report with the next route request, given once per fallback. */
    takeFallbackReport(): SearchFallbackReason | undefined;
}

/**
 * Hold the search pass of a site and visitor context in memory.
 */
export function createSearchPassStore(
    prewarmURL: string,
    target: DirectSearchProps | undefined
): SearchPassStore {
    let state: SearchPassState = { status: 'none' };
    let open = false;
    let pendingWarmUp: Promise<void> | null = null;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let report: SearchFallbackReason | undefined;
    let unknownSpaces = 0;

    const clearRefresh = () => {
        if (refreshTimer) {
            clearTimeout(refreshTimer);
            refreshTimer = null;
        }
    };

    const scheduleRefresh = () => {
        clearRefresh();
        if (!open || state.status !== 'ready') {
            return;
        }

        const delay = Math.max(
            MIN_REFRESH_DELAY_MS,
            state.pass.expiresAt - Date.now() - REFRESH_BEFORE_EXPIRY_MS
        );
        refreshTimer = setTimeout(() => {
            void store.warmUp().catch(() => undefined);
        }, delay);
    };

    const keepPass = (pass: SearchPass | null) => {
        if (state.status === 'route') {
            return;
        }

        const refreshing = state.status === 'ready';
        const usable = pass !== null && pass.expiresAt - Date.now() > MIN_USABLE_LIFETIME_MS;
        if (!usable) {
            if (refreshing) {
                store.fallBack('refresh_failed');
            } else {
                state = { status: 'none' };
            }
            return;
        }
        if (!target) {
            state = { status: 'none' };
            return;
        }
        if (!isSearchPassEndpoint(pass.endpoint, target)) {
            store.fallBack('invalid_endpoint');
            return;
        }

        state = { status: 'ready', pass };
        ReactDOM.preconnect(new URL(pass.endpoint).origin, { crossOrigin: 'anonymous' });
        scheduleRefresh();
    };

    const store: SearchPassStore = {
        target,

        warmUp() {
            if (pendingWarmUp) {
                return pendingWarmUp;
            }

            pendingWarmUp = (async () => {
                try {
                    const response = await fetch(prewarmURL, {
                        method: 'POST',
                        signal: AbortSignal.timeout(WARM_UP_TIMEOUT_MS),
                    });
                    if (!response.ok) {
                        throw new Error(`Search prewarm request failed: ${response.status}`);
                    }
                    keepPass(await readSearchPass(response));
                } catch (error) {
                    if (state.status === 'ready') {
                        store.fallBack('refresh_failed');
                    }
                    throw error;
                }
            })().finally(() => {
                pendingWarmUp = null;
            });

            return pendingWarmUp;
        },

        setOpen(nextOpen) {
            open = nextOpen;
            if (open) {
                scheduleRefresh();
            } else {
                clearRefresh();
            }
        },

        getPass() {
            if (state.status !== 'ready' || state.pass.expiresAt - Date.now() <= EXPIRY_MARGIN_MS) {
                return null;
            }
            return state.pass;
        },

        fallBack(reason) {
            if (state.status === 'route') {
                return;
            }

            state = { status: 'route', reason };
            report = reason;
            clearRefresh();
        },

        rerouteUnknownSpace() {
            unknownSpaces += 1;
            if (unknownSpaces >= UNKNOWN_SPACE_LIMIT) {
                store.fallBack('unknown_space');
            } else {
                report = 'unknown_space';
            }
        },

        takeFallbackReport() {
            const reason = report;
            report = undefined;
            return reason;
        },
    };

    return store;
}

async function readSearchPass(response: Response): Promise<SearchPass | null> {
    let body: unknown;
    try {
        body = await response.json();
    } catch {
        return null;
    }

    const fields = readSearchPassFields(body);
    if (!fields) {
        return null;
    }

    const expiresAt = Date.parse(fields.expiresAt);
    const serverDate = Date.parse(response.headers.get('date') ?? '');
    const lifetime = expiresAt - serverDate;

    return {
        token: fields.token,
        endpoint: fields.endpoint,
        expiresAt: Number.isNaN(lifetime) ? expiresAt : Date.now() + lifetime,
    };
}

type SearchItems = (SearchSpaceResult | SearchRecordResult)[];

type PassRequestOutcome =
    | { type: 'results'; items: SearchItems }
    | { type: 'refresh' }
    | { type: 'back_off' }
    | { type: 'fall_back'; reason: SearchFallbackReason };

/**
 * Search the API with the store's pass. Resolves to null when the search must use the route.
 */
export async function searchWithPass(input: {
    store: SearchPassStore;
    body: unknown;
    signal: AbortSignal;
}): Promise<SearchItems | null> {
    const { store, body, signal } = input;

    const pass = store.getPass();
    if (!pass) {
        return null;
    }

    let outcome = await requestWithPass(pass, body, signal);
    if (outcome.type === 'refresh') {
        await abortable(
            store.warmUp().catch(() => undefined),
            signal
        );
        const refreshed = store.getPass();
        outcome =
            refreshed && refreshed.token !== pass.token
                ? await requestWithPass(refreshed, body, signal)
                : { type: 'fall_back', reason: 'unauthorized' };
        if (outcome.type === 'refresh') {
            outcome = { type: 'fall_back', reason: 'unauthorized' };
        }
    }

    switch (outcome.type) {
        case 'results':
            return outcome.items;
        case 'back_off':
            store.fallBack('rate_limited');
            await wait(RATE_LIMIT_BACK_OFF_MS, signal);
            return null;
        case 'fall_back':
            store.fallBack(outcome.reason);
            return null;
    }
}

async function requestWithPass(
    pass: SearchPass,
    body: unknown,
    signal: AbortSignal
): Promise<PassRequestOutcome> {
    let response: Response;
    try {
        response = await fetch(pass.endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${pass.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'omit',
            signal,
        });
    } catch (error) {
        if (signal.aborted) {
            throw error;
        }
        return { type: 'fall_back', reason: 'network' };
    }

    const outcome: SearchPassStatusOutcome = classifySearchPassStatus(response.status);
    if (outcome.type === 'results') {
        return readSearchItems(response, signal);
    }
    return outcome;
}

async function readSearchItems(
    response: Response,
    signal: AbortSignal
): Promise<PassRequestOutcome> {
    try {
        const data = (await response.json()) as { items?: unknown };
        if (!Array.isArray(data?.items)) {
            return { type: 'fall_back', reason: 'invalid_response' };
        }
        return { type: 'results', items: data.items as SearchItems };
    } catch (error) {
        if (signal.aborted) {
            throw error;
        }
        return { type: 'fall_back', reason: 'invalid_response' };
    }
}

function wait(delayMs: number, signal: AbortSignal): Promise<void> {
    return abortable(new Promise((resolve) => setTimeout(resolve, delayMs)), signal);
}

function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
    if (signal.aborted) {
        return Promise.reject(signal.reason);
    }

    return new Promise<T>((resolve, reject) => {
        const onAbort = () => reject(signal.reason);
        signal.addEventListener('abort', onAbort, { once: true });
        promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
    });
}
