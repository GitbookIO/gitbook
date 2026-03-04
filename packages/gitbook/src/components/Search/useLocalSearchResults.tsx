'use client';

import { Document, type DocumentValue } from 'flexsearch';
import React from 'react';

/** Raw entry from the `~gitbook/index` JSON response */
interface RawIndexPage {
    id: string;
    title: string;
    pathname: string;
    icon?: string;
    description?: string;
}

/** FlexSearch-compatible document type — satisfies DocumentData via explicit index signature */
interface IndexPage {
    [key: string]: DocumentValue | DocumentValue[];
    id: string;
    title: string;
    pathname: string;
    icon: string | null;
    description: string | null;
}

/** Result type returned by this hook */
export interface LocalPageResult {
    type: 'local-page';
    id: string;
    title: string;
    pathname: string;
    icon?: string;
    description?: string;
}

type LocalSearchState = {
    results: LocalPageResult[];
    fetching: boolean;
    error: boolean;
};

// Module-level singletons — one site per session
let cachedIndex: Document<IndexPage> | null = null;
let pendingFetch: Promise<Document<IndexPage>> | null = null;

async function getOrBuildIndex(siteBasePath: string): Promise<Document<IndexPage>> {
    if (cachedIndex) {
        return cachedIndex;
    }

    if (pendingFetch) {
        return pendingFetch;
    }

    pendingFetch = (async () => {
        const url = `${siteBasePath}~gitbook/index`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch search index: ${response.status}`);
        }

        const data: { pages: RawIndexPage[] } = await response.json();

        const index = new Document<IndexPage>({
            document: {
                id: 'id',
                index: ['title', 'description'],
                store: ['id', 'title', 'pathname', 'icon', 'description'],
            },
            tokenize: 'bidirectional',
            encoder: 'Normalize',
        });

        for (const page of data.pages) {
            index.add({
                id: page.id,
                title: page.title,
                pathname: `${siteBasePath}${page.pathname}`,
                icon: page.icon ?? null,
                description: page.description ?? null,
            });
        }

        cachedIndex = index;
        return index;
    })();

    // Clear pendingFetch on error so a retry is possible
    pendingFetch.catch(() => {
        console.error('Error fetching/building search index for siteBasePath', siteBasePath);
        pendingFetch = null;
    });

    return pendingFetch;
}

export function useLocalSearchResults(props: {
    query: string;
    siteBasePath: string;
    disabled?: boolean;
}): LocalSearchState {
    const { query, siteBasePath, disabled = false } = props;

    const [state, setState] = React.useState<LocalSearchState>({
        results: [],
        fetching: false,
        error: false,
    });

    // Track whether the index is loaded so the search effect re-runs after load
    const [indexReady, setIndexReady] = React.useState(!!cachedIndex);

    // Load the index once
    React.useEffect(() => {
        if (cachedIndex) {
            setIndexReady(true);
            return;
        }

        let cancelled = false;
        setState((prev) => ({ ...prev, fetching: true, error: false }));

        getOrBuildIndex(siteBasePath)
            .then(() => {
                if (!cancelled) {
                    setIndexReady(true);
                    setState((prev) => ({ ...prev, fetching: false }));
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setState({ results: [], fetching: false, error: true });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [siteBasePath]);

    // Perform instant local search whenever query or index readiness changes
    React.useEffect(() => {
        if (disabled || !indexReady || !cachedIndex) {
            return;
        }

        if (!query) {
            setState({ results: [], fetching: false, error: false });
            return;
        }

        const rawResults = cachedIndex.search(query, { enrich: true, limit: 10 });

        // Flatten and deduplicate results across fields (flexsearch returns one array per indexed field)
        const seen = new Set<string>();
        const results: LocalPageResult[] = [];

        for (const fieldResult of rawResults) {
            for (const item of fieldResult.result) {
                const doc = (item as { id: string; doc: IndexPage }).doc;
                if (!seen.has(doc.id)) {
                    seen.add(doc.id);
                    results.push({
                        type: 'local-page',
                        id: doc.id,
                        title: doc.title,
                        pathname: doc.pathname as string,
                        icon: doc.icon ?? undefined,
                        description: doc.description ?? undefined,
                    });
                }
            }
        }

        setState({ results, fetching: false, error: false });
    }, [query, indexReady, disabled]);

    return state;
}
