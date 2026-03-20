import { readStreamableValue } from 'ai/rsc';
import React from 'react';

import { assert } from 'ts-essentials';

import type { OrderedComputedResult } from './search-types';
import { streamRecommendedQuestions } from './server-actions';

import { type Assistant, useAI } from '@/components/AI';
import assertNever from 'assert-never';
import { useTrackEvent } from '../Insights';
import { isQuestion } from './isQuestion';
import { getResultKey, reciprocalRankFusion } from './reciprocalRankFusion';
import { type LocalPageResult, useLocalSearchResults } from './useLocalSearchResults';
import type { SearchScope } from './useSearch';

export type ResultType =
    | OrderedComputedResult
    | LocalPageResult
    | { type: 'question'; id: string; query: string; assistant: Assistant }
    | { type: 'recommended-question'; id: string; question: string };

export type { LocalPageResult };

type MergeableResult = LocalPageResult | OrderedComputedResult;

/**
 * Append-only merge: keep all previous results unchanged and append any new
 * items from a fresh RRF run at the end.
 * Used once the user has interacted with the list (scroll / keyboard / pointer)
 * so that already-visible items never jump to a different position.
 */
function appendMerge(
    localResults: LocalPageResult[],
    remoteResults: OrderedComputedResult[],
    previousResults: MergeableResult[]
): MergeableResult[] {
    const prevKeys = new Set(previousResults.map(getResultKey));
    const fresh = reciprocalRankFusion(localResults, remoteResults);
    const newItems = fresh.filter((item) => !prevKeys.has(getResultKey(item)));
    return [...previousResults, ...newItems];
}

/**
 * Stable-visible merge: run a full RRF but keep the relative order of items
 * that are currently visible in the scroll viewport. Items below the fold are
 * still freely re-ranked by RRF.
 *
 * The slot-filling algorithm:
 *  1. Partition the RRF output into "visible" and "non-visible" buckets.
 *  2. Sort the visible bucket by each item's position in `previousResults`.
 *  3. Walk the RRF output: every slot that held a visible item is filled from
 *     the sorted visible bucket; every other slot is filled from the non-visible
 *     bucket (preserving RRF order for that half).
 */
function stableVisibleMerge(
    localResults: LocalPageResult[],
    remoteResults: OrderedComputedResult[],
    visibleIds: ReadonlySet<string>,
    previousResults: MergeableResult[]
): MergeableResult[] {
    const rrfResult = reciprocalRankFusion(localResults, remoteResults);

    if (visibleIds.size === 0 || previousResults.length === 0) {
        return rrfResult;
    }

    const prevIndexMap = new Map<string, number>(
        previousResults.map((item, i) => [getResultKey(item), i])
    );

    const visibleInRRF: MergeableResult[] = [];
    const nonVisibleInRRF: MergeableResult[] = [];

    for (const item of rrfResult) {
        if (visibleIds.has(getResultKey(item))) {
            visibleInRRF.push(item);
        } else {
            nonVisibleInRRF.push(item);
        }
    }

    // Sort visible items by their previous display position
    visibleInRRF.sort((a, b) => {
        const ia = prevIndexMap.get(getResultKey(a)) ?? Number.POSITIVE_INFINITY;
        const ib = prevIndexMap.get(getResultKey(b)) ?? Number.POSITIVE_INFINITY;
        return ia - ib;
    });

    // Fill RRF-shaped slots: visible → stable-sorted visible; non-visible → RRF order
    const result: MergeableResult[] = [];
    let vi = 0;
    let ni = 0;

    for (const item of rrfResult) {
        if (visibleIds.has(getResultKey(item))) {
            result.push(visibleInRRF[vi++]!);
        } else {
            result.push(nonVisibleInRRF[ni++]!);
        }
    }

    return result;
}

/**
 * We cache the recommended questions globally to avoid calling the API multiple times
 * when re-opening the search modal. The cache is per space, so that we can
 * have different recommended questions for different spaces of the same site.
 * It should not be used outside of an useEffect.
 */
const cachedRecommendedQuestions: Map<string, ResultType[]> = new Map();

