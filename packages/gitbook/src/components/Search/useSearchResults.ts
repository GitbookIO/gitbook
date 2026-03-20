import { readStreamableValue } from 'ai/rsc';
import React from 'react';

import { assert } from 'ts-essentials';

import type { OrderedComputedResult } from './search-types';
import { streamRecommendedQuestions } from './server-actions';

import { type Assistant, useAI } from '@/components/AI';
import assertNever from 'assert-never';
import { useTrackEvent } from '../Insights';
import { isQuestion } from './isQuestion';
import { type MergedPageResult, getResultKey, reciprocalRankFusion } from './reciprocalRankFusion';
import { type LocalPageResult, useLocalSearchResults } from './useLocalSearchResults';
import type { SearchScope } from './useSearch';

export type ResultType =
    | OrderedComputedResult
    | LocalPageResult
    | MergedPageResult
    | { type: 'question'; id: string; query: string; assistant: Assistant }
    | { type: 'recommended-question'; id: string; question: string };

export type { LocalPageResult, MergedPageResult };

type MergeableResult = LocalPageResult | OrderedComputedResult | MergedPageResult;

/**
 * Append-only merge: local results first, then remote results that aren't
 * already covered by local.
 * Used once the user has interacted with the list (scroll / keyboard / pointer)
 * so that already-visible items never jump to a different position.
 */
function appendMerge(
    localResults: LocalPageResult[],
    remoteResults: OrderedComputedResult[]
): MergeableResult[] {
    const localKeys = new Set(localResults.map(getResultKey));
    const remoteOnly = remoteResults.filter((item) => !localKeys.has(getResultKey(item)));
    return [...localResults, ...remoteOnly];
}

/**
 * Stable-visible merge: visible items are kept in the order they appear in
 * `visibleIds` (insertion order), followed by non-visible items ranked by RRF.
 */
function stableVisibleMerge(
    localResults: LocalPageResult[],
    remoteResults: OrderedComputedResult[],
    visibleIds: ReadonlySet<string>
): MergeableResult[] {
    const rrfResult = reciprocalRankFusion(localResults, remoteResults);

    if (visibleIds.size === 0) {
        return rrfResult;
    }

    const rrfByKey = new Map<string, MergeableResult>(
        rrfResult.map((item) => [getResultKey(item), item])
    );

    const visible: MergeableResult[] = [];
    for (const id of visibleIds) {
        const item = rrfByKey.get(id);
        if (item) visible.push(item);
    }

    const nonVisible = rrfResult.filter((item) => !visibleIds.has(getResultKey(item)));

    return [...visible, ...nonVisible];
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

        let merged: MergeableResult[];
        if (hasInteractedRef.current) {
            // User has interacted: append new items, never reorder existing ones.
            merged = appendMerge(localResults, remoteState.results);
        } else if (!hasInteractedRef.current) {
            // User hasn't interacted: keep visible items in local order,
            // allow below-the-fold items to be freely re-ranked by RRF.
            merged = stableVisibleMerge(
                localResults,
                remoteState.results,
                visibleIdsRef.current
            );
        } else {
            // First render for this query: plain RRF with no stability constraints.
            merged = reciprocalRankFusion(localResults, remoteState.results);
        }

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
