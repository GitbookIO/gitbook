'use client';

import assertNever from 'assert-never';
import React from 'react';

import { useAI } from '@/components/AI';
import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { Button, SkeletonParagraph, SkeletonSmall } from '../primitives';
import { SearchPageResultItem } from './SearchPageResultItem';
import { SearchQuestionResultItem } from './SearchQuestionResultItem';
import { SearchRecordResultItem } from './SearchRecordResultItem';
import { SearchResultItem } from './SearchResultItem';
import type { OrderedComputedResult } from './search-types';
import type { LocalPageResult } from './useLocalSearchResults';

export interface SearchResultsRef {
    select(): void;
}

type ResultType =
    | OrderedComputedResult
    | LocalPageResult
    | { type: 'recommended-question'; id: string; question: string };

/**
 * Fetch the results of the keyboard navigable elements to display for a query:
 *   - Recommended questions if no query is provided.
 *   - Search results if a query is provided.
 */
export const SearchResults = React.forwardRef(function SearchResults(
    props: {
        children?: React.ReactNode;
        id: string;
        query: string;
        results: ResultType[];
        fetching: boolean;
        cursor: number | null;
        error: boolean;
        onResultSelect?: () => void;
    },
    ref: React.Ref<SearchResultsRef>
) {
    const { children, id, query, results, fetching, cursor, error, onResultSelect } = props;

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

    if (error) {
        return (
            <output
                className={tcls(
                    'flex',
                    'flex-col',
                    'items-center',
                    'justify-center',
                    'text-center',
                    'py-8',
                    'h-full',
                    'gap-4'
                )}
            >
                <div>{t(language, 'search_ask_error')}</div>
                <Button
                    variant="secondary"
                    size="small"
                    // We do a reload because in case of a new deployment, the action might have changed and it requires a full reload to work again.
                    onClick={() => window.location.reload()}
                >
                    {t(language, 'unexpected_error_retry')}
                </Button>
            </output>
        );
    }

    const noResults = (
        <output
            className={tcls(
                'flex',
                'items-center',
                'justify-center',
                'text-center',
                'py-8',
                'h-full',
                'animate-blur-in-slow'
            )}
        >
            {t(language, 'search_no_results_for', query)}
        </output>
    );

    return (
        <output aria-busy={fetching}>
            {children}
            {results.length === 0 ? (
                fetching ? null : query ? (
                    noResults
                ) : (
                    <div className="empty" />
                )
            ) : (
                <>
                    <div
                        data-testid="search-results"
                        className="flex flex-col space-y-1"
                        id={id}
                        role="listbox"
                        aria-live="polite"
                    >
                        {results.map((item, index) => {
                            const resultItemProps = {
                                'aria-posinset': index + 1,
                                'aria-setsize': results.length,
                                id: `${id}-${index}`,
                                onClickCapture: () => onResultSelect?.(),
                            };
                            switch (item.type) {
                                case 'local-page':
                                case 'page': {
                                    return (
                                        <SearchPageResultItem
                                            ref={(ref) => {
                                                refs.current[index] = ref;
                                            }}
                                            query={query}
                                            item={item}
                                            active={index === cursor}
                                            {...resultItemProps}
                                            key={item.type === 'page' ? item.pageId : item.id}
                                            style={{
                                                animationDelay: `${index * 25}ms,${100 + index * 25}ms`,
                                            }}
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
                                            style={{
                                                animationDelay: `${index * 25}ms,${100 + index * 25}ms`,
                                            }}
                                        />
                                    );
                                }
                                case 'record': {
                                    return (
                                        <SearchRecordResultItem
                                            ref={(ref) => {
                                                refs.current[index] = ref;
                                            }}
                                            key={item.id}
                                            query={query}
                                            item={item}
                                            active={index === cursor}
                                            style={{
                                                animationDelay: `${index * 25}ms,${100 + index * 25}ms`,
                                            }}
                                            {...resultItemProps}
                                        />
                                    );
                                }
                                default:
                                    assertNever(item);
                            }
                        })}
                    </div>
                    {!fetching && results.length === 0 ? noResults : null}
                </>
            )}
            {fetching && <SearchResultsSkeleton items={Math.max(3, 5 - results.length)} />}
        </output>
    );
});

const SearchResultsSkeleton = (props: { items: number }) => {
    const { items } = props;

    return (
        <>
            {Array.from({ length: items }).map((_, index) => (
                <SearchResultItem
                    key={index}
                    active={false}
                    href="#"
                    action=""
                    disabled
                    data-testid="search-page-result"
                    leadingIcon={
                        <SkeletonSmall
                            className="size-4"
                            style={{ animationDelay: `${index * 0.3}s` }}
                        />
                    }
                >
                    <SkeletonParagraph size="small" start={index * 3} />
                </SearchResultItem>
            ))}
        </>
    );
};
