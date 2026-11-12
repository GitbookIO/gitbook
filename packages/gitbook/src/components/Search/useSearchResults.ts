import { readStreamableValue } from 'ai/rsc';
import { jwtDecode } from 'jwt-decode';
import React from 'react';
import { assert } from 'ts-essentials';

import type { SearchRecordResult, SearchSpaceResult } from '@gitbook/api';

import { useTrackEvent } from '../Insights';
import {
    type RecommendedQuestionResult,
    createRecommendedQuestionResult,
    getEmptySearchResults,
} from './empty-search-results';
import { computeFilterSiteSpaceIds } from './filter';
import { useRecentSearchQueries } from './recent-queries';
import { type MergedPageResult, fuseSearchResults } from './reciprocalRankFusion';
import { computeRemoteSearchScope } from './remote-scope';
import type { OrderedComputedResult, SearchSiteContentScope } from './search-types';
import { getSearchSpikeOverrides } from './searchSpikeOverrides';
import { streamRecommendedQuestions } from './server-actions';
import { type LocalPageResult, useLocalSearchResults } from './useLocalSearchResults';
import type { SearchScope } from './useSearch';
import { useAI } from '@/components/AI';
import { getEmbeddableLinker } from '@/lib/embeddable-linker';
import { createSiteLinker } from '@/lib/links';
import { removeTrailingSlash } from '@/lib/paths';
import {
    type DirectSearchProps,
    computePublishedSearchResults,
    toSearchSiteContentBody,
} from '@/lib/search-results';

export type ResultType =
    | OrderedComputedResult
    | LocalPageResult
    | MergedPageResult
    | RecommendedQuestionResult;

export type { LocalPageResult, MergedPageResult };

// Small helper extracted for unit testing of scope → local filter mapping
// computeFilterSiteSpaceIds is imported from './filter' for testability

/** Delay between the last keystroke and the remote search request. */
const SEARCH_DEBOUNCE_MS = 200;

/**
 * We cache the recommended questions globally to avoid calling the API multiple times
 * when re-opening the search modal. The cache is per space, so that we can
 * have different recommended questions for different spaces of the same site.
 * It should not be used outside of an useEffect.
 */
const cachedRecommendedQuestions: Map<string, RecommendedQuestionResult[]> = new Map();