export function useSearchResults(props: {
    disabled: boolean;
    query: string;
    siteSpaceId: string;
    siteSpaceIds: string[];
    scope: SearchScope;
    withAI: boolean;
    suggestions?: string[];
    /** URL for the search API route (e.g. from linker.toPathInSpace('~gitbook/search')). */
    searchURL: string;
    /** URL for the local index JSON (e.g. from linker.toPathInSite('~gitbook/index')). */
    indexURL: string;
    /** BCP-47 language code of the current site space, used to filter local search results. */
    lang?: string;
}) {
    const {
        disabled,
        query,
        siteSpaceId,
        siteSpaceIds,
        scope,
        suggestions,
        searchURL,
        indexURL,
        lang,
    } = props;

    const trackEvent = useTrackEvent();

    const { results: localResults } = useLocalSearchResults({
        query,
        indexURL,
        lang,
        disabled,
    });

    const [remoteState, setRemoteState] = React.useState<{
        results: OrderedComputedResult[];
        fetching: boolean;
        error: boolean;
    }>({ results: [], fetching: false, error: false });

    const { assistants } = useAI();
    const withAI = assistants.length > 0;

    // --- Interaction / visibility tracking (refs → no extra renders) ---

    /** True once the user has scrolled, moved the keyboard cursor, or hovered over results. */
    const hasInteractedRef = React.useRef(false);
    /** Keys of result items currently visible in the scroll viewport. */
    const visibleIdsRef = React.useRef<ReadonlySet<string>>(new Set());
    /**
     * The last merged result list together with the query it was computed for.
     * Storing the query lets us detect when the query has changed and discard
     * stale data synchronously inside the useMemo, even before the reset effect
     * has fired.
     */
    const previousResultsRef = React.useRef<{ query: string; results: MergeableResult[] }>({
        query: '',
        results: [],
    });

    // Reset interaction state whenever the query changes.
    React.useEffect(() => {
        hasInteractedRef.current = false;
        visibleIdsRef.current = new Set();
    }, [query]);

    /** Call when the user scrolls, navigates with arrow keys, or hovers the list. */
    const setInteracted = React.useCallback(() => {
        hasInteractedRef.current = true;
    }, []);

    /** Update the set of result keys that are currently visible in the viewport. */
    const onVisibilityChange = React.useCallback((ids: ReadonlySet<string>) => {
        visibleIdsRef.current = ids;
    }, []);

    React.useEffect(() => {
        if (disabled) {
            return;
        }
        if (!query) {
            if (!withAI) {
                setRemoteState({ results: [], fetching: false, error: false });
                return;
            }

            if (cachedRecommendedQuestions.has(siteSpaceId)) {
                const results = cachedRecommendedQuestions.get(siteSpaceId);
                assert(
                    results,
                    `Cached recommended questions should be set for site-space ${siteSpaceId}`
                );
                // Recommended questions are stored as ResultType[] already
                setRemoteState({ results: [], fetching: false, error: false });
                return;
            }

            setRemoteState({ results: [], fetching: false, error: false });

            let cancelled = false;

            // We currently have a bug where the same question can be returned multiple times.
            // This is a workaround to avoid that.
            const questions = new Set<string>();
            const recommendedQuestions: ResultType[] = [];

            if (suggestions && suggestions.length > 0) {
                suggestions.forEach((question) => {
                    questions.add(question);
                });
                setRemoteState({ results: [], fetching: false, error: false });
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
                    recommendedQuestions.push({
                        type: 'recommended-question',
                        id: question,
                        question,
                    });
                    cachedRecommendedQuestions.set(siteSpaceId, recommendedQuestions);

                    if (!cancelled) {
                        // Recommended questions are handled via a separate path below
                        setRemoteState({ results: [], fetching: false, error: false });
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
            try {
                const results = await (() => {
                    const fetchSearch = (
                        scope: Parameters<typeof fetchSearchResults>[1]
                    ): Promise<OrderedComputedResult[]> =>
                        fetchSearchResults(searchURL, scope, query, abortController.signal);

                    switch (scope) {
                        case 'all':
                            // Search all content on the site
                            return fetchSearch({ mode: 'all' });
                        case 'default':
                            // Search the current section's variant + matched/default variant for other sections
                            return fetchSearch({ mode: 'current', siteSpaceId });
                        case 'extended':
                            // Search all variants of the current section
                            return fetchSearch({ mode: 'specific', siteSpaceIds });
                        case 'current':
                            // Search only the current section's current variant
                            return fetchSearch({ mode: 'specific', siteSpaceIds: [siteSpaceId] });
                        default:
                            assertNever(scope);
                    }
                })();

                if (cancelled) {
                    return;
                }

                if (!results) {
                    // One time when this one returns undefined is when it cannot find the server action and returns the html from the page.
                    // In that case, we want to avoid being stuck in a loading state, but it is an error.
                    // We could potentially try to force reload the page here, but i'm not 100% sure it would be a better experience.
                    setRemoteState({ results: [], fetching: false, error: true });
                    return;
                }

                setRemoteState({ results, fetching: false, error: false });

                trackEvent({
                    type: 'search_type_query',
                    query,
                });
            } catch {
                // If there is an error, we need to catch it to avoid infinite loading state.
                if (cancelled) {
                    return;
                }
                setRemoteState({ results: [], fetching: false, error: true });
            }
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
            abortController.abort();
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
    ]);

    // Merge local and remote results.
    // Re-runs immediately whenever either result set changes.
    const results = React.useMemo<ResultType[]>(() => {
        if (!query) {
            // No query: show recommended questions (AI-only path) or nothing.
            if (withAI && cachedRecommendedQuestions.has(siteSpaceId)) {
                return cachedRecommendedQuestions.get(siteSpaceId) ?? [];
            }
            if (suggestions && suggestions.length > 0) {
                return suggestions.map((question, index) => ({
                    type: 'recommended-question' as const,
                    id: `recommended-question-${index}`,
                    question,
                }));
            }
            return [];
        }

        // Treat previousResults as empty if they belong to a different query.
        // This is a synchronous guard that complements the reset useEffect above.
        const previous =
            previousResultsRef.current.query === query ? previousResultsRef.current.results : [];

        let merged: MergeableResult[];
        if (hasInteractedRef.current && previous.length > 0) {
            // User has interacted: append new items, never reorder existing ones.
            merged = appendMerge(localResults, remoteState.results, previous);
        } else if (!hasInteractedRef.current && previous.length > 0) {
            // User hasn't interacted: keep visible items in their current order,
            // allow below-the-fold items to be freely re-ranked by RRF.
            merged = stableVisibleMerge(
                localResults,
                remoteState.results,
                visibleIdsRef.current,
                previous
            );
        } else {
            // First render for this query: plain RRF with no stability constraints.
            merged = reciprocalRankFusion(localResults, remoteState.results);
        }

        // Store for the next merge cycle (written during render; safe for refs).
        previousResultsRef.current = { query, results: merged };

        return withAI ? withAskTriggers(merged, query, assistants) : merged;
    }, [localResults, remoteState.results, query, withAI, assistants, siteSpaceId, suggestions]);

    return {
        results,
        fetching: remoteState.fetching,
        error: remoteState.error,
        setInteracted,
        onVisibilityChange,
    };
}

/**
 * Fetch search results from the search API route.
 */
async function fetchSearchResults(
    searchURL: string,
    scope:
        | { mode: 'all' }
        | { mode: 'current'; siteSpaceId: string }
        | { mode: 'specific'; siteSpaceIds: string[] },
    query: string,
    signal?: AbortSignal
): Promise<OrderedComputedResult[]> {
    const response = await fetch(searchURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

/**
 * Add a "Ask <question>" item at the top of the results list.
 */
function withAskTriggers(
    results: ResultType[],
    query: string,
    assistants: Assistant[]
): ResultType[] {
    const without = results.filter((result) => result.type !== 'question');

    if (query.length === 0) {
        return without;
    }

    const queryIsQuestion = isQuestion(query);

    return [
        ...(queryIsQuestion ? [] : (without ?? [])),
        ...assistants.map((assistant, index) => ({
            type: 'question' as const,
            id: `question-${index}`,
            query,
            assistant,
        })),
        ...(!queryIsQuestion ? [] : (without ?? [])),
    ];
}
