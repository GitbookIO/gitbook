'use client';

import assertNever from 'assert-never';
import React from 'react';

import { type Assistant, useAI } from '@/components/AI';
import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { Loading } from '../primitives';
import { SearchPageResultItem } from './SearchPageResultItem';
import { SearchQuestionResultItem } from './SearchQuestionResultItem';
import { SearchSectionResultItem } from './SearchSectionResultItem';
import type { OrderedComputedResult } from './server-actions';

export interface SearchResultsRef {
    select(): void;
}

type ResultType =
    | OrderedComputedResult
    | { type: 'question'; id: string; query: string; assistant: Assistant }
    | { type: 'recommended-question'; id: string; question: string };

/**
 * Fetch the results of the keyboard navigable elements to display for a query:
 *   - Recommended questions if no query is provided.
 *   - Search results if a query is provided.
 *      - If withAI is true, add a question result.
 */
export const SearchResults = React.forwardRef(function SearchResults(
    props: {
        children?: React.ReactNode;
        id: string;
        query: string;
        results: ResultType[];
        fetching: boolean;
        cursor: number | null;
    },
    ref: React.Ref<SearchResultsRef>
) {
    const { children, id, query, results, fetching, cursor } = props;

    const language = useLanguage();

    const refs = React.useRef<(null | HTMLAnchorElement)[]>([]);

    // Scroll to the active result.
    React.useEffect(() => {
        if (cursor === null || !refs.current[cursor]) {
            return;
        }

        refs.current[cursor]?.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
        });
    }, [cursor]);

    const select = React.useCallback(() => {
        if (cursor === null || !refs.current[cursor]) {
            return;
        }

        refs.current[cursor]?.click();
    }, [cursor]);

    React.useImperativeHandle(
        ref,
        () => ({
            select,
        }),
        [select]
    );

    const { assistants } = useAI();

    if (fetching) {
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
                    <div
                        data-testid="search-results"
                        className="flex flex-col gap-y-1"
                        id={id}
                        role="listbox"
                        aria-live="polite"
                    >
                        {results.map((item, index) => {
                            const resultItemProps = {
                                'aria-posinset': index + 1,
                                'aria-setsize': results.length,
                                id: `${id}-${index}`,
                            };
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
                                            {...resultItemProps}
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
                                            assistant={item.assistant}
                                            {...resultItemProps}
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
                                            assistant={assistants[0]!}
                                            recommended
                                            {...resultItemProps}
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
                                            {...resultItemProps}
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
