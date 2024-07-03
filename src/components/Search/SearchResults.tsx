import { Collection, Site } from '@gitbook/api';
import assertNever from 'assert-never';
import React from 'react';

import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { isQuestion } from './isQuestion';
import { SearchPageResultItem } from './SearchPageResultItem';
import { SearchQuestionResultItem } from './SearchQuestionResultItem';
import { SearchSectionResultItem } from './SearchSectionResultItem';
import {
    getRecommendedQuestions,
    OrderedComputedResult,
    searchParentContent,
    searchSpaceContent,
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
        parent: Site | Collection | null;
        withAsk: boolean;
        onSwitchToAsk: () => void;
        onClose: (to?: string) => void;
    },
    ref: React.Ref<SearchResultsRef>,
) {
    const { children, query, spaceId, revisionId, parent, withAsk, onSwitchToAsk, onClose } = props;

    const language = useLanguage();
    const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);
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
                setCursor(null);

                const fetchedResults = await (parent
                    ? searchParentContent(parent, query)
                    : searchSpaceContent(spaceId, revisionId, query));
                setResults(withAsk ? withQuestionResult(fetchedResults, query) : fetchedResults);
            }, 250);

            return () => {
                if (debounceTimeout.current) {
                    clearTimeout(debounceTimeout.current);
                    debounceTimeout.current = null;
                }
            };
        }
    }, [query, spaceId, revisionId, parent, withAsk]);

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
        <div
            className={tcls(
                'max-h-[60vh]',
                'overflow-auto',
                'relative',
                'shadow-[0_1px_0_0_inset]',
                'shadow-dark/2',
                'dark:shadow-light/2',
            )}
        >
            {children}
            {results.length === 0 ? (
                <div
                    data-test="search-noresults"
                    className={tcls(
                        'text-sm',
                        'text-dark',
                        'p-6',
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
                                        onClick={onClose}
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

function withQuestionResult(results: null | ResultType[], query: string): null | ResultType[] {
    const without = results ? results.filter((result) => result.type !== 'question') : null;

    if (!isQuestion(query)) {
        return without;
    }

    return [{ type: 'question', id: 'question', query }, ...(without ?? [])];
}
