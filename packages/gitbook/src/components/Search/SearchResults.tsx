'use client';

import { captureException } from '@sentry/nextjs';
import assertNever from 'assert-never';
import React from 'react';

import { t, useLanguage } from '@/intl/client';
import { SiteContentPointer } from '@/lib/api';
import { tcls } from '@/lib/tailwind';

import { SearchPageResultItem } from './SearchPageResultItem';
import { SearchQuestionResultItem } from './SearchQuestionResultItem';
import { SearchSectionResultItem } from './SearchSectionResultItem';
import {
    getRecommendedQuestions,
    OrderedComputedResult,
    searchSiteSpaceContent,
    searchAllSiteContent,
} from './server-actions';
import { useTrackEvent } from '../Insights';
import { Loading } from '../primitives';

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
 * Fetch the results of the keyboard navigable elements to display for a query:
 *   - Recommended questions if no query is provided.
 *   - Search results if a query is provided.
 *      - If withAsk is true, add a question result.
 */
export const SearchResults = React.forwardRef(function SearchResults(
    props: {
        children?: React.ReactNode;
        query: string;
        spaceId: string;
        revisionId: string;
        global: boolean;
        withAsk: boolean;
        pointer: SiteContentPointer;
        onSwitchToAsk: () => void;
    },
    ref: React.Ref<SearchResultsRef>,
) {
    const { children, query, pointer, spaceId, revisionId, withAsk, global, onSwitchToAsk } = props;

    const language = useLanguage();
    const trackEvent = useTrackEvent();
    const [resultsState, setResultsState] = React.useState<{
        results: ResultType[];
        fetching: boolean;
    }>({ results: [], fetching: true });
    const [cursor, setCursor] = React.useState<number | null>(null);
    const refs = React.useRef<(null | HTMLAnchorElement)[]>([]);
    const suggestedQuestionsRef = React.useRef<null | ResultType[]>(null);

    React.useEffect(() => {
        if (!query) {
            if (!withAsk) {
                setResultsState({ results: [], fetching: false });
                return;
            }

            if (suggestedQuestionsRef.current) {
                setResultsState({ results: suggestedQuestionsRef.current, fetching: false });
                return;
            }

            let cancelled = false;

            setResultsState({ results: [], fetching: true });
            getRecommendedQuestions(spaceId).then((questions) => {
                if (!questions) {
                    if (!cancelled) {
                        setResultsState({ results: [], fetching: false });
                    }
                    captureException(
                        new Error(`corrupt-cache: getRecommendedQuestions is ${questions}`),
                    );
                    return;
                }

                const results = questions.map((question) => ({
                    type: 'recommended-question',
                    id: question,
                    question: question,
                })) satisfies ResultType[];

                suggestedQuestionsRef.current = results;

                if (cancelled) {
                    return;
                }

                setResultsState({ results, fetching: false });
            });

            return () => {
                cancelled = true;
            };
        } else {
            setResultsState((prev) => ({ results: prev.results, fetching: true }));
            let cancelled = false;
            const timeout = setTimeout(async () => {
                const results = await (global
                    ? searchAllSiteContent(query, pointer)
                    : searchSiteSpaceContent(query, pointer, revisionId));

                if (cancelled) {
                    return;
                }

                if (!results) {
                    captureException(
                        new Error(
                            `corrupt-cache: ${global ? 'searchAllSiteContent' : 'searchSiteSpaceContent'} is ${results}`,
                        ),
                        { extra: { results } },
                    );
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
        }
    }, [query, global, pointer, spaceId, revisionId, withAsk, trackEvent]);

    const results: ResultType[] = React.useMemo(() => {
        if (!withAsk) {
            return resultsState.results;
        }
        return withQuestionResult(resultsState.results, query);
    }, [resultsState.results, query, withAsk]);

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
        [results],
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
        [moveBy, select],
    );

    if (resultsState.fetching) {
        return (
            <div className={tcls('flex', 'items-center', 'justify-center', 'py-8')}>
                <Loading className={tcls('w-6', 'text-primary')} />
            </div>
        );
    }

    const noResults = (
        <div
            data-test="search-noresults"
            className={tcls('text', 'text-dark/8', 'p-8', 'text-center', 'dark:text-light/8')}
        >
            {t(language, 'search_no_results', query)}
        </div>
    );

    return (
        <div className={tcls('overflow-auto')}>
            {children}
            {results.length === 0 ? (
                query ? (
                    noResults
                ) : null
            ) : (
                <>
                    <div data-test="search-results">
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
                                            key={item.id}
                                            question={query}
                                            active={index === cursor}
                                            onClick={onSwitchToAsk}
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
                                            question={item.question}
                                            active={index === cursor}
                                            onClick={onSwitchToAsk}
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
