import { readStreamableValue } from 'ai/rsc';
import React from 'react';

import { assert } from 'ts-essentials';

import {
    type OrderedComputedResult,
    searchAllSiteContent,
    searchCurrentSiteSpaceContent,
    searchSpecificSiteSpaceContent,
    streamRecommendedQuestions,
} from './server-actions';

import { type Assistant, useAI } from '@/components/AI';
import { useTrackEvent } from '../Insights';
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
    disabled: boolean;
    query: string;
    siteSpaceId: string;
    siteSpaceIds: string[];
    scope: SearchScope;
    withAI: boolean;
}) {
    const { disabled, query, siteSpaceId, siteSpaceIds, scope } = props;

    const trackEvent = useTrackEvent();

    const [resultsState, setResultsState] = React.useState<{
        results: ResultType[];
        fetching: boolean;
    }>({ results: [], fetching: false });

    const { assistants } = useAI();
    const withAI = assistants.length > 0;

    React.useEffect(() => {
        if (disabled) {
            return;
        }
        if (!query) {
            if (!withAI) {
                setResultsState({ results: [], fetching: false });
                return;
            }

            if (cachedRecommendedQuestions.has(siteSpaceId)) {
                const results = cachedRecommendedQuestions.get(siteSpaceId);
                assert(
                    results,
                    `Cached recommended questions should be set for site-space ${siteSpaceId}`
                );
                setResultsState({ results, fetching: false });
                return;
            }

            setResultsState({ results: [], fetching: false });

            let cancelled = false;

            // We currently have a bug where the same question can be returned multiple times.
            // This is a workaround to avoid that.
            const questions = new Set<string>();
            const recommendedQuestions: ResultType[] = [];

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
                        setResultsState({ results: [...recommendedQuestions], fetching: false });
                    }
                }
            }, 100);

            return () => {
                cancelled = true;
                clearTimeout(timeout);
            };
        }
        setResultsState((prev) => ({ results: prev.results, fetching: true }));
        let cancelled = false;
        const timeout = setTimeout(async () => {
            const results = await (() => {
                if (scope === 'all') {
                    // Search all content on the site
                    return searchAllSiteContent(query);
                }
                if (scope === 'default') {
                    // Search the current section's variant + matched/default variant for other sections
                    return searchCurrentSiteSpaceContent(query, siteSpaceId);
                }
                if (scope === 'extended') {
                    // Search all variants of the current section
                    return searchSpecificSiteSpaceContent(query, siteSpaceIds);
                }
                if (scope === 'current') {
                    // Search only the current section's current variant
                    return searchSpecificSiteSpaceContent(query, [siteSpaceId]);
                }
                throw new Error(`Unhandled search scope: ${scope}`);
            })();

            if (cancelled) {
                return;
            }

            if (!results) {
                setResultsState({ results: [], fetching: false });
                return;
            }

            setResultsState({ results, fetching: false });

            trackEvent({
                type: 'search_type_query',
                query,
            });
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [query, scope, trackEvent, withAI, siteSpaceId, siteSpaceIds, disabled]);

    const aiEnrichedResults: ResultType[] = React.useMemo(() => {
        if (!withAI) {
            return resultsState.results;
        }
        return withAskTriggers(resultsState.results, query, assistants);
    }, [resultsState.results, query, withAI]);

    return { ...resultsState, results: aiEnrichedResults };
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

    return [
        ...assistants.map((assistant, index) => ({
            type: 'question' as const,
            id: `question-${index}`,
            query,
            assistant,
        })),
        ...(without ?? []),
    ];
}
