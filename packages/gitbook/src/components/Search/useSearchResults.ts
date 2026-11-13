import { readStreamableValue } from 'ai/rsc';
import React from 'react';
import { assert } from 'ts-essentials';

import { useTrackEvent } from '../Insights';
import {
    type RecommendedQuestionResult,
    createRecommendedQuestionResult,
    getEmptySearchResults,
} from './empty-search-results';
import { computeFilterSiteSpaceIds, filterResultsBySiteSpaces } from './filter';
import { useRecentSearchQueries } from './recent-queries';
import { computeRemoteSearchScope } from './remote-scope';
import type { OrderedComputedResult, SearchSiteContentScope } from './search-types';
import { streamRecommendedQuestions } from './server-actions';
import type { SearchScope } from './useSearch';
import { useAI } from '@/components/AI';

export type ResultType = OrderedComputedResult | RecommendedQuestionResult;

type RemoteSearchState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'ready'; requestKey: string; results: OrderedComputedResult[] }
    | { status: 'error' };

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
    selectedSectionSiteSpaceIds?: string[];
    scope: SearchScope;
    suggestions?: string[];
    /** URL for the search API route (e.g. from linker.toPathInSpace('~gitbook/search')). */
    searchURL: string;
    /** Whether the site has multiple sections. If false, the default scope only shows the current site space. */
    withSections?: boolean;
    /** Returns true when the latest edit completed the query (paste, IME commit), so it is sent without the idle delay. */
    consumeImmediate?: (query: string) => boolean;
}) {
    const {
        asEmbeddable,
        disabled,
        query,
        siteSpaceId,
        siteSpaceIds,
        selectedSectionSiteSpaceIds,
        scope,
        suggestions,
        searchURL,
        withSections,
        consumeImmediate,
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

    const remoteScope = React.useMemo(
        () =>
            computeRemoteSearchScope(scope, siteSpaceId, siteSpaceIds, selectedSectionSiteSpaceIds),
        [scope, siteSpaceId, siteSpaceIds, selectedSectionSiteSpaceIds]
    );
    // Identifies the answer the UI needs now; an answer for any other key is never shown as current.
    const requestKey = JSON.stringify([query, remoteScope]);

    const [remoteState, setRemoteState] = React.useState<RemoteSearchState>({ status: 'idle' });

    // Track the current in-flight fetch so it can be aborted imperatively
    // when the user navigates away before the request completes.
    const abortRef = React.useRef<(() => void) | null>(null);
    // Sends the pending request now instead of waiting for the idle delay.
    const flushRef = React.useRef<(() => void) | null>(null);

    const { assistants } = useAI();
    const withAI = assistants.length > 0;
    const recentQueries = useRecentSearchQueries(siteSpaceId);

    React.useEffect(() => {
        if (disabled) {
            return;
        }
        if (!query) {
            if (!withAI) {
                setRemoteState({ status: 'idle' });
                return;
            }

            if (cachedRecommendedQuestions.has(siteSpaceId)) {
                const results = cachedRecommendedQuestions.get(siteSpaceId);
                assert(
                    results,
                    `Cached recommended questions should be set for site-space ${siteSpaceId}`
                );
                // Recommended questions are stored as ResultType[] already
                setRemoteState({ status: 'idle' });
                return;
            }

            setRemoteState({ status: 'idle' });

            let cancelled = false;

            // We currently have a bug where the same question can be returned multiple times.
            // This is a workaround to avoid that.
            const questions = new Set<string>();
            const recommendedQuestions: RecommendedQuestionResult[] = [];

            if (suggestions && suggestions.length > 0) {
                suggestions.forEach((question) => {
                    questions.add(question);
                });
                setRemoteState({ status: 'idle' });
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
                        setRemoteState({ status: 'idle' });
                    }
                }
            }, 100);

            return () => {
                cancelled = true;
                clearTimeout(timeout);
            };
        }
        setRemoteState({ status: 'loading' });
        let cancelled = false;
        const abortController = new AbortController();
        const send = async () => {
            flushRef.current = null;
            const fetchSearch = (
                scope: Parameters<typeof fetchSearchResults>[1]
            ): Promise<OrderedComputedResult[]> =>
                fetchSearchResults(searchURL, scope, query, abortController.signal, asEmbeddable);

            try {
                const resultsPromise = fetchSearch(remoteScope);

                const onResults = (results: OrderedComputedResult[]) => {
                    if (cancelled) {
                        return;
                    }

                    if (!results) {
                        // Can happen when the route cannot be found and returns the page's html.
                        setRemoteState({ status: 'error' });
                        return;
                    }

                    setRemoteState({ status: 'ready', requestKey, results });
                    trackEvent({ type: 'search_type_query', query });
                };
                const onError = () => {
                    if (cancelled) {
                        return;
                    }
                    setRemoteState({ status: 'error' });
                };

                await resultsPromise.then(onResults, onError);
            } catch {
                // If there is an error, we need to catch it to avoid infinite loading state.
                if (cancelled) {
                    return;
                }
                setRemoteState({ status: 'error' });
            }
        };
        const timeout = setTimeout(send, consumeImmediate?.(query) ? 0 : 200);
        flushRef.current = () => {
            clearTimeout(timeout);
            void send();
        };

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
            flushRef.current = null;
        };
    }, [
        query,
        remoteScope,
        requestKey,
        trackEvent,
        withAI,
        siteSpaceId,
        disabled,
        suggestions,
        searchURL,
        asEmbeddable,
        consumeImmediate,
    ]);

    const flush = React.useCallback(() => {
        flushRef.current?.();
    }, []);

    const abort = React.useCallback(() => {
        abortRef.current?.();
        abortRef.current = null;
        setRemoteState((prev) => (prev.status === 'loading' ? { status: 'idle' } : prev));
    }, []);

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

        return remoteState.status === 'ready' && remoteState.requestKey === requestKey
            ? filterResultsBySiteSpaces(remoteState.results, filterSiteSpaceIds)
            : [];
    }, [
        remoteState,
        requestKey,
        query,
        filterSiteSpaceIds,
        withAI,
        siteSpaceId,
        suggestions,
        recentQueries,
    ]);

    // Between a query change and its loading state, the previous answer must still read as loading.
    const isOutdated = remoteState.status === 'ready' && remoteState.requestKey !== requestKey;

    return {
        results,
        fetching: remoteState.status === 'loading' || (Boolean(query) && isOutdated),
        error: remoteState.status === 'error',
        requestKey,
        flush,
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
