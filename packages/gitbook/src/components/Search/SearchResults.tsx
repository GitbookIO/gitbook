'use client';

import assertNever from 'assert-never';
import { motion } from 'framer-motion';
import React from 'react';

import { Button } from '../primitives';
import { isExternalLink } from '../utils/link';
import { addRecentSearchQuery } from './recent-queries';
import { SearchPageResultItem } from './SearchPageResultItem';
import { SearchQuestionResultItem } from './SearchQuestionResultItem';
import { SearchRecordResultItem } from './SearchRecordResultItem';
import type { ResultType } from './useSearchResults';
import { useAI } from '@/components/AI';
import { useCurrentContent } from '@/components/hooks';
import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

/**
 * Bar widths (breadcrumb, title, description, in %) of the loading placeholder rows. Six rows of
 * this height fill the results area of the desktop popover; the count never depends on an answer.
 */
const PLACEHOLDER_ROWS: [crumb: number, title: number, description: number][] = [
    [28, 64, 86],
    [20, 48, 78],
    [34, 58, 90],
    [24, 70, 72],
    [30, 52, 84],
    [22, 60, 76],
];

export interface SearchResultsRef {
    select(): boolean;
    /** Activate the first result, ignoring the cursor. */
    selectFirst(): boolean;
}

function getResultKey(item: ResultType): string {
    switch (item.type) {
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
    const { siteSpaceId } = useCurrentContent();
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
            return false;
        }

        refs.current[cursor]?.click();
        return true;
    }, [cursor]);

    React.useImperativeHandle(
        ref,
        () => ({
            select,
            selectFirst: () => {
                const first = refs.current[0];
                first?.click();
                return Boolean(first);
            },
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
                    'grow',
                    'flex-col',
                    'items-center',
                    'justify-center',
                    'text-center',
                    'py-8',
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
                'grow',
                'items-center',
                'justify-center',
                'text-center',
                'py-8',
                'animate-blur-in-slow'
            )}
        >
            {t(language, 'search_no_results_for', query)}
        </output>
    );

    return (
        <output className="flex grow flex-col" aria-busy={fetching}>
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
                        className="flex flex-col gap-1"
                        id={id}
                        role="listbox"
                        aria-live="polite"
                    >
                        {results.map((item, index) => {
                            const itemKey = getResultKey(item);
                            const shouldAnimateItem =
                                shouldAnimateResults || !seenResultKeys.current.has(itemKey);
                            const handleResultSelect = (
                                event: React.MouseEvent<HTMLAnchorElement>
                            ) => {
                                const isPageResult = item.type === 'page' || item.type === 'record';

                                if (
                                    isPageResult &&
                                    !event.currentTarget.hash &&
                                    event.currentTarget.pathname === window.location.pathname
                                ) {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }

                                if (query && siteSpaceId && isPageResult) {
                                    addRecentSearchQuery(siteSpaceId, query, 'search');
                                }

                                // The popover's focus manager re-focuses the popup when the focused
                                // result is torn down during close (base-ui `restoreFocus`), and that
                                // focus() scrolls the popup — anchored at the top of the page — into
                                // view, undoing the scroll to the section the result linked to.
                                // A click that opens elsewhere leaves the search open, and keyboard
                                // users should keep their place in it.
                                if (navigatesCurrentWindow(event)) {
                                    event.currentTarget.blur();
                                }

                                onResultSelect?.();
                            };
                            const resultItemProps = {
                                'aria-posinset': index + 1,
                                'aria-setsize': results.length,
                                id: `${id}-${index}`,
                                onClickCapture: handleResultSelect,
                            };
                            switch (item.type) {
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
                                                shouldAnimateItem ? 'animate-blur-in' : undefined
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
                                                action={item.action}
                                                active={index === cursor}
                                                assistant={primaryAssistant}
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
                    </div>
                    {!fetching && results.length === 0 ? noResults : null}
                </>
            )}
            {fetching ? (
                <div
                    role="status"
                    aria-busy="true"
                    className={tcls(
                        results.length > 0 ? 'mt-1' : '',
                        'flex flex-col gap-1',
                        'animate-[fadeIn_150ms_ease-out_both,pulse_2.4s_ease-in-out_600ms_infinite] motion-reduce:animate-none'
                    )}
                >
                    <SearchResultsPlaceholder />
                </div>
            ) : null}
        </output>
    );
});

/**
 * Loading rows shaped like a page result: breadcrumb, title and description lines in the real
 * row's box, so the first result lands where the first placeholder was.
 */
const SearchResultsPlaceholder = () =>
    PLACEHOLDER_ROWS.map(([crumb, title, description], index) => (
        <div
            key={index}
            data-search-placeholder-row
            aria-hidden
            className="flex items-center gap-3 py-2 pl-3 pr-2"
        >
            <div className="size-4 shrink-0 rounded-sm bg-tint-solid/2" />
            <div className="grow">
                <PlaceholderLine className="text-xs" barClassName="h-2" width={crumb} />
                <PlaceholderLine
                    className="font-heading text-base font-semibold leading-snug"
                    barClassName="h-3.5 bg-tint-solid/3"
                    width={title}
                />
                <PlaceholderLine className="h-5 text-sm" barClassName="h-2.5" width={description} />
            </div>
            <div className="size-7 shrink-0" />
        </div>
    ));

/** One text line of a placeholder row: the line box of the real text, with a bar inside it. */
const PlaceholderLine = (props: { className: string; barClassName: string; width: number }) => (
    <div className={tcls('relative', props.className)}>
        {'\u00a0'}
        <div
            className={tcls(
                'absolute inset-y-0 left-0 my-auto rounded-full bg-tint-solid/2',
                props.barClassName
            )}
            style={{ width: `${props.width}%` }}
        />
    </div>
);

/**
 * Whether clicking a result navigates the current window, and so closes the search — as opposed
 * to opening a new tab or window (modifier keys, `target="_blank"`, or an external destination,
 * which an embed opens in a new tab).
 */
function navigatesCurrentWindow(event: React.MouseEvent<HTMLAnchorElement>) {
    const link = event.currentTarget;
    return (
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        link.target !== '_blank' &&
        !isExternalLink(link.href, window.location.origin)
    );
}
