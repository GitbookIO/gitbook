import assertNever from 'assert-never';
import React from 'react';

import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { isQuestion } from './isQuestion';
import { SearchPageResultItem } from './SearchPageResultItem';
import { SearchQuestionResultItem } from './SearchQuestionResultItem';
import { SearchSectionResultItem } from './SearchSectionResultItem';
import { OrderedComputedResult, searchContent } from './server-actions';


export interface SearchResultsRef {
    moveUp(): void;
    moveDown(): void;
    select(): void;
}

type ResultType = OrderedComputedResult | { type: 'question'; id: string; query: string };

export const SearchResults = React.forwardRef(function SearchResults(
    props: {
        query: string;
        spaceId: string;
        onSwitchToAsk: () => void;
    },
    ref: React.Ref<SearchResultsRef>,
) {
    const { query, spaceId, onSwitchToAsk } = props;

    const language = useLanguage();
    const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);
    const [results, setResults] = React.useState<ResultType[] | null>(null);
    const [cursor, setCursor] = React.useState<number | null>(null);
    const refs = React.useRef<(null | HTMLAnchorElement)[]>([]);

    React.useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        setResults((prev) => withQuestionResult(prev, query));

        debounceTimeout.current = setTimeout(async () => {
            setCursor(null);
            setResults(withQuestionResult(await searchContent(spaceId, query), query));
        }, 250);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [query, spaceId]);

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
        return null;
    }

    return (
        <div className={tcls('max-h-[60vh]', 'overflow-auto', 'px', 'inverted-theme-scroll')}>
            {results.length === 0 ? (
                <div className={tcls('text-sm', 'text-dark', 'p-6', 'text-center')}>
                    {t(language, 'search_no_results', query)}
                </div>
            ) : (
                results.map((item, index) => {
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
                                    query={query}
                                    active={index === cursor}
                                    onClick={onSwitchToAsk}
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
                })
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
