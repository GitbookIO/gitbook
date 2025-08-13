'use client';

import { readStreamableValue } from 'ai/rsc';
import assertNever from 'assert-never';
import React from 'react';

import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { CustomizationAIMode } from '@gitbook/api';
import { assert } from 'ts-essentials';
import { useTrackEvent } from '../Insights';
import { Loading } from '../primitives';
import { SearchPageResultItem } from './SearchPageResultItem';
import { SearchQuestionResultItem } from './SearchQuestionResultItem';
import { SearchSectionResultItem } from './SearchSectionResultItem';
import {
    type OrderedComputedResult,
    searchAllSiteContent,
    searchSiteSpaceContent,
    streamRecommendedQuestions,
} from './server-actions';

export interface SearchResultsRef {
    moveUp(): void;
    moveDown(): void;
    select(): void;
}

type ResultType =
    | OrderedComputedResult
    | { type: 'question'; id: string; query: string }
    | { type: 'recommended-question'; id: string; question: string };

/**
 * We cache the recommended questions globally to avoid calling the API multiple times
 * when re-opening the search modal. The cache is per space, so that we can
 * have different recommended questions for different spaces of the same site.
 * It should not be used outside of an useEffect.
 */
const cachedRecommendedQuestions: Map<string, ResultType[]> = new Map();

/**
 * Fetch the results of the keyboard navigable elements to display for a query:
 *   - Recommended questions if no query is provided.
 *   - Search results if a query is provided.
 *      - If withAI is true, add a question result.
 */
export const SearchResults = React.forwardRef(function SearchResults(
    props: {
        children?: React.ReactNode;
        query: string;
        global: boolean;
        aiMode: CustomizationAIMode;
        siteSpaceId: string;
    },
    ref: React.Ref<SearchResultsRef>
) {
    const { children, query, aiMode, global, siteSpaceId } = props;

    const language = useLanguage();
    const trackEvent = useTrackEvent();
    const [resultsState, setResultsState] = React.useState<{
        results: ResultType[];
        fetching: boolean;
    }>({ results: [], fetching: true });
    const [cursor, setCursor] = React.useState<number | null>(null);
    const refs = React.useRef<(null | HTMLAnchorElement)[]>([]);

    const withAI =
        aiMode === CustomizationAIMode.Search || aiMode === CustomizationAIMode.Assistant;

    React.useEffect(() => {
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
            const results = await (global
                ? searchAllSiteContent(query)
                : searchSiteSpaceContent(query));

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
    }, [query, global, withAI, trackEvent]);

    const results: ResultType[] = React.useMemo(() => {
        if (!withAI) {
            return resultsState.results;
        }
        return withQuestionResult(resultsState.results, query);
    }, [resultsState.results, query, withAI]);

    React.useEffect(() => {
        if (!query) {
            // Reset the cursor when there's no query
            setCursor(null);
        } else if (results.length > 0) {
            // Auto-focus the first result
            setCursor(0);
        }
    }, [results, query]);

    // Scroll to the active result.
    React.useEffect(() => {
        if (cursor === null || !refs.current[cursor]) {
            return;
        }

        refs.current[cursor]?.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
        });
    }, [cursor, refs]);

    const moveBy = React.useCallback(
        (delta: number) => {
            setCursor((prev) => {
                if (prev === null) {
                    return 0;
                }

                return Math.max(Math.min(prev + delta, results.length - 1), 0);
            });
        },
        [results]
    );

    const select = React.useCallback(() => {
        if (cursor === null || !refs.current[cursor]) {
            return;
        }

        refs.current[cursor]?.click();
    }, [cursor, refs]);

    React.useImperativeHandle(
        ref,
        () => ({
            moveUp: () => {
                moveBy(-1);
            },
            moveDown: () => {
                moveBy(1);
            },
            select,
        }),
        [moveBy, select]
    );

    if (resultsState.fetching) {
        return (
            <div className={tcls('flex', 'items-center', 'justify-center', 'py-8', 'h-full')}>
                <Loading className={tcls('w-6', 'text-tint/6')} />
            </div>
        );
    }

    const noResults = (
        <div
            className={tcls(
                'flex',
                'items-center',
                'justify-center',
                'text-center',
                'py-8',
                'h-full'
            )}
        >
            {t(language, 'search_no_results_for', query)}
        </div>
    );

    return (
        <div className={tcls('min-h-full')}>
            {children}
            {results.length === 0 ? (
                query ? (
                    noResults
                ) : (
                    <div className="empty" />
                )
            ) : (
                <>
                    <div data-testid="search-results" className="flex flex-col gap-y-1">
                        {results.map((item, index) => {
                            switch (item.type) {
                                case 'page': {
                                    return (
                                        <SearchPageResultItem
                                            ref={(ref) => {
                                                refs.current[index] = ref;
                                            }}
                                            key={item.id}
                                            query={query}
                                            item={item}
                                            active={index === cursor}
                                        />
                                    );
                                }
                                case 'question': {
                                    return (
                                        <SearchQuestionResultItem
                                            ref={(ref) => {
                                                refs.current[index] = ref;
                                            }}
                                            withAIChat={aiMode === CustomizationAIMode.Assistant}
                                            key={item.id}
                                            question={query}
                                            active={index === cursor}
                                        />
                                    );
                                }
                                case 'recommended-question': {
                                    return (
                                        <SearchQuestionResultItem
                                            ref={(ref) => {
                                                refs.current[index] = ref;
                                            }}
                                            key={item.id}
                                            withAIChat={aiMode === CustomizationAIMode.Assistant}
                                            question={item.question}
                                            active={index === cursor}
                                            recommended
                                        />
                                    );
                                }
                                case 'section': {
                                    return (
                                        <SearchSectionResultItem
                                            ref={(ref) => {
                                                refs.current[index] = ref;
                                            }}
                                            key={item.id}
                                            query={query}
                                            item={item}
                                            active={index === cursor}
                                        />
                                    );
                                }
                                default:
                                    assertNever(item);
                            }
                        })}
                    </div>
                    {!results.some((result) => result.type !== 'question') && noResults}
                </>
            )}
        </div>
    );
});

/**
 * Add a "Ask <question>" item at the top of the results list.
 */
function withQuestionResult(results: ResultType[], query: string): ResultType[] {
    const without = results.filter((result) => result.type !== 'question');

    if (query.length === 0) {
        return without;
    }

    return [{ type: 'question', id: 'question', query }, ...(without ?? [])];
}