export function useSearchResults(props: {
    asEmbeddable?: boolean;
    disabled: boolean;
    /** Whether the search surface is open. Gates building the local search index. */
    open: boolean;
    query: string;
    siteSpaceId: string;
    siteSpaceIds: string[];
    selectedSectionSiteSpaceIds?: string[];
    scope: SearchScope;
    suggestions?: string[];
    /** URL for the search API route (e.g. from linker.toPathInSpace('~gitbook/search')). */
    searchURL: string;
    /** Target to query the search API directly from the browser, when the page allows it. */
    directSearch?: DirectSearchProps;
    /** URL for the local index JSON (e.g. from linker.toPathInSite('~gitbook/site-index')). */
    indexURL: string;
    /** BCP-47 language code of the current site space, used to filter local search results. */
    lang?: string;
    /** Whether the site has multiple sections. If false, treat default scope as current for local filtering. */
    withSections?: boolean;
}) {
    const {
        asEmbeddable,
        disabled,
        open,
        query,
        siteSpaceId,
        siteSpaceIds,
        selectedSectionSiteSpaceIds,
        scope,
        suggestions,
        searchURL,
        directSearch,
        indexURL,
        lang,
        withSections,
    } = props;

    const trackEvent = useTrackEvent();

    const filterSiteSpaceIds = React.useMemo(
        () =>
            computeFilterSiteSpaceIds(
                scope,
                siteSpaceId,
                siteSpaceIds,
                withSections,
                selectedSectionSiteSpaceIds
            ),
        [scope, siteSpaceId, siteSpaceIds, withSections, selectedSectionSiteSpaceIds]
    );

    const { results: localResults } = useLocalSearchResults({
        query,
        indexURL,
        lang,
        disabled,
        open,
        filterSiteSpaceIds,
    });

    const [remoteState, setRemoteState] = React.useState<{
        results: OrderedComputedResult[];
        fetching: boolean;
        error: boolean;
    }>({ results: [], fetching: false, error: false });

    // Track the current in-flight fetch so it can be aborted imperatively
    // when the user navigates away before the request completes.
    const abortRef = React.useRef<(() => void) | null>(null);

    const { assistants } = useAI();
    const withAI = assistants.length > 0;
    const recentQueries = useRecentSearchQueries(siteSpaceId);

    React.useEffect(() => {
        if (disabled) {
            return;
        }
        if (!query) {
            if (!withAI) {
                setRemoteState({
                    results: [],
                    fetching: false,
                    error: false,
                });
                return;
            }

            if (cachedRecommendedQuestions.has(siteSpaceId)) {
                const results = cachedRecommendedQuestions.get(siteSpaceId);
                assert(
                    results,
                    `Cached recommended questions should be set for site-space ${siteSpaceId}`
                );
                // Recommended questions are stored as ResultType[] already
                setRemoteState({
                    results: [],
                    fetching: false,
                    error: false,
                });
                return;
            }

            setRemoteState({
                results: [],
                fetching: false,
                error: false,
            });

            let cancelled = false;

            // We currently have a bug where the same question can be returned multiple times.
            // This is a workaround to avoid that.
            const questions = new Set<string>();
            const recommendedQuestions: RecommendedQuestionResult[] = [];

            if (suggestions && suggestions.length > 0) {
                suggestions.forEach((question) => {
                    questions.add(question);
                });
                setRemoteState({
                    results: [],
                    fetching: false,
                    error: false,
                });
                return;
            }

            const timeout = setTimeout(async () => {
                if (cancelled) {
                    return;
                }

                const response = await streamRecommendedQuestions({ siteSpaceId });
                for await (const entry of readStreamableValue(response.stream)) {
                    if (!entry) {
                        continue;
                    }

                    const { question } = entry;
                    if (questions.has(question)) {
                        continue;
                    }

                    questions.add(question);
                    recommendedQuestions.push(createRecommendedQuestionResult(question, question));
                    cachedRecommendedQuestions.set(siteSpaceId, recommendedQuestions);

                    if (!cancelled) {
                        // Recommended questions are handled via a separate path below
                        setRemoteState({
                            results: [],
                            fetching: false,
                            error: false,
                        });
                    }
                }
            }, 100);

            return () => {
                cancelled = true;
                clearTimeout(timeout);
            };
        }
        setRemoteState({
            results: [],
            fetching: true,
            error: false,
        });
        let cancelled = false;
        const abortController = new AbortController();
        const timeout = setTimeout(async () => {
            const fetchSearch = (scope: SearchSiteContentScope): Promise<OrderedComputedResult[]> =>
                fetchSearchResults({
                    searchURL,
                    directSearch,
                    scope,
                    query,
                    signal: abortController.signal,
                    asEmbeddable,
                });

            try {
                const resultsPromise = fetchSearch(
                    computeRemoteSearchScope(
                        scope,
                        siteSpaceId,
                        siteSpaceIds,
                        selectedSectionSiteSpaceIds
                    )
                );

                const onResults = (results: OrderedComputedResult[]) => {
                    if (cancelled) {
                        return;
                    }

                    if (!results) {
                        // Can happen when the route cannot be found and returns the page's html.
                        setRemoteState((prev) => ({ ...prev, error: true }));
                        return;
                    }

                    setRemoteState((prev) => ({ ...prev, results }));
                    trackEvent({ type: 'search_type_query', query });
                };
                const onError = () => {
                    if (cancelled) {
                        return;
                    }
                    setRemoteState((prev) => ({ ...prev, error: true }));
                };

                await resultsPromise.then(onResults, onError);

                if (cancelled) {
                    return;
                }
                setRemoteState((prev) => ({ ...prev, fetching: false }));
            } catch {
                // If there is an error, we need to catch it to avoid infinite loading state.
                if (cancelled) {
                    return;
                }
                setRemoteState({
                    results: [],
                    fetching: false,
                    error: true,
                });
            }
        }, getSearchSpikeOverrides().debounceMs ?? SEARCH_DEBOUNCE_MS);

        abortRef.current = () => {
            cancelled = true;
            clearTimeout(timeout);
            abortController.abort();
        };

        return () => {
            cancelled = true;
            clearTimeout(timeout);
            abortController.abort();
            abortRef.current = null;
        };
    }, [
        query,
        scope,
        trackEvent,
        withAI,
        siteSpaceId,
        siteSpaceIds,
        selectedSectionSiteSpaceIds,
        disabled,
        suggestions,
        searchURL,
        directSearch,
        asEmbeddable,
    ]);

    const abort = React.useCallback(() => {
        abortRef.current?.();
        abortRef.current = null;
        setRemoteState((prev) => (prev.fetching ? { ...prev, fetching: false } : prev));
    }, []);

    // Merge local and remote results.
    // Re-runs immediately whenever either result set changes.
    const results = React.useMemo<ResultType[]>(() => {
        if (!query) {
            const recommendedQuestions =
                cachedRecommendedQuestions.get(siteSpaceId) ??
                suggestions?.map((question, index) =>
                    createRecommendedQuestionResult(`recommended-question-${index}`, question)
                ) ??
                [];

            return getEmptySearchResults({
                withAI,
                recentQueries,
                recommendedQuestions,
            });
        }

        return fuseSearchResults({
            localResults,
            remoteResults: remoteState.results,
            query,
            allowedSiteSpaceIds: filterSiteSpaceIds,
        });
    }, [
        localResults,
        remoteState.results,
        query,
        filterSiteSpaceIds,
        withAI,
        siteSpaceId,
        suggestions,
        recentQueries,
    ]);

    return {
        results,
        fetching: remoteState.fetching,
        error: remoteState.error,
        abort,
    };
}

