'use client';

import React from 'react';

interface Breadcrumb {
    label: string;
    icon?: string;
    emoji?: string;
}

/** Result type returned by this hook */
export interface LocalPageResult {
    type: 'local-page';
    id: string;
    title: string;
    pathname: string;
    icon?: string;
    emoji?: string;
    description?: string;
    breadcrumbs?: Breadcrumb[];
}

type LocalSearchState = {
    results: LocalPageResult[];
    fetching: boolean;
    error: boolean;
};

type WorkerOutboundMessage =
    | { type: 'loaded' }
    | { type: 'load-error'; message: string }
    | { type: 'results'; requestId: number; results: LocalPageResult[] }
    | { type: 'search-error'; requestId: number };

// Module-level Worker singleton — shared across all mounted hook instances.
let worker: Worker | null = null;
let indexState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
const indexStateListeners = new Set<() => void>();
let requestCounter = 0;
const pendingRequests = new Map<number, (results: LocalPageResult[]) => void>();

function getOrStartWorker(indexURL: string): Worker {
    if (worker) return worker;

    worker = new Worker(new URL('./search.worker.ts', import.meta.url));

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
        const msg = event.data;
        if (msg.type === 'loaded') {
            indexState = 'ready';
            for (const listener of indexStateListeners) listener();
        } else if (msg.type === 'load-error') {
            indexState = 'error';
            for (const listener of indexStateListeners) listener();
        } else if (msg.type === 'results') {
            const cb = pendingRequests.get(msg.requestId);
            if (cb) {
                pendingRequests.delete(msg.requestId);
                cb(msg.results);
            }
        } else if (msg.type === 'search-error') {
            pendingRequests.delete(msg.requestId);
        }
    };

    indexState = 'loading';
    worker.postMessage({ type: 'load', indexURL });

    return worker;
}

export function useLocalSearchResults(props: {
    query: string;
    indexURL: string;
    /** BCP-47 language code of the current site space. When provided, only results
     * from pages with a matching language are returned. */
    lang?: string;
    /** When provided, only results from pages belonging to one of these site space IDs
     * are returned. Uses FlexSearch native tag filtering. Omit for no filtering (all spaces). */
    filterSiteSpaceIds?: string[];
    disabled?: boolean;
}): LocalSearchState {
    const { query, indexURL, lang, filterSiteSpaceIds, disabled = false } = props;

    const [state, setState] = React.useState<LocalSearchState>({
        results: [],
        fetching: false,
        error: false,
    });

    const [currentIndexState, setCurrentIndexState] = React.useState<typeof indexState>(indexState);

    // Start the worker and subscribe to index state changes
    React.useEffect(() => {
        if (disabled) return;

        getOrStartWorker(indexURL);

        // Sync state in case it changed before this effect ran
        setCurrentIndexState(indexState);

        const listener = () => {
            setCurrentIndexState(indexState);
            if (indexState === 'ready') {
                setState((prev) => ({ ...prev, fetching: false }));
            } else if (indexState === 'error') {
                setState({ results: [], fetching: false, error: true });
            }
        };

        indexStateListeners.add(listener);
        return () => {
            indexStateListeners.delete(listener);
        };
    }, [indexURL, disabled]);

    // Perform search whenever query, lang, filterSiteSpaceIds, or index readiness changes
    React.useEffect(() => {
        if (disabled || currentIndexState !== 'ready') return;

        if (!query) {
            setState({ results: [], fetching: false, error: false });
            return;
        }

        const requestId = ++requestCounter;
        pendingRequests.set(requestId, (results) => {
            setState({ results, fetching: false, error: false });
        });

        // biome-ignore lint/style/noNonNullAssertion: worker is always set when indexState is 'ready'
        worker!.postMessage({ type: 'search', requestId, query, lang, filterSiteSpaceIds });

        return () => {
            // Cancel stale request so its callback doesn't update state
            pendingRequests.delete(requestId);
        };
    }, [query, lang, filterSiteSpaceIds, currentIndexState, disabled]);

    return state;
}
