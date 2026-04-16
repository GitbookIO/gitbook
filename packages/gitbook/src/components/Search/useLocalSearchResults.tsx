'use client';

import { Document, type DocumentValue } from 'flexsearch';
import React from 'react';

interface Breadcrumb {
    label: string;
    icon?: string;
    emoji?: string;
}

/** Raw entry from the `~gitbook/index` JSON response */
interface RawIndexPage {
    id: string;
    title: string;
    pathname: string;
    /** BCP-47 language code emitted by the index route, absent when no language is set. */
    lang?: string;
    icon?: string;
    emoji?: string;
    description?: string;
    breadcrumbs?: Breadcrumb[];
}

/** FlexSearch-compatible document type — satisfies DocumentData via explicit index signature */
interface IndexPage {
    [key: string]: DocumentValue | DocumentValue[];
    id: string;
    title: string;
    description: string | null;
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

// Module-level singletons — one Document per language per session.
// Keys are the page's `lang` value, or `''` when no language is set.
const cachedIndexes = new Map<string, Document<IndexPage>>();

// Side-map for data that doesn't belong in the FlexSearch index.
// Keyed by page id, shared across all language groups.
const cachedPageData = new Map<
    string,
    { pathname: string; icon?: string; emoji?: string; breadcrumbs?: Breadcrumb[] }
>();

let pendingFetch: Promise<Map<string, Document<IndexPage>>> | null = null;

function buildLangIndex(pages: RawIndexPage[]): Document<IndexPage> {
    const index = new Document<IndexPage>({
        document: {
            id: 'id',
            index: ['title', 'description'],
            store: ['id', 'title', 'description'],
        },
        tokenize: 'full',
        resolution: 15,
        encoder: 'Normalize',
    });

    for (const page of pages) {
        index.add({
            id: page.id,
            title: page.title,
            description: page.description ?? null,
        });

        cachedPageData.set(page.id, {
            pathname: page.pathname,
            icon: page.icon,
            emoji: page.emoji,
            breadcrumbs: page.breadcrumbs?.length ? page.breadcrumbs : undefined,
        });
    }

    return index;
}

async function getOrBuildIndexes(indexURL: string): Promise<Map<string, Document<IndexPage>>> {
    if (cachedIndexes.size > 0) {
        return cachedIndexes;
    }

    if (pendingFetch) {
        return pendingFetch;
    }

    pendingFetch = (async () => {
        const response = await fetch(indexURL);
        if (!response.ok) {
            throw new Error(`Failed to fetch search index: ${response.status}`);
        }

        const data: { pages: RawIndexPage[] } = await response.json();

        // Group pages by their `lang` value (empty string for pages without one)
        const pagesByLang = new Map<string, RawIndexPage[]>();
        for (const page of data.pages) {
            const key = page.lang ?? '';
            const bucket = pagesByLang.get(key);
            if (bucket) {
                bucket.push(page);
            } else {
                pagesByLang.set(key, [page]);
            }
        }

        // Build one FlexSearch Document per language group
        for (const [lang, pages] of pagesByLang) {
            cachedIndexes.set(lang, buildLangIndex(pages));
        }

        return cachedIndexes;
    })();

    // Clear pendingFetch on error so a retry is possible
    pendingFetch.catch(() => {
        console.error('Error fetching/building search index', indexURL);
        pendingFetch = null;
    });

    return pendingFetch;
}

export function useLocalSearchResults(props: {
    query: string;
    indexURL: string;
    /** BCP-47 language code of the current site space. When provided, only results
     * from pages with a matching language are returned. */
    lang?: string;
    disabled?: boolean;
}): LocalSearchState {
    const { query, indexURL, lang, disabled = false } = props;

    const [state, setState] = React.useState<LocalSearchState>({
        results: [],
        fetching: false,
        error: false,
    });

    // Track whether the indexes are loaded so the search effect re-runs after load
    const [indexReady, setIndexReady] = React.useState(cachedIndexes.size > 0);

    // Load the indexes once
    React.useEffect(() => {
        if (cachedIndexes.size > 0) {
            setIndexReady(true);
            return;
        }

        let cancelled = false;
        setState((prev) => ({ ...prev, fetching: true, error: false }));

        getOrBuildIndexes(indexURL)
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
    }, [indexURL]);

    // Perform instant local search whenever query, lang, or index readiness changes
    React.useEffect(() => {
        // Resolve the per-language index to query. When `lang` is not set we fall
        // back to the `''` bucket (pages with no language tag).
        const langKey = lang ?? '';
        const index = cachedIndexes.get(langKey);

        if (disabled || !indexReady || !index) {
            return;
        }

        if (!query) {
            setState({ results: [], fetching: false, error: false });
            return;
        }

        const rawResults = index.search(query, { enrich: true, limit: 5, suggest: true });

        // Flatten and deduplicate results across fields (flexsearch returns one array per indexed field)
        const seen = new Set<string>();
        const results: LocalPageResult[] = [];

        for (const fieldResult of rawResults) {
            for (const item of fieldResult.result) {
                const doc = (item as { id: string; doc: IndexPage }).doc;
                if (!seen.has(doc.id)) {
                    seen.add(doc.id);
                    const extra = cachedPageData.get(doc.id);
                    results.push({
                        type: 'local-page',
                        id: doc.id,
                        title: doc.title,
                        pathname: extra?.pathname ?? '',
                        icon: extra?.icon,
                        emoji: extra?.emoji,
                        description: (doc.description as string | null) ?? undefined,
                        breadcrumbs: extra?.breadcrumbs,
                    });
                }
            }
        }

        setState({ results, fetching: false, error: false });
    }, [query, lang, indexReady, disabled]);

    return state;
}
