'use client';

import assertNever from 'assert-never';
import { AnimatePresence, motion } from 'framer-motion';
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

function getResultKey(item: ResultType): string {
    switch (item.type) {
        case 'local-page':
            return `page:${item.id}`;
        case 'page':
            return `page:${item.pageId}`;
        case 'record':
            return `record:${item.id}`;
        case 'recommended-question':
            return `question:${item.id}`;
        default:
            return assertNever(item);
    }
}

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
    const shouldAnimateResults = !query || fetching;
    const previousCursor = React.useRef<number | null>(cursor);
    const seenResultKeys = React.useRef(new Set<string>());
    const lastQuery = React.useRef(query);

    if (lastQuery.current !== query) {
        lastQuery.current = query;
        seenResultKeys.current.clear();
    }

    const refs = React.useRef<(null | HTMLAnchorElement)[]>([]);

    React.useEffect(() => {
        for (const item of results) {
            seenResultKeys.current.add(getResultKey(item));
        }
    }, [results]);

    // Scroll to the active result.
    React.useEffect(() => {
        if (cursor === null || !refs.current[cursor]) {
            return;
        }

        refs.current[cursor]?.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
            behavior: 'instant',
        });
    }, [cursor]);

    const shouldDisableLayoutAnimation = previousCursor.current !== cursor;
    React.useEffect(() => {
        previousCursor.current = cursor;
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
    const primaryAssistant = assistants[0];

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
        <output className={tcls('min-h-full', query ? 'mb-[100%]' : '')} aria-busy={fetching}>
            {children}
            {results.length === 0 ? (
                fetching ? null : query ? (
                    noResults
                ) : (
                    <div className="empty" />
                )
            ) : (
                <>
                    <div data-testid="search-results" className="flex flex-col space-y-1" id={id}>
                        <AnimatePresence initial={false} mode="popLayout">
                            {results.map((item, index) => {
                                const itemKey = getResultKey(item);
                                const shouldAnimateItem =
                                    shouldAnimateResults || !seenResultKeys.current.has(itemKey);
                                const resultItemProps = {
                                    'aria-posinset': index + 1,
                                    'aria-setsize': results.length,
                                    onClickCapture: () => onResultSelect?.(),
                                };
                                switch (item.type) {
                                    case 'local-page':
                                    case 'page': {
                                        return (
                                            <motion.div
                                                layout="position"
                                                transition={
                                                    shouldDisableLayoutAnimation
                                                        ? { layout: { duration: 0 } }
                                                        : { duration: 0.3, ease: 'circInOut' }
                                                }
                                                key={itemKey}
                                            >
                                                <div
                                                    className={
                                                        shouldAnimateItem
                                                            ? 'animate-blur-in-height'
                                                            : undefined
                                                    }
                                                    style={{
                                                        animationDelay: `${index * 25}ms,${100 + index * 25}ms`,
                                                    }}
                                                >
                                                    <SearchPageResultItem
                                                        ref={(ref) => {
                                                            refs.current[index] = ref;
                                                        }}
                                                        query={query}
                                                        item={item}
                                                        active={index === cursor}
                                                        style={{
                                                            animationDelay: `${index * 25}ms,${100 + index * 25}ms`,
                                                        }}
                                                        {...resultItemProps}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    }
                                    case 'recommended-question': {
                                        if (!primaryAssistant) {
                                            return null;
                                        }
                                        return (
                                            <motion.div
                                                className={
                                                    shouldAnimateItem
                                                        ? 'animate-blur-in'
                                                        : undefined
                                                }
                                                style={
                                                    shouldAnimateItem
                                                        ? {
                                                              animationDelay: `${index * 25}ms,${100 + index * 25}ms`,
                                                          }
                                                        : undefined
                                                }
                                                key={itemKey}
                                            >
                                                <SearchQuestionResultItem
                                                    ref={(ref) => {
                                                        refs.current[index] = ref;
                                                    }}
                                                    question={item.question}
                                                    active={index === cursor}
                                                    assistant={primaryAssistant}
                                                    recommended
                                                    style={{
                                                        animationDelay: `${index * 25}ms,${100 + index * 25}ms`,
                                                    }}
                                                    {...resultItemProps}
                                                />
                                            </motion.div>
                                        );
                                    }
                                    case 'record': {
                                        return (
                                            <motion.div
                                                layout="position"
                                                transition={
                                                    shouldDisableLayoutAnimation
                                                        ? { layout: { duration: 0 } }
                                                        : { duration: 0.3, ease: 'circInOut' }
                                                }
                                                key={itemKey}
                                            >
                                                <div
                                                    className={
                                                        shouldAnimateItem
                                                            ? 'animate-blur-in-height'
                                                            : undefined
                                                    }
                                                    style={{
                                                        animationDelay: `${index * 25}ms,${100 + index * 25}ms`,
                                                    }}
                                                >
                                                    <SearchRecordResultItem
                                                        ref={(ref) => {
                                                            refs.current[index] = ref;
                                                        }}
                                                        key={itemKey}
                                                        query={query}
                                                        item={item}
                                                        active={index === cursor}
                                                        style={{
                                                            animationDelay: `${index * 25}ms,${100 + index * 25}ms`,
                                                        }}
                                                        {...resultItemProps}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    }
                                    default:
                                        assertNever(item);
                                }
                            })}
                        </AnimatePresence>
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
    const skeletonKeys = Array.from({ length: items }, (_, index) => `skeleton:${index}`);

    return (
        <>
            {skeletonKeys.map((key, index) => (
                <SearchResultItem
                    key={key}
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
