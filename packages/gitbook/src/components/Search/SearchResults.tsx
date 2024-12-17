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
 *      - If withAsk is true and the query is a question, add a question result.
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
    const { children, query, pointer, spaceId, revisionId, global, withAsk, onSwitchToAsk } = props;

    const language = useLanguage();
    const debounceTimeout = React.useRef<Timer | null>(null);
    const [results, setResults] = React.useState<ResultType[] | null>(null);
    const [cursor, setCursor] = React.useState<number | null>(null);
    const refs = React.useRef<(null | HTMLAnchorElement)[]>([]);
    const suggestedQuestionsRef = React.useRef<null | string[]>(null);

    React.useEffect(() => {
        if (!query) {
            if (!withAsk) {
                return;
            }

            let cancelled = false;

            (suggestedQuestionsRef.current
                ? Promise.resolve(suggestedQuestionsRef.current)
                : getRecommendedQuestions(spaceId)
            ).then((questions) => {
                suggestedQuestionsRef.current = questions;

                if (cancelled) {
                    return;
                }

                setResults(
                    questions.map((question) => ({
                        type: 'recommended-question',
                        id: question,
                        question: question,
                    })),
                );
            });

            return () => {
                cancelled = true;
            };
        } else {
            if (withAsk) {
                setResults((prev) => withQuestionResult(prev, query));
            }

            debounceTimeout.current = setTimeout(async () => {
                const fetchedResults = await (global
                    ? searchAllSiteContent(query, pointer)
                    : searchSiteSpaceContent(query, pointer, revisionId));

                setResults(withAsk ? withQuestionResult(fetchedResults, query) : fetchedResults);
            }, 350);

            return () => {
                if (debounceTimeout.current) {
                    clearTimeout(debounceTimeout.current);
                    debounceTimeout.current = null;
                }
            };
        }
    }, [query, global, pointer, spaceId, revisionId, withAsk]);

    React.useEffect(() => {
        if (!query) {
            // Reset the cursor when there's no query
            setCursor(null);
        } else if (results && results.length > 0) {
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
            if (!results) {
                return;
            }

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

    if (!results) {
        if (query) {
            return (
                <div className={tcls('flex', 'items-center', 'justify-center', 'py-8')}>
                    <Loading className={tcls('w-6', 'text-primary')} />
                </div>
            );
        }

        return null;
    }

    return (
        <div className={tcls('overflow-auto')}>
            {children}
            {results.length === 0 ? (
                <div
                    data-test="search-noresults"
                    className={tcls(
                        'text',
                        'text-dark/8',
                        'p-8',
                        'text-center',
                        'dark:text-light/8',
                    )}
                >
                    {t(language, 'search_no_results', query)}
                </div>
            ) : (
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
            )}
        </div>
    );
});

/**
 * Add a "Ask <question>" item at the top of the results list.
 */
function withQuestionResult(results: null | ResultType[], query: string): null | ResultType[] {
    const without = results ? results.filter((result) => result.type !== 'question') : null;

    if (query.length === 0) {
        return without;
    }

    return [{ type: 'question', id: 'question', query }, ...(without ?? [])];
}
