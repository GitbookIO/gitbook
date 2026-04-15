import { readStreamableValue } from 'ai/rsc';
import React from 'react';

import { assert } from 'ts-essentials';

import type { OrderedComputedResult } from './search-types';
import { streamRecommendedQuestions } from './server-actions';

import { type Assistant, useAI } from '@/components/AI';
import assertNever from 'assert-never';
import { useEventCallback } from 'usehooks-ts';
import { useTrackEvent } from '../Insights';
import { isQuestion } from './isQuestion';
import type { SearchScope } from './useSearch';

export type ResultType =
    | OrderedComputedResult
    | { type: 'question'; id: string; query: string; assistant: Assistant }
    | { type: 'recommended-question'; id: string; question: string };

/**
 * We cache the recommended questions globally to avoid calling the API multiple times
 * when re-opening the search modal. The cache is per space, so that we can
 * have different recommended questions for different spaces of the same site.
 * It should not be used outside of an useEffect.
 */
const cachedRecommendedQuestions: Map<string, ResultType[]> = new Map();

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
    } = props;

    const trackEvent = useTrackEvent();

    const [resultsState, setResultsState] = React.useState<{
        results: ResultType[];
        fetching: boolean;
        error: boolean;
    }>({ results: [], fetching: false, error: false });

    const { assistants } = useAI();
    const getAssistants = useEventCallback(() => assistants);
    const withAI = assistants.length > 0;

    React.useEffect(() => {
        if (disabled) {
            return;
        }
        if (!query) {
            if (!withAI) {
                setResultsState({ results: [], fetching: false, error: false });
                return;
            }

            if (cachedRecommendedQuestions.has(siteSpaceId)) {
                const results = cachedRecommendedQuestions.get(siteSpaceId);
                assert(
                    results,
                    `Cached recommended questions should be set for site-space ${siteSpaceId}`
                );
                setResultsState({ results, fetching: false, error: false });
                return;
            }

            setResultsState({ results: [], fetching: false, error: false });

            let cancelled = false;

            // We currently have a bug where the same question can be returned multiple times.
            // This is a workaround to avoid that.
            const questions = new Set<string>();
            const recommendedQuestions: ResultType[] = [];

            if (suggestions && suggestions.length > 0) {
                suggestions.forEach((question) => {
                    questions.add(question);
                });
                setResultsState({
                    results: suggestions.map((question, index) => ({
                        type: 'recommended-question',
                        id: `recommended-question-${index}`,
                        question,
                    })),
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
                    recommendedQuestions.push({
                        type: 'recommended-question',
                        id: question,
                        question,
                    });
                    cachedRecommendedQuestions.set(siteSpaceId, recommendedQuestions);

                    if (!cancelled) {
                        setResultsState({
                            results: [...recommendedQuestions],
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
        setResultsState({
            results: withAI ? withAskTriggers([], query, getAssistants()) : [],
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
                        fetchSearchResults(
                            searchURL,
                            scope,
                            query,
                            abortController.signal,
                            asEmbeddable
                        );

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
                    setResultsState({ results: [], fetching: false, error: true });
                    return;
                }

                const aiEnrichedResults = withAI
                    ? withAskTriggers(results, query, getAssistants())
                    : results;

                setResultsState({ results: aiEnrichedResults, fetching: false, error: false });

                trackEvent({
                    type: 'search_type_query',
                    query,
                });
            } catch {
                // If there is an error, we need to catch it to avoid infinite loading state.
                if (cancelled) {
                    return;
                }
                setResultsState({ results: [], fetching: false, error: true });
            }
        }, 200);

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
        asEmbeddable,
        getAssistants,
    ]);

    return resultsState;
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
