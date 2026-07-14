import { readStreamableValue } from 'ai/rsc';
import React from 'react';

import { assert } from 'ts-essentials';

import {
    type RecommendedQuestionResult,
    createRecommendedQuestionResult,
    getEmptySearchResults,
} from './empty-search-results';
import type { OrderedComputedResult, SearchSiteContentScope } from './search-types';
import { streamRecommendedQuestions } from './server-actions';

import { useAI } from '@/components/AI';
import assertNever from 'assert-never';
import { useTrackEvent } from '../Insights';
import { computeFilterSiteSpaceIds } from './filter';
import { useRecentSearchQueries } from './recent-queries';
import { type MergedPageResult, reciprocalRankFusion } from './reciprocalRankFusion';
import { type LocalPageResult, useLocalSearchResults } from './useLocalSearchResults';
import type { SearchScope } from './useSearch';

export type ResultType =
    | OrderedComputedResult
    | LocalPageResult
    | MergedPageResult
    | RecommendedQuestionResult;

export type { LocalPageResult, MergedPageResult };

// Small helper extracted for unit testing of scope → local filter mapping
// computeFilterSiteSpaceIds is imported from './filter' for testability

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
    query: string;
    siteSpaceId: string;
    siteSpaceIds: string[];
    scope: SearchScope;
    suggestions?: string[];
    /** URL for the search API route (e.g. from linker.toPathInSpace('~gitbook/search')). */
    searchURL: string;
    /** URL for the local index JSON (e.g. from linker.toPathInSite('~gitbook/index')). */
    indexURL: string;
    /** BCP-47 language code of the current site space, used to filter local search results. */
    lang?: string;
    /** Whether the site has multiple sections. If false, treat default scope as current for local filtering. */
    withSections?: boolean;
}) {
    const {
        asEmbeddable,
        disabled,
        query,
        siteSpaceId,
        siteSpaceIds,
        scope,
        suggestions,
        searchURL,
        indexURL,
        lang,
        withSections,
    } = props;

    const trackEvent = useTrackEvent();

    const filterSiteSpaceIds = React.useMemo(
        () => computeFilterSiteSpaceIds(scope, siteSpaceId, siteSpaceIds, withSections),
        [scope, siteSpaceId, siteSpaceIds, withSections]
    );

    const { results: localResults } = useLocalSearchResults({
        query,
        indexURL,
        lang,
        disabled,
        filterSiteSpaceIds,
    });

    const [remoteState, setRemoteState] = React.useState<{
        results: OrderedComputedResult[];
        /** Results from the other site spaces, appended below all other results. */
        otherSpacesResults: OrderedComputedResult[];
        fetching: boolean;
        error: boolean;
    }>({ results: [], otherSpacesResults: [], fetching: false, error: false });

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
                    otherSpacesResults: [],
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
                    otherSpacesResults: [],
                    fetching: false,
                    error: false,
                });
                return;
            }

            setRemoteState({
                results: [],
                otherSpacesResults: [],
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
                    otherSpacesResults: [],
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
                            otherSpacesResults: [],
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
            otherSpacesResults: [],
            fetching: true,
            error: false,
        });
        let cancelled = false;
        const abortController = new AbortController();
        const timeout = setTimeout(async () => {
            const fetchSearch = (
                scope: Parameters<typeof fetchSearchResults>[1]
            ): Promise<OrderedComputedResult[]> =>
                fetchSearchResults(searchURL, scope, query, abortController.signal, asEmbeddable);

            try {
                // Each scope resolves to a primary search request and, for the default scope
                // on a multi-section site, a secondary request for the other site spaces
                // whose results are displayed below all other results.
                const { resultsPromise, otherSpacesResultsPromise } = ((): {
                    resultsPromise: Promise<OrderedComputedResult[]>;
                    otherSpacesResultsPromise?: Promise<OrderedComputedResult[]>;
                } => {
                    switch (scope) {
                        case 'all':
                            // Search all content on the site
                            return { resultsPromise: fetchSearch({ mode: 'all' }) };
                        case 'default':
                            // Search the current section's variant + matched/default variant for other sections.
                            // Without sections, the scope resolves to the current site space alone, so a
                            // second request restricted to the other site spaces would be redundant.
                            if (!withSections) {
                                return {
                                    resultsPromise: fetchSearch({ mode: 'current', siteSpaceId }),
                                };
                            }

                            // Split into two parallel requests so the (smaller, faster) current site
                            // space results can be shown while the other site spaces are still being searched.
                            return {
                                resultsPromise: fetchSearch({
                                    mode: 'current',
                                    siteSpaceId,
                                    restrictTo: 'currentSiteSpace',
                                }),
                                otherSpacesResultsPromise: fetchSearch({
                                    mode: 'current',
                                    siteSpaceId,
                                    restrictTo: 'otherSiteSpaces',
                                }),
                            };
                        case 'extended':
                            // Search all variants of the current section
                            return {
                                resultsPromise: fetchSearch({
                                    mode: 'specific',
                                    siteSpaceIds,
                                }),
                            };
                        case 'current':
                            // Search only the current section's current variant
                            return {
                                resultsPromise: fetchSearch({
                                    mode: 'specific',
                                    siteSpaceIds: [siteSpaceId],
                                }),
                            };
                        default:
                            assertNever(scope);
                    }
                })();

                let resultsArrived = false;
                otherSpacesResultsPromise?.then(
                    () => {
                        if (!resultsArrived && !cancelled) {
                            console.warn(
                                'Search results for the other site spaces arrived before the current site space results'
                            );
                        }
                    },
                    // Swallow the rejection to avoid an unhandled one;
                    // failures are handled where the promise is awaited below.
                    () => {}
                );

                const results = await resultsPromise;
                resultsArrived = true;

                if (cancelled) {
                    return;
                }

                if (!results) {
                    // One time when this one returns undefined is when it cannot find the server action and returns the html from the page.
                    // In that case, we want to avoid being stuck in a loading state, but it is an error.
                    // We could potentially try to force reload the page here, but i'm not 100% sure it would be a better experience.
                    setRemoteState({
                        results: [],
                        otherSpacesResults: [],
                        fetching: false,
                        error: true,
                    });
                    return;
                }

                // Keep fetching while the other site spaces request, if any, is in flight.
                setRemoteState({
                    results: results,
                    otherSpacesResults: [],
                    fetching: Boolean(otherSpacesResultsPromise),
                    error: false,
                });

                trackEvent({ type: 'search_type_query', query });

                if (!otherSpacesResultsPromise) {
                    return;
                }

                // If only the other site spaces request fails, keep the current site space
                // results and report a partial error.
                const otherSpacesResults = await otherSpacesResultsPromise.catch(() => null);
                if (cancelled) {
                    return;
                }
                setRemoteState({
                    results: results,
                    otherSpacesResults: otherSpacesResults ?? [],
                    fetching: false,
                    error: !otherSpacesResults,
                });
            } catch {
                // If there is an error, we need to catch it to avoid infinite loading state.
                if (cancelled) {
                    return;
                }
                setRemoteState({
                    results: [],
                    otherSpacesResults: [],
                    fetching: false,
                    error: true,
                });
            }
        }, 200);

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
        disabled,
        suggestions,
        searchURL,
        asEmbeddable,
        withSections,
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

        return reciprocalRankFusion(
            localResults,
            remoteState.results,
            remoteState.otherSpacesResults,
            query
        );
    }, [
        localResults,
        remoteState.results,
        remoteState.otherSpacesResults,
        query,
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
 * Fetch search results from the search API route.
 */
async function fetchSearchResults(
    searchURL: string,
    scope: SearchSiteContentScope,
    query: string,
    signal?: AbortSignal,
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