/**
 * Fetch search results from the search API, or from the search route when the page can't query it.
 */
async function fetchSearchResults(input: {
    searchURL: string;
    directSearch: DirectSearchProps | undefined;
    scope: SearchSiteContentScope;
    query: string;
    signal: AbortSignal;
    asEmbeddable: boolean | undefined;
}): Promise<OrderedComputedResult[]> {
    const { searchURL, directSearch, scope, query, signal, asEmbeddable } = input;

    if (directSearch && canSearchDirectly(directSearch)) {
        try {
            return await fetchDirectSearchResults({
                directSearch,
                scope,
                query,
                signal,
                asEmbeddable: Boolean(asEmbeddable),
            });
        } catch (error) {
            if (signal.aborted) {
                throw error;
            }
        }
    }

    return fetchRouteSearchResults(searchURL, scope, query, signal, asEmbeddable);
}

function canSearchDirectly(directSearch: DirectSearchProps): boolean {
    if (getSearchSpikeOverrides().direct === false) {
        return false;
    }

    try {
        const { exp } = jwtDecode<{ exp?: number }>(directSearch.apiToken);
        // Same margin as the static routes, which stop serving a token this close to expiry.
        return typeof exp === 'number' && exp > Date.now() / 1000 + 120;
    } catch {
        return false;
    }
}

async function fetchDirectSearchResults(input: {
    directSearch: DirectSearchProps;
    scope: SearchSiteContentScope;
    query: string;
    signal: AbortSignal;
    asEmbeddable: boolean;
}): Promise<OrderedComputedResult[]> {
    const { directSearch, scope, query, signal, asEmbeddable } = input;
    const { apiURL, apiToken, organizationId, siteId, spaces } = directSearch;

    if (query.length <= 1) {
        return [];
    }

    const response = await fetch(
        `${removeTrailingSlash(apiURL)}/v1/orgs/${organizationId}/sites/${siteId}/search`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(toSearchSiteContentBody(query, scope)),
            signal,
        }
    );

    if (!response.ok) {
        throw new Error(`Direct search request failed: ${response.status}`);
    }

    const data = (await response.json()) as {
        items?: (SearchSpaceResult | SearchRecordResult)[];
    };
    if (!Array.isArray(data?.items)) {
        throw new Error('Direct search response has no items');
    }

    const linker = createSiteLinker(directSearch.linker);
    return computePublishedSearchResults({
        asEmbeddable,
        linker: asEmbeddable ? getEmbeddableLinker(linker) : linker,
        searchResults: data.items,
        spaces,
    });
}

/**
 * Fetch search results from the search API route.
 */
async function fetchRouteSearchResults(
    searchURL: string,
    scope: SearchSiteContentScope,
    query: string,
    signal: AbortSignal,
    asEmbeddable?: boolean
): Promise<OrderedComputedResult[]> {
    const response = await fetch(searchURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            asEmbeddable,
            query,
            scope,
        }),
        signal,
    });

    if (!response.ok) {
        throw new Error(`Search request failed: ${response.status}`);
    }

    return response.json() as Promise<OrderedComputedResult[]>;
}
