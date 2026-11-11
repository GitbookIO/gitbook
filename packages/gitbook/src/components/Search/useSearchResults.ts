import { readStreamableValue } from 'ai/rsc';
import React from 'react';

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
import { streamRecommendedQuestions } from './server-actions';
import { type LocalPageResult, useLocalSearchResults } from './useLocalSearchResults';
import type { SearchScope } from './useSearch';
import { useAI } from '@/components/AI';

export type ResultType =
    | OrderedComputedResult
    | LocalPageResult
    | MergedPageResult
    | RecommendedQuestionResult;

export type { LocalPageResult, MergedPageResult };

/**
 * Where a search stands. Results listed while `loading` are instant title matches only,
 * so they are provisional; in every other phase the list is final.
 */
export type SearchPhase = 'idle' | 'loading' | 'loaded' | 'failed' | 'stopped';

type RemoteSearch =
    | { status: 'idle' }
    | { status: 'loading'; query: string }
    | { status: 'loaded'; query: string; results: OrderedComputedResult[] }
    | { status: 'failed'; query: string }
    // The visitor opened a result or asked an assistant before the server answered.
    | { status: 'stopped'; query: string };

const NO_REMOTE_RESULTS: OrderedComputedResult[] = [];

function getSearchPhase(query: string, remote: RemoteSearch): SearchPhase {
    if (!query) {
        return 'idle';
    }
    // A new query renders once before its request starts.
    if (remote.status === 'idle' || remote.query !== query) {
        return 'loading';
    }
    return remote.status;
}

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

    const [remote, setRemote] = React.useState<RemoteSearch>({ status: 'idle' });

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
            setRemote({ status: 'idle' });

            const hasQuestions =
                cachedRecommendedQuestions.has(siteSpaceId) ||
                (suggestions !== undefined && suggestions.length > 0);
            if (!withAI || hasQuestions) {
                return;
            }

            let cancelled = false;

            // We currently have a bug where the same question can be returned multiple times.
            // This is a workaround to avoid that.
            const questions = new Set<string>();
            const recommendedQuestions: RecommendedQuestionResult[] = [];

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
                        // A new object re-renders, so the list picks up the cached questions.
                        setRemote({ status: 'idle' });
                    }
                }
            }, 100);

            return () => {
                cancelled = true;
                clearTimeout(timeout);
            };
        }
        setRemote({ status: 'loading', query });
        let cancelled = false;
        const abortController = new AbortController();
        const timeout = setTimeout(async () => {
            const fetchSearch = (
                scope: Parameters<typeof fetchSearchResults>[1]
            ): Promise<OrderedComputedResult[]> =>
                fetchSearchResults(searchURL, scope, query, abortController.signal, asEmbeddable);

            try {
                const results = await fetchSearch(
                    computeRemoteSearchScope(
                        scope,
                        siteSpaceId,
                        siteSpaceIds,
                        selectedSectionSiteSpaceIds
                    )
                );
                if (cancelled) {
                    return;
                }

                if (!results) {
                    // Can happen when the route cannot be found and returns the page's html.
                    setRemote({ status: 'failed', query });
                    return;
                }

                setRemote({ status: 'loaded', query, results });
                trackEvent({ type: 'search_type_query', query });
            } catch {
                if (cancelled) {
                    return;
                }
                setRemote({ status: 'failed', query });
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
        selectedSectionSiteSpaceIds,
        disabled,
        suggestions,
        searchURL,
        asEmbeddable,
    ]);

    const abort = React.useCallback(() => {
        abortRef.current?.();
        abortRef.current = null;
        setRemote((prev) =>
            prev.status === 'loading' ? { status: 'stopped', query: prev.query } : prev
        );
    }, []);

    const phase = getSearchPhase(query, remote);
    const remoteResults =
        phase === 'loaded' && remote.status === 'loaded' ? remote.results : NO_REMOTE_RESULTS;

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
            remoteResults,
            query,
            allowedSiteSpaceIds: filterSiteSpaceIds,
        });
    }, [
        localResults,
        remote,
        remoteResults,
        query,
        filterSiteSpaceIds,
        withAI,
        siteSpaceId,
        suggestions,
        recentQueries,
    ]);

    return { results, phase, abort };
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
